import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { CTA_INTRO, OVERLAP, EASE } from './config';
import { enter, fadeInLeft, scrambleReveal } from './presets';

gsap.registerPlugin(ScrollTrigger);

/**
 * Timeline de entrada de la sección CTA. Bajo el fold: la dispara un
 * `ScrollTrigger` de un solo uso al entrar en viewport, igual que
 * `studioIntro.ts`. Sin `document.fonts.ready`: a diferencia de
 * `wordsReveal`/`charsReveal`, `scrambleReveal` no mide anchos de palabra ni
 * usa `SplitText`, así que no hace falta ese gate.
 *
 * Secuencia:
 *   1. título + email — scramble en cascada, uno tras otro (`OVERLAP`)
 *   2. botón "Escribir un mensaje" — fade desde la izquierda, mismo preset
 *      que el CTA del Hero
 */

/** Selectores de los pasos. Cambiar el markup = cambiar solo esta tabla. */
const SEL = {
  section: '[data-cta]',
  scramble: '[data-cta-scramble]',
  button: '[data-cta-button]',
} as const;

let cleanup: (() => void) | null = null;

export function initCtaIntro() {
  destroyCtaIntro();

  const section = document.querySelector(SEL.section);
  const texts = gsap.utils.toArray<HTMLElement>(SEL.scramble);
  const button = document.querySelector<HTMLElement>(SEL.button);
  if (!section || !texts.length || !button) return;

  const all = [...texts, button];

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.set(all, { visibility: 'visible' });
    return;
  }

  const tl = gsap.timeline({ paused: true, defaults: { ease: EASE.enter } });

  texts.forEach((el, i) => scrambleReveal(tl, el, i === 0 ? 0 : OVERLAP));

  tl.addLabel('boton', OVERLAP);
  enter(tl, button, fadeInLeft(), 'boton');

  const trigger = ScrollTrigger.create({
    trigger: section,
    start: CTA_INTRO.start,
    once: true,
    onEnter: () => tl.play(),
  });

  cleanup = () => {
    trigger.kill();
    tl.kill();
    gsap.killTweensOf(all);
  };
}

export function destroyCtaIntro() {
  cleanup?.();
  cleanup = null;
}
