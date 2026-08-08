import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { DURATION, EASE, OVERLAP, START_DELAY } from './config';
import {
  charsReveal,
  enter,
  fadeInDepth,
  fadeInLeft,
  fadeInRight,
  wordsReveal,
  type Split,
} from './presets';

gsap.registerPlugin(ScrollTrigger);

/**
 * Timeline de entrada del hero de la home.
 *
 * Este módulo es el ÚNICO sitio donde se decide el ORDEN de la secuencia; el
 * CÓMO (duraciones, eases, distancias) vive en `config.ts` y los movimientos
 * concretos en `presets.ts`. Para añadir un paso basta una línea nueva entre
 * dos etiquetas; para reordenar, mover esa línea.
 *
 * Secuencia:
 *   1. navbar                       — fade de atrás hacia adelante
 *   2. H1 + imagen decorativa       — a la vez; cascada de palabras + fade en profundidad
 *   3. párrafo                      — escritura (cascada por carácter)
 *   4. botón "Empezar un proyecto"  — fade desde la izquierda
 *   5. banda del marquee            — fade desde la derecha
 *
 * Los elementos arrancan en `visibility: hidden` desde `global.css`: los
 * `<script>` de Astro son diferidos y si no se verían antes de que corra esto.
 */

/** Selectores de los pasos. Cambiar el markup = cambiar solo esta tabla. */
const SEL = {
  hero: '[data-hero]',
  nav: '[data-navbar]',
  media: '[data-hero-media]',
  title: '[data-hero-title]',
  desc: '[data-hero-desc]',
  cta: '[data-hero-cta]',
  marquee: '[data-hero-marquee]',
} as const;

/** Por debajo de este scroll consideramos que la página se abrió arriba del
 *  todo y la intro tiene sentido. Por encima (ancla, recarga a media página)
 *  se salta: el navbar ya está en su estado fijo y el hero fuera de vista. */
const TOP_THRESHOLD = 4;

let timeline: gsap.core.Timeline | null = null;
let cleanup: (() => void) | null = null;

export function initHeroIntro() {
  destroyHeroIntro();

  const hero = document.querySelector(SEL.hero);
  if (!hero) return;

  const nav = document.querySelector(SEL.nav);
  const media = document.querySelector(SEL.media);
  const title = document.querySelector(SEL.title);
  const desc = document.querySelector(SEL.desc);
  const cta = document.querySelector(SEL.cta);
  const marquee = document.querySelector(SEL.marquee);

  const all = [nav, media, title, desc, cta, marquee].filter(Boolean) as Element[];
  if (!all.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || window.scrollY > TOP_THRESHOLD) {
    revealAll(all);
    return;
  }

  let cancelled = false;
  const splits: Split[] = [];

  // Partimos el texto con las fuentes ya cargadas: con la fuente fallback los
  // anchos de palabra (y el reparto de líneas) se calculan mal y saltan.
  document.fonts.ready.then(() => {
    if (cancelled) return;

    const tl = gsap.timeline({ delay: START_DELAY, defaults: { ease: EASE.enter } });
    timeline = tl;

    // 1 — Navbar.
    //
    // Animamos el wrapper `[data-navbar]` y no el `<header>`: `navMorph.ts` ya
    // escribe `y`/`autoAlpha` sobre `.site-nav` y `maxWidth`/fondo sobre
    // `[data-nav-shell]`, así que tocando otro nivel no se pisan.
    //
    // `clearProps: 'transform'` al terminar es obligatorio: un `transform` en
    // un ancestro convierte al `.site-nav.is-pinned` (`position: fixed`) en
    // fijo respecto a este wrapper, y la cápsula se descolocaría al hacer
    // scroll fuera del hero.
    if (nav) {
      tl.addLabel('nav', 0);
      enter(tl, nav, fadeInDepth({ to: { duration: DURATION.nav, clearProps: 'transform' } }), 'nav');
    }

    // 2 — H1 e imagen decorativa, arrancando a la vez.
    tl.addLabel('titulo', OVERLAP);

    if (title) {
      const split = wordsReveal(title);
      splits.push(split);
      enter(tl, split.targets, split.preset, 'titulo');
    }

    if (media) {
      enter(tl, media, fadeInDepth({ to: { duration: DURATION.media } }), 'titulo');
    }

    // 3 — Párrafo descriptivo: escritura por caracteres.
    if (desc) {
      const split = charsReveal(desc);
      splits.push(split);
      tl.addLabel('desc', OVERLAP);
      enter(tl, split.targets, split.preset, 'desc');
    }

    // 4 — Botón principal.
    if (cta) {
      tl.addLabel('cta', OVERLAP);
      enter(tl, cta, fadeInLeft(), 'cta');
    }

    // 5 — Banda del marquee.
    if (marquee) {
      tl.addLabel('marquee', OVERLAP);
      enter(tl, marquee, fadeInRight(), 'marquee');
    }

    // SplitText inyecta wrappers y cambia los offsets del documento: hay que
    // recalcular los ScrollTriggers (pin de Servicios, umbral del navbar).
    ScrollTrigger.refresh();
  });

  cleanup = () => {
    cancelled = true;
    timeline?.kill();
    timeline = null;
    gsap.killTweensOf(all);
    splits.forEach((s) => s.revert());
    splits.length = 0;
    gsap.set(all, { clearProps: 'transform' });
  };
}

export function destroyHeroIntro() {
  cleanup?.();
  cleanup = null;
}

/** Estado final sin animar: para reduced-motion y para la carga con scroll. */
function revealAll(targets: Element[]) {
  gsap.set(targets, { visibility: 'visible', clearProps: 'transform' });
}
