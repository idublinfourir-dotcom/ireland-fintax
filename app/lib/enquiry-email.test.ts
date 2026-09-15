import test from "node:test";
import assert from "node:assert/strict";
import { ackHtml, ackSubject, ackText } from "./enquiry-email.ts";

const base = {
  name: "Cian Murphy",
  message: "I need help with a Form 11 for 2025.",
  service: "Income tax return",
  firmName: "Ireland Fintax",
};

test("the acknowledgement says when we will reply", () => {
  assert.match(ackText(base), /within one working day/);
  assert.match(ackHtml(base), /within one working day/);
});

test("the subject reads as a confirmation, not as an alert", () => {
  assert.equal(ackSubject(), "We've received your enquiry");
});

test("the enquiry is echoed back so the sender can see what arrived", () => {
  assert.match(ackText(base), /I need help with a Form 11 for 2025\./);
  assert.match(ackHtml(base), /I need help with a Form 11 for 2025\./);
});

test("the echoed message is escaped", () => {
  assert.doesNotMatch(ackHtml({ ...base, message: "<b>urgent</b>" }), /<b>/);
});

test("an enquiry submitted with no name still greets the sender", () => {
  assert.match(ackText({ ...base, name: "" }), /^Hi there,/);
});
