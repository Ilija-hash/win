import { useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lightbox from "../components/Lightbox";
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

// Folder "trepezarija" je zateceno ime; labela je ispravna.
const ROOM_LABELS = {
  dnevna: "Dnevna soba",
  spavaca: "Spavaća soba",
  kuhinja: "Kuhinja",
  trepezarija: "Trpezarija",
  kupatilo: "Kupatilo",
  terasa: "Terasa",
  hodnik: "Hodnik",
  lift: "Lift",
  zgrada: "Zgrada",
};

const ROOM_ORDER = ["dnevna", "spavaca", "kuhinja", "trepezarija", "kupatilo", "terasa", "hodnik", "lift", "zgrada"];

const photos = manifest
  .map((item) => ({
    ...item,
    label: ROOM_LABELS[item.room] ?? item.room,
    thumb: thumbMap[`${item.room}/${item.slug}`],
    full: fullMap[`${item.room}/${item.slug}`],
  }))
  .filter((item) => item.thumb && item.full)
  .sort((a, b) => ROOM_ORDER.indexOf(a.room) - ROOM_ORDER.indexOf(b.room) || a.slug.localeCompare(b.slug));

const availableRooms = ROOM_ORDER.filter((room) => photos.some((photo) => photo.room === room));

export default function Gallery({ onLightboxChange }) {
  const [activeRoom, setActiveRoom] = useState("all");
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const gridRef = useRef(null);
  const headingRef = useRef(null);

  const visible = useMemo(
    () => (activeRoom === "all" ? photos : photos.filter((photo) => photo.room === activeRoom)),
    [activeRoom],
  );

  // Naslov ulazi na scroll
  useLayoutEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return undefined;

    const context = gsap.context(() => {
      gsap.fromTo(
        headingRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: headingRef.current, start: "top 85%" },
        },
      );
    }, headingRef);

    return () => context.revert();
  }, []);

  // Stagger pri promeni filtera
  useLayoutEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !gridRef.current) return undefined;

    const context = gsap.context(() => {
      gsap.fromTo(
        gridRef.current.children,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.03, ease: "power2.out", onComplete: () => ScrollTrigger.refresh() },
      );
    }, gridRef);

    return () => context.revert();
  }, [activeRoom]);

  const openLightbox = (photo) => {
    const index = visible.indexOf(photo);
    setLightboxIndex(index);
    onLightboxChange?.(true);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    onLightboxChange?.(false);
  };

  return (
    <section
      id="galerija"
      aria-labelledby="gallery-title"
      className="flex flex-col bg-[#e9e9e9] px-5 py-[clamp(5rem,10vw,9rem)] text-[#141414] sm:px-8 lg:px-10"
    >
      <div className="flex items-center justify-between border-b border-[#141414]/30 pb-4 text-[0.7rem] font-bold uppercase tracking-[0.2em] sm:text-xs">
        <p>Galerija</p>
        <p>( 02 )</p>
      </div>

      <h2
        ref={headingRef}
        id="gallery-title"
        className="font-melodrama mt-[clamp(3rem,7vw,6rem)] max-w-[12ch] text-[clamp(3.5rem,10vw,9rem)] font-normal leading-[0.82] tracking-[-0.045em]"
      >
        Pogledaj svaki ugao.
      </h2>

      <div className="mt-[clamp(2.5rem,5vw,4rem)] flex flex-wrap gap-2">
        {["all", ...availableRooms].map((room) => {
          const isActive = activeRoom === room;
          return (
            <button
              key={room}
              type="button"
              onClick={() => setActiveRoom(room)}
              aria-pressed={isActive}
              className={`rounded-full border px-4 py-2 text-[0.7rem] font-bold uppercase tracking-[0.15em] transition-colors duration-200 sm:text-xs ${
                isActive
                  ? "border-[#141414] bg-[#141414] text-[#e9e9e9]"
                  : "border-[#141414]/25 text-[#141414] hover:border-[#141414]/60"
              }`}
            >
              {room === "all" ? "Sve" : ROOM_LABELS[room]}
            </button>
          );
        })}
      </div>

      <div ref={gridRef} className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
        {visible.map((photo) => (
          <button
            key={`${photo.room}/${photo.slug}`}
            type="button"
            onClick={() => openLightbox(photo)}
            aria-label={`Otvori fotografiju - ${photo.label}`}
            className="group relative aspect-[4/5] overflow-hidden bg-[#d7d7d7]"
          >
            <img
              src={photo.thumb}
              alt={photo.label}
              loading="lazy"
              decoding="async"
              width={photo.w}
              height={photo.h}
              style={{ backgroundImage: `url(${photo.lqip})`, backgroundSize: "cover", backgroundPosition: "center" }}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            />
          </button>
        ))}
      </div>

      <Lightbox photos={visible} index={lightboxIndex} onClose={closeLightbox} onNavigate={setLightboxIndex} />
    </section>
  );
}
