/* The acknowledgement sent to someone who asks a question on the contact
   form: confirmation that it arrived and that a person will come back to them.

   It goes to the CUSTOMER, not to the firm. New enquiries surface in
   /admin/enquiries with an unread badge, which is how the firm sees them.
   There is deliberately no notification email (see AGENTS.md).

   It carries NOTHING the visitor typed, not the message and not the name. The
   form is public and the recipient is whatever address was entered, so any
   echoed text would let anyone send their own words to anyone from the firm's
   mailbox. A fixed message makes the worst case one unwanted "we got your
   question" email. Don't add the message or the name back.

   Pure: composes strings, sends nothing. Rendering rules live in
   email-layout.ts. */

import { emailShell, paragraph, signOff } from "./email-layout.ts";

export interface EnquiryAckInput {
  firmName: string;
}

export function ackSubject(): string {
  return "We've received your question";
}

/** The one line of substance, shared by both parts so they cannot drift. It
    promises a reply but no turnaround: the site is free, so it makes no service
    level. If one is ever promised, it goes here and nowhere else. */
const ACK_LINE =
  "Thanks for your question. It has reached us, and a real person will reply by email.";

export function ackText(input: EnquiryAckInput): string {
  return ["Hi there,", "", ACK_LINE, "", input.firmName].join("\n");
}

export function ackHtml(input: EnquiryAckInput): string {
  return emailShell({
    firmName: input.firmName,
    bodyHtml: [paragraph("Hi there,"), paragraph(ACK_LINE), signOff(input.firmName)].join("\n"),
  });
}
