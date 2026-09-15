import test from "node:test";
import assert from "node:assert/strict";
import { replyHtml, replySubject, replyText } from "./reply-email.ts";

const base = {
  clientName: "Aoife Ni Bhriain",
  body: "Your Form 11 is filed.",
  service: "Income tax return",
  firmName: "Ireland Fintax",
};

test("the subject names the service the enquiry was about", () => {
  assert.equal(replySubject(base), "Re: Income tax return");
});

test("an enquiry with no service still gets a readable subject", () => {
  assert.equal(replySubject({ ...base, service: null }), "Re: your enquiry");
  assert.equal(replySubject({ ...base, service: "   " }), "Re: your enquiry");
});

test("the plain-text part carries the reply verbatim", () => {
  const text = replyText(base);
  assert.match(text, /^Hi Aoife,/);
  assert.match(text, /Your Form 11 is filed\./);
  assert.match(text, /Ireland Fintax$/);
});

test("nothing is appended to the reply", () => {
  // Greeting, the admin's text, firm name. No quoted enquiry, no portal link,
  // no timestamp: a product decision, not an oversight.
  assert.equal(replyText(base).split("\n").filter(Boolean).length, 3);
});

test("an admin typing HTML cannot break the layout", () => {
  const html = replyHtml({ ...base, body: "<img src=x onerror=alert(1)>" });
  assert.doesNotMatch(html, /<img/);
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
});

test("paragraph breaks the admin typed survive into the HTML", () => {
  const html = replyHtml({ ...base, body: "First para.\n\nSecond para." });
  assert.match(html, /First para\./);
  assert.match(html, /Second para\./);
  // Greeting + two body paragraphs + sign-off.
  assert.equal(html.match(/<p /g)?.length, 4);
});
