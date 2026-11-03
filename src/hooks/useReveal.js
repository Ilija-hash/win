import { useLayoutEffect } from "react";
import gsap from "gsap";

/**
 * Animira svaki [data-reveal] unutar `scopeRef` kada udje u viewport.
 *   data-reveal="line" -> izlazi iz maske (roditelj mora imati overflow-hidden)
 *   data-reveal        -> blago podizanje + fade
 */
export function useReveal(scopeRef) {
  useLayoutEffect(() => {
    const scope = scopeRef.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!scope || reduceMotion) return undefined;

    const context = gsap.context(() => {
      gsap.utils.toArray("[data-reveal]", scope).forEach((element) => {
        const isLine = element.dataset.reveal === "line";
        gsap.fromTo(
          element,
          isLine ? { yPercent: 110, rotate: 1.5 } : { y: 48, opacity: 0 },
          {
            ...(isLine ? { yPercent: 0, rotate: 0 } : { y: 0, opacity: 1 }),
            duration: isLine ? 1.15 : 0.9,
            ease: isLine ? "power4.out" : "power3.out",
            scrollTrigger: { trigger: element, start: "top 88%" },
          },
        );
      });
    }, scope);

    return () => context.revert();
  }, [scopeRef]);
}
