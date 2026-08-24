import test from "node:test";
import assert from "node:assert/strict";
import {
  ENQUIRY_MESSAGE_MAX_LENGTH,
  validateEnquiryReply,
} from "./enquiry-message-validation.ts";

test("rejects empty enquiry replies", () => {
  assert.match(validateEnquiryReply("   ") ?? "", /write a message/i);
});

test("accepts a reply at the character limit", () => {
  assert.equal(
    validateEnquiryReply("a".repeat(ENQUIRY_MESSAGE_MAX_LENGTH)),
    null,
  );
});

test("rejects a reply over the character limit", () => {
  assert.match(
    validateEnquiryReply("a".repeat(ENQUIRY_MESSAGE_MAX_LENGTH + 1)) ?? "",
    /characters or fewer/i,
  );
});
