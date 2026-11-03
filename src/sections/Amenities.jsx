import { useRef } from "react";
import Icon from "../components/Icons";
import { PillLink, SectionTitle } from "../components/Section";
import { useReveal } from "../hooks/useReveal";
import { AMENITIES } from "../data/site";
import { getBookingHref } from "../lib/booking";

export default function Amenities() {
  const sectionRef = useRef(null);
  useReveal(sectionRef);

  return (
    <section
      ref={sectionRef}
      id="sadrzaj"
      aria-labelledby="amenities-title"
      className="bg-[#e9e9e9] page-x pb-[clamp(5rem,10vw,9rem)] pt-[clamp(2rem,5vw,4rem)] text-[#141414]"
    >
      <div className="grid items-end gap-6 lg:grid-cols-[1fr_0.6fr]">
        <div>
          <SectionTitle id="amenities-title">
            sadržaj.
          </SectionTitle>
        </div>
        <p data-reveal className="max-w-md pb-[1vw] text-base leading-relaxed text-[#141414]/65 sm:text-lg">
          Opremljen do detalja, da biste se na odmoru brinuli samo o odmoru.
        </p>
      </div>

      {/* 8 pogodnosti + CTA kartica = 9 polja: 3 x 3 od tableta (md);
          na manjim ekranima 2 kolone, a CTA ide preko cele sirine. */}
      <ul className="mt-[clamp(2.5rem,6vw,4.5rem)] grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3">
        {AMENITIES.map((item) => (
          <li
            key={item.title}
            data-reveal
            className="group flex flex-col rounded-[1.5rem] bg-white/55 p-5 transition-transform duration-500 ease-out hover:-translate-y-1 sm:rounded-[1.75rem] sm:p-6"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#141414]/[0.06] transition-colors duration-300 group-hover:bg-[#141414] group-hover:text-[#e9e9e9] sm:h-14 sm:w-14">
              <Icon name={item.icon} className="h-6 w-6 sm:h-7 sm:w-7" />
            </span>
            <h3 className="mt-6 text-base font-bold leading-tight tracking-[-0.03em] sm:mt-10 sm:text-xl">{item.title}</h3>
            <p className="mt-1 text-[0.8rem] leading-snug text-[#141414]/60 sm:text-sm">{item.text}</p>
          </li>
        ))}

        <li
          data-reveal
          className="col-span-2 flex flex-wrap items-center justify-between gap-6 rounded-[1.5rem] bg-[#141414] p-5 text-[#e9e9e9] sm:rounded-[1.75rem] sm:p-6 md:col-span-1 md:flex-col md:flex-nowrap md:items-start"
        >
          <p className="font-melodrama text-[clamp(2rem,3vw,2.75rem)] leading-[0.95] tracking-[-0.03em]">Spremni za odmor?</p>
          <PillLink href={getBookingHref()} data-booking tone="light" className="!pl-4 text-sm sm:!pl-5">
            Pozovi
          </PillLink>
        </li>
      </ul>
    </section>
  );
}
