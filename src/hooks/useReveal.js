import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../lib/motion";

/**
 * Animira [data-reveal] elemente unutar `scopeRef` kada udju u viewport.
 *   data-reveal="line" -> naslov izlazi iz maske (roditelj mora imati overflow-hidden)
 *   data-reveal        -> blago podizanje + fade
 *
 * Fade elementi idu kroz ScrollTrigger.batch: jedan batch po sekciji umesto
 * po jednog trigger-a za svaki element, a elementi koji udju zajedno dobijaju
 * mali stagger. Sve je `once` - trigger-i se gase posle animacije.
 */
export function useReveal(scopeRef) {
  useLayoutEffect(() => {
    const scope = scopeRef.current;
    const reduceMotion = prefersReducedMotion();
    if (!scope || reduceMotion) return undefined;

    const context = gsap.context(() => {
      const elements = gsap.utils.toArray("[data-reveal]", scope);
      const lines = elements.filter((element) => element.dataset.reveal === "line");
      const fades = elements.filter((element) => element.dataset.reveal !== "line");

      lines.forEach((line) => {
        gsap.fromTo(
          line,
          { yPercent: 110, rotate: 1.5 },
          {
            yPercent: 0,
            rotate: 0,
            duration: 1.15,
            ease: "power4.out",
            scrollTrigger: { trigger: line, start: "top 88%", once: true },
          },
        );
      });

      if (fades.length) {
        gsap.set(fades, { y: 48, opacity: 0 });
        ScrollTrigger.batch(fades, {
          // Ranije od naslova (88%): element krece cim proviri, bez praznog prostora.
          start: "top 95%",
          interval: 0.05, // podrazumevano 0.1s cekanja da se skupi batch
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", stagger: 0.08, overwrite: true }),
        });
      }
    }, scope);

    return () => context.revert();
  }, [scopeRef]);
}
