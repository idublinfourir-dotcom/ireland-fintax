/* Admin-gated CSV export of the indexation multiplier table. A GET route (not a
   client-side blob) so the strict CSP is a non-issue. requireAdmin redirects
   non-admins to /login. */

import { requireAdmin } from "../../../lib/supabase/guards";
import { getCgtData } from "../../../lib/cgt-data";
import { serializeMultiplierCsv } from "../../../lib/csv";

export async function GET() {
  await requireAdmin();
  const { multipliers } = await getCgtData();
  return new Response(serializeMultiplierCsv(multipliers), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="cgt-multipliers.csv"',
    },
  });
}
