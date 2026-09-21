/* The shell every outbound email is built in, and the escaping helpers that go
   with it. Pure: no IO, no env, unit-tested.

   Email clients are a hostile rendering target and have been for twenty years:
   Gmail strips <style> blocks, Outlook renders through Word. So: tables for
   structure, inline styles only, no flexbox or grid, no external stylesheet,
   no web font, a 600px fixed width and a max-width for the phone. Keep it that
   way when editing.

   One shell rather than a copy per message, because there are three of them
   (enquiry acknowledgement, admin reply, signup confirmation) and three
   hand-maintained copies of the same table drift. The palette matches the site
   (see globals.css) so the mail and the pages look like one firm. */

/** Brand ink, --color-ink. */
const INK = "#0b0d14";
/** Page background behind the card, --color-surface-muted. */
const CANVAS = "#f0f2f8";
/** Card border, --color-line. */
const LINE = "#e0e3ec";
/** Accent, --color-primary-500. Buttons and links only. */
const ACCENT = "#2540a8";

const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif";
const SERIF = "Georgia,'Times New Roman',serif";

const TEXT = `margin:0 0 16px;font-size:15px;line-height:24px;color:${INK}`;

/**
 * Escape anything that goes near the HTML body.
 *
 * Every interpolated value passes through here, including the ones an admin
 * typed: a reply is trusted as content but is still untrusted input as far as
 * this document is concerned, and an unescaped "<" breaks the layout at best.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** One escaped paragraph of body copy. */
export function paragraph(text: string): string {
  return `<p style="${TEXT}">${escapeHtml(text)}</p>`;
}

/** Preserve the paragraph breaks someone typed: a blank line starts a new
    paragraph, a single newline becomes a <br>.

    Line endings are normalised first. A browser may hand back a textarea's
    contents CRLF-encoded, and \r\n\r\n does not match a run of two newlines,
    so without this a whole message collapses into one paragraph. */
export function paragraphs(body: string): string {
  return body
    .replace(/\r\n?/g, "\n")
    .split(/\n{2,}/)
    .map((para) => `<p style="${TEXT}">${escapeHtml(para).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

/**
 * A call-to-action button, with the raw URL repeated underneath.
 *
 * The repeat is not clutter: a link this one carries (confirming an address)
 * has to survive a client that strips the anchor styling or refuses to open it,
 * and a URL the reader can copy is the only fallback that always works.
 *
 * The href is NOT escaped as HTML text: it is built by this app from its own
 * origin and a hex token, never from user input. Do not start passing
 * arbitrary URLs through here.
 */
export function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px">
  <tr>
    <td style="background:${ACCENT}">
      <a href="${href}" style="display:inline-block;padding:12px 22px;font-family:${SANS};font-size:15px;font-weight:600;color:#ffffff;text-decoration:none">${escapeHtml(label)}</a>
    </td>
  </tr>
</table>
<p style="margin:0 0 16px;font-size:13px;line-height:20px;color:#5f6577">Or paste this into your browser:<br><a href="${href}" style="color:${ACCENT}">${escapeHtml(href)}</a></p>`;
}

/**
 * Wrap composed body HTML in the branded card.
 *
 * `bodyHtml` is assumed already escaped, so build it with `paragraph`,
 * `paragraphs` or `button`, never by interpolating raw values.
 */
export function emailShell(input: { firmName: string; bodyHtml: string }): string {
  const firm = escapeHtml(input.firmName);

  return `<!doctype html>
<html lang="en">
<body style="margin:0;padding:0;background:${CANVAS}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CANVAS};padding:24px 12px">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#ffffff;border:1px solid ${LINE}">

          <tr>
            <td style="background:${INK};padding:20px 28px">
              <span style="color:#ffffff;font-family:${SERIF};font-size:17px;letter-spacing:0.02em">${firm}</span>
            </td>
          </tr>

          <tr>
            <td style="padding:28px;font-family:${SANS}">
              ${input.bodyHtml}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** First name for a greeting, falling back to something that still reads as a
    sentence when the record has no usable name on it. */
export function greetingName(name: string): string {
  return name.trim().split(/\s+/)[0] || "there";
}

/** Sign-off line shared by every message. */
export function signOff(firmName: string): string {
  return `<p style="margin:24px 0 0;font-size:15px;line-height:24px;color:${INK}">${escapeHtml(firmName)}</p>`;
}

/**
 * A one-time code, set out on its own so it survives being read on a phone.
 *
 * Its own block rather than a sentence for two reasons: a code buried in a
 * paragraph is hard to transcribe, and the wide letter-spacing stops adjacent
 * digits running together in the condensed fonts some clients substitute.
 * Monospace with a generic fallback, because a mail client that lacks the
 * first family must not reflow this into a proportional face.
 *
 * Deliberately NOT a `button`: there is nothing to click in a code email, and
 * anything that looks clickable is the shape a phisher imitates.
 */
export function codeBlock(code: string): string {
  return `<p style="margin:0 0 16px;padding:16px 20px;background:${CANVAS};border:1px solid ${LINE};font-family:Consolas,'Courier New',monospace;font-size:26px;letter-spacing:0.18em;text-align:center;color:${INK}">${escapeHtml(code)}</p>`;
}
