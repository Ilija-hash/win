import { Chevron } from "./Icons";
/** Veliki naslov u nueve stilu: mala slova + tacka, izlazi iz maske. */
export function SectionTitle({ id, children, className = "" }) {
  return (
    // Maska za reveal animaciju sece samo po visini (overflow-y: clip): dugacak naslov
    // ("o apartmanu.") tako nikad nije odsecen sa strane.
    <div className={`overflow-x-visible overflow-y-clip pb-[0.08em] pr-[0.08em] ${className}`}>
      <h2
        id={id}
        data-reveal="line"
        className="font-melodrama origin-bottom-left text-[clamp(4rem,12vw,11rem)] font-normal leading-[0.9] tracking-[-0.05em]"
      >
        {children}
      </h2>
    </div>
  );
}

/** Zajednicki pill CTA. `tone="dark"` = tamno dugme na svetloj pozadini. */
export function PillLink({ href, children, tone = "dark", className = "", ...rest }) {
  const tones = {
    dark: "bg-[#141414] text-[#e9e9e9]",
    light: "bg-[#e9e9e9] text-[#141414]",
  };
  return (
    <a
      href={href}
      {...rest}
      className={`group inline-flex w-fit items-center gap-3 rounded-full py-2 pl-6 pr-2 text-sm font-bold tracking-[-0.01em] transition-transform duration-300 ease-out hover:scale-[1.03] sm:text-base ${tones[tone]} ${className}`}
    >
      {children}
      <span
        aria-hidden="true"
        className={`flex h-10 w-10 items-center justify-center rounded-full transition-transform duration-300 group-hover:translate-x-0.5 ${
          tone === "dark" ? "bg-[#e9e9e9] text-[#141414]" : "bg-[#141414] text-[#e9e9e9]"
        }`}
      >
        <Chevron className="h-4 w-4" />
      </span>
    </a>
  );
}
