/* The real type and pixel size of an uploaded picture, read from its bytes.
   PURE module, unit-tested.

   The upload route never trusts the browser's word for what a file is: the
   Content-Type a picture is later served with comes from here. Only JPEG, PNG
   and WebP are recognised. SVG in particular is refused, because an SVG is a
   document that can carry script, not just a picture. */

export type ImageType = "image/jpeg" | "image/png" | "image/webp";

export interface ImageInfo {
  type: ImageType;
  width: number;
  height: number;
}

const be16 = (b: Uint8Array, i: number) => (b[i] << 8) | b[i + 1];
const le16 = (b: Uint8Array, i: number) => b[i] | (b[i + 1] << 8);
const le24 = (b: Uint8Array, i: number) => b[i] | (b[i + 1] << 8) | (b[i + 2] << 16);
const be32 = (b: Uint8Array, i: number) =>
  ((b[i] << 24) >>> 0) + ((b[i + 1] << 16) | (b[i + 2] << 8) | b[i + 3]);
const ascii = (b: Uint8Array, i: number, n: number) =>
  String.fromCharCode(...b.subarray(i, i + n));

function png(b: Uint8Array): ImageInfo | null {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (b.length < 24 || signature.some((v, i) => b[i] !== v)) return null;
  if (ascii(b, 12, 4) !== "IHDR") return null;
  return { type: "image/png", width: be32(b, 16), height: be32(b, 20) };
}

/* Walks the JPEG segments to the first start-of-frame marker, which carries
   the size. Markers C4, C8 and CC share the range but are not frames. */
function jpeg(b: Uint8Array): ImageInfo | null {
  if (b.length < 4 || b[0] !== 0xff || b[1] !== 0xd8 || b[2] !== 0xff) return null;
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) return null;
    const marker = b[i + 1];
    if (marker === 0xff) {
      i += 1; // fill byte
      continue;
    }
    const isFrame =
      marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isFrame) {
      return { type: "image/jpeg", height: be16(b, i + 5), width: be16(b, i + 7) };
    }
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2; // markers with no length
      continue;
    }
    if (marker === 0xd9 || marker === 0xda) return null; // end, or scan before any frame
    i += 2 + be16(b, i + 2);
  }
  return null;
}

function webp(b: Uint8Array): ImageInfo | null {
  if (b.length < 30 || ascii(b, 0, 4) !== "RIFF" || ascii(b, 8, 4) !== "WEBP") return null;
  const chunk = ascii(b, 12, 4);
  if (chunk === "VP8 ") {
    // Lossy: a 3-byte frame tag, the 9D 01 2A start code, then 14-bit sizes.
    if (b[23] !== 0x9d || b[24] !== 0x01 || b[25] !== 0x2a) return null;
    return { type: "image/webp", width: le16(b, 26) & 0x3fff, height: le16(b, 28) & 0x3fff };
  }
  if (chunk === "VP8L") {
    // Lossless: a 0x2F signature, then width-1 and height-1 in 14 bits each.
    if (b[20] !== 0x2f) return null;
    const bits = b[21] | (b[22] << 8) | (b[23] << 16) | (b[24] << 24);
    return {
      type: "image/webp",
      width: (bits & 0x3fff) + 1,
      height: ((bits >>> 14) & 0x3fff) + 1,
    };
  }
  if (chunk === "VP8X") {
    // Extended: canvas width-1 and height-1 as 24-bit little-endian.
    return { type: "image/webp", width: le24(b, 24) + 1, height: le24(b, 27) + 1 };
  }
  return null;
}

/** The picture's type and size, or null for anything that is not a JPEG,
    PNG or WebP with a readable, non-zero size. */
export function imageInfo(bytes: Uint8Array): ImageInfo | null {
  const info = png(bytes) ?? jpeg(bytes) ?? webp(bytes);
  if (!info || info.width < 1 || info.height < 1) return null;
  return info;
}
