/**
 * Optimizuje sirove fotografije iz gallery/ u web verzije.
 *
 *   node scripts/optimize-gallery.mjs
 *
 * Ulaz:  gallery/<soba>/**\/*.jpg   (podfolderi se spajaju u nadrednu sobu)
 * Izlaz: src/assets/gallery/<soba>/<slug>-800.webp
 *        src/assets/gallery/<soba>/<slug>-1600.webp
 *        src/assets/gallery/manifest.json
 *
 * Idempotentno je - vec obradjene slike preskace, pa ponovno pokretanje traje sekundama.
 * Pokreni ponovo kad dodas nove fotografije u gallery/.
 */
import sharp from "sharp";
import { readdir, mkdir, writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC_DIR = path.join(ROOT, "gallery");
const OUT_DIR = path.join(ROOT, "src", "assets", "gallery");
const MANIFEST = path.join(OUT_DIR, "manifest.json");

const SIZES = [800, 1600];
const QUALITY = 78;
const LQIP_WIDTH = 16;

/** Skuplja .jpg rekurzivno; soba je uvek prvi folder ispod gallery/. */
async function collect(dir, room = null) {
  const entries = await readdir(dir, { withFileTypes: true });
  const found = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // room ?? entry.name: dnevna/novo/ ostaje u sobi "dnevna"
      found.push(...(await collect(full, room ?? entry.name)));
    } else if (/\.jpe?g$/i.test(entry.name) && room) {
      found.push({ file: full, room, slug: entry.name.replace(/\.jpe?g$/i, "").toLowerCase() });
    }
  }
  return found;
}

async function loadPreviousManifest() {
  if (!existsSync(MANIFEST)) return new Map();
  try {
    const parsed = JSON.parse(await readFile(MANIFEST, "utf8"));
    return new Map(parsed.map((item) => [`${item.room}/${item.slug}`, item]));
  } catch {
    return new Map();
  }
}

async function main() {
  if (!existsSync(SRC_DIR)) {
    console.error(`Nema foldera ${SRC_DIR} - nista za obraditi.`);
    process.exit(1);
  }

  const images = await collect(SRC_DIR);
  images.sort((a, b) => a.room.localeCompare(b.room) || a.slug.localeCompare(b.slug));

  if (images.length === 0) {
    console.error("Nije pronadjena nijedna .jpg fotografija.");
    process.exit(1);
  }

  const previous = await loadPreviousManifest();
  const manifest = [];
  let processed = 0;
  let skipped = 0;

  console.log(`Pronadjeno ${images.length} fotografija.\n`);

  for (const { file, room, slug } of images) {
    const roomOut = path.join(OUT_DIR, room);
    await mkdir(roomOut, { recursive: true });

    const targets = SIZES.map((size) => ({ size, out: path.join(roomOut, `${slug}-${size}.webp`) }));
    const key = `${room}/${slug}`;
    const cached = previous.get(key);

    // Sve vec postoji i imamo zapis iz proslog puta -> preskoci dekodiranje.
    if (cached && targets.every((t) => existsSync(t.out))) {
      manifest.push(cached);
      skipped += 1;
      continue;
    }

    // .rotate() bez argumenata primenjuje EXIF orijentaciju - bez ovoga
    // fotografije sa telefona zavrse okrenute na stranu.
    let width = 0;
    let height = 0;

    for (const { size, out } of targets) {
      const { info } = await sharp(file)
        .rotate()
        .resize({ width: size, withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toBuffer({ resolveWithObject: true })
        .then(async (result) => {
          await writeFile(out, result.data);
          return result;
        });

      // Dimenzije uzimamo sa najvece verzije - vec su posle rotacije, pa je odnos tacan.
      if (size === Math.max(...SIZES)) {
        width = info.width;
        height = info.height;
      }
    }

    const lqipBuffer = await sharp(file)
      .rotate()
      .resize({ width: LQIP_WIDTH })
      .webp({ quality: 20 })
      .toBuffer();

    manifest.push({
      room,
      slug,
      w: width,
      h: height,
      lqip: `data:image/webp;base64,${lqipBuffer.toString("base64")}`,
    });

    processed += 1;
    console.log(`  ${String(processed + skipped).padStart(2)}/${images.length}  ${room}/${slug}`);
  }

  await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(`\nGotovo. Obradjeno: ${processed}, preskoceno: ${skipped}.`);
  console.log(`Manifest: ${path.relative(ROOT, MANIFEST)} (${manifest.length} zapisa)`);
}

main().catch((error) => {
  console.error("Greska:", error.message);
  process.exit(1);
});
