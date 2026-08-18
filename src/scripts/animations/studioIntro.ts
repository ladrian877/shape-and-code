import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { EASE, OVERLAP, STUDIO_INTRO } from './config';
import {
  countUp, enter, fadeInDepth, wordsReveal, type Split,
} from './presets';

gsap.registerPlugin(ScrollTrigger);

/**
 * Timeline de entrada de la sección Estudio.
 *
 * Mismo lenguaje que `heroIntro.ts` (presets compartidos, labels solapados
 * con `OVERLAP`), pero la sección está bajo el fold: la timeline no arranca
 * sola al cargar, la dispara un `ScrollTrigger` de un solo uso al entrar en
 * viewport (mismo patrón que `textReveal.ts`).
 *
 * Secuencia:
 *   1. modelo decorativo           — fade en profundidad (mismo preset que
 *      la imagen del Hero)
 *   2. párrafo manifiesto          — cascada de palabras
 *   3. cifras (+40, 8 años, 100%)  — fade en profundidad + conteo, los 3 con
 *      retraso fijo de 2s desde el modelo, sin esperar al párrafo ni
 *      escalonarse entre sí.
 */

/** Selectores de los pasos. Cambiar el markup = cambiar solo esta tabla. */
const SEL = {
  section: '[data-estudio]',
  model: '[data-estudio-model]',
  text: '[data-estudio-text]',
  stats: '[data-estudio-stat]',
  counters: '[data-count-to]',
} as const;

let timeline: gsap.core.Timeline | null = null;
let cleanup: (() => void) | null = null;

export function initStudioIntro() {
  destroyStudioIntro();

  const section = document.querySelector(SEL.section);
  const model = document.querySelector(SEL.model);
  const text = document.querySelector(SEL.text);
  const stats = gsap.utils.toArray<Element>(SEL.stats);
  const counters = gsap.utils.toArray<HTMLElement>(SEL.counters);
  if (!section || !model || !text || !stats.length) return;

  const all = [model, text, ...stats];

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealAll(all);
    return;
  }

  let cancelled = false;
  let trigger: ScrollTrigger | null = null;
  const splits: Split[] = [];

  // Igual que en heroIntro/textReveal: sin fuentes cargadas el ancho de las
  // palabras del párrafo se mide mal y salta al cambiar de fuente.
  document.fonts.ready.then(() => {
    if (cancelled) return;

    const tl = gsap.timeline({ paused: true, defaults: { ease: EASE.enter } });
    timeline = tl;

    tl.addLabel('model', 0);
    enter(tl, model, fadeInDepth(), 'model');

    const split = wordsReveal(text);
    splits.push(split);
    tl.addLabel('texto', OVERLAP);
    enter(tl, split.targets, split.preset, 'texto');

    // Las cifras no esperan al párrafo, solo un retraso fijo de 1s desde el
    // modelo: los 3 bloques a la vez (sin stagger entre ellos), con su
    // número contando en paralelo al fade.
    tl.addLabel('cifras', 'model+=1');
    enter(tl, stats, fadeInDepth(), 'cifras');
    counters.forEach((counter) => {
      countUp(tl, counter, Number(counter.dataset.countTo), 'cifras');
    });

    trigger = ScrollTrigger.create({
      trigger: section,
      start: STUDIO_INTRO.start,
      once: true,
      onEnter: () => tl.play(),
    });
  });

  cleanup = () => {
    cancelled = true;
    trigger?.kill();
    trigger = null;
    timeline?.kill();
    timeline = null;
    gsap.killTweensOf(all);
    splits.forEach((s) => s.revert());
    splits.length = 0;
  };
}

export function destroyStudioIntro() {
  cleanup?.();
  cleanup = null;
}

/** Estado final sin animar: para reduced-motion. */
function revealAll(targets: Element[]) {
  gsap.set(targets, { visibility: 'visible' });
}
