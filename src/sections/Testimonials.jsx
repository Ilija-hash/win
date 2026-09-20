import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { testimonials } from "../data/testimonials";
import { useDarkSection } from "../hooks/useDarkSection";

export default function Testimonials() {
  const sectionRef = useRef(null);
  const listRef = useRef(null);

  useDarkSection(sectionRef);

  useLayoutEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return undefined;

    const context = gsap.context(() => {
      gsap.fromTo(
        listRef.current.children,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: listRef.current, start: "top 80%" },
        },
      );
    }, sectionRef);

    return () => context.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="utisci"
      aria-labelledby="testimonials-title"
      className="flex flex-col bg-[#101010] px-5 py-[clamp(5rem,10vw,9rem)] text-[#e9e9e9] sm:px-8 lg:px-10"
    >
      <div className="flex items-center justify-between border-b border-[#e9e9e9]/25 pb-4 text-[0.7rem] font-bold uppercase tracking-[0.2em] sm:text-xs">
        <p>Utisci gostiju</p>
        <p>( 03 )</p>
      </div>

      <h2
        id="testimonials-title"
        className="font-melodrama mt-[clamp(3rem,7vw,6rem)] max-w-[14ch] text-[clamp(3.5rem,10vw,9rem)] font-normal leading-[0.82] tracking-[-0.045em]"
      >
        Šta kažu oni koji su već bili.
      </h2>

      <div ref={listRef} className="mt-[clamp(3rem,7vw,6rem)] grid gap-px bg-[#e9e9e9]/15 sm:grid-cols-2">
        {testimonials.map((item) => (
          <figure key={`${item.name}-${item.date}`} className="flex flex-col bg-[#101010] p-6 sm:p-8 lg:p-10">
            <blockquote className="text-[clamp(1.1rem,1.9vw,1.6rem)] font-semibold leading-snug tracking-[-0.02em]">
              „{item.text}”
            </blockquote>
            <figcaption className="mt-auto pt-8 text-[0.7rem] font-bold uppercase tracking-[0.2em] opacity-60 sm:text-xs">
              {item.name} — {item.city} · {item.date}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
