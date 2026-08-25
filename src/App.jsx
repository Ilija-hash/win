import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import roomImage from "./assets/room.webp";

gsap.registerPlugin(ScrollTrigger);

function Loader({ onComplete }) {
  const loaderRef = useRef(null);
  const fillRef = useRef(null);
  const countWrapRef = useRef(null);
  const countRef = useRef(null);

  useEffect(() => {
    const loader = loaderRef.current;
    const fill = fillRef.current;
    const countWrap = countWrapRef.current;
    const count = countRef.current;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const duration = reduceMotion ? 0.2 : 3;
    const progress = { value: 0 };
    const updateProgress = () => {
      const value = Math.round(progress.value);
      count.textContent = value;
      fill.style.width = `${progress.value}%`;
      loader.setAttribute("aria-valuenow", value);
    };

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
      onUpdate: updateProgress,
      onComplete: () => {
        progress.value = 100;
        updateProgress();
      },
    });
    timeline.fromTo(
      countWrap,
      { x: 0 },
      {
        x: () => {
          const gutter = window.innerWidth < 640 ? 20 : 24;
          return Math.max(
            0,
            window.innerWidth - gutter * 2 - countWrap.offsetWidth,
          );
        },
        duration,
        ease: "power1.inOut",
      },
      0,
    );
    timeline.to(loader, {
      yPercent: -100,
      duration: reduceMotion ? 0.01 : 0.65,
      delay: reduceMotion ? 0 : 0.25,
      ease: "expo.inOut",
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
        ref={countWrapRef}
        className="loader-count absolute bottom-4 left-5 z-10 inline-grid font-melodrama text-[clamp(9rem,24vw,16rem)] font-normal leading-[0.72] mix-blend-difference sm:bottom-6 sm:left-6"
      >
        <span className="invisible col-start-1 row-start-1" aria-hidden="true">
          100
        </span>
        <span ref={countRef} className="col-start-1 row-start-1">
          0
        </span>
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
  const headerRef = useRef(null);

  useLayoutEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const context = gsap.context(() => {
      gsap.fromTo(
        headerRef.current.children,
        { y: -24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: reduceMotion ? 0 : 0.85,
          stagger: reduceMotion ? 0 : 0.08,
          ease: "power3.out",
        },
      );
    }, headerRef);

    return () => context.revert();
  }, []);

  return (
    <header
      ref={headerRef}
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
        <a
          ref={brandRef}
          href="tel:0611187040"
          onClick={onClose}
          className="font-melodrama block pb-[0.12em] pr-[0.08em] pt-[0.16em] text-[clamp(5rem,16vw,18rem)] font-normal leading-[0.84] tracking-[-0.05em]"
        >
          Rezerviši
        </a>
      </div>
    </aside>
  );
}

function Hero({ ready }) {
  const stageRef = useRef(null);
  const titleRef = useRef(null);
  const imageEntranceRef = useRef(null);
  const imageRef = useRef(null);

  useLayoutEffect(() => {
    if (!ready) return undefined;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const context = gsap.context(() => {
      const titleLines = titleRef.current.querySelectorAll("[data-title-line]");
      const intro = gsap.timeline({ delay: reduceMotion ? 0 : 0.2 });

      intro
        .fromTo(
          titleLines[0],
          { y: 50, rotate: 1, opacity: 0 },
          {
            y: 0,
            rotate: 0,
            opacity: 1,
            duration: reduceMotion ? 0 : 1.1,
            ease: "power4.out",
          },
        )
        .fromTo(
          titleLines[1],
          { y: 100, rotate: 1.2, opacity: 0 },
          {
            y: 0,
            rotate: 0,
            opacity: 1,
            duration: reduceMotion ? 0 : 1.15,
            ease: "power4.out",
          },
          reduceMotion ? 0 : "-=0.72",
        )
        .fromTo(
          imageEntranceRef.current,
          { y: 100 },
          {
            y: 0,
            duration: reduceMotion ? 0 : 1.15,
            ease: "power3.out",
            onComplete: () => ScrollTrigger.refresh(),
          },
          reduceMotion ? 0 : "-=0.65",
        );

      if (!reduceMotion) {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: stageRef.current,
              start: "top top",
              endTrigger: imageRef.current,
              end: "top top",
              scrub: 1,
              invalidateOnRefresh: true,
            },
          })
          .fromTo(
            imageRef.current,
            {
              width: 300,
              borderTopLeftRadius: "500px",
              borderTopRightRadius: "500px",
            },
            {
              width: "100%",
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
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
    <main id="top" ref={stageRef} className="relative bg-[#e9e9e9]">
      <section className="overflow-hidden">
        <div
          ref={titleRef}
          className="relative z-10 flex min-h-svh flex-col items-center justify-center px-4 text-center"
        >
          <div className="overflow-hidden">
            <h1
              data-title-line
              className="origin-bottom text-[38px] font-black leading-[1.4] tracking-[-0.05em] text-[#141414] max-[390px]:text-[34px] min-[431px]:text-[70px] min-[768px]:text-[80px] min-[992px]:text-[100px]"
            >
              nigde nije kao kod
            </h1>
          </div>
          <div className="overflow-hidden px-[0.08em] pb-[0.08em]">
            <p
              data-title-line
              className="font-melodrama origin-bottom text-[120px] font-light italic leading-none tracking-[-0.045em] text-[#141414] max-[390px]:text-[110px] min-[431px]:text-[140px] min-[992px]:text-[180px]"
            >
              kuće?
            </p>
          </div>
        </div>

        <div
          ref={imageEntranceRef}
          className="mt-[-150px] flex justify-center min-[431px]:mt-[-200px]"
        >
          <div
            ref={imageRef}
            className="hero-image relative h-[70svh] w-[300px] overflow-hidden bg-[#d7d7d7] will-change-[width,border-radius] min-[431px]:h-svh"
          >
            <img
              src={roomImage}
              alt="Moderan enterijer dnevne sobe i kuhinje"
              className="absolute left-1/2 top-0 h-full w-screen max-w-none -translate-x-1/2 object-cover object-center"
            />
          </div>
        </div>
      </section>

      <section
        aria-labelledby="story-title"
        className="flex min-h-svh flex-col bg-[#d8d4ca] px-5 py-[clamp(5rem,10vw,9rem)] text-[#141414] sm:px-8 lg:px-10"
      >
        <div className="flex items-center justify-between border-b border-[#141414]/30 pb-4 text-[0.7rem] font-bold uppercase tracking-[0.2em] sm:text-xs">
          <p>O prostoru</p>
          <p>( 01 )</p>
        </div>

        <h2
          id="story-title"
          className="font-melodrama mt-[clamp(4rem,9vw,8rem)] max-w-[11ch] text-[clamp(4.5rem,12vw,11rem)] font-normal leading-[0.78] tracking-[-0.045em]"
        >
          Prostor koji prati tvoj ritam.
        </h2>

        <div className="mt-auto grid gap-8 border-t border-[#141414]/30 pt-5 sm:grid-cols-2 lg:grid-cols-[1fr_0.65fr]">
          <p className="max-w-xl text-[clamp(1.25rem,2.3vw,2rem)] font-semibold leading-tight tracking-[-0.035em]">
            Mesto za sporija jutra, duže razgovore i sve ono između.
          </p>
          <p className="max-w-md text-sm leading-relaxed text-[#141414]/65 sm:justify-self-end sm:text-base">
            Promišljeni detalji, mirne linije i dovoljno prostora da se svaki
            dan oseća kao kod kuće.
          </p>
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
      {ready && (
        <>
          <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
          <BrandMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
          <Hero ready={ready} />
        </>
      )}
    </>
  );
}
