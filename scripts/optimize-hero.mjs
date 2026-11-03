/**
 * Pravi sve verzije hero slike iz ORIGINALNE fotografije (jedna kompresija).
 *
 *   node scripts/optimize-hero.mjs
 *
 * Ulaz:  gallery/dnevna/20240412_160654.jpg (3060x4080, original sa telefona;
 *        /gallery/ je u .gitignore - lokalna arhiva sirovih fotografija)
 * Izlaz: src/assets/hero-800|1200|1600.webp       uspravne - telefon / uspravni ekrani
 *        src/assets/hero-wide-1600|2400|3060.webp siroki isecak 16:10 - desktop
 *        public/og-image.jpg                       1200x630 - pregled linka
 *
 * Zasto siroki isecak: uspravna slika preko sirokog ekrana se razvlaci
 * (1600px na 2880px retina laptop = mutno). Isecak 16:10 je bas onaj deo
 * koji se na desktopu vidi, pa je i ostar i manji fajl.
 */
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = path.join(ROOT, "gallery", "dnevna", "20240412_160654.jpg");
const ASSETS = path.join(ROOT, "src", "assets");
const QUALITY = 80;

// .rotate() bez argumenta primenjuje EXIF orijentaciju (telefon snima polozeno).
const source = () => sharp(SOURCE).rotate();
const report = (name, info) => console.log(`${name}  ${info.width}x${info.height}  ${Math.round(info.size / 1024)} KB`);

for (const width of [800, 1200, 1600]) {
  const name = `hero-${width}.webp`;
  report(name, await source().resize({ width }).webp({ quality: QUALITY, effort: 6 }).toFile(path.join(ASSETS, name)));
}

for (const width of [1600, 2400, 3060]) {
  const name = `hero-wide-${width}.webp`;
  const height = Math.round(width / 1.6);
  report(name, await source().resize(width, height, { fit: "cover" }).webp({ quality: QUALITY, effort: 6 }).toFile(path.join(ASSETS, name)));
}

report(
  "og-image.jpg",
  await source().resize(1200, 630, { fit: "cover" }).jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(ROOT, "public", "og-image.jpg")),
);
