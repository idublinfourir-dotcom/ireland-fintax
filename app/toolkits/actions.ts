"use server";

/* "Request a copy" on the Founders Hub.

   A visitor fills in the form and we record who they are and what they want.
   Nothing is emailed automatically: a team member reads the request in
   /admin/toolkits and sends the file by hand, then marks it sent.

   Deliberately public (no auth). Abuse is bounded per address AND per IP, and
   the request only ever records what was typed in. */

import { revalidatePath } from "next/cache";
import { findRequestableResourceBySlug } from "../lib/toolkit-content";
import { createRequest } from "../lib/toolkit-requests";
import { allowPublicAction } from "../lib/rate-limit";
import { getT } from "../lib/messages";
import { toolkitMessages } from "../lib/messages/toolkits";

export interface RequestState {
  status: "idle" | "sent" | "error";
  message?: string;
  /** Field-level errors, keyed by input name, so each one renders in place. */
  errors?: Record<string, string>;
}

/* Permissive on purpose: the real test of an address is whether mail arrives.
   This only rejects obvious nonsense. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/* Digits, spaces and the usual punctuation; 7 to 20 digits once stripped. */
const PHONE_RE = /^[+()\d][\d\s().-]{5,}$/;

const LIMITS = { name: 120, phone: 40, email: 254, website: 200, purpose: 1000 };

/**
 * Normalise an organisation website. People type "acme.ie" far more often than
 * "https://acme.ie", so the scheme is optional on the way in and always present
 * on the way out. Only http(s) is ever returned — the admin list renders this
 * as a clickable link, so a `javascript:` or `data:` value must never survive.
 * Returns null when it is not a usable address.
 */
function normaliseWebsite(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  // A bare word ("acme") is a typo rather than a site: require a dotted host.
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i.test(url.hostname)) return null;

  return url.toString();
}

export async function submitResourceRequestAction(
  _prev: RequestState,
  formData: FormData,
): Promise<RequestState> {
  const slug = String(formData.get("slug") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();
  const purpose = String(formData.get("purpose") ?? "").trim();

  const t = (await getT(toolkitMessages)).errors;
  const errors: Record<string, string> = {};

  if (!name) errors.name = t.nameMissing;
  else if (name.length > LIMITS.name) errors.name = t.nameLong;

  if (!phone) errors.phone = t.phoneMissing;
  else if (phone.length > LIMITS.phone) errors.phone = t.phoneLong;
  else if (!PHONE_RE.test(phone) || (phone.replace(/\D/g, "").length < 7))
    errors.phone = t.phoneInvalid;

  if (!email) errors.email = t.emailMissing;
  else if (email.length > LIMITS.email) errors.email = t.emailLong;
  else if (!EMAIL_RE.test(email)) errors.email = t.emailInvalid;

  let normalisedWebsite = "";
  if (!website) errors.website = t.websiteMissing;
  else if (website.length > LIMITS.website)
    errors.website = t.websiteLong;
  else {
    const parsed = normaliseWebsite(website);
    if (!parsed) errors.website = t.websiteInvalid;
    else normalisedWebsite = parsed;
  }

  if (!purpose) errors.purpose = t.purposeMissing;
  else if (purpose.length > LIMITS.purpose)
    errors.purpose = t.purposeLong;

  if (Object.keys(errors).length > 0) {
    return { status: "error", message: t.checkFields, errors };
  }

  // Resolve the slug server-side rather than trusting a posted title.
  const resource = findRequestableResourceBySlug(slug);
  if (!resource) {
    return {
      status: "error",
      message: t.gone,
    };
  }

  /* Capped per address and per IP, using the same helper as the contact form
     and signup. Counting only by address, which is what this did, bounded
     nothing: the address is chosen by whoever is submitting, so varying it
     made the limit disappear entirely. The IP axis is the one that actually
     costs an abuser something.

     Fails open on purpose. Nothing here is a credential, so a transient
     database fault should cost a few spare rows rather than turn away
     genuine requests. */
  const allowed = await allowPublicAction({
    action: "toolkit-request",
    identity: email,
    ip: { max: 20, windowSeconds: 60 * 60 },
    identityLimit: { max: 5, windowSeconds: 60 * 60 },
  });
  if (!allowed) {
    return {
      status: "error",
      message: t.rateLimited,
    };
  }

  try {
    await createRequest({
      resourceTitle: resource.title,
      name,
      phone,
      email,
      website: normalisedWebsite,
      purpose,
    });
  } catch (err) {
    console.error("[toolkits] could not record request:", err);
    return {
      status: "error",
      message: t.saveFailed,
    };
  }

  revalidatePath("/admin/toolkits");
  return { status: "sent" };
}
