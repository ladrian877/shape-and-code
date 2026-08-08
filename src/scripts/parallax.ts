import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { PARALLAX_SPEED } from './animations/config';
import { getSmoother } from './scrollSmooth';

gsap.registerPlugin(ScrollTrigger);

/**
 * Parallax del hero: la imagen decorativa se mueve más lento que la página,
 * el texto va a velocidad normal. El clásico "fondo lento".
 *
 * Va dentro de `gsap.matchMedia()`: cada rama se monta y se desmonta sola al
 * cruzar el breakpoint, y con `prefers-reduced-motion: reduce` no se registra
 * nada. Requiere que `scrollSmooth.ts` se haya inicializado antes — el efecto
 * se registra contra la instancia del smoother.
 *
 * Solo movimiento vertical: `global.css` pone `overflow-x: clip` en `html` y
 * `body`, así que cualquier desplazamiento lateral quedaría recortado. Lo que
 * sí se mueve en horizontal —el carrusel de Servicios— vive en
 * `servicesCarousel.ts` y lo hace dentro de un contenedor con su propio
 * `overflow`.
 */

/** Tabla de selectores. Cambiar el markup = cambiar solo esto. */
const SEL = {
  // El wrapper de la imagen del hero, no la imagen: `heroIntro.ts` ya escribe
  // el `transform` de `[data-hero-media]` durante la entrada.
  heroMedia: '[data-hero-parallax]',
} as const;

const NO_REDUCE = 'and (prefers-reduced-motion: no-preference)';

let mm: gsap.MatchMedia | null = null;

export function initParallax() {
  destroyParallax();

  mm = gsap.matchMedia();

  const branch = (speed: number) => () => {
    const media = document.querySelector<HTMLElement>(SEL.heroMedia);
    if (media) getSmoother()?.effects(media, { speed });

    return () => {
      // `effects()` deja transforms puestos: al revertir la rama hay que
      // limpiarlos o la imagen se queda descolocada en el otro breakpoint.
      if (media) gsap.set(media, { clearProps: 'transform' });
    };
  };

  mm.add(`(min-width: 768px) ${NO_REDUCE}`, branch(PARALLAX_SPEED.heroMedia.desktop));
  // Móvil: mismo efecto con la amplitud reducida (velocidad más cerca de 1).
  mm.add(`(max-width: 767px) ${NO_REDUCE}`, branch(PARALLAX_SPEED.heroMedia.mobile));
}

export function destroyParallax() {
  mm?.revert();
  mm = null;
}
