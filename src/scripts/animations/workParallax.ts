import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { DURATION, EASE, WORK_PARALLAX } from './config';

gsap.registerPlugin(ScrollTrigger);

/**
 * Sección "Trabajo": titular fijo y tarjetas cruzando por delante.
 *
 * La sección se fija y las tarjetas suben de abajo arriba, cada una con su
 * velocidad y su tramo de scroll. Van por DELANTE del titular y lo tapan
 * parcialmente: ese solape es el efecto, así que el título no se atenúa ni se
 * enmascara nunca.
 *
 * Se fija con `pin: true` en vez de `position: sticky` porque `ScrollSmoother`
 * traslada `#smooth-content` con `matrix3d`, y un ancestro con `transform` crea
 * un bloque contenedor: dentro de él `sticky` deja de referirse al viewport.
 * Mismo motivo por el que el carrusel de Servicios usa `pin` (ver
 * `servicesCarousel.ts`) y por el que `navMorph.ts` mueve el header con
 * `gsap.set` en lugar de `position: fixed`.
 *
 * Los parámetros por tarjeta (velocidad y tramo) llegan como `data-*` desde
 * `src/config/work.ts`: este módulo no conoce los proyectos, solo los lee del
 * DOM. Para recolocar una tarjeta se toca esa tabla, no esto.
 *
 * Estado sin JS y con `prefers-reduced-motion`: no se registra ninguna rama y
 * manda el CSS de `index.astro`, que fuera de la media query de parallax deja
 * las tarjetas en una columna estática y visible.
 */

/** Tabla de selectores. Cambiar el markup = cambiar solo esto. */
const SEL = {
  section: '[data-work]',
  // Lo que se fija es el bloque de la pantalla, no la sección entera: así el
  // CTA de debajo queda fuera del pin y sigue el flujo normal.
  stage: '[data-work-stage]',
  cards: '[data-work-card]',
} as const;

const NO_REDUCE = 'and (prefers-reduced-motion: no-preference)';

/** Lee un `data-*` numérico con valor de respaldo si falta o no es un número. */
function num(el: HTMLElement, key: string, fallback: number): number {
  const parsed = Number(el.dataset[key]);
  return Number.isFinite(parsed) ? parsed : fallback;
}

let mm: gsap.MatchMedia | null = null;

export function initWorkParallax() {
  destroyWorkParallax();

  const section = document.querySelector<HTMLElement>(SEL.section);
  if (!section) return;

  mm = gsap.matchMedia();

  // --- Desktop: fijado + parallax ---
  //
  // Las media queries son gemelas de las del `<style>` de `index.astro`: la
  // disposición absoluta de las tarjetas y la rama que las anima tienen que
  // aparecer y desaparecer juntas, o quedarían apiladas unas sobre otras sin
  // nada que las mueva.
  mm.add(`(min-width: 768px) ${NO_REDUCE}`, () => {
    const stage = section.querySelector<HTMLElement>(SEL.stage);
    const cards = gsap.utils.toArray<HTMLElement>(SEL.cards, section);
    if (!stage || cards.length === 0) return;

    // JS toma el control: la disposición absoluta de las tarjetas cuelga de esta
    // clase, no de la media query a secas. Sin JS nunca se añade y la sección se
    // queda en la columna estática, que es legible por sí sola. Mismo trato que
    // `.is-pinned` en `servicesCarousel.ts`.
    stage.classList.add('is-parallax');

    // Timeline de duración normalizada a 1: así los `start`/`end` de la tabla
    // son directamente progreso de scroll (0-1) y no hay que convertir nada.
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: stage,
        start: 'top top',
        end: `+=${WORK_PARALLAX.pinLength}%`,
        pin: true,
        // `scrub` numérico = inercia: la animación persigue al scroll con
        // retardo en vez de ir pegada a la rueda.
        scrub: WORK_PARALLAX.scrub,
        // Compensa el salto de un fotograma al fijar en scroll rápido.
        anticipatePin: 1,
        // El recorrido depende de la altura del viewport: hay que remedirlo en
        // cada refresh (resize, carga de fuentes) en vez de congelarlo.
        invalidateOnRefresh: true,
      },
    });

    cards.forEach((card) => {
      const speed = num(card, 'speed', 1);
      const start = num(card, 'start', 0);
      const end = num(card, 'end', 1);

      tl.fromTo(
        card,
        // Sin `speed`: el punto de partida solo tiene que dejar la tarjeta
        // fuera de cuadro, y eso no es negociable por lenta que vaya. Escalarlo
        // hacía que las lentas arrancasen ya dentro de la pantalla y se
        // quedasen ahí paradas hasta que el scroll llegaba a su tramo.
        { y: () => window.innerHeight * WORK_PARALLAX.travelIn },
        {
          // La salida sí va con `speed`: es la distancia recorrida dentro del
          // mismo tramo lo que hace que unas se perciban más rápidas. Va hacia
          // arriba, así que subirla solo aleja más la tarjeta del cuadro.
          y: () => window.innerHeight * WORK_PARALLAX.travelOut * speed,
          // El tramo de la tabla es la duración dentro de la timeline; el
          // mínimo evita que un `end <= start` mal puesto congele la tarjeta.
          duration: Math.max(end - start, 0.01),
        },
        start,
      );
    });

    return () => {
      stage.classList.remove('is-parallax');
      gsap.set(cards, { clearProps: 'transform' });
    };
  });

  // --- Móvil: sin fijar y sin parallax, solo la entrada ---
  //
  // Aquí las tarjetas son una columna normal. El parallax penaliza el
  // rendimiento en pantalla pequeña y no aporta nada.
  mm.add(`(max-width: 767px) ${NO_REDUCE}`, () => {
    const cards = gsap.utils.toArray<HTMLElement>(SEL.cards, section);
    if (cards.length === 0) return;

    cards.forEach((card) => {
      gsap.from(card, {
        autoAlpha: 0,
        y: WORK_PARALLAX.mobileShift,
        duration: DURATION.card,
        ease: EASE.enter,
        scrollTrigger: { trigger: card, start: 'top 88%', once: true },
      });
    });

    return () => {
      gsap.set(cards, { clearProps: 'transform,opacity,visibility' });
    };
  });
}

export function destroyWorkParallax() {
  mm?.revert();
  mm = null;
}
