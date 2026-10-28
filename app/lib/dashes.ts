/* The site's copy uses no em or en dashes (house style). Machine-written text
   (the news agent's drafts) is passed through this before it is saved:
     a range "600 (en dash) 900ms"    -> "600 to 900ms"
     an aside "X (dash) aside (dash) Y" -> "X (aside) Y"
     a break "X (dash) Y"             -> "X: Y" (", " when a colon already follows)
   Verbatim quotes are left alone: they must match their source. The dash
   characters are written as escapes so this file passes its own rule. */

const DASH = "[\u2013\u2014]";

/** The text with every em and en dash replaced by plain punctuation. */
export function withoutDashes(text: string): string {
  let t = text.replace(new RegExp(`(?<=[\\w%€.)])${DASH}(?=[\\w€(])`, "gu"), " to ");
  // A pair of spaced dashes around an aside becomes brackets, one pair at a time.
  const pair = new RegExp(` ${DASH} ([^\u2013\u2014]+?) ${DASH} `, "u");
  while (pair.test(t)) t = t.replace(pair, " ($1) ");
  t = t.replace(new RegExp(` ${DASH} `, "gu"), (_m, offset: number, whole: string) => {
    const rest = whole.slice(offset).split(".")[0];
    return rest.slice(3).includes(":") ? ", " : ": ";
  });
  // Anything left (a dash at an edge or between spaces and punctuation).
  return t.replace(new RegExp(`\\s*${DASH}\\s*`, "gu"), ", ").replace(/^, |, $/g, "");
}
