import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import roomImage from "./assets/room.webp";

gsap.registerPlugin(ScrollTrigger);

function Loader({ onComplete }) {
  const loaderRef = useRef(null);
  const fillRef = useRef(null);
  const countRef = useRef(null);

  useEffect(() => {
    const loader = loaderRef.current;
    const fill = fillRef.current;
    const count = countRef.current;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const duration = reduceMotion ? 0.2 : 3;
    const progress = { value: 0 };

    document.documentElement.classList.add("is-loading");

    const timeline = gsap.timeline({
      onComplete: () => {
        document.documentElement.classList.remove("is-loading");
        onComplete();
      },
    });

    timeline.to(progress, {
      value: 100,
      duration,
      ease: "power1.inOut",
      onUpdate: () => {
        const value = Math.round(progress.value);
        count.textContent = value;
        fill.style.width = `${value}%`;
        count.style.left = `clamp(1.25rem, calc(${value}% - ${value * 2.56}px), calc(100% - 15rem))`;
        loader.setAttribute("aria-valuenow", value);
      },
    });
    timeline.to(loader, {
      yPercent: -100,
      duration: reduceMotion ? 0.01 : 0.2,
      delay: reduceMotion ? 0 : 0.4,
      ease: "expo.in",
    });

    return () => {
      timeline.kill();
      document.documentElement.classList.remove("is-loading");
    };
  }, [onComplete]);

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 z-[1000] overflow-hidden bg-[#101010] text-[#e9e9e9]"
      role="progressbar"
      aria-label="Učitavanje stranice"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div
        ref={fillRef}
        className="absolute inset-y-0 left-0 w-0 bg-[#e9e9e9]"
      />
      <span
        ref={countRef}
        className="loader-count absolute bottom-4 left-5 z-10 font-melodrama text-[clamp(9rem,24vw,16rem)] font-normal leading-[0.72] mix-blend-difference sm:bottom-6"
      >
        0
      </span>
    </div>
  );
}

function Cursor() {
  const cursorRef = useRef(null);

  useEffect(() => {
    const canHover = window.matchMedia("(pointer: fine)").matches;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!canHover || reduceMotion) return undefined;

    const cursor = cursorRef.current;
    const position = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const target = { ...position };
    let frame;

    document.documentElement.classList.add("has-custom-cursor");

    const render = () => {
      position.x += (target.x - position.x) * 0.16;
      position.y += (target.y - position.y) * 0.16;
      cursor.style.transform = `translate3d(${position.x}px, ${position.y}px, 0)`;
      frame = requestAnimationFrame(render);
    };

    const onMove = (event) => {
      target.x = event.clientX;
      target.y = event.clientY;
      cursor.classList.remove("is-hidden");
    };
    const onLeave = () => cursor.classList.add("is-hidden");
    const onEnter = () => cursor.classList.remove("is-hidden");
    const onDown = () => cursor.classList.add("is-active");
    const onUp = () => cursor.classList.remove("is-active");
    const onOver = (event) => {
      if (event.target.closest("a, button"))
        cursor.classList.add("is-hovering");
    };
    const onOut = (event) => {
      if (event.target.closest("a, button"))
        cursor.classList.remove("is-hovering");
    };

    window.addEventListener("mousemove", onMove);
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="custom-cursor is-hidden"
      aria-hidden="true"
    />
  );
}

function Header({ menuOpen, setMenuOpen }) {
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 flex items-start justify-between px-5 py-4 transition-colors duration-300 sm:px-8 sm:py-6 lg:px-10 lg:py-7 ${menuOpen ? "text-[#e9e9e9]" : "text-[#141414]"}`}
    >
      <a
        href="#top"
        className="text-[1.9rem] font-extrabold leading-none tracking-[-0.07em] sm:text-[2.25rem]"
        aria-label="win. početna"
      >
        win.
      </a>
      <button
        type="button"
        className={`menu-button relative h-7 w-11 sm:h-9 sm:w-14 ${menuOpen ? "is-open" : ""}`}
        aria-label={menuOpen ? "Zatvori meni" : "Otvori meni"}
        aria-expanded={menuOpen}
        aria-controls="brand-menu"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span />
        <span />
        <span />
      </button>
    </header>
  );
}

function BrandMenu({ open, onClose }) {
  const panelRef = useRef(null);
  const brandRef = useRef(null);

  useEffect(() => {
    const panel = panelRef.current;
    const brand = brandRef.current;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const timeline = gsap.timeline();

    if (open) {
      document.body.classList.add("menu-open");
      timeline.set(panel, { visibility: "visible" });
      timeline.fromTo(
        panel,
        { y: 0, yPercent: -100 },
        {
          y: 0,
          yPercent: 0,
          duration: reduceMotion ? 0 : 0.75,
          ease: "expo.inOut",
        },
      );
      timeline.fromTo(
        brand,
        { yPercent: 120, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: reduceMotion ? 0 : 0.7,
          ease: "power4.out",
        },
        reduceMotion ? 0 : "-=0.25",
      );
    } else {
      document.body.classList.remove("menu-open");
      timeline.to(brand, {
        yPercent: -80,
        opacity: 0,
        duration: reduceMotion ? 0 : 0.3,
        ease: "power2.in",
      });
      timeline.to(panel, {
        yPercent: -100,
        y: 0,
        duration: reduceMotion ? 0 : 0.65,
        ease: "expo.inOut",
        onComplete: () => gsap.set(panel, { visibility: "hidden" }),
      });
    }

    const onKeyDown = (event) => {
      if (event.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      timeline.kill();
      window.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("menu-open");
    };
  }, [open, onClose]);

  return (
    <aside
      ref={panelRef}
      id="brand-menu"
      className="invisible fixed inset-0 z-40 flex items-end overflow-hidden bg-[#101010] px-5 pb-8 text-[#e9e9e9] sm:px-8 sm:pb-12 lg:px-10 lg:pb-14"
      aria-hidden={!open}
    >
      <div className="overflow-hidden">
        <p
          ref={brandRef}
          className="font-melodrama text-[clamp(7rem,27vw,30rem)] font-normal leading-[0.7] tracking-[-0.07em]"
        >
          win.
        </p>
      </div>
    </aside>
  );
}

function Hero({ ready }) {
  const stageRef = useRef(null);
  const titleRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    if (!ready) return undefined;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const context = gsap.context(() => {
      gsap.fromTo(
        titleRef.current.children,
        { y: 70, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: reduceMotion ? 0 : 0.9,
          stagger: reduceMotion ? 0 : 0.12,
          ease: "power4.out",
        },
      );

      gsap.fromTo(
        imageRef.current,
        { opacity: 0, y: 100 },
        {
          opacity: 1,
          y: 0,
          duration: reduceMotion ? 0 : 1,
          delay: reduceMotion ? 0 : 0.15,
          ease: "power3.out",
        },
      );

      if (!reduceMotion) {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: stageRef.current,
              start: "top top",
              end: "bottom bottom",
              scrub: 1,
              invalidateOnRefresh: true,
            },
          })
          .to(titleRef.current, { y: -60, ease: "none" }, 0)
          .fromTo(
            imageRef.current,
            {
              width: () =>
                Math.min(
                  320,
                  Math.max(
                    window.innerWidth < 640 ? 230 : 270,
                    window.innerWidth * 0.38,
                  ),
                ),
              borderTopLeftRadius: "999px",
              borderTopRightRadius: "999px",
              y: 0,
            },
            {
              width: "100%",
              borderTopLeftRadius: () =>
                window.innerWidth < 768 ? "110px" : "150px",
              borderTopRightRadius: () =>
                window.innerWidth < 768 ? "110px" : "150px",
              y: () => (window.innerWidth < 768 ? -40 : -70),
              ease: "none",
            },
            0,
          );
      }
    }, stageRef);

    ScrollTrigger.refresh();
    return () => context.revert();
  }, [ready]);

  return (
    <main id="top" ref={stageRef} className="relative h-[190svh] bg-[#e9e9e9]">
      <section className="sticky top-0 h-svh overflow-hidden">
        <div
          ref={titleRef}
          className="absolute inset-x-4 top-[24svh] z-10 flex flex-col items-center text-center sm:top-[25svh] md:top-[23svh] lg:top-[25svh]"
        >
          <h1 className="text-[clamp(2.35rem,6vw,5rem)] font-extrabold leading-[1.04] tracking-[-0.055em] text-[#141414]">
            nigde nije kao kod
          </h1>
          <p className="font-melodrama mt-1 text-[clamp(4.4rem,11vw,9.5rem)] font-normal leading-[0.82] tracking-[-0.045em] text-[#141414] sm:mt-3">
            kuće<span className="text-[#0798f6]">?</span>
          </p>
        </div>

        <div className="absolute inset-x-0 bottom-[-48svh] flex justify-center md:bottom-[-52svh] lg:bottom-[-58svh]">
          <div
            ref={imageRef}
            className="hero-image h-[102svh] w-[38vw] overflow-hidden rounded-t-full border-[2px] border-[#0798f6] bg-[#d7d7d7] will-change-[width,transform,border-radius]"
          >
            <img
              src={roomImage}
              alt="Moderan enterijer dnevne sobe i kuhinje"
              className="h-full w-full object-cover object-center"
            />
          </div>
        </div>
      </section>
    </main>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lenisRef = useRef(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return undefined;

    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      touchMultiplier: 1.2,
      easing: (time) => Math.min(1, 1.001 - 2 ** (-10 * time)),
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!lenisRef.current) return;
    if (!ready || menuOpen) lenisRef.current.stop();
    else lenisRef.current.start();
  }, [menuOpen, ready]);

  return (
    <>
      {!ready && <Loader onComplete={() => setReady(true)} />}
      <Cursor />
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <BrandMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <Hero ready={ready} />
    </>
  );
}
