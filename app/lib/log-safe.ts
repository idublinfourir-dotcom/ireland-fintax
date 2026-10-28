/* Personal data kept out of server logs. Logs go to the host's log store,
   which is outside the privacy page's promises, so an address appears there
   only in a form that still helps support ("was the mail to j***@gmail.com
   sent?") without being the address itself. */

/** "jane.doe@gmail.com" → "j***@gmail.com". Anything that is not an address
    becomes "***". */
export function maskEmail(email: string): string {
  const at = email.lastIndexOf("@");
  if (at < 1 || at === email.length - 1) return "***";
  return `${email[0]}***${email.slice(at)}`;
}
