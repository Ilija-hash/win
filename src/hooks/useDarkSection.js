import { useLayoutEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Tamne sekcije emituju DVA nezavisna signala, jer kursor i header
 * ne postavljaju isto pitanje:
 *
 *   body.on-dark      -> "sta je ispod KURSORA" (sredina ekrana)
 *   body.header-dark  -> "sta je ispod TRAKE HEADERA" (sam vrh ekrana)
 *
 * Spajanje ova dva daje gresku: header posvetli cim tamna sekcija udje u
 * vidokrug, pa `win.` izbledi dok jos stoji iznad svetlog sadrzaja.
 */
const counters = { "on-dark": 0, "header-dark": 0 };

function toggle(className, on) {
  counters[className] = Math.max(0, counters[className] + (on ? 1 : -1));
  document.body.classList.toggle(className, counters[className] > 0);
}

/** Jedan ScrollTrigger sa latch-om, da se brojac ne pomeri dva puta. */
function createTrigger(element, className, start, end) {
  let isOn = false;
  const on = () => {
    if (!isOn) {
      isOn = true;
      toggle(className, true);
    }
  };
  const off = () => {
    if (isOn) {
      isOn = false;
      toggle(className, false);
    }
  };

  const trigger = ScrollTrigger.create({
    trigger: element,
    start,
    end,
    onEnter: on,
    onEnterBack: on,
    onLeave: off,
    onLeaveBack: off,
  });

  return () => {
    off();
    trigger.kill();
  };
}

export function useDarkSection(ref) {
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    // Kursor: 80/20, a ne 50/50 - footer je nizak i na dnu stranice, pa mu
    // vrh nikad ne stigne do sredine ekrana (nema vise skrola).
    const disposeCursor = createTrigger(element, "on-dark", "top 80%", "bottom 20%");

    // Header: tacno dok sekcija preseca vrh viewport-a, tj. dok je stvarno
    // iza fiksirane trake. Za footer se ovo cesto nikad ne desi - i to je tacno,
    // jer header tada i jeste iznad svetlog sadrzaja.
    const disposeHeader = createTrigger(element, "header-dark", "top top", "bottom top");

    return () => {
      disposeCursor();
      disposeHeader();
    };
  }, [ref]);
}
