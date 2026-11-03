import { Chevron } from "../components/Icons";
import { useRef } from "react";
import { useDarkSection } from "../hooks/useDarkSection";
import { CONTACT, NAV } from "../data/site";

export default function Footer({ onNavigate }) {
  const footerRef = useRef(null);
  useDarkSection(footerRef);

  return (
    <footer
      ref={footerRef}
      className="surface-dark flex flex-col overflow-hidden bg-[#101010] page-x pb-6 pt-[clamp(1rem,3vw,2rem)] text-[#e9e9e9] sm:pb-8"
    >
      <div className="grid gap-10 sm:grid-cols-2">
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-2">
            {NAV.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(event) => {
                    event.preventDefault();
                    onNavigate?.(item.id);
                  }}
                  className="inline-flex rounded-full border border-[#e9e9e9]/20 px-4 py-2 text-sm sm:px-5 sm:py-2.5 sm:text-base font-semibold tracking-[-0.02em] transition-colors duration-300 hover:bg-[#e9e9e9] hover:text-[#101010]"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="grid content-start gap-2 sm:justify-items-end sm:text-right">
          <a href={CONTACT.phoneHref} className="text-lg font-semibold tracking-[-0.02em] transition-opacity hover:opacity-60">
            {CONTACT.phone}
          </a>
          <a href={`mailto:${CONTACT.email}`} className="text-lg font-semibold tracking-[-0.02em] transition-opacity hover:opacity-60">
            {CONTACT.email}
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

      {/* Ogroman wordmark preko cele sirine, kao kod nueve. */}
      <p
        aria-hidden="true"
        className="mt-[clamp(3rem,8vw,6rem)] select-none text-center text-[clamp(7rem,36vw,36rem)] font-extrabold leading-[0.78] tracking-[-0.08em]"
      >
        win.
      </p>

      <div className="mt-6 flex flex-col gap-3 text-[0.7rem] font-bold uppercase tracking-[0.2em] opacity-55 sm:flex-row sm:items-center sm:justify-between sm:text-xs">
        <p>{CONTACT.address}</p>
        <p>&copy; {new Date().getFullYear()} win. Sva prava zadržana.</p>
        <a
          href="#top"
          onClick={(event) => {
            event.preventDefault();
            onNavigate?.("top");
          }}
          className="transition-opacity hover:opacity-100"
        >
          Nazad na vrh <Chevron direction="up" className="ml-1 inline h-3.5 w-3.5 align-[-0.15em]" />
        </a>
      </div>
    </footer>
  );
}
