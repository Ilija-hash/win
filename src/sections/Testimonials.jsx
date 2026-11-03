import { Chevron } from "../components/Icons";
import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { SectionTitle } from "../components/Section";
import { useReveal } from "../hooks/useReveal";
import { testimonials } from "../data/testimonials";

const CONTROLS = [
  { step: -1, label: "Prethodni utisak", icon: "left" },
  { step: 1, label: "Sledeći utisak", icon: "right" },
];

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const sectionRef = useRef(null);
  const quotesRef = useRef(null);
  const isFirstRender = useRef(true);

  useReveal(sectionRef);

  // Prelaz izmedju citata (ne na prvom renderu - tada radi useReveal).
  useLayoutEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return undefined;
    }
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const current = quotesRef.current?.children[active];
    if (!current || reduceMotion) return undefined;
    const tween = gsap.fromTo(current, { y: 32, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" });
    return () => tween.kill();
  }, [active]);

  const go = (step) => setActive((index) => (index + step + testimonials.length) % testimonials.length);

  // Swipe prstom levo/desno menja utisak. Vertikalni pokret ostaje skrol stranice
  // (touch-pan-y), a swipe mora da bude vise horizontalan nego vertikalan.
  const swipe = useRef({ x: 0, y: 0 });
  const onTouchStart = (event) => {
    const point = event.touches[0];
    swipe.current = { x: point.clientX, y: point.clientY };
  };
  const onTouchEnd = (event) => {
    const point = event.changedTouches[0];
    const dx = point.clientX - swipe.current.x;
    const dy = point.clientY - swipe.current.y;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
    go(dx < 0 ? 1 : -1);
  };

  // Bez utisaka nema ni sekcije (link "utisci" u meniju se sakriva u src/data/site.js).
  if (testimonials.length === 0) return null;
  const hasMany = testimonials.length > 1;

  return (
    <section
      ref={sectionRef}
      id="utisci"
      aria-labelledby="testimonials-title"
      className="bg-[#d8d4ca] page-x pb-[clamp(7rem,13vw,12rem)] pt-[clamp(5rem,10vw,9rem)] text-[#141414]"
    >
      <SectionTitle id="testimonials-title">utisci.</SectionTitle>

      <div
        data-reveal
        onTouchStart={hasMany ? onTouchStart : undefined}
        onTouchEnd={hasMany ? onTouchEnd : undefined}
        className="mt-[clamp(2.5rem,6vw,4.5rem)] touch-pan-y pointer-coarse:select-none rounded-[1.5rem] bg-[#ece9e2] p-6 sm:rounded-[2rem] sm:p-10 lg:p-14 short:p-6">
        {/* Svi citati su slozeni u istu celiju, pa visina ne skace pri promeni. */}
        <div ref={quotesRef} className="grid">
          {testimonials.map((item, index) => {
            const isActive = index === active;
            return (
              <figure
                key={`${index}-${item.name}`}
                aria-hidden={!isActive}
                className={`col-start-1 row-start-1 ${isActive ? "" : "invisible opacity-0"}`}
              >
                {/* Melodrama nema znakove „ ” (browser ih crta drugim fontom), pa je navodnik
                    nacrtan kao SVG - uvek isti, nezavisno od fonta. */}
                <svg
                  viewBox="0 0 48 36"
                  aria-hidden="true"
                  className="mb-5 h-7 w-auto fill-current opacity-90 sm:mb-7 sm:h-10"
                >
                  <path d="M0 36V22.6C0 9.9 6.9 2.3 19 0l2.2 5.2C14.3 7.4 10.9 11.7 10.5 18H20v18H0Zm27 0V22.6C27 9.9 33.9 2.3 46 0l2 5.2c-6.9 2.2-10.3 6.5-10.7 12.8H47v18H27Z" />
                </svg>
                <blockquote className="font-melodrama max-w-[28ch] text-[clamp(1.65rem,4.6vw,4.25rem)] leading-[1] tracking-[-0.035em] short:text-[1.6rem]">
                  {item.text}
                </blockquote>
                <figcaption className="mt-8 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#141414] text-sm font-bold text-[#e9e9e9]">
                    {item.name.charAt(0)}
                  </span>
                  <span className="text-sm leading-tight">
                    <span className="block font-bold">{item.name}</span>
                    <span className="opacity-60">{[item.city, item.date].filter(Boolean).join(" · ")}</span>
                  </span>
                </figcaption>
              </figure>
            );
          })}
        </div>

        {hasMany && (
          <div className="mt-10 flex items-center justify-between gap-6">
            {/* Telefon: brojac umesto tackica - staje za bilo koji broj utisaka
                (9 tackica + strelice je bilo sire od ekrana i sirilo celu stranicu). */}
            <p className="text-sm font-semibold tabular-nums sm:hidden" aria-live="polite">
              {active + 1} / {testimonials.length}
            </p>
            {/* Od sm: tackice; vidljiva je mala, a dugme oko nje ima ~30px za prst. */}
            <div className="-ml-2.5 hidden min-w-0 flex-wrap sm:flex">
              {testimonials.map((item, index) => (
                <button
                  key={`${index}-${item.name}-dot`}
                  type="button"
                  onClick={() => setActive(index)}
                  aria-label={`Utisak ${index + 1} od ${testimonials.length}`}
                  aria-current={index === active}
                  className="group p-2.5"
                >
                  <span
                    className={`block h-2.5 rounded-full transition-[width,background-color] duration-500 ${
                      index === active ? "w-8 bg-[#141414]" : "w-2.5 bg-[#141414]/25 group-hover:bg-[#141414]/50"
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="flex flex-none gap-2">
              {CONTROLS.map((control) => (
                <button
                  key={control.step}
                  type="button"
                  onClick={() => go(control.step)}
                  aria-label={control.label}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-[#141414] text-[#e9e9e9] transition-transform duration-300 hover:scale-105 sm:h-12 sm:w-12"
                >
                  <Chevron direction={control.icon} className="h-5 w-5" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
