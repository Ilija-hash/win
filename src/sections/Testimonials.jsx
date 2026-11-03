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

  return (
    <section
      ref={sectionRef}
      id="utisci"
      aria-labelledby="testimonials-title"
      className="bg-[#d8d4ca] px-5 pb-[clamp(7rem,13vw,12rem)] pt-[clamp(5rem,10vw,9rem)] text-[#141414] sm:px-8 lg:px-10"
    >
      <SectionTitle id="testimonials-title">
        utisci.
      </SectionTitle>

      <div data-reveal className="mt-[clamp(2.5rem,6vw,4.5rem)] rounded-[1.75rem] bg-[#ece9e2] p-6 sm:rounded-[2.5rem] sm:p-10 lg:p-14">
        {/* Svi citati su slozeni u istu celiju, pa visina ne skace pri promeni. */}
        <div ref={quotesRef} className="grid">
          {testimonials.map((item, index) => {
            const isActive = index === active;
            return (
              <figure
                key={`${item.name}-${item.date}`}
                aria-hidden={!isActive}
                className={`col-start-1 row-start-1 ${isActive ? "" : "invisible opacity-0"}`}
              >
                <blockquote className="font-melodrama max-w-[28ch] text-[clamp(2rem,4.6vw,4.25rem)] leading-[1] tracking-[-0.035em]">
                  „{item.text}”
                </blockquote>
                <figcaption className="mt-8 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#141414] text-sm font-bold text-[#e9e9e9]">
                    {item.name.charAt(0)}
                  </span>
                  <span className="text-sm leading-tight">
                    <span className="block font-bold">{item.name}</span>
                    <span className="opacity-60">
                      {item.city} · {item.date}
                    </span>
                  </span>
                </figcaption>
              </figure>
            );
          })}
        </div>

        <div className="mt-10 flex items-center justify-between gap-6">
          <div className="flex gap-2">
            {testimonials.map((item, index) => (
              <button
                key={`${item.name}-dot`}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Utisak ${index + 1} od ${testimonials.length}`}
                aria-current={index === active}
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  index === active ? "w-8 bg-[#141414]" : "w-2.5 bg-[#141414]/25 hover:bg-[#141414]/50"
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {CONTROLS.map((control) => (
              <button
                key={control.step}
                type="button"
                onClick={() => go(control.step)}
                aria-label={control.label}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-[#141414] text-[#e9e9e9] transition-transform duration-300 hover:scale-105"
              >
                <Chevron direction={control.icon} className="h-5 w-5" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
