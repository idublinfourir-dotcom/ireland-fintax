export const ENQUIRY_MESSAGE_MAX_LENGTH = 4_000;

export function validateEnquiryReply(body: string): string | null {
  if (!body.trim()) return "Write a message before sending.";
  if (body.length > ENQUIRY_MESSAGE_MAX_LENGTH) {
    return `Messages must be ${ENQUIRY_MESSAGE_MAX_LENGTH.toLocaleString("en-GB")} characters or fewer.`;
  }
  return null;
}
