/**
 * Pravi srednju (1200px) verziju svake slike galerije iz postojece -1600.webp.
 * Telefoni sa 3x ekranom tako ne skidaju 1600px (300-490 KB) za karticu.
 *
 *   node scripts/gallery-1200.mjs
 *
 * Idempotentno: vec postojece -1200.webp preskace.
 * (Novi uvoz preko optimize-gallery.mjs vec pravi i 1200 - ova skripta je
 *  za slike obradjene pre toga, jer originali nisu u repou.)
 */
import sharp from "sharp";
import { readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GALLERY = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "assets", "gallery");

let made = 0;
for (const room of await readdir(GALLERY, { withFileTypes: true })) {
  if (!room.isDirectory()) continue;
  const dir = path.join(GALLERY, room.name);
  for (const file of await readdir(dir)) {
    if (!file.endsWith("-1600.webp")) continue;
    const out = path.join(dir, file.replace("-1600.webp", "-1200.webp"));
    if (existsSync(out)) continue;
    await sharp(path.join(dir, file)).resize({ width: 1200 }).webp({ quality: 78 }).toFile(out);
    made++;
  }
}
console.log(`Napravljeno ${made} slika od 1200px.`);
