import { Chevron } from "../components/Icons";
import { useRef } from "react";
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
      className="surface-dark relative z-10 -mt-[2.5rem] rounded-t-[2rem] bg-[#101010] px-5 py-[clamp(5rem,10vw,9rem)] text-[#e9e9e9] sm:-mt-[3.5rem] sm:rounded-t-[3.5rem] sm:px-8 lg:px-10"
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
            Rezerviši — {CONTACT.phone}
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

        <div
          data-reveal
          className="map-frame relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-[#1c1c1c] sm:rounded-[2rem] lg:aspect-auto lg:min-h-[34rem]"
        >
          <iframe
            src={CONTACT.mapsEmbed}
            title={`Mapa - ${CONTACT.address}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>
      </div>
    </section>
  );
}
