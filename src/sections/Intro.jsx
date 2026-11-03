import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { PillLink, SectionTitle } from "../components/Section";
import { useReveal } from "../hooks/useReveal";
import { getBookingHref } from "../lib/booking";
import terraceImage from "../assets/gallery/terasa/20240412_163603-1600.webp";
import terraceImage800 from "../assets/gallery/terasa/20240412_163603-800.webp";
import terraceImage1200 from "../assets/gallery/terasa/20240412_163603-1200.webp";

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
      className="bg-[#e9e9e9] page-x py-[clamp(5rem,10vw,9rem)] text-[#141414]"
    >
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
        <div>
          <SectionTitle id="intro-title">
            o stanu.
          </SectionTitle>
          <p
            data-reveal
            className="mt-8 max-w-[24ch] text-[clamp(1.6rem,3vw,2.75rem)] font-semibold leading-[1.1] tracking-[-0.04em]"
          >
            {/* Odgovor na pitanje iz hero-a: "nigde nije kao kod kuće?" */}
            Uživajte u udobnosti svog doma, čak i kada ste daleko od njega.
          </p>
          <div data-reveal className="mt-6 max-w-lg space-y-4 text-base leading-relaxed text-[#141414]/65 sm:text-lg">
            <p>
              Apartman Win se nalazi na prvom spratu nove zgrade, u mirnom delu Sokobanje — blizu parka Banjica i hotela
              Sunce, samo 500 metara od centra grada.
            </p>
            <p>Potpuno je opremljen i sastoji se od dnevne sobe, trpezarije, kuhinje, kupatila, spavaće sobe i terase.</p>
          </div>
          <div data-reveal className="mt-10">
            <PillLink href={getBookingHref()} data-booking>
                Rezerviši boravak
              </PillLink>
          </div>
        </div>

        <div data-reveal className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-[#d7d7d7] sm:aspect-[4/3] sm:rounded-[2rem] lg:aspect-[4/5] short:aspect-[16/9]">
          <img
            ref={imageRef}
            src={terraceImage800}
            srcSet={`${terraceImage800} 800w, ${terraceImage1200} 1200w, ${terraceImage} 1600w`}
            sizes="(min-width: 1024px) 45vw, 100vw"
            alt="Terasa apartmana Win u Sokobanji"
            loading="lazy"
            decoding="async"
            className="absolute inset-x-0 -top-[10%] h-[120%] w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
