import { useCallback, useEffect, useRef, useState } from "react";
import { Chevron } from "../components/Icons";
import Lightbox from "../components/Lightbox";
import { SectionTitle } from "../components/Section";
import { useReveal } from "../hooks/useReveal";
import { ROOMS } from "../data/site";
import { preloadPhoto } from "../lib/photos";
import manifest from "../assets/gallery/manifest.json";

// Vite hesira i verzionise ove fajlove sam.
const thumbs = import.meta.glob("../assets/gallery/*/*-800.webp", { eager: true, import: "default" });
const mids = import.meta.glob("../assets/gallery/*/*-1200.webp", { eager: true, import: "default" });
const fulls = import.meta.glob("../assets/gallery/*/*-1600.webp", { eager: true, import: "default" });

function indexByKey(modules) {
  const map = {};
  for (const [filePath, url] of Object.entries(modules)) {
    const match = filePath.match(/gallery\/([^/]+)\/(.+)-\d+\.webp$/);
    if (match) map[`${match[1]}/${match[2]}`] = url;
  }
  return map;
}

const thumbMap = indexByKey(thumbs);
const midMap = indexByKey(mids);
const fullMap = indexByKey(fulls);

const allPhotos = manifest
  .map((item) => {
    const key = `${item.room}/${item.slug}`;
    return { ...item, key, thumb: thumbMap[key], mid: midMap[key] ?? fullMap[key], full: fullMap[key] };
  })
  .filter((item) => item.thumb && item.full);

// Svaka soba: cover prvi, pa ostale slike iz njenih foldera.
const rooms = ROOMS.map((room) => {
  const roomPhotos = allPhotos
    .filter((photo) => room.folders.includes(photo.room))
    .sort((a, b) => room.folders.indexOf(a.room) - room.folders.indexOf(b.room) || a.slug.localeCompare(b.slug))
    .map((photo) => ({ ...photo, label: room.label }));
  const cover = roomPhotos.find((photo) => photo.key === room.cover) ?? roomPhotos[0];
  return { ...room, cover, photos: cover ? [cover, ...roomPhotos.filter((photo) => photo !== cover)] : [] };
}).filter((room) => room.photos.length > 0);

// 1 fotografija, 2-4 fotografije, 5+ fotografija (11-14 uvek "fotografija").
function photoCount(count) {
  const lastTwo = count % 100;
  const last = count % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return `${count} fotografija`;
  if (last >= 2 && last <= 4) return `${count} fotografije`;
  return `${count} fotografija`;
}

const DRAG_THRESHOLD = 5;

// srcset sa sve tri velicine - browser bira najmanju dovoljnu (telefon 3x -> 1200, ne 1600).
const photoSrcSet = (photo) => `${photo.thumb} 800w, ${photo.mid} 1200w, ${photo.full} 1600w`;

const CARD_SIZES = "(min-width: 1024px) 28vw, (min-width: 768px) 36vw, (min-width: 640px) 42vw, 72vw";

// Unapred skidanje prvih slika sobe (hover / dodir kartice), pa se slider otvara sa vec ucitanom slikom.
const preloaded = new Set();
function preloadRoom(room) {
  if (preloaded.has(room.id)) return;
  preloaded.add(room.id);
  room.photos.slice(0, 2).forEach(preloadPhoto);
}

// Slika postaje vidljiva tek kada je ucitana (ispod je LQIP), bez naglog "pop"-a.
const markLoaded = (image) => image.classList.add("is-loaded");
const watchLoaded = (image) => {
  if (image?.complete && image.naturalWidth) markLoaded(image);
};

const CONTROLS = [
  { dir: -1, label: "Prethodne sobe", icon: "left", edge: "atStart" },
  { dir: 1, label: "Sledeće sobe", icon: "right", edge: "atEnd" },
];

export default function Gallery({ onLightboxChange }) {
  const [openRoom, setOpenRoom] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [edges, setEdges] = useState({ atStart: true, atEnd: false });
  const [nearby, setNearby] = useState(false);
  const sectionRef = useRef(null);
  const rowRef = useRef(null);
  const drag = useRef({ active: false, moved: false, startX: 0, startScroll: 0 });
  const openerRef = useRef(null);

  useReveal(sectionRef);

  // Umesto loading="lazy" (koji u horizontalnom redu krece tek kada je kartica skoro vidljiva):
  // kada je galerija ~1200px daleko, SVE kartice krecu da se skidaju odjednom.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !("IntersectionObserver" in window)) {
      setNearby(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNearby(true);
          observer.disconnect();
        }
      },
      { rootMargin: "1200px 0px" },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Strelice se gase na krajevima reda (state se menja samo kada se kraj promeni).
  const updateEdges = useCallback(() => {
    const row = rowRef.current;
    if (!row) return;
    const atStart = row.scrollLeft <= 2;
    const atEnd = row.scrollLeft >= row.scrollWidth - row.clientWidth - 2;
    setEdges((prev) => (prev.atStart === atStart && prev.atEnd === atEnd ? prev : { atStart, atEnd }));
  }, []);

  useEffect(() => {
    updateEdges();
    window.addEventListener("resize", updateEdges);
    return () => window.removeEventListener("resize", updateEdges);
  }, [updateEdges]);

  // Vucenje misem. Touch koristi nativni horizontalni skrol (+ snap).
  useEffect(() => {
    const row = rowRef.current;

    const onDown = (event) => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      drag.current = { active: true, moved: false, startX: event.clientX, startScroll: row.scrollLeft };
    };
    const onMove = (event) => {
      const state = drag.current;
      if (!state.active) return;
      const delta = event.clientX - state.startX;
      if (!state.moved && Math.abs(delta) > DRAG_THRESHOLD) {
        state.moved = true;
        row.classList.add("is-dragging");
      }
      if (state.moved) row.scrollLeft = state.startScroll - delta;
    };
    const onUp = () => {
      if (!drag.current.active) return;
      drag.current.active = false;
      row.classList.remove("is-dragging");
    };

    row.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      row.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  // Klik posle vucenja ne sme da otvori sobu.
  const onClickCapture = (event) => {
    if (drag.current.moved) {
      event.preventDefault();
      event.stopPropagation();
      drag.current.moved = false;
    }
  };

  const step = (direction) => {
    const row = rowRef.current;
    const card = row.firstElementChild;
    const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
    row.scrollBy({ left: direction * (card ? card.offsetWidth + gap : row.clientWidth * 0.8), behavior: "smooth" });
  };

  const open = (room, event) => {
    openerRef.current = event?.currentTarget ?? null;
    setOpenRoom(room);
    setLightboxIndex(0);
    onLightboxChange?.(true);
  };

  const close = () => {
    setLightboxIndex(null);
    setOpenRoom(null);
    onLightboxChange?.(false);
    // Fokus nazad na karticu koja je otvorila sobu (posle uklanjanja inert-a sa #root).
    requestAnimationFrame(() => openerRef.current?.focus({ preventScroll: true }));
  };

  return (
    <section
      ref={sectionRef}
      id="galerija"
      aria-labelledby="gallery-title"
      className="overflow-hidden bg-paper pb-[clamp(5rem,10vw,9rem)] pt-[clamp(2rem,5vw,4rem)] text-ink"
    >
      <div className="flex items-end justify-between gap-6 page-x">
        <SectionTitle id="gallery-title">galerija.</SectionTitle>

        <div data-reveal className="mb-[1.2vw] hidden gap-2 sm:flex">
          {CONTROLS.map((control) => (
            <button
              key={control.dir}
              type="button"
              onClick={() => step(control.dir)}
              disabled={edges[control.edge]}
              aria-label={control.label}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-paper transition duration-300 hover:scale-105 disabled:scale-100 disabled:bg-ink/10 disabled:text-ink/35"
            >
              <Chevron direction={control.icon} className="h-5 w-5" />
            </button>
          ))}
        </div>
      </div>

      <ul
        ref={rowRef}
        data-reveal
        data-cursor="drag"
        onScroll={updateEdges}
        onClickCapture={onClickCapture}
        aria-label="Sobe apartmana"
        className="gallery-row mt-[clamp(2.5rem,6vw,4.5rem)] flex gap-3 overflow-x-auto page-x pointer-coarse:snap-x pointer-coarse:snap-mandatory sm:gap-4"
      >
        {rooms.map((room) => (
          <li key={room.id} className="w-[72vw] flex-none snap-start sm:w-[42vw] md:w-[36vw] lg:w-[28vw]">
            <button
              type="button"
              onClick={(event) => open(room, event)}
              onPointerEnter={() => preloadRoom(room)}
              onTouchStart={() => preloadRoom(room)}
              onFocus={() => preloadRoom(room)}
              aria-label={`${room.label} - otvori ${photoCount(room.photos.length)}`}
              className="group relative block aspect-[4/5] max-h-[70svh] min-h-[260px] w-full overflow-hidden rounded-[1.5rem] bg-mist sm:rounded-[1.75rem]"
              style={{ backgroundImage: `url(${room.cover.lqip})`, backgroundSize: "cover", backgroundPosition: "center" }}
            >
              <img
                ref={watchLoaded}
                src={nearby ? room.cover.thumb : undefined}
                srcSet={nearby ? photoSrcSet(room.cover) : undefined}
                sizes={CARD_SIZES}
                alt={room.label}
                fetchPriority="low"
                decoding="async"
                onLoad={(event) => markLoaded(event.currentTarget)}
                draggable="false"
                width={room.cover.w}
                height={room.cover.h}
                className="gallery-card-image pointer-events-none absolute inset-0 h-full w-full select-none object-cover transition-[transform,opacity] duration-[900ms] ease-out group-hover:scale-[1.04]"
              />
              <span className="absolute bottom-3 left-3 flex max-w-[calc(100%-1.5rem)] items-center gap-3 rounded-full bg-paper/[0.92] py-1.5 pl-4 pr-1.5 text-left sm:bottom-4 sm:left-4 sm:py-2 sm:pr-2">
                <span className="min-w-0 truncate text-sm font-semibold tracking-[-0.01em] sm:text-base">
                  {room.label}
                  <span className="ml-2 font-medium opacity-60">{room.photos.length}</span>
                </span>
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-ink text-paper transition-transform duration-300 group-hover:translate-x-0.5"
                >
                  <Chevron className="h-3.5 w-3.5" />
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <Lightbox
        photos={openRoom?.photos ?? []}
        title={openRoom?.label}
        index={lightboxIndex}
        onClose={close}
        onNavigate={setLightboxIndex}
      />
    </section>
  );
}
