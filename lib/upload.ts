import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { HERO_UPLOAD } from "@/lib/settings";

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export async function saveHeroUpload(file: File) {
  if (!HERO_UPLOAD.types.includes(file.type as (typeof HERO_UPLOAD.types)[number])) {
    throw new Error("Use a JPG, PNG, WebP, or AVIF image.");
  }
  if (file.size > HERO_UPLOAD.maxBytes) {
    throw new Error("Hero image must be 8 MB or smaller.");
  }

  const ext = EXT[file.type] ?? "jpg";
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const filename = `hero-${Date.now()}.${ext}`;
  await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${filename}`;
}

const SWAP_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const SWAP_MAX_BYTES = 4 * 1024 * 1024;

export async function saveSwapImage(file: File, prefix: string) {
  if (!SWAP_TYPES.includes(file.type as (typeof SWAP_TYPES)[number])) {
    throw new Error("Use a JPG, PNG, or WebP image.");
  }
  if (file.size > SWAP_MAX_BYTES) {
    throw new Error("Each image must be 4 MB or smaller.");
  }
  const ext = EXT[file.type] ?? "jpg";
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const filename = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${filename}`;
}
