/**
 * Telegram image import (OPTIONAL workflow).
 *
 * The site serves flower photos as plain static files (local /public in dev, your
 * VPS in production — see docs/IMAGES.md). This script exists for the alternative
 * documented in the brief: hosting the source photos in Telegram.
 *
 * What it does:
 *   1. Reads image files from a directory (default: ./import-images).
 *   2. Uploads each to your bot via sendPhoto (to TELEGRAM_CHAT_ID).
 *   3. Captures the Telegram file_id for each and writes a mapping JSON
 *      (data/telegram-images.json) so products can reference them.
 *
 * Important (per Telegram's API):
 *   - file_id is NOT a public image URL. To display an image you must resolve it
 *     server-side via getFile (see app/api/images/[fileId]/route.ts), and that
 *     download URL is temporary — always go back through the proxy, never cache
 *     the raw URL. For long-term delivery, prefer the VPS/object-storage path.
 *   - TELEGRAM_BOT_TOKEN is a SERVER-ONLY secret. Never expose it to the browser,
 *     never prefix it with NEXT_PUBLIC_, never commit it.
 *
 * Usage:
 *   TELEGRAM_BOT_TOKEN=... TELEGRAM_CHAT_ID=... npm run telegram:import -- ./import-images
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN?.trim();
const CHAT_ID = process.env.TELEGRAM_CHAT_ID?.trim();
const INPUT_DIR = resolve(process.argv[2] ?? "./import-images");
const OUTPUT_FILE = resolve("./data/telegram-images.json");
const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);

interface Mapping {
  [fileName: string]: { fileId: string; uploadedAt: string };
}

function fail(message: string): never {
  console.error(`❌ ${message}`);
  process.exit(1);
}

async function uploadPhoto(filePath: string): Promise<string> {
  const bytes = readFileSync(filePath);
  const form = new FormData();
  form.append("chat_id", CHAT_ID!);
  form.append(
    "photo",
    new Blob([new Uint8Array(bytes)]),
    basename(filePath),
  );

  const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendPhoto`, {
    method: "POST",
    body: form,
  });
  const json = (await res.json()) as {
    ok: boolean;
    description?: string;
    result?: { photo: { file_id: string; width: number }[] };
  };

  if (!json.ok || !json.result) {
    throw new Error(json.description ?? "Unknown Telegram API error");
  }
  // The last photo size is the largest/highest resolution.
  const photos = json.result.photo;
  return photos[photos.length - 1].file_id;
}

async function main() {
  if (!TOKEN) fail("TELEGRAM_BOT_TOKEN is not set. Export it before running (never commit it).");
  if (!CHAT_ID) fail("TELEGRAM_CHAT_ID is not set. Start a chat with your bot and set your chat id.");
  if (!existsSync(INPUT_DIR)) fail(`Input directory not found: ${INPUT_DIR}`);

  const files = readdirSync(INPUT_DIR).filter((f) => IMAGE_EXT.has(extname(f).toLowerCase()));
  if (files.length === 0) fail(`No images (${[...IMAGE_EXT].join(", ")}) found in ${INPUT_DIR}`);

  const mapping: Mapping = existsSync(OUTPUT_FILE)
    ? (JSON.parse(readFileSync(OUTPUT_FILE, "utf8")) as Mapping)
    : {};

  console.log(`📤 Uploading ${files.length} image(s) from ${INPUT_DIR}…`);
  for (const file of files) {
    try {
      const fileId = await uploadPhoto(join(INPUT_DIR, file));
      mapping[file] = { fileId, uploadedAt: new Date().toISOString() };
      console.log(`   ✓ ${file} → ${fileId}`);
    } catch (error) {
      console.error(`   ✗ ${file}: ${(error as Error).message}`);
    }
  }

  mkdirSync(resolve("./data"), { recursive: true });
  writeFileSync(OUTPUT_FILE, JSON.stringify(mapping, null, 2), "utf8");
  console.log(`\n✅ Wrote ${Object.keys(mapping).length} mapping(s) to ${OUTPUT_FILE}`);
  console.log(
    "   Reference an image from a product via the proxy: /api/images/<file_id>\n" +
      "   (For permanent, cache-friendly delivery, prefer the VPS path — see docs/IMAGES.md.)",
  );
}

main().catch((error) => fail((error as Error).message));
