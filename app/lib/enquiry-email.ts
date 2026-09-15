/* The acknowledgement sent to someone who submits the contact form:
   confirmation that their enquiry arrived and that a person will come back to
   them.

   It goes to the CUSTOMER, not to the firm. New enquiries surface in
   /admin/enquiries with an unread badge, which is how the firm sees them.
   There is deliberately no notification email (see AGENTS.md).

   Pure: composes strings, sends nothing. Rendering rules live in
   email-layout.ts. */

import {
  emailShell,
  greetingName,
  paragraph,
  paragraphs,
  signOff,
} from "./email-layout.ts";

export interface EnquiryAckInput {
  /** The name they gave on the form, for the greeting. */
  name: string;
  /** What they wrote, echoed back so they can see what reached us. */
  message: string;
  /** What the enquiry was about. Subject line only; null for a general one. */
  service: string | null;
  firmName: string;
}

export function ackSubject(): string {
  return "We've received your enquiry";
}

/** The one line of substance, shared by both parts so they cannot drift. It
    promises a reply within one working day: that is a commitment made to every
    enquirer, so change the service level here, not the copy around it. */
const ACK_LINE =
  "Thanks for getting in touch. We've received your enquiry and will reply within one working day.";

export function ackText(input: EnquiryAckInput): string {
  return [
    `Hi ${greetingName(input.name)},`,
    "",
    ACK_LINE,
    "",
    "What you sent us:",
    input.message,
    "",
    input.firmName,
  ].join("\n");
}

export function ackHtml(input: EnquiryAckInput): string {
  return emailShell({
    firmName: input.firmName,
    bodyHtml: [
      paragraph(`Hi ${greetingName(input.name)},`),
      paragraph(ACK_LINE),
      // Quoted back, indented, so the reader can see what actually arrived:
      // people routinely submit a form and immediately doubt it went through.
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px">
    <tr>
      <td style="border-left:3px solid #e0e3ec;padding:2px 0 2px 16px">
        ${paragraphs(input.message)}
      </td>
    </tr>
  </table>`,
      signOff(input.firmName),
    ].join("\n"),
  });
}
