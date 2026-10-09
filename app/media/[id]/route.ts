import type { NextRequest } from "next/server";
import { getMediaFile } from "../../lib/media";

/* Serves an uploaded blog picture: /media/<id>, or /media/<id>?size=small for
   the 900px copy used by cards and thumbnails.

   A stored picture never changes (a new upload gets a new id), so it is sent
   with a year-long immutable cache header and browsers and CDNs keep it. The
   Content-Type comes from the bytes as checked on upload, and nosniff (set
   site-wide in next.config.ts) stops a browser guessing otherwise. */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const size = request.nextUrl.searchParams.get("size") === "small" ? "small" : "large";

  let file: Awaited<ReturnType<typeof getMediaFile>>;
  try {
    file = await getMediaFile(id, size);
  } catch (err) {
    console.error("[media] read failed:", err);
    return new Response("Unavailable", { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  if (!file) return new Response("Not found", { status: 404 });

  return new Response(file.bytes as unknown as BodyInit, {
    headers: {
      "Content-Type": file.type,
      "Content-Length": String(file.bytes.length),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
