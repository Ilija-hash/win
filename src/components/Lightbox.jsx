import { useCallback, useEffect, useRef } from "react";
import gsap from "gsap";

export default function Lightbox({ photos, index, onClose, onNavigate }) {
  const panelRef = useRef(null);
  const figureRef = useRef(null);
  const touchStartX = useRef(null);

  const open = index !== null;
  const photo = open ? photos[index] : null;

  const goPrev = useCallback(() => {
    if (!open) return;
    onNavigate((index - 1 + photos.length) % photos.length);
  }, [index, onNavigate, open, photos.length]);

  const goNext = useCallback(() => {
    if (!open) return;
    onNavigate((index + 1) % photos.length);
  }, [index, onNavigate, open, photos.length]);

  // Tastatura
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      else if (event.key === "ArrowLeft") goPrev();
      else if (event.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNext, goPrev, onClose, open]);

  // Ulazna animacija panela
  useEffect(() => {
    if (!open) return undefined;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tween = gsap.fromTo(
      figureRef.current,
      { opacity: 0, scale: 0.985 },
      { opacity: 1, scale: 1, duration: reduceMotion ? 0 : 0.4, ease: "power3.out" },
    );
    return () => tween.kill();
  }, [index, open]);

  if (!open) return null;

  const onTouchStart = (event) => {
    touchStartX.current = event.changedTouches[0].clientX;
  };

  const onTouchEnd = (event) => {
    if (touchStartX.current === null) return;
    const delta = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 50) return;
    if (delta > 0) goPrev();
    else goNext();
  };

  return (
    <div
      ref={panelRef}
      className="fixed inset-0 z-[900] flex flex-col bg-[#101010] text-[#e9e9e9]"
      role="dialog"
      aria-modal="true"
      aria-label={`Fotografija ${index + 1} od ${photos.length}`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="flex items-center justify-between px-5 py-4 sm:px-8 sm:py-6 lg:px-10">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] sm:text-xs">
          {String(index + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Zatvori galeriju"
          className="menu-button is-open relative h-6 w-9 sm:h-8 sm:w-11"
        >
          <span />
          <span />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-4 sm:px-8 sm:pb-8">
        <button
          type="button"
          onClick={goPrev}
          aria-label="Prethodna fotografija"
          className="absolute left-2 z-10 flex h-12 w-12 items-center justify-center rounded-full text-2xl transition-opacity hover:opacity-60 sm:left-6"
        >
          &#8592;
        </button>

        <figure ref={figureRef} className="flex h-full max-h-full items-center justify-center">
          <img
            src={photo.full}
            alt={`${photo.label} - fotografija ${index + 1}`}
            className="max-h-[78svh] w-auto max-w-full object-contain"
          />
        </figure>

        <button
          type="button"
          onClick={goNext}
          aria-label="Sledeća fotografija"
          className="absolute right-2 z-10 flex h-12 w-12 items-center justify-center rounded-full text-2xl transition-opacity hover:opacity-60 sm:right-6"
        >
          &#8594;
        </button>
      </div>

      <p className="px-5 pb-6 text-center text-[0.7rem] font-bold uppercase tracking-[0.2em] opacity-60 sm:px-8 sm:text-xs">
        {photo.label}
      </p>
    </div>
  );
}
