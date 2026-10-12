/* Unit tests for the news agent's model client: the fallback chain, rate-limit
   waits and request shape, against a fake fetch.
   Run: node --test app/lib/news-llm.test.ts */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  GROQ_URL,
  OPENROUTER_URL,
  callJson,
  llmTargets,
  parseWait,
  pickOpenRouterModels,
  replyJson,
  type JsonCall,
  type LlmConfig,
} from "./news-llm.ts";

const CALL: JsonCall = {
  name: "triage",
  schema: { type: "object", additionalProperties: false, required: [], properties: {} },
  messages: { system: "sys", user: "usr" },
  maxTokens: 500,
};

const CFG: LlmConfig = {
  groqKey: "gsk_test",
  openRouterKey: "sk-or-test",
  openRouterModels: ["nvidia/nemotron-3-super-120b-a12b:free"],
  siteUrl: "https://www.irishfintax.ie",
};

const ok = (data: unknown, tokens = 42) =>
  new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(data) } }], usage: { total_tokens: tokens } }), {
    status: 200,
  });

type Seen = { url: string; body: Record<string, unknown>; auth: string };

/** A fetch that answers from a script of responses, recording each request. */
function fakeFetch(script: ((seen: Seen) => Response)[]) {
  const seen: Seen[] = [];
  const fn = (async (url: string, init: RequestInit) => {
    const s = {
      url,
      body: JSON.parse(String(init.body)),
      auth: (init.headers as Record<string, string>).Authorization,
    };
    seen.push(s);
    const next = script.shift();
    if (!next) throw new Error("no more scripted responses");
    return next(s);
  }) as unknown as typeof fetch;
  return { fn, seen };
}

function deps(fetchFn: typeof fetch) {
  const sleeps: number[] = [];
  const lines: string[] = [];
  return {
    deps: { fetch: fetchFn, sleep: async (ms: number) => void sleeps.push(ms), log: (l: string) => void lines.push(l) },
    sleeps,
    lines,
  };
}

test("the first model answers: strict JSON schema, low reasoning, token count", async () => {
  const { fn, seen } = fakeFetch([() => ok({ items: [] }, 1234)]);
  const result = await callJson(CALL, CFG, deps(fn).deps);
  assert.deepEqual(result, { data: { items: [] }, provider: "groq", model: "openai/gpt-oss-120b", tokens: 1234 });
  assert.equal(seen[0].url, GROQ_URL);
  assert.equal(seen[0].auth, "Bearer gsk_test");
  assert.deepEqual(seen[0].body.response_format, {
    type: "json_schema",
    json_schema: { name: "triage", strict: true, schema: CALL.schema },
  });
  assert.equal(seen[0].body.reasoning_effort, "low");
  assert.equal(seen[0].body.max_completion_tokens, 500);
});

test("a short rate limit is waited out on the same model", async () => {
  const { fn, seen } = fakeFetch([
    () => new Response("slow down", { status: 429, headers: { "retry-after": "7" } }),
    () => ok({ fine: true }),
  ]);
  const d = deps(fn);
  const result = await callJson(CALL, CFG, d.deps);
  assert.equal(result.model, "openai/gpt-oss-120b");
  assert.equal(seen.length, 2);
  assert.deepEqual(d.sleeps, [7500]);
  assert.match(d.lines[0], /waiting 7s/);
});

test("a long rate limit (daily quota) moves on to the next model", async () => {
  const { fn, seen } = fakeFetch([
    () => new Response("quota", { status: 429, headers: { "x-ratelimit-reset-tokens": "2h3m" } }),
    () => ok({ fine: true }),
  ]);
  const result = await callJson(CALL, CFG, deps(fn).deps);
  assert.equal(result.model, "qwen/qwen3.8-27b");
  assert.equal(seen[1].body.reasoning_format, "hidden", "qwen hides its reasoning instead");
});

test("a refused key skips that provider's other models", async () => {
  const { fn, seen } = fakeFetch([() => new Response("bad key", { status: 401 }), () => ok({ fine: true })]);
  const result = await callJson(CALL, CFG, deps(fn).deps);
  assert.equal(result.provider, "openrouter");
  assert.equal(seen.length, 2, "no second Groq model was tried");
  assert.equal(seen[1].url, OPENROUTER_URL);
  assert.deepEqual(seen[1].body.provider, { require_parameters: true });
  assert.equal(seen[1].body.max_tokens, 500);
});

test("an unreadable reply or a server error falls through; all failing throws with each reason", async () => {
  const { fn } = fakeFetch([
    () => new Response(JSON.stringify({ choices: [{ message: { content: "not json" } }] }), { status: 200 }),
    () => new Response("boom", { status: 500 }),
    () => new Response("boom", { status: 502 }),
    () => new Response("too large", { status: 413 }),
    () => new Response("nope", { status: 400 }),
  ]);
  const d = deps(fn);
  await assert.rejects(callJson(CALL, CFG, d.deps), (err: Error) => {
    assert.match(err.message, /groq:openai\/gpt-oss-120b: unreadable reply/);
    assert.match(err.message, /groq:qwen\/qwen3.8-27b: 502/);
    assert.match(err.message, /groq:openai\/gpt-oss-20b: 413/);
    assert.match(err.message, /openrouter:.*: 400/);
    return true;
  });
  assert.deepEqual(d.sleeps, [3000], "one retry after the first server error");
});

test("no keys, no targets, a clear error", async () => {
  assert.deepEqual(llmTargets({ siteUrl: "x" }), []);
  await assert.rejects(callJson(CALL, { siteUrl: "x" }, deps(fakeFetch([]).fn).deps), /set GROQ_API_KEY/);
});

test("OpenRouter's free list: structured output only, preferred first, no tiny models", () => {
  const list = {
    data: [
      { id: "paid/model", context_length: 200_000, supported_parameters: ["structured_outputs"] },
      { id: "liquid/lfm-2.5-2.6b:free", context_length: 65_536, supported_parameters: ["structured_outputs"] },
      { id: "poolside/laguna-s-2.1:free", context_length: 262_144, supported_parameters: ["tools"] },
      { id: "dots-studio/dots-3-note-preview:free", context_length: 512_000, supported_parameters: ["structured_outputs"] },
      { id: "apodex/apodex-1.1-mini:free", context_length: 262_144, supported_parameters: ["structured_outputs"] },
      { id: "nvidia/nemotron-3-super-120b-a12b:free", context_length: 262_144, supported_parameters: ["structured_outputs"] },
    ],
  };
  assert.deepEqual(pickOpenRouterModels(list), [
    "nvidia/nemotron-3-super-120b-a12b:free",
    "dots-studio/dots-3-note-preview:free",
    "apodex/apodex-1.1-mini:free",
  ]);
  assert.deepEqual(pickOpenRouterModels({}), []);
});

test("wait headers in every format Groq and OpenRouter send", () => {
  assert.equal(parseWait("7"), 7000);
  assert.equal(parseWait("7.66s"), 7660);
  assert.equal(parseWait("1m2.5s"), 62_500);
  assert.equal(parseWait("120ms"), 120);
  assert.equal(parseWait(null), null);
  assert.equal(parseWait("soon"), null);
});

test("a reply wrapped in a code fence still parses", () => {
  assert.deepEqual(replyJson({ choices: [{ message: { content: '```json\n{"a":1}\n```' } }] }), { a: 1 });
  assert.throws(() => replyJson({ choices: [] }), /empty reply/);
});
