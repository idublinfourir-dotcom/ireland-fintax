import { NextResponse, type NextRequest } from "next/server";
import { getUser } from "../../../lib/auth/guards";
import { MediaError, saveUpload } from "../../../lib/media";
import { recordAudit } from "../../../lib/rate-audit";

/* Picture upload for the post editor: POST multipart with `large` and `small`
   (the same picture, already shrunk by the editor). Answers JSON
   { id, width, height } or { error }.

   A route handler rather than a server action because pictures are bigger
   than the server-action body limit, and raising that limit would raise it for
   every public form too. That means doing by hand what a server action gets
   for free: the role check (proxy.ts only checks that someone is signed in
   under /admin) and a same-origin check. The session cookie is SameSite=Lax,
   so a cross-site POST would not carry it anyway; the origin check is the
   second lock on that door. */

function sameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user || user.role !== "admin") return fail("Sign in as an admin to upload.", 403);
  if (!sameOrigin(request)) return fail("Upload refused.", 403);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail("Could not read the upload.", 400);
  }
  const large = form.get("large");
  const small = form.get("small");
  if (!(large instanceof Blob) || !(small instanceof Blob)) {
    return fail("Could not read the upload.", 400);
  }

  try {
    const stored = await saveUpload(
      new Uint8Array(await large.arrayBuffer()),
      new Uint8Array(await small.arrayBuffer()),
      user.email,
    );
    await recordAudit({
      area: "media",
      action: "upload",
      summary: `Uploaded a ${stored.width}×${stored.height} picture`,
      details: { id: stored.id },
      changedBy: user.email,
    });
    return NextResponse.json(stored);
  } catch (err) {
    if (err instanceof MediaError) return fail(err.message, 400);
    console.error("[media] upload failed:", err);
    return fail("Could not save the picture. Try again.", 500);
  }
}
