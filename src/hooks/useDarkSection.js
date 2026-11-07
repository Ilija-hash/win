import { useLayoutEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Tamne sekcije postavljaju `body.on-dark` dok su ispod kursora, da se kursor
 * prebaci na svetlu boju. Brojac podrzava vise tamnih sekcija koje se
 * preklapaju (kontakt + footer).
 */
let darkCount = 0;

function setDark(on) {
  darkCount = Math.max(0, darkCount + (on ? 1 : -1));
  document.body.classList.toggle("on-dark", darkCount > 0);
}

export function useDarkSection(ref) {
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    // Latch: brojac se nikad ne pomeri dva puta za istu sekciju.
    let isOn = false;
    const on = () => {
      if (isOn) return;
      isOn = true;
      setDark(true);
    };
    const off = () => {
      if (!isOn) return;
      isOn = false;
      setDark(false);
    };

    // 80/20, a ne 50/50 - footer je nizak i na dnu stranice, pa mu vrh
    // nikad ne stigne do sredine ekrana (nema vise skrola).
    const trigger = ScrollTrigger.create({
      trigger: element,
      start: "top 80%",
      end: "bottom 20%",
      onEnter: on,
      onEnterBack: on,
      onLeave: off,
      onLeaveBack: off,
    });

    return () => {
      off();
      trigger.kill();
    };
  }, [ref]);
}
