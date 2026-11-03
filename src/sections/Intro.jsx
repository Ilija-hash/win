import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { PillLink, SectionTitle } from "../components/Section";
import { useReveal } from "../hooks/useReveal";
import { getBookingHref } from "../lib/booking";
import terraceImage from "../assets/gallery/terasa/20240412_163603-1600.webp";

export default function Intro() {
  const sectionRef = useRef(null);
  const imageRef = useRef(null);
  useReveal(sectionRef);

  // Blagi parallax: slika klizi sporije od okvira.
  useLayoutEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return undefined;
    const context = gsap.context(() => {
      gsap.fromTo(
        imageRef.current,
        { yPercent: -8 },
        {
          yPercent: 8,
          ease: "none",
          scrollTrigger: { trigger: imageRef.current.parentElement, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    }, sectionRef);
    return () => context.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="o-stanu"
      aria-labelledby="intro-title"
      className="bg-[#e9e9e9] px-5 py-[clamp(5rem,10vw,9rem)] text-[#141414] sm:px-8 lg:px-10"
    >
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
        <div>
          <SectionTitle id="intro-title">
            o stanu.
          </SectionTitle>
          <p
            data-reveal
            className="mt-8 max-w-[22ch] text-[clamp(1.6rem,3vw,2.75rem)] font-semibold leading-[1.1] tracking-[-0.04em]"
          >
            Svetao, miran stan za sporija jutra, duge šetnje i sve ono između.
          </p>
          <p data-reveal className="mt-6 max-w-lg text-base leading-relaxed text-[#141414]/65 sm:text-lg">
            Promišljeni detalji, tople boje i sve što je potrebno za odmor — bilo da dolazite u dvoje, sa porodicom ili
            društvom. Banja, planina i centar grada su na par minuta hoda.
          </p>
          <div data-reveal className="mt-10">
            <PillLink href={getBookingHref()}>Rezerviši boravak</PillLink>
          </div>
        </div>

        <div data-reveal className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-[#d7d7d7] sm:rounded-[2rem]">
          <img
            ref={imageRef}
            src={terraceImage}
            alt="Terasa apartmana"
            loading="lazy"
            decoding="async"
            className="absolute inset-x-0 -top-[10%] h-[120%] w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
