import { Chevron } from "../components/Icons";
import { useEffect, useRef, useState } from "react";
import { PillLink, SectionTitle } from "../components/Section";
import { useDarkSection } from "../hooks/useDarkSection";
import { useReveal } from "../hooks/useReveal";
import { CONTACT } from "../data/site";
import { getBookingHref } from "../lib/booking";

const LINES = [
  { label: "Telefon", value: CONTACT.phone, href: CONTACT.phoneHref },
  { label: "Email", value: CONTACT.email, href: `mailto:${CONTACT.email}` },
  { label: "Adresa", value: CONTACT.address, href: CONTACT.mapsLink, external: true },
  { label: "Instagram", value: CONTACT.instagram, href: CONTACT.instagramHref, external: true },
];

/**
 * Google mapa bez laga:
 *  - iframe (1 MB+ JS) se ucitava unapred, u slobodnom trenutku, kada je mapa
 *    ~800px ispred - a ne usred skrola na nju;
 *  - providan sloj preko mape pusta tockic/prst da skroluju STRANICU (inace
 *    iframe "proguta" skrol i Lenis zastane). Klik/tap aktivira mapu, a izlazak
 *    misem je ponovo zakljuca.
 */
function MapEmbed() {
  const frameRef = useRef(null);
  const [load, setLoad] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return undefined;
    let idle;
    const schedule = window.requestIdleCallback ?? ((callback) => setTimeout(callback, 200));
    const cancel = window.cancelIdleCallback ?? clearTimeout;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        idle = schedule(() => setLoad(true));
      },
      { rootMargin: "800px 0px" },
    );
    observer.observe(frame);
    return () => {
      observer.disconnect();
      if (idle) cancel(idle);
    };
  }, []);

  // Aktivna mapa se zakljucava cim izadje iz ekrana. Na telefonu `pointerleave`
  // ne stize iz iframe-a, pa bi mapa inace zauvek "gutala" skrol prstom.
  useEffect(() => {
    if (!active) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) setActive(false);
    });
    observer.observe(frameRef.current);
    return () => observer.disconnect();
  }, [active]);

  return (
    <div
      ref={frameRef}
      data-reveal
      onPointerLeave={() => setActive(false)}
      className="map-frame relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-[#1c1c1c] sm:rounded-[2rem] lg:aspect-auto lg:min-h-[34rem]"
    >
      {/* Dok se mapa ne ucita: adresa na tamnoj pozadini */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center opacity-60">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className="h-8 w-8">
          <path d="M12 21s-7-6.1-7-11.5a7 7 0 0 1 14 0C19 14.9 12 21 12 21Z" />
          <circle cx="12" cy="9.5" r="2.5" />
        </svg>
        <p className="text-sm font-semibold">{CONTACT.address}</p>
      </div>

      {load && (
        <iframe
          src={CONTACT.mapsEmbed}
          title={`Mapa - ${CONTACT.address}`}
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 h-full w-full border-0"
        />
      )}

      {!active && (
        <button
          type="button"
          onClick={() => setActive(true)}
          aria-label="Aktiviraj mapu za pomeranje i zumiranje"
          className="group absolute inset-0 flex items-end justify-center pb-5"
        >
          <span className="rounded-full bg-[#101010]/80 px-4 py-2 text-xs font-semibold text-[#e9e9e9] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 pointer-coarse:opacity-100">
            Klikni za interakciju sa mapom
          </span>
        </button>
      )}
    </div>
  );
}

export default function LocationContact() {
  const sectionRef = useRef(null);
  useDarkSection(sectionRef);
  useReveal(sectionRef);

  return (
    // Zaobljeni gornji uglovi + blago preklapanje prethodne sekcije - isti luk kao u hero-u.
    <section
      ref={sectionRef}
      id="kontakt"
      aria-labelledby="contact-title"
      className="surface-dark relative z-10 -mt-[2.5rem] rounded-t-[2rem] bg-[#101010] page-x py-[clamp(5rem,10vw,9rem)] text-[#e9e9e9] sm:-mt-[3.5rem] sm:rounded-t-[3.5rem]"
    >
      <SectionTitle id="contact-title">
        kontakt.
      </SectionTitle>

      <div className="mt-[clamp(2.5rem,6vw,4.5rem)] grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-8">
        <div data-reveal className="flex flex-col">
          <p className="max-w-md text-base leading-relaxed text-[#e9e9e9]/65 sm:text-lg">
            Pozovite nas za slobodne termine i cene — odgovaramo brzo, a rado pomažemo i oko dolaska i preporuka u Sokobanji.
          </p>

          <PillLink href={getBookingHref()} tone="light" className="mt-8">
            {/* Jedan span: PillLink je flex sa gap-3, pa bi "Rezerviši" i broj kao dva
                deteta dobili dodatni razmak izmedju sebe. */}
            <span>
              Rezerviši<span className="hidden min-[381px]:inline"> — {CONTACT.phone}</span>
            </span>
          </PillLink>

          <ul className="mt-10 grid gap-2">
            {LINES.map((line) => (
              <li key={line.label}>
                <a
                  href={line.href}
                  {...(line.external ? { target: "_blank", rel: "noreferrer" } : {})}
                  className="group flex items-center justify-between gap-4 rounded-[1.25rem] bg-white/[0.06] px-5 py-4 transition-colors duration-300 hover:bg-white/[0.12]"
                >
                  <span>
                    <span className="block text-xs font-semibold opacity-55">{line.label}</span>
                    <span className="mt-0.5 block text-[clamp(1.05rem,1.8vw,1.4rem)] font-semibold tracking-[-0.02em]">{line.value}</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-white/10 transition-transform duration-300 group-hover:translate-x-0.5"
                  >
                    <Chevron className="h-4 w-4" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <MapEmbed />
      </div>
    </section>
  );
}
