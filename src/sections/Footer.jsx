import { useRef } from "react";
import { useDarkSection } from "../hooks/useDarkSection";
import { CONTACT } from "./LocationContact";

export default function Footer() {
  const footerRef = useRef(null);
  useDarkSection(footerRef);

  return (
    <footer
      ref={footerRef}
      className="flex flex-col bg-[#101014] px-5 pb-8 pt-[clamp(4rem,8vw,7rem)] text-[#e9e9e9] sm:px-8 sm:pb-10 lg:px-10"
    >
      <div className="grid gap-10 border-b border-[#e9e9e9]/20 pb-10 sm:grid-cols-2">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] opacity-55 sm:text-xs">Apartman</p>
          <a
            href={CONTACT.phoneHref}
            className="font-melodrama mt-4 block text-[clamp(3rem,9vw,7rem)] font-normal leading-[0.85] tracking-[-0.05em] transition-opacity hover:opacity-70"
          >
            Rezerviši
          </a>
        </div>

        <div className="grid gap-4 sm:justify-items-end sm:text-right">
          <a href={CONTACT.phoneHref} className="text-lg font-semibold tracking-[-0.02em] transition-opacity hover:opacity-60">
            {CONTACT.phone}
          </a>
          <a
            href={`mailto:${CONTACT.email}`}
            className="text-lg font-semibold tracking-[-0.02em] transition-opacity hover:opacity-60"
          >
            {CONTACT.email}
          </a>
          <a
            href={CONTACT.mapsLink}
            target="_blank"
            rel="noreferrer"
            className="text-lg font-semibold tracking-[-0.02em] transition-opacity hover:opacity-60"
          >
            {CONTACT.address}
          </a>
          <a
            href={CONTACT.instagramHref}
            target="_blank"
            rel="noreferrer"
            className="text-lg font-semibold tracking-[-0.02em] transition-opacity hover:opacity-60"
          >
            {CONTACT.instagram}
          </a>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-6 text-[0.7rem] font-bold uppercase tracking-[0.2em] opacity-55 sm:flex-row sm:items-center sm:justify-between sm:text-xs">
        <p>win. — Sokobanja</p>
        <p>&copy; {new Date().getFullYear()} Sva prava zadržana.</p>
        <a href="#top" className="transition-opacity hover:opacity-100">
          Nazad na vrh &#8593;
        </a>
      </div>
    </footer>
  );
}
