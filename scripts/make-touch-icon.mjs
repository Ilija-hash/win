/**
 * Pravi public/apple-touch-icon.png (180x180) iz public/favicon.svg.
 *
 *   node scripts/make-touch-icon.mjs
 *
 * iOS ne koristi SVG favicon i sam zaobljuje uglove, pa ikonica mora biti pun
 * kvadrat - providni uglovi kruga bi na pocetnom ekranu postali crni.
 */
import sharp from "sharp";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PUBLIC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "public");

const svg = (await readFile(path.join(PUBLIC, "favicon.svg"), "utf8")).replace(/rx="[\d.]+"/, 'rx="0"');
const info = await sharp(Buffer.from(svg), { density: 300 })
  .resize(180, 180)
  .png({ compressionLevel: 9 })
  .toFile(path.join(PUBLIC, "apple-touch-icon.png"));

console.log(`apple-touch-icon.png  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(1)} KB`);
