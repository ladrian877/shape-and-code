import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';

import { SMOOTH } from './animations/config';

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

/**
 * Scroll suave con inercia (ScrollSmoother) — dueño único del scroll de la home.
 *
 * ScrollSmoother deja la barra de scroll nativa intacta y lo que hace es
 * desplazar `#smooth-content` con un `transform` que persigue la posición real
 * con retardo. De ahí dos reglas de oro del markup:
 *
 *   1. El contenido va dentro de `#smooth-wrapper > #smooth-content`.
 *   2. Todo lo que sea `position: fixed` —el navbar— va FUERA del wrapper: un
 *      ancestro con `transform` convierte `fixed` en relativo a ese ancestro.
 *
 * Este módulo debe inicializarse ANTES que `parallax.ts`: los efectos de
 * parallax se registran contra la instancia que se crea aquí.
 *
 * Con `prefers-reduced-motion: reduce` no se crea nada y la página se queda con
 * el scroll nativo.
 */

let smoother: ScrollSmoother | null = null;

export function initScrollSmooth() {
  destroyScrollSmooth();

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!document.getElementById('smooth-wrapper')) return;

  smoother = ScrollSmoother.create({
    wrapper: '#smooth-wrapper',
    content: '#smooth-content',
    smooth: SMOOTH.desktop,
    smoothTouch: SMOOTH.touch,
    // Los efectos NO se declaran con `data-speed` en el markup: los registra
    // `parallax.ts` desde JS para que las velocidades salgan de `config.ts` y
    // `matchMedia` pueda dar valores distintos en desktop y en móvil.
    effects: false,
    // Los anchors (`#contacto`, `#top`) los intercepta ScrollSmoother.
    ignoreMobileResize: true,
    // ScrollTrigger pasa a gobernar el scroll en vez de reaccionar a los
    // eventos del navegador. Sin esto, el scroll asincrono del navegador y las
    // actualizaciones de ScrollTrigger van desfasadas: la seccion FIJADA de
    // Servicios —lo unico que deberia estar quieto— vibraba a cada frame.
    normalizeScroll: true,
  });
}

/** Instancia activa, o `null` si no hay smoother (reduced-motion, otra página). */
export function getSmoother() {
  return smoother;
}

export function destroyScrollSmooth() {
  smoother?.kill();
  smoother = null;
}
