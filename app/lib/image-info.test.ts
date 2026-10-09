/* Unit tests for reading a picture's type and size from its bytes.
   Run: node --test app/lib/image-info.test.ts

   The fixtures are minimal hand-built headers: the parser only ever reads the
   first few dozen bytes, so a header is all it needs to see. */

import { test } from "node:test";
import assert from "node:assert/strict";
import { imageInfo } from "./image-info.ts";

const bytes = (...parts: (number[] | string)[]) =>
  new Uint8Array(
    parts.flatMap((p) => (typeof p === "string" ? [...p].map((c) => c.charCodeAt(0)) : p)),
  );
const u32be = (n: number) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
const u16be = (n: number) => [(n >>> 8) & 255, n & 255];
const u16le = (n: number) => [n & 255, (n >>> 8) & 255];
const u24le = (n: number) => [n & 255, (n >>> 8) & 255, (n >>> 16) & 255];
const u32le = (n: number) => [n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255];

test("PNG: size from the IHDR chunk", () => {
  const png = bytes([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], u32be(13), "IHDR", u32be(1600), u32be(900), [8, 6, 0, 0, 0]);
  assert.deepEqual(imageInfo(png), { type: "image/png", width: 1600, height: 900 });
});

test("JPEG: walks past APP segments to the frame", () => {
  const app0 = [0xff, 0xe0, ...u16be(16), ...new Array(14).fill(0)];
  const sof0 = [0xff, 0xc0, ...u16be(17), 8, ...u16be(1333), ...u16be(2000), 3, ...new Array(9).fill(0)];
  const jpeg = bytes([0xff, 0xd8], app0, sof0, [0xff, 0xd9]);
  assert.deepEqual(imageInfo(jpeg), { type: "image/jpeg", width: 2000, height: 1333 });
});

test("JPEG: a progressive frame (C2) counts, a Huffman table (C4) does not", () => {
  const dht = [0xff, 0xc4, ...u16be(4), 0, 0];
  const sof2 = [0xff, 0xc2, ...u16be(17), 8, ...u16be(480), ...u16be(640), 3, ...new Array(9).fill(0)];
  const jpeg = bytes([0xff, 0xd8], dht, sof2);
  assert.deepEqual(imageInfo(jpeg), { type: "image/jpeg", width: 640, height: 480 });
});

test("WebP lossy (VP8)", () => {
  const webp = bytes("RIFF", u32le(100), "WEBP", "VP8 ", u32le(80), [0, 0, 0], [0x9d, 0x01, 0x2a], u16le(2000), u16le(1125), new Array(10).fill(0));
  assert.deepEqual(imageInfo(webp), { type: "image/webp", width: 2000, height: 1125 });
});

test("WebP lossless (VP8L)", () => {
  const w = 800, h = 600;
  const packed = ((w - 1) & 0x3fff) | (((h - 1) & 0x3fff) << 14);
  const webp = bytes("RIFF", u32le(100), "WEBP", "VP8L", u32le(80), [0x2f], u32le(packed), new Array(10).fill(0));
  assert.deepEqual(imageInfo(webp), { type: "image/webp", width: 800, height: 600 });
});

test("WebP extended (VP8X)", () => {
  const webp = bytes("RIFF", u32le(100), "WEBP", "VP8X", u32le(10), [0, 0, 0, 0], u24le(1919), u24le(1079), new Array(10).fill(0));
  assert.deepEqual(imageInfo(webp), { type: "image/webp", width: 1920, height: 1080 });
});

test("SVG, GIF, HTML and junk are refused", () => {
  assert.equal(imageInfo(bytes('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"></svg>')), null);
  assert.equal(imageInfo(bytes("GIF89a", new Array(30).fill(0))), null);
  assert.equal(imageInfo(bytes("<!doctype html><script>alert(1)</script>")), null);
  assert.equal(imageInfo(new Uint8Array(0)), null);
  assert.equal(imageInfo(bytes([0xff, 0xd8, 0xff, 0xd9])), null);
});

test("a zero-sized picture is refused", () => {
  const png = bytes([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], u32be(13), "IHDR", u32be(0), u32be(900), [8, 6, 0, 0, 0]);
  assert.equal(imageInfo(png), null);
});
