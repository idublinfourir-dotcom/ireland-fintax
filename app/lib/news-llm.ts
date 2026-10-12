/* The news agent's model client: one JSON-schema chat call, tried across a
   chain of free models until one answers. `fetch` and `sleep` are passed in,
   so the fallback logic is unit-tested without a network.

   Chain (all free, no card, verified Oct 2026):
     1-3. Groq: gpt-oss-120b, qwen3.8-27b, gpt-oss-20b. Each model has its
          OWN quota (1K requests and 200K tokens a day, 8K tokens a minute),
          so one exhausted model does not stop the next.
     4+.  OpenRouter `:free` models with structured-output support, picked at
          run time from its public model list, because that list rotates.
   Both speak the OpenAI chat format, so there is no SDK. */

import type { ChatMessages } from "./news-draft.ts";

export const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
export const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
export const OPENROUTER_MODELS_URL = "https://openrouter.ai/api/v1/models";

export const GROQ_MODELS = ["openai/gpt-oss-120b", "qwen/qwen3.8-27b", "openai/gpt-oss-20b"];

/** Tried first when present in OpenRouter's list; others with structured
    outputs follow, largest context first. */
export const OPENROUTER_PREFERRED = ["nvidia/nemotron-3-super-120b-a12b:free", "google/gemma-4-31b-it:free"];

export interface LlmTarget {
  provider: "groq" | "openrouter";
  model: string;
}

export interface LlmConfig {
  groqKey?: string;
  openRouterKey?: string;
  /** From pickOpenRouterModels; empty skips OpenRouter. */
  openRouterModels?: string[];
  /** Sent to OpenRouter as the referring site. */
  siteUrl: string;
}

export interface JsonCall {
  /** Schema name, letters and underscores. */
  name: string;
  schema: object;
  messages: ChatMessages;
  maxTokens: number;
}

export interface JsonResult {
  data: unknown;
  provider: LlmTarget["provider"];
  model: string;
  tokens: number;
}

export interface LlmDeps {
  fetch: typeof fetch;
  sleep: (ms: number) => Promise<void>;
  log: (line: string) => void;
}

/** Free OpenRouter models that can answer to a JSON schema, best first. */
export function pickOpenRouterModels(list: unknown, limit = 3): string[] {
  const data = (list as { data?: unknown })?.data;
  if (!Array.isArray(data)) return [];
  const usable = data
    .map((m) => m as { id?: unknown; context_length?: unknown; supported_parameters?: unknown })
    .filter(
      (m): m is { id: string; context_length: number; supported_parameters: string[] } =>
        typeof m.id === "string" &&
        m.id.endsWith(":free") &&
        Array.isArray(m.supported_parameters) &&
        m.supported_parameters.includes("structured_outputs") &&
        typeof m.context_length === "number" &&
        // Small models write poorly and context under 100K signals one.
        m.context_length >= 100_000,
    );
  const ids = usable.map((m) => m.id);
  const preferred = OPENROUTER_PREFERRED.filter((id) => ids.includes(id));
  const rest = usable
    .filter((m) => !preferred.includes(m.id))
    .sort((a, b) => b.context_length - a.context_length)
    .map((m) => m.id);
  return [...preferred, ...rest].slice(0, limit);
}

export function llmTargets(cfg: LlmConfig): LlmTarget[] {
  return [
    ...(cfg.groqKey ? GROQ_MODELS.map((model) => ({ provider: "groq" as const, model })) : []),
    ...(cfg.openRouterKey ? (cfg.openRouterModels ?? []).map((model) => ({ provider: "openrouter" as const, model })) : []),
  ];
}

/** "7.66s", "1m2.5s", "120ms" or plain seconds, in milliseconds. */
export function parseWait(value: string | null): number | null {
  if (!value) return null;
  const v = value.trim();
  if (/^\d+(\.\d+)?$/.test(v)) return Math.round(Number(v) * 1000);
  let ms = 0;
  let matched = false;
  for (const m of v.matchAll(/(\d+(?:\.\d+)?)(ms|h|m|s)/g)) {
    matched = true;
    const n = Number(m[1]);
    ms += m[2] === "h" ? n * 3_600_000 : m[2] === "m" ? n * 60_000 : m[2] === "s" ? n * 1000 : n;
  }
  return matched ? Math.round(ms) : null;
}

function requestBody(target: LlmTarget, call: JsonCall) {
  const base = {
    model: target.model,
    messages: [
      { role: "system", content: call.messages.system },
      { role: "user", content: call.messages.user },
    ],
    response_format: {
      type: "json_schema",
      json_schema: { name: call.name, strict: true, schema: call.schema },
    },
    temperature: 0.2,
  };
  if (target.provider === "openrouter") {
    // Route only to hosts that honour response_format.
    return { ...base, max_tokens: call.maxTokens, provider: { require_parameters: true } };
  }
  return {
    ...base,
    max_completion_tokens: call.maxTokens,
    // Reasoning tokens count against Groq's 8K-a-minute budget, so keep them few.
    ...(target.model.startsWith("openai/gpt-oss") ? { reasoning_effort: "low" } : { reasoning_format: "hidden" }),
  };
}

/** The JSON a reply carries, tolerating a stray code fence. */
export function replyJson(body: unknown): unknown {
  const content = (body as { choices?: { message?: { content?: unknown } }[] })?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) throw new Error("empty reply");
  const trimmed = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return JSON.parse(trimmed);
}

/** Longest single wait for a rate limit before moving to the next model. */
const MAX_WAIT_MS = 65_000;

/**
 * One structured call, falling through the chain. Throws only when every
 * model has failed, with each failure in the message.
 */
export async function callJson(call: JsonCall, cfg: LlmConfig, deps: LlmDeps): Promise<JsonResult> {
  const failures: string[] = [];
  const deadKeys = new Set<string>();

  for (const target of llmTargets(cfg)) {
    if (deadKeys.has(target.provider)) continue;
    const key = target.provider === "groq" ? cfg.groqKey! : cfg.openRouterKey!;
    const url = target.provider === "groq" ? GROQ_URL : OPENROUTER_URL;
    const label = `${target.provider}:${target.model}`;

    for (let attempt = 0; attempt < 2; attempt++) {
      let res: Response;
      try {
        res = await deps.fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
            ...(target.provider === "openrouter" ? { "HTTP-Referer": cfg.siteUrl, "X-Title": "Ireland Fintax" } : {}),
          },
          body: JSON.stringify(requestBody(target, call)),
          signal: AbortSignal.timeout(120_000),
        });
      } catch (err) {
        failures.push(`${label}: ${(err as Error).message}`);
        if (attempt === 0) {
          await deps.sleep(2000);
          continue;
        }
        break;
      }

      if (res.ok) {
        try {
          const body = await res.json();
          const tokens = Number((body as { usage?: { total_tokens?: unknown } }).usage?.total_tokens) || 0;
          return { data: replyJson(body), provider: target.provider, model: target.model, tokens };
        } catch (err) {
          failures.push(`${label}: unreadable reply (${(err as Error).message})`);
          break;
        }
      }

      const detail = (await res.text().catch(() => "")).slice(0, 200).replace(/\s+/g, " ");
      if (res.status === 401 || res.status === 403) {
        // A bad key fails the same way for every model of that provider.
        deadKeys.add(target.provider);
        failures.push(`${label}: ${res.status} key refused`);
        break;
      }
      if (res.status === 429 && attempt === 0) {
        const wait = Math.max(
          parseWait(res.headers.get("retry-after")) ?? 0,
          parseWait(res.headers.get("x-ratelimit-reset-tokens")) ?? 0,
        );
        if (wait > 0 && wait <= MAX_WAIT_MS) {
          deps.log(`  rate limited on ${label}, waiting ${Math.ceil(wait / 1000)}s`);
          await deps.sleep(wait + 500);
          continue;
        }
      }
      if (res.status >= 500 && attempt === 0) {
        await deps.sleep(3000);
        continue;
      }
      failures.push(`${label}: ${res.status} ${detail}`);
      break;
    }
  }

  throw new Error(failures.length > 0 ? `Every model failed. ${failures.join(" | ")}` : "No model is configured: set GROQ_API_KEY or OPENROUTER_API_KEY.");
}
