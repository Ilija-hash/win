import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
// Hero: uspravne za telefon, siroki isecak (16:10) za desktop - vidi scripts/optimize-hero.mjs.
import hero800 from "./assets/hero-800.webp";
import hero1200 from "./assets/hero-1200.webp";
import hero1600 from "./assets/hero-1600.webp";
import heroWide1600 from "./assets/hero-wide-1600.webp";
import heroWide2400 from "./assets/hero-wide-2400.webp";
import heroWide3060 from "./assets/hero-wide-3060.webp";
import Intro from "./sections/Intro";
import Gallery from "./sections/Gallery";
import Amenities from "./sections/Amenities";
import Testimonials from "./sections/Testimonials";
import LocationContact from "./sections/LocationContact";
import Footer from "./sections/Footer";
import { NAV } from "./data/site";
import { getBookingHref } from "./lib/booking";
import { prefersReducedMotion } from "./lib/motion";

gsap.registerPlugin(ScrollTrigger);

// Boja trake browsera na telefonu (= --color-night / --color-paper iz styles.css).
const THEME_DARK = "#101010";
const THEME_LIGHT = "#e9e9e9";

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
    const reduceMotion = prefersReducedMotion();
    const duration = reduceMotion ? 0.1 : 1.3;
    const progress = { value: 0 };
    const updateProgress = () => {
      const value = Math.round(progress.value);
      count.textContent = value;
      fill.style.width = `${progress.value}%`;
      loader.setAttribute("aria-valuenow", value);
    };

    document.documentElement.classList.add("is-loading");

    // Loader se podize tek kada su fontovi i hero slika spremni (dekodirani),
    // da se ne bi dekodirali usred intro animacije. Zastita: najvise 3s.
    const heroImage = document.querySelector(".hero-image img");
    const assetsReady = Promise.race([
      Promise.all([document.fonts?.ready, heroImage?.decode?.().catch(() => {})]),
      new Promise((resolve) => setTimeout(resolve, 3000)),
    ]);
    let cancelled = false;
    let exit;

    const timeline = gsap.timeline({
      onComplete: () => {
        assetsReady.then(() => {
          if (cancelled) return;
          exit = gsap.to(loader, {
            yPercent: -100,
            duration: reduceMotion ? 0.01 : 0.3,
            delay: reduceMotion ? 0 : 0.05,
            ease: "expo.inOut",
            onComplete: () => {
              document.documentElement.classList.remove("is-loading");
              onComplete();
            },
          });
        });
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
          return Math.max(0, window.innerWidth - gutter * 2 - countWrap.offsetWidth);
        },
        duration,
        ease: "power1.inOut",
      },
      0,
    );

    return () => {
      cancelled = true;
      timeline.kill();
      exit?.kill();
      document.documentElement.classList.remove("is-loading");
    };
  }, [onComplete]);

  return (
    <div
      ref={loaderRef}
      className="loader-screen fixed inset-0 z-[1000] overflow-hidden bg-night text-paper"
      role="progressbar"
      aria-label="Učitavanje stranice"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div ref={fillRef} className="absolute inset-y-0 left-0 w-0 bg-paper" />
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
    const reduceMotion = prefersReducedMotion();
    if (!canHover || reduceMotion) return undefined;

    const cursor = cursorRef.current;
    const position = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const target = { ...position };
    let frame = null;

    document.documentElement.classList.add("has-custom-cursor");

    // Petlja radi samo dok kursor "dostize" mis; kad se smiri - staje.
    const render = () => {
      const dx = target.x - position.x;
      const dy = target.y - position.y;
      position.x += dx * 0.16;
      position.y += dy * 0.16;
      cursor.style.transform = `translate3d(${position.x}px, ${position.y}px, 0)`;
      frame = Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1 ? null : requestAnimationFrame(render);
    };
    const wake = () => {
      if (frame === null) frame = requestAnimationFrame(render);
    };

    const onMove = (event) => {
      target.x = event.clientX;
      target.y = event.clientY;
      cursor.classList.remove("is-hidden");
      wake();
    };
    const onLeave = () => cursor.classList.add("is-hidden");
    const onEnter = () => cursor.classList.remove("is-hidden");
    const onDown = () => cursor.classList.add("is-active");
    const onUp = () => cursor.classList.remove("is-active");
    const onOver = (event) => {
      if (event.target.closest("a, button")) cursor.classList.add("is-hovering");
      if (event.target.closest('[data-cursor="drag"]')) cursor.classList.add("is-drag");
      if (event.target.closest('[data-cursor="zoom"]')) cursor.classList.add("is-zoom");
    };
    const onOut = (event) => {
      // pointerout okida i pri prelasku na dete elementa - to nije napuštanje
      const target = event.target.closest("a, button");
      if (target && !target.contains(event.relatedTarget)) cursor.classList.remove("is-hovering");
      const dragArea = event.target.closest('[data-cursor="drag"]');
      if (dragArea && !dragArea.contains(event.relatedTarget)) cursor.classList.remove("is-drag");
      const zoomArea = event.target.closest('[data-cursor="zoom"]');
      if (zoomArea && !zoomArea.contains(event.relatedTarget)) cursor.classList.remove("is-zoom");
    };

    window.addEventListener("mousemove", onMove);
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);
    window.addEventListener("blur", onLeave);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerout", onOut);
    wake();

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
    };
  }, []);

  return <div ref={cursorRef} className="custom-cursor is-hidden" aria-hidden="true" />;
}

function Header({ ready, menuOpen, setMenuOpen, onNavigate }) {
  const headerRef = useRef(null);
  const barRef = useRef(null);
  // "Tamni" izgled headera prati meni: odmah pri otvaranju, a pri zatvaranju
  // tek kada panel (≈0.95s animacija) ode sa vrha ekrana - inace bi se svetla
  // pilula i taman tekst pojavili preko tamnog panela koji se jos povlaci.
  const [onPanel, setOnPanel] = useState(menuOpen);

  useEffect(() => {
    if (menuOpen) {
      setOnPanel(true);
      return undefined;
    }
    const reduceMotion = prefersReducedMotion();
    const timer = setTimeout(() => setOnPanel(false), reduceMotion ? 0 : 800);
    return () => clearTimeout(timer);
  }, [menuOpen]);

  // Posle ~80px skrola header postaje pilula i ostaje stalno vidljiv.
  useEffect(() => {
    const header = headerRef.current;
    const trigger = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => header.classList.toggle("is-scrolled", self.scroll() > 80),
    });
    return () => trigger.kill();
  }, []);

  // Header se renderuje ispod loadera, ali ulazi tek kada je sajt spreman.
  useLayoutEffect(() => {
    const reduceMotion = prefersReducedMotion();
    const context = gsap.context(() => {
      if (!ready) {
        gsap.set(barRef.current.children, { y: -24, opacity: 0 });
        return;
      }
      gsap.fromTo(
        barRef.current.children,
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
  }, [ready]);

  return (
    <header
      ref={headerRef}
      className={`site-header fixed inset-x-0 top-0 z-50 px-2.5 pt-2.5 sm:px-4 sm:pt-4 lg:px-5 lg:pt-5 ${
        onPanel ? "is-menu-open text-paper" : "text-ink"
      }`}
    >
      <div ref={barRef} className="header-bar flex items-center justify-between">
        <a
          href="#top"
          onClick={(event) => {
            event.preventDefault();
            onNavigate("top"); // zatvara i meni, ako je otvoren
          }}
          className="text-[1.9rem] font-extrabold leading-none tracking-[-0.07em] sm:text-[2.25rem]"
          aria-label="win. početna"
        >
          win.
        </a>
        <button
          type="button"
          className={`menu-button relative h-6 w-9 sm:h-8 sm:w-11 ${menuOpen ? "is-open" : ""}`}
          aria-label={menuOpen ? "Zatvori meni" : "Otvori meni"}
          aria-expanded={menuOpen}
          aria-controls="brand-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}

function BrandMenu({ open, onClose, onNavigate }) {
  const panelRef = useRef(null);
  const brandRef = useRef(null);
  const navRef = useRef(null);
  const hasOpened = useRef(false);

  useEffect(() => {
    const panel = panelRef.current;
    const brand = brandRef.current;
    const navItems = navRef.current.children;
    const reduceMotion = prefersReducedMotion();
    const themeColor = document.querySelector('meta[name="theme-color"]');
    const timeline = gsap.timeline();

    if (open) {
      hasOpened.current = true;
      document.body.classList.add("menu-open");
      if (themeColor) themeColor.content = THEME_DARK;
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
      timeline.fromTo(
        navItems,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: reduceMotion ? 0 : 0.5, stagger: reduceMotion ? 0 : 0.05, ease: "power3.out" },
        reduceMotion ? 0 : "-=0.5",
      );
      timeline.call(() => brand.focus());
    } else {
      document.body.classList.remove("menu-open");
      if (themeColor) themeColor.content = THEME_LIGHT;
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
      if (hasOpened.current) document.querySelector(".menu-button")?.focus();
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
      className="invisible fixed inset-0 z-40 flex flex-col items-center justify-center overflow-hidden bg-night px-5 pt-20 text-center text-paper sm:px-8 lg:px-10"
      aria-hidden={!open}
      inert={!open}
    >
      <nav aria-label="Glavni meni">
        {/* Isti jezik kao "rezerviši." ispod: Melodrama, mala slova, tacka. Sve centrirano. */}
        <ul
          ref={navRef}
          className="mb-[clamp(1.5rem,5vh,3.5rem)] flex flex-col items-center gap-1 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-10 sm:gap-y-2"
        >
          {NAV.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(event) => {
                  event.preventDefault();
                  onNavigate(item.id);
                }}
                className="font-melodrama inline-block text-[clamp(2.5rem,6vw,5rem)] leading-[1] tracking-[-0.04em] opacity-50 transition duration-300 hover:-translate-y-1 hover:opacity-100"
              >
                {item.label}.
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="overflow-hidden">
        <a
          ref={brandRef}
          href={getBookingHref()}
          data-booking
          onClick={onClose}
          className="font-melodrama block px-[0.04em] pb-[0.12em] pt-[0.16em] text-[clamp(4rem,13vw,14rem)] font-normal leading-[0.84] tracking-[-0.05em]"
        >
          rezerviši.
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

  // Hero je renderovan ispod loadera: do `ready` drzimo naslov i sliku u
  // pocetnom (skrivenom) stanju, da se ne vide pre intro animacije.
  useLayoutEffect(() => {
    if (ready) return undefined;
    const reduceMotion = prefersReducedMotion();
    if (reduceMotion) return undefined;
    const context = gsap.context(() => {
      gsap.set(titleRef.current.querySelectorAll("[data-title-line]"), { opacity: 0 });
      gsap.set(imageEntranceRef.current, { y: window.innerWidth <= 430 ? 150 : 200 });
    }, stageRef);
    return () => context.revert();
  }, [ready]);

  useLayoutEffect(() => {
    if (!ready) return undefined;

    const reduceMotion = prefersReducedMotion();
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
          { y: () => (window.innerWidth <= 430 ? 150 : 200) },
          {
            y: 0,
            duration: reduceMotion ? 0 : 1.3,
            ease: "power3.out",
            onComplete: () => ScrollTrigger.refresh(),
          },
          reduceMotion ? 0 : "-=0.65",
        );

      if (!reduceMotion) {
        // Isti izgled kao ranije (luk 300px -> puna sirina), ali preko clip-path:
        // kontejner je uvek pune sirine, pa nema preracunavanja layout-a po frejmu.
        const side = () => `${Math.max(0, (imageRef.current.offsetWidth - 300) / 2)}px`;
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
            { clipPath: () => `inset(0px ${side()} 0px ${side()} round 500px 500px 0px 0px)` },
            { clipPath: "inset(0px 0px 0px 0px round 0px 0px 0px 0px)", ease: "none" },
            0,
          );
      }
    }, stageRef);

    ScrollTrigger.refresh();
    return () => context.revert();
  }, [ready]);

  return (
    <div ref={stageRef} className="relative bg-paper">
      <section className="overflow-hidden">
        <div ref={titleRef} className="relative z-10 flex min-h-svh flex-col items-center justify-center px-4 text-center">
          <div className="overflow-hidden">
            <h1
              data-title-line
              className="origin-bottom text-[38px] font-extrabold leading-[1.4] tracking-[-0.05em] text-ink max-[390px]:text-[34px] min-[431px]:text-[70px] min-[768px]:text-[80px] min-[992px]:text-[100px] short:!text-[48px]"
            >
              nigde nije kao kod
            </h1>
          </div>
          <div className="overflow-hidden px-[0.08em] pb-[0.08em]">
            <p
              data-title-line
              className="font-melodrama origin-bottom text-[120px] font-normal leading-none tracking-[-0.045em] text-ink max-[390px]:text-[110px] min-[431px]:text-[140px] min-[992px]:text-[180px] short:!text-[100px]"
            >
              kuće?
            </p>
          </div>
        </div>

        <div ref={imageEntranceRef} className="hero-arch flex justify-center">
          <div
            ref={imageRef}
            className="hero-image relative h-[70svh] w-full overflow-hidden bg-mist will-change-[clip-path] min-[431px]:h-svh"
          >
            {/* Siroki ekran dobija siroki isecak - uspravna slika bi se tu razvukla i bila mutna.
                160vh: kada je ekran uzi od 16:10, slika se skalira po visini (cover). */}
            <picture>
              <source
                media="(min-aspect-ratio: 1/1)"
                srcSet={`${heroWide1600} 1600w, ${heroWide2400} 2400w, ${heroWide3060} 3060w`}
                sizes="(max-aspect-ratio: 16/10) 160vh, 100vw"
              />
              <img
                src={hero1600}
                srcSet={`${hero800} 800w, ${hero1200} 1200w, ${hero1600} 1600w`}
                sizes="(max-aspect-ratio: 3/4) 75vh, 100vw"
                alt="Dnevna soba i kuhinja apartmana Win"
                fetchPriority="high"
                decoding="async"
                className="absolute left-1/2 top-0 h-full w-screen max-w-none -translate-x-1/2 object-cover object-center"
              />
            </picture>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const lenisRef = useRef(null);

  useEffect(() => {
    const reduceMotion = prefersReducedMotion();
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
    if (!ready || menuOpen || lightboxOpen) lenisRef.current.stop();
    else lenisRef.current.start();
  }, [lightboxOpen, menuOpen, ready]);

  // Navigacija na sekciju. Iz menija: prvo zatvori meni (skida `menu-open`
  // i overflow:hidden sa body-ja), pa tek onda skroluj iza panela koji se zatvara.
  // Naslov sekcije staje 24px ispod navbara (pilula je fiksna i prekrila bi ga).
  // Cilj je omotac naslova iz SectionTitle: sam <h2> je pre reveal animacije
  // pomeren nadole, pa bi njegova pozicija bila pogresna.
  const navigate = useCallback(
    (id, { immediate = false } = {}) => {
      const section = id === "top" ? null : document.getElementById(id);
      if (id !== "top" && !section) return;
      const scroll = () => {
        if (!section) {
          if (lenisRef.current) lenisRef.current.scrollTo(0, { force: true, duration: 1.4, immediate });
          else window.scrollTo(0, 0);
          return;
        }
        const target = section.querySelector("h2")?.parentElement ?? section;
        const headerBottom = document.querySelector(".header-bar")?.getBoundingClientRect().bottom ?? 0;
        const offset = -(headerBottom + 24);
        if (lenisRef.current) lenisRef.current.scrollTo(target, { offset, force: true, duration: 1.4, immediate });
        else window.scrollTo(0, target.getBoundingClientRect().top + window.scrollY + offset);
      };
      if (menuOpen) {
        setMenuOpen(false);
        setTimeout(scroll, 80);
      } else scroll();
    },
    [menuOpen],
  );

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // Link sa hash-om (npr. /#sadrzaj): kada je sajt spreman, skok na sekciju sa
  // istim razmakom ispod navbara kao i klik u meniju.
  useEffect(() => {
    if (!ready) return;
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (NAV.some((item) => item.id === id)) navigate(id, { immediate: true });
    // samo jednom, kada sajt postane spreman
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // Rezervacija je tel: link. Na racunaru (bez touch ekrana) poziv uglavnom ne
  // radi, pa [data-booking] linkovi tamo vode na kontakt sekciju sa brojem i email-om.
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;
  useEffect(() => {
    const onClick = (event) => {
      const link = event.target.closest?.("a[data-booking]");
      if (!link || window.matchMedia("(pointer: coarse)").matches) return;
      event.preventDefault();
      navigateRef.current("kontakt");
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  // Stabilna referenca - inace bi se Loader efekat (i animacija) restartovao na svaki render.
  const onLoaded = useCallback(() => setReady(true), []);

  useEffect(() => {
    document.body.classList.toggle("lightbox-open", lightboxOpen);
    return () => document.body.classList.remove("lightbox-open");
  }, [lightboxOpen]);

  return (
    <>
      {!ready && <Loader onComplete={onLoaded} />}
      <Cursor />
      {/* Sajt se renderuje odmah, ispod loadera: tezak prvi render, ScrollTrigger-i
          i dekodiranje slika se tako zavrse dok je loader jos preko ekrana,
          umesto da se sudare sa intro animacijom. Animacije cekaju `ready`. */}
      <Header ready={ready} menuOpen={menuOpen} setMenuOpen={setMenuOpen} onNavigate={navigate} />
      <BrandMenu open={menuOpen} onClose={closeMenu} onNavigate={navigate} />
      {/* Dok je meni otvoren, sadrzaj iza panela nije dostupan tastaturom (Tab ostaje u meniju). */}
      <main id="top" inert={menuOpen}>
        <Hero ready={ready} />
        <Intro />
        <Gallery onLightboxChange={setLightboxOpen} />
        <Amenities />
        <Testimonials />
        <LocationContact />
      </main>
      <Footer onNavigate={navigate} inert={menuOpen} />
    </>
  );
}
