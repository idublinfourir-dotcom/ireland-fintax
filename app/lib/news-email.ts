/* The note the news agent sends the admins after a run that drafted
   something. Pure: composes strings, sends nothing.

   It lists titles only, never draft text: the drafts are unreviewed, and an
   inbox is a place they could be forwarded from before anyone has checked
   them. The button goes to the review filter in /admin/posts. */

import { button, emailShell, paragraph, signOff } from "./email-layout.ts";

export interface NewsDigestInput {
  drafts: { title: string; flagCount: number }[];
  /** Absolute URL of /admin/posts?filter=review, built from the app's own origin. */
  reviewUrl: string;
  siteName: string;
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function newsDigestSubject(input: NewsDigestInput): string {
  return `${plural(input.drafts.length, "news draft is", "news drafts are")} waiting for review`;
}

function line(d: NewsDigestInput["drafts"][number]): string {
  return d.flagCount > 0 ? `${d.title} (${plural(d.flagCount, "thing", "things")} to check)` : d.title;
}

export function newsDigestText(input: NewsDigestInput): string {
  return [
    "The news agent drafted these posts. Nothing is published until you review and publish each one.",
    "",
    ...input.drafts.map((d) => `- ${line(d)}`),
    "",
    `Review them: ${input.reviewUrl}`,
    "",
    input.siteName,
  ].join("\n");
}

export function newsDigestHtml(input: NewsDigestInput): string {
  return emailShell({
    firmName: input.siteName,
    bodyHtml: [
      paragraph("The news agent drafted these posts. Nothing is published until you review and publish each one."),
      ...input.drafts.map((d) => paragraph(`• ${line(d)}`)),
      button(input.reviewUrl, "Review the drafts"),
      signOff(input.siteName),
    ].join("\n"),
  });
}
