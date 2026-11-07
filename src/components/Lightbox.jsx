import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { Chevron, UiIcon } from "./Icons";
import { prefersReducedMotion } from "../lib/motion";
import { largeSrcSet, preloadPhoto } from "../lib/photos";

const ZOOM = 2.5;
const DOUBLE_TAP_MS = 300;

const clamp = (value) => Math.min(100, Math.max(0, value));

export default function Lightbox({ photos, title, index, onClose, onNavigate }) {
  const panelRef = useRef(null);
  const figureRef = useRef(null);
  const imageRef = useRef(null);
  const stripRef = useRef(null);
  const closeRef = useRef(null);
  const touch = useRef({ startX: 0, startY: 0, lastTap: 0, originX: 50, originY: 50, moved: false });
  const lastTouchAt = useRef(0);
  const [zoomed, setZoomed] = useState(false);

  const open = index !== null;
  const photo = open ? photos[index] : null;

  // Origin zuma pisemo direktno u style (prati pointer), bez re-rendera.
  const origin = useRef({ x: 50, y: 50 });
  const applyOrigin = useCallback((x, y) => {
    origin.current = { x: clamp(x), y: clamp(y) };
    if (imageRef.current) imageRef.current.style.transformOrigin = `${origin.current.x}% ${origin.current.y}%`;
  }, []);

  const pointToPercent = (clientX, clientY) => {
    const rect = imageRef.current.getBoundingClientRect();
    // rect je skaliran kada je zumirano - vracamo se u koordinate neskalirane slike
    return { x: ((clientX - rect.left) / rect.width) * 100, y: ((clientY - rect.top) / rect.height) * 100 };
  };

  const zoomAt = (clientX, clientY) => {
    const point = pointToPercent(clientX, clientY);
    applyOrigin(point.x, point.y);
    setZoomed(true);
  };

  const goPrev = useCallback(() => {
    if (!open) return;
    onNavigate((index - 1 + photos.length) % photos.length);
  }, [index, onNavigate, open, photos.length]);

  const goNext = useCallback(() => {
    if (!open) return;
    onNavigate((index + 1) % photos.length);
  }, [index, onNavigate, open, photos.length]);

  // Nova slika ili zatvaranje -> zoom 1x
  useEffect(() => {
    setZoomed(false);
    applyOrigin(50, 50);
  }, [index, open, applyOrigin]);

  // Slika nestaje bez pointerout dogadjaja - ocisti zoom stanje kursora.
  useEffect(() => {
    if (open) return undefined;
    document.querySelector(".custom-cursor")?.classList.remove("is-zoom");
    return undefined;
  }, [open]);

  // Kursor prikazuje +/- u zavisnosti od stanja.
  useEffect(() => {
    document.documentElement.classList.toggle("lightbox-zoomed", zoomed);
    return () => document.documentElement.classList.remove("lightbox-zoomed");
  }, [zoomed]);

  // Tastatura
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        if (zoomed) setZoomed(false);
        else onClose();
      } else if (!zoomed && event.key === "ArrowLeft") goPrev();
      else if (!zoomed && event.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNext, goPrev, onClose, open, zoomed]);

  // Tastatura ostaje u lightbox-u: sajt iza (#root) je inert dok je otvoren,
  // a fokus pocinje na dugmetu za zatvaranje. Lightbox je portal u <body>, van #root-a.
  useEffect(() => {
    if (!open) return undefined;
    const root = document.getElementById("root");
    if (root) root.inert = true;
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      if (root) root.inert = false;
    };
  }, [open]);

  // Ulazna animacija panela
  useEffect(() => {
    if (!open) return undefined;
    const reduceMotion = prefersReducedMotion();
    const tween = gsap.fromTo(
      panelRef.current,
      { opacity: 0 },
      { opacity: 1, duration: reduceMotion ? 0 : 0.35, ease: "power2.out" },
    );
    return () => tween.kill();
  }, [open]);

  // Prelaz izmedju slika
  useEffect(() => {
    if (!open || !figureRef.current) return undefined;
    const reduceMotion = prefersReducedMotion();
    const tween = gsap.fromTo(
      figureRef.current,
      { opacity: 0, scale: 0.985 },
      { opacity: 1, scale: 1, duration: reduceMotion ? 0 : 0.4, ease: "power3.out" },
    );
    return () => tween.kill();
  }, [index, open]);

  // Sledeca i prethodna slika se skidaju unapred - prelaz strelicom/swipe-om je bez cekanja.
  useEffect(() => {
    if (!open || photos.length < 2) return;
    [index + 1, index - 1].forEach((neighbour) => preloadPhoto(photos[(neighbour + photos.length) % photos.length]));
  }, [index, open, photos]);

  // Aktivna mala slika uvek ostaje vidljiva u traci.
  useEffect(() => {
    if (!open) return;
    const active = stripRef.current?.children[index];
    active?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [index, open]);

  if (!open) return null;

  // --- Mis: klik zumira na mesto klika, pomeranje misa pomera zumiranu sliku ---
  const onImageClick = (event) => {
    if (Date.now() - lastTouchAt.current < 700) return; // klik koji je browser izmislio posle tapa
    if (zoomed) setZoomed(false);
    else zoomAt(event.clientX, event.clientY);
  };

  const onImageMouseMove = (event) => {
    if (!zoomed) return;
    const rect = figureRef.current.getBoundingClientRect();
    applyOrigin(((event.clientX - rect.left) / rect.width) * 100, ((event.clientY - rect.top) / rect.height) * 100);
  };

  // --- Touch: dupli tap zumira, prst pomera zumiranu sliku, swipe menja sliku ---
  const onTouchStart = (event) => {
    if (event.touches.length > 1) return;
    const point = event.touches[0];
    touch.current = {
      ...touch.current,
      startX: point.clientX,
      startY: point.clientY,
      originX: origin.current.x,
      originY: origin.current.y,
      moved: false,
    };
  };

  const onTouchMove = (event) => {
    if (!zoomed || event.touches.length > 1) return;
    const point = event.touches[0];
    const rect = figureRef.current.getBoundingClientRect();
    const dx = point.clientX - touch.current.startX;
    const dy = point.clientY - touch.current.startY;
    if (Math.abs(dx) + Math.abs(dy) > 4) touch.current.moved = true;
    // Pomeraj origin-a za -d/(zoom-1) daje osecaj da slika prati prst.
    applyOrigin(
      touch.current.originX - (dx / rect.width) * (100 / (ZOOM - 1)),
      touch.current.originY - (dy / rect.height) * (100 / (ZOOM - 1)),
    );
  };

  const onTouchEnd = (event) => {
    lastTouchAt.current = Date.now();
    const point = event.changedTouches[0];
    const dx = point.clientX - touch.current.startX;
    const dy = point.clientY - touch.current.startY;
    const isTap = Math.abs(dx) < 12 && Math.abs(dy) < 12;

    if (isTap) {
      const now = Date.now();
      if (now - touch.current.lastTap < DOUBLE_TAP_MS) {
        touch.current.lastTap = 0;
        if (zoomed) setZoomed(false);
        else zoomAt(point.clientX, point.clientY);
      } else {
        touch.current.lastTap = now;
      }
      return;
    }

    if (zoomed || Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx > 0) goPrev();
    else goNext();
  };

  const navButton =
    "absolute top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-night/45 backdrop-blur-md transition duration-300 hover:bg-night/70";

  return createPortal(
    <div
      ref={panelRef}
      className="fixed inset-0 z-[900] flex flex-col bg-night text-paper"
      role="dialog"
      aria-modal="true"
      aria-label={`${title ?? photo.label} - fotografija ${index + 1} od ${photos.length}`}
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 short:py-1.5">
        <p className="flex min-w-0 items-baseline gap-3">
          <span className="font-melodrama truncate text-[clamp(1.6rem,2.6vw,2.25rem)] leading-none short:text-2xl tracking-[-0.03em]">
            {title ?? photo.label}
          </span>
          <span className="text-sm font-semibold opacity-60">
            {index + 1} / {photos.length}
          </span>
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => (zoomed ? setZoomed(false) : (applyOrigin(50, 50), setZoomed(true)))}
            aria-label={zoomed ? "Umanji fotografiju" : "Uvećaj fotografiju"}
            aria-pressed={zoomed}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition-colors duration-300 hover:bg-white/20"
          >
            <UiIcon name={zoomed ? "zoomOut" : "zoomIn"} />
          </button>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Zatvori galeriju"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition-colors duration-300 hover:bg-white/20"
          >
            <UiIcon name="close" />
          </button>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 px-2 sm:px-6">
        <figure
          ref={figureRef}
          data-cursor="zoom"
          onClick={onImageClick}
          onMouseMove={onImageMouseMove}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className="relative h-full w-full touch-none overflow-hidden rounded-[1rem] sm:rounded-[1.5rem]"
        >
          <img
            ref={imageRef}
            src={photo.full}
            srcSet={largeSrcSet(photo)}
            sizes="100vw"
            alt={`${photo.label} - fotografija ${index + 1}`}
            draggable="false"
            className="lightbox-image h-full w-full select-none object-contain"
            style={{ transform: zoomed ? `scale(${ZOOM})` : "scale(1)" }}
          />
        </figure>

        {!zoomed && photos.length > 1 && (
          <>
            <button type="button" onClick={goPrev} aria-label="Prethodna fotografija" className={`${navButton} left-4 sm:left-9`}>
              <Chevron direction="left" className="h-5 w-5" />
            </button>
            <button type="button" onClick={goNext} aria-label="Sledeća fotografija" className={`${navButton} right-4 sm:right-9`}>
              <Chevron className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Traka sa malim slikama - jasno je da je ovo slider cele sobe. */}
      <div ref={stripRef} className="lightbox-strip flex gap-2 overflow-x-auto px-4 py-3 sm:justify-center sm:px-6 short:hidden">
        {photos.map((item, itemIndex) => (
          <button
            key={item.key ?? item.full}
            type="button"
            onClick={() => onNavigate(itemIndex)}
            aria-label={`Fotografija ${itemIndex + 1}`}
            aria-current={itemIndex === index}
            className={`h-12 w-12 flex-none overflow-hidden rounded-lg transition duration-300 sm:h-14 sm:w-14 sm:rounded-xl ${
              itemIndex === index ? "opacity-100 ring-2 ring-paper ring-offset-2 ring-offset-night" : "opacity-40 hover:opacity-80"
            }`}
          >
            <img src={item.thumb} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>,
    document.body,
  );
}
