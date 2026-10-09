"use client";

/* Choosing a picture in the post editor: upload from the computer, one of the
   site's own photos, or an Unsplash address.

   Uploads are shrunk HERE, in the browser, before they are sent: one copy up
   to 2,000px for the page and one up to 900px for cards and thumbnails, as
   WebP (or JPEG where the browser cannot encode WebP). A phone photo of 5MB
   or more arrives as a few hundred KB, and the server re-checks both copies
   from their bytes rather than trusting this code. */

import { useRef, useState } from "react";
import {
  COVER_CHOICES,
  IMAGE_HOST,
  imageUrl,
  normaliseImageUrl,
  UPLOAD_LARGE_EDGE,
  UPLOAD_SMALL_EDGE,
  type PostImage,
} from "../../lib/post-types";

const MAX_ORIGINAL_BYTES = 40 * 1024 * 1024;

const toBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

async function encode(bitmap: ImageBitmap, edge: number): Promise<Blob> {
  const scale = Math.min(1, edge / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("This browser could not process the picture.");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, w, h);

  const webp = await toBlob(canvas, "image/webp", 0.82);
  if (webp && webp.type === "image/webp") return webp;
  // A browser that cannot encode WebP hands back PNG instead. Send JPEG on a
  // white background, since JPEG has no transparency.
  ctx.globalCompositeOperation = "destination-over";
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  const jpeg = await toBlob(canvas, "image/jpeg", 0.85);
  if (!jpeg) throw new Error("This browser could not process the picture.");
  return jpeg;
}

/** Shrinks one picture and uploads both copies. */
async function uploadPicture(file: File): Promise<PostImage> {
  if (!file.type.startsWith("image/") || /svg|gif/.test(file.type)) {
    throw new Error(`"${file.name}" is not a photo. Use a JPEG, PNG or WebP picture.`);
  }
  if (file.size > MAX_ORIGINAL_BYTES) {
    throw new Error(`"${file.name}" is over 40MB. Export a smaller copy and try again.`);
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(`"${file.name}" could not be opened. Save it as JPEG or PNG and try again.`);
  }
  let large: Blob;
  let small: Blob;
  try {
    large = await encode(bitmap, UPLOAD_LARGE_EDGE);
    small = await encode(bitmap, UPLOAD_SMALL_EDGE);
  } finally {
    bitmap.close();
  }

  const body = new FormData();
  body.append("large", large, "large");
  body.append("small", small, "small");
  const res = await fetch("/admin/posts/images", { method: "POST", body });
  if (res.redirected) {
    throw new Error("Your session has ended. Sign in again in another tab, then retry.");
  }
  const data = (await res.json().catch(() => null)) as
    | { id?: string; width?: number; height?: number; error?: string }
    | null;
  if (!res.ok || !data?.id || !data.width || !data.height) {
    throw new Error(data?.error ?? "The upload failed. Try again.");
  }
  return { kind: "upload", id: data.id, width: data.width, height: data.height };
}

type Tab = "upload" | "site" | "unsplash";

const tabs: { id: Tab; label: string }[] = [
  { id: "upload", label: "Upload" },
  { id: "site", label: "Site photos" },
  { id: "unsplash", label: "Unsplash link" },
];

export function ImagePicker({
  onPick,
  multiple = false,
  compact = false,
  onCancel,
}: {
  /** Called with every picture chosen (one, unless `multiple`). */
  onPick: (images: PostImage[]) => void;
  multiple?: boolean;
  /** The narrow layout for the sidebar's cover picker. */
  compact?: boolean;
  onCancel?: () => void;
}) {
  const [tab, setTab] = useState<Tab>("upload");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [link, setLink] = useState("");
  const [checking, setChecking] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const linkUrl = link.trim() ? normaliseImageUrl(link, 900) : null;

  async function handleFiles(list: FileList | null) {
    const files = [...(list ?? [])].slice(0, multiple ? 6 : 1);
    if (files.length === 0) return;
    setError(null);
    const done: PostImage[] = [];
    try {
      for (const [i, file] of files.entries()) {
        setBusy(files.length > 1 ? `Uploading ${i + 1} of ${files.length}…` : "Shrinking and uploading…");
        done.push(await uploadPicture(file));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "The upload failed. Try again.");
    } finally {
      setBusy(null);
      if (fileInput.current) fileInput.current.value = "";
    }
    if (done.length > 0) onPick(done);
  }

  /* Loads the picture before accepting it: a mistyped or removed photo is
     caught here instead of publishing a broken image, and its size is
     recorded so the page can reserve the space for it. */
  function applyLink() {
    const url = normaliseImageUrl(link);
    if (!url) {
      setError(
        `Paste the image address, starting https://${IMAGE_HOST}/. On Unsplash, right-click the photo and choose "Copy image address".`,
      );
      return;
    }
    setChecking(true);
    setError(null);
    const probe = new Image();
    probe.onload = () => {
      setChecking(false);
      onPick([{ kind: "unsplash", url, width: probe.naturalWidth, height: probe.naturalHeight }]);
    };
    probe.onerror = () => {
      setChecking(false);
      setError("That picture could not be loaded. Check the address and try again.");
    };
    probe.src = url;
  }

  return (
    <div className="border border-line bg-surface-muted/40">
      <div role="tablist" aria-label="Picture source" className="flex border-b border-line">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => {
              setTab(t.id);
              setError(null);
            }}
            className={`flex-1 cursor-pointer px-3 py-2.5 text-xs font-semibold transition-colors duration-200 ${
              tab === t.id ? "bg-white text-ink shadow-[inset_0_-2px_0] shadow-primary-500" : "text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {tab === "upload" && (
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              void handleFiles(e.dataTransfer.files);
            }}
            className={`flex cursor-pointer flex-col items-center justify-center border-2 border-dashed px-4 text-center transition-colors duration-200 ${
              compact ? "py-6" : "py-10"
            } ${dragging ? "border-primary-500 bg-primary-50" : "border-line bg-white hover:border-primary-300"}`}
          >
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/avif"
              multiple={multiple}
              disabled={busy !== null}
              onChange={(e) => void handleFiles(e.target.files)}
              className="sr-only"
            />
            {busy ? (
              <span className="flex items-center gap-2 text-sm font-medium text-ink">
                <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-ink/20 border-t-primary-500" />
                {busy}
              </span>
            ) : (
              <>
                <span className="text-sm font-semibold text-ink">
                  {multiple ? "Choose pictures" : "Choose a picture"}
                </span>
                <span className="mt-1 text-xs text-muted">
                  or drag {multiple ? "them" : "it"} here. JPEG, PNG or WebP; shrunk automatically.
                </span>
              </>
            )}
          </label>
        )}

        {tab === "site" && (
          <div className={`grid gap-2 ${compact ? "grid-cols-3" : "grid-cols-3 sm:grid-cols-4"}`}>
            {COVER_CHOICES.map((choice) => (
              <button
                key={choice.key}
                type="button"
                title={choice.label}
                onClick={() => onPick([{ kind: "curated", key: choice.key }])}
                className="group cursor-pointer outline-none"
              >
                <span className="sr-only">{choice.label}</span>
                <span
                  aria-hidden="true"
                  className="block aspect-[4/3] bg-surface-muted bg-cover bg-center opacity-85 ring-primary-500 ring-offset-2 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:ring-2"
                  style={{
                    backgroundImage: `url("${imageUrl({ kind: "curated", key: choice.key }, 240)}")`,
                  }}
                />
              </button>
            ))}
          </div>
        )}

        {tab === "unsplash" && (
          <div>
            <input
              value={link}
              onChange={(e) => {
                setLink(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyLink();
                }
              }}
              placeholder={`https://${IMAGE_HOST}/photo-…`}
              aria-label="Unsplash image address"
              className="h-9 w-full border border-line bg-white px-3 font-mono text-xs text-ink focus:border-primary-400 focus:outline-none"
            />
            {linkUrl && (
              <span
                aria-hidden="true"
                className="mt-3 block aspect-[16/9] bg-surface-muted bg-cover bg-center"
                style={{ backgroundImage: `url("${linkUrl}")` }}
              />
            )}
            <button
              type="button"
              onClick={applyLink}
              disabled={checking}
              className="mt-3 inline-flex h-9 cursor-pointer items-center bg-primary-500 px-4 text-xs font-semibold text-white transition-colors duration-200 hover:bg-primary-600 disabled:opacity-60"
            >
              {checking ? "Checking the picture…" : "Use this picture"}
            </button>
          </div>
        )}

        {error && (
          <p role="alert" className="mt-3 text-xs font-medium text-primary-600">
            {error}
          </p>
        )}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="mt-3 cursor-pointer text-xs font-semibold text-muted transition-colors duration-200 hover:text-ink"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
