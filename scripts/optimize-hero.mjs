/**
 * Pravi manje verzije hero slike za srcset (telefoni ne skidaju 1600px).
 *
 *   node scripts/optimize-hero.mjs
 *
 * Ulaz:  src/assets/room.webp (1600px - ostaje kao najveca verzija)
 * Izlaz: src/assets/room-800.webp, src/assets/room-1200.webp
 */
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ASSETS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "assets");
const SOURCE = path.join(ASSETS, "room.webp");

for (const width of [800, 1200]) {
  const out = path.join(ASSETS, `room-${width}.webp`);
  const info = await sharp(SOURCE).resize({ width }).webp({ quality: 78 }).toFile(out);
  console.log(`room-${width}.webp  ${info.width}x${info.height}  ${Math.round(info.size / 1024)} KB`);
}
