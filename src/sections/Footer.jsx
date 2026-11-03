import { useRef } from "react";
import { Chevron } from "../components/Icons";
import { useDarkSection } from "../hooks/useDarkSection";
import { CONTACT, NAV } from "../data/site";

// Footer je nastavak tamne kontakt sekcije - bez ponavljanja kontakata (vec su iznad).
export default function Footer({ onNavigate, inert = false }) {
  const footerRef = useRef(null);
  useDarkSection(footerRef);

  const go = (id) => (event) => {
    event.preventDefault();
    onNavigate?.(id);
  };

  return (
    <footer ref={footerRef} inert={inert} className="surface-dark bg-[#101010] page-x pb-[clamp(1.5rem,3vw,2.5rem)] text-[#e9e9e9]">
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-5 border-t border-[#e9e9e9]/10 pt-6 sm:pt-8">
        <a
          href="#top"
          onClick={go("top")}
          aria-label="win. - nazad na vrh"
          className="text-[1.9rem] font-extrabold leading-none tracking-[-0.07em] sm:text-[2.25rem]"
        >
          win.
        </a>

        <nav aria-label="Footer" className="order-last w-full md:order-none md:w-auto">
          <ul className="-my-2 flex flex-wrap gap-x-5 sm:gap-x-7">
            {NAV.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={go(item.id)}
                  className="inline-block py-2 text-base font-semibold tracking-[-0.02em] opacity-60 transition-opacity duration-300 hover:opacity-100"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <a
          href="#top"
          onClick={go("top")}
          aria-label="Nazad na vrh"
          className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-white/10 transition-colors duration-300 hover:bg-white/20"
        >
          <Chevron direction="up" className="h-5 w-5" />
        </a>
      </div>

      <div className="mt-6 flex flex-col gap-1 border-t border-[#e9e9e9]/10 pt-5 text-xs font-semibold text-[#e9e9e9]/50 sm:flex-row sm:items-center sm:justify-between">
        <a href={CONTACT.mapsLink} target="_blank" rel="noreferrer" className="transition-colors duration-300 hover:text-[#e9e9e9]">
          {CONTACT.address}
        </a>
        <p>&copy; {new Date().getFullYear()} win. Sva prava zadržana.</p>
      </div>
    </footer>
  );
}
