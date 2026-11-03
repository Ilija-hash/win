import { Chevron } from "../components/Icons";
import { useEffect, useRef, useState } from "react";
import Lightbox from "../components/Lightbox";
import { SectionTitle } from "../components/Section";
import { useReveal } from "../hooks/useReveal";
import { ROOMS } from "../data/site";
import manifest from "../assets/gallery/manifest.json";

// Vite hesira i verzionise ove fajlove sam.
const thumbs = import.meta.glob("../assets/gallery/*/*-800.webp", { eager: true, import: "default" });
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
const fullMap = indexByKey(fulls);

const allPhotos = manifest
  .map((item) => {
    const key = `${item.room}/${item.slug}`;
    return { ...item, key, thumb: thumbMap[key], full: fullMap[key] };
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
  if (last === 1) return `${count} fotografija`;
  if (last >= 2 && last <= 4) return `${count} fotografije`;
  return `${count} fotografija`;
}

const DRAG_THRESHOLD = 5;

export default function Gallery({ onLightboxChange }) {
  const [openRoom, setOpenRoom] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const drag = useRef({ active: false, moved: false, startX: 0, startScroll: 0 });

  useReveal(sectionRef);

  // Vucenje misem. Touch koristi nativni horizontalni skrol (+ snap).
  useEffect(() => {
    const track = trackRef.current;

    const onDown = (event) => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      drag.current = { active: true, moved: false, startX: event.clientX, startScroll: track.scrollLeft };
    };
    const onMove = (event) => {
      const state = drag.current;
      if (!state.active) return;
      const delta = event.clientX - state.startX;
      if (!state.moved && Math.abs(delta) > DRAG_THRESHOLD) {
        state.moved = true;
        track.classList.add("is-dragging");
      }
      if (state.moved) track.scrollLeft = state.startScroll - delta;
    };
    const onUp = () => {
      if (!drag.current.active) return;
      drag.current.active = false;
      track.classList.remove("is-dragging");
    };

    track.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      track.removeEventListener("pointerdown", onDown);
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
    const track = trackRef.current;
    const card = track.firstElementChild;
    const distance = card ? card.offsetWidth + 12 : track.clientWidth * 0.8;
    track.scrollBy({ left: direction * distance, behavior: "smooth" });
  };

  const open = (room) => {
    setOpenRoom(room);
    setLightboxIndex(0);
    onLightboxChange?.(true);
  };

  const close = () => {
    setLightboxIndex(null);
    setOpenRoom(null);
    onLightboxChange?.(false);
  };

  return (
    <section
      ref={sectionRef}
      id="galerija"
      aria-labelledby="gallery-title"
      className="overflow-hidden bg-[#e9e9e9] py-[clamp(5rem,10vw,9rem)] text-[#141414]"
    >
      <div className="flex items-end justify-between gap-6 px-5 sm:px-8 lg:px-10">
        <SectionTitle id="gallery-title">galerija.</SectionTitle>

        <div data-reveal className="mb-[1.2vw] hidden gap-2 sm:flex">
          {[
            { dir: -1, label: "Prethodne sobe", icon: "left" },
            { dir: 1, label: "Sledeće sobe", icon: "right" },
          ].map((control) => (
            <button
              key={control.dir}
              type="button"
              onClick={() => step(control.dir)}
              aria-label={control.label}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#141414] text-[#e9e9e9] transition-transform duration-300 hover:scale-105"
            >
              <Chevron direction={control.icon} className="h-5 w-5" />
            </button>
          ))}
        </div>
      </div>

      <ul
        ref={trackRef}
        data-reveal
        data-cursor="drag"
        onClickCapture={onClickCapture}
        className="gallery-track mt-10 flex gap-3 overflow-x-auto px-5 pointer-coarse:snap-x pointer-coarse:snap-mandatory sm:mt-14 sm:px-8 lg:px-10"
        aria-label="Sobe apartmana"
      >
        {rooms.map((room) => (
          <li key={room.id} className="flex-none snap-start">
            <button
              type="button"
              onClick={() => open(room)}
              aria-label={`${room.label} - otvori ${photoCount(room.photos.length)}`}
              className="group relative block h-[62svh] max-h-[640px] min-h-[380px] w-[78vw] overflow-hidden rounded-[1.5rem] bg-[#d7d7d7] text-left sm:w-[46vw] sm:rounded-[2rem] lg:w-[30vw]"
            >
              <img
                src={room.cover.thumb}
                alt={room.label}
                loading="lazy"
                decoding="async"
                draggable="false"
                width={room.cover.w}
                height={room.cover.h}
                style={{ backgroundImage: `url(${room.cover.lqip})`, backgroundSize: "cover", backgroundPosition: "center" }}
                className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
              />
              <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 to-transparent" />
              <span className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 text-[#e9e9e9] sm:inset-x-6 sm:bottom-6">
                <span>
                  <span className="font-melodrama block text-[clamp(2.25rem,3.6vw,3.5rem)] leading-[0.95] tracking-[-0.03em]">
                    {room.label}
                  </span>
                  <span className="mt-1 block text-sm font-semibold opacity-80">{photoCount(room.photos.length)}</span>
                </span>
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-[#e9e9e9] text-[#141414] transition-transform duration-300 group-hover:translate-x-0.5"
                >
                  <Chevron className="h-4 w-4" />
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
