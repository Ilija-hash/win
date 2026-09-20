import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

export const CONTACT = {
  phone: "0611187040",
  phoneHref: "tel:0611187040",
  email: "win.sokobanja@gmail.com",
  address: "Prevalac 9, Sokobanja",
  instagram: "@win_sokobanja",
  instagramHref: "https://instagram.com/win_sokobanja",
  mapsLink: "https://www.google.com/maps/search/?api=1&query=Prevalac+9%2C+Sokobanja",
  mapsEmbed: "https://www.google.com/maps?q=Prevalac+9,+Sokobanja&output=embed",
};

const LINES = [
  { label: "Telefon", value: CONTACT.phone, href: CONTACT.phoneHref },
  { label: "Email", value: CONTACT.email, href: `mailto:${CONTACT.email}` },
  { label: "Adresa", value: CONTACT.address, href: CONTACT.mapsLink, external: true },
  { label: "Instagram", value: CONTACT.instagram, href: CONTACT.instagramHref, external: true },
];

export default function LocationContact() {
  const sectionRef = useRef(null);
  const mapRef = useRef(null);

  useLayoutEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return undefined;

    const context = gsap.context(() => {
      gsap.fromTo(
        mapRef.current,
        { y: 48, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: mapRef.current, start: "top 85%" },
        },
      );
    }, sectionRef);

    return () => context.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="lokacija"
      aria-labelledby="location-title"
      className="flex flex-col bg-[#e9e9e9] px-5 py-[clamp(5rem,10vw,9rem)] text-[#141414] sm:px-8 lg:px-10"
    >
      <div className="flex items-center justify-between border-b border-[#141414]/30 pb-4 text-[0.7rem] font-bold uppercase tracking-[0.2em] sm:text-xs">
        <p>Lokacija i kontakt</p>
        <p>( 04 )</p>
      </div>

      <h2
        id="location-title"
        className="font-melodrama mt-[clamp(3rem,7vw,6rem)] max-w-[12ch] text-[clamp(3.5rem,10vw,9rem)] font-normal leading-[0.82] tracking-[-0.045em]"
      >
        Nadji nas u Sokobanji.
      </h2>

      <div className="mt-[clamp(3rem,6vw,5rem)] grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
        <div ref={mapRef} className="map-frame relative aspect-[4/3] overflow-hidden bg-[#d7d7d7] lg:aspect-auto lg:min-h-[28rem]">
          <iframe
            src={CONTACT.mapsEmbed}
            title={`Mapa - ${CONTACT.address}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>

        <div className="flex flex-col">
          <dl className="grid gap-px bg-[#141414]/15">
            {LINES.map((line) => (
              <div key={line.label} className="bg-[#e9e9e9] py-5">
                <dt className="text-[0.7rem] font-bold uppercase tracking-[0.2em] opacity-55 sm:text-xs">{line.label}</dt>
                <dd className="mt-2">
                  <a
                    href={line.href}
                    {...(line.external ? { target: "_blank", rel: "noreferrer" } : {})}
                    className="text-[clamp(1.25rem,2.4vw,1.9rem)] font-semibold leading-tight tracking-[-0.03em] transition-opacity hover:opacity-60"
                  >
                    {line.value}
                  </a>
                </dd>
              </div>
            ))}
          </dl>

          <a
            href={CONTACT.mapsLink}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex w-fit items-center gap-2 border-b border-[#141414] pb-1 text-[0.7rem] font-bold uppercase tracking-[0.2em] transition-opacity hover:opacity-60 sm:text-xs"
          >
            Otvori u Google Maps &#8599;
          </a>
        </div>
      </div>
    </section>
  );
}
