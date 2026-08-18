import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { WORK_PARALLAX } from './config';

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

type CardWindow = { start: number; end: number; speed: number };

/** Ventana de escritorio: la tabla curada de `work.ts`, ya en el DOM como
 *  `data-*`. Los tramos se solapan a propósito ("2-3 tarjetas en pantalla a
 *  la vez"). */
function desktopWindow(card: HTMLElement): CardWindow {
  return {
    speed: num(card, 'speed', 1),
    start: num(card, 'start', 0),
    end: num(card, 'end', 1),
  };
}

/** Ventana de móvil: sin `data-*`, un tramo propio y exclusivo por índice —
 *  la tarjeta `i` de `n` ocupa `[i/n, (i+1)/n)`. Sin solape porque en móvil
 *  no hay ancho para mostrar más de una a la vez, van una detrás de otra en
 *  orden. Velocidad fija: con velocidades distintas una tarjeta rápida
 *  saldría de cuadro antes de que acabe su tramo y dejaría un hueco vacío
 *  hasta que empiece la siguiente. */
function mobileWindow(_card: HTMLElement, index: number, total: number): CardWindow {
  return { speed: 1, start: index / total, end: (index + 1) / total };
}

type RiseConfig = {
  pinLength: number;
  travelIn: number;
  travelOut: number;
  getWindow: (card: HTMLElement, index: number, total: number) => CardWindow;
};

/** Timeline de scrub compartida entre desktop y móvil: un `fromTo` por
 *  tarjeta, dentro de un ScrollTrigger fijado en `stage`. Todo lo que
 *  distingue una rama de otra llega en `config` — el mecanismo de fijado y
 *  scrub es el mismo. */
function buildCardRiseTimeline(stage: HTMLElement, cards: HTMLElement[], config: RiseConfig) {
  const { pinLength, travelIn, travelOut, getWindow } = config;

  // Timeline de duración normalizada a 1: así los `start`/`end` son
  // directamente progreso de scroll (0-1) y no hay que convertir nada.
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: stage,
      start: 'top top',
      end: `+=${pinLength}%`,
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

  cards.forEach((card, index) => {
    const { speed, start, end } = getWindow(card, index, cards.length);

    tl.fromTo(
      card,
      // Sin `speed`: el punto de partida solo tiene que dejar la tarjeta
      // fuera de cuadro, y eso no es negociable por lenta que vaya. Escalarlo
      // hacía que las lentas arrancasen ya dentro de la pantalla y se
      // quedasen ahí paradas hasta que el scroll llegaba a su tramo.
      { y: () => window.innerHeight * travelIn },
      {
        // La salida sí va con `speed`: es la distancia recorrida dentro del
        // mismo tramo lo que hace que unas se perciban más rápidas. Va hacia
        // arriba, así que subirla solo aleja más la tarjeta del cuadro.
        y: () => window.innerHeight * travelOut * speed,
        // El tramo es la duración dentro de la timeline; el mínimo evita que
        // un `end <= start` mal puesto congele la tarjeta.
        duration: Math.max(end - start, 0.01),
      },
      start,
    );
  });

  return tl;
}

export function initWorkParallax() {
  destroyWorkParallax();

  const section = document.querySelector<HTMLElement>(SEL.section);
  if (!section) return;

  mm = gsap.matchMedia();

  // --- Desktop: fijado + parallax, tarjetas esparcidas ---
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
    buildCardRiseTimeline(stage, cards, {
      pinLength: WORK_PARALLAX.pinLength,
      travelIn: WORK_PARALLAX.travelIn,
      travelOut: WORK_PARALLAX.travelOut,
      getWindow: desktopWindow,
    });

    return () => {
      stage.classList.remove('is-parallax');
      gsap.set(cards, { clearProps: 'transform' });
    };
  });

  // --- Móvil: mismo fijado + scrub que desktop, tarjetas apiladas en el
  // centro en vez de esparcidas ---
  //
  // Mecanismo idéntico al de escritorio (`buildCardRiseTimeline`): lo único
  // que cambia es la clase que se añade al stage, que en el CSS resuelve a
  // una única posición centrada para todas las tarjetas en vez de la
  // disposición por `--work-x`/`--work-w` de escritorio.
  mm.add(`(max-width: 767px) ${NO_REDUCE}`, () => {
    const stage = section.querySelector<HTMLElement>(SEL.stage);
    const cards = gsap.utils.toArray<HTMLElement>(SEL.cards, section);
    if (!stage || cards.length === 0) return;

    stage.classList.add('is-parallax-mobile');
    buildCardRiseTimeline(stage, cards, {
      pinLength: WORK_PARALLAX.mobile.pinLength,
      travelIn: WORK_PARALLAX.mobile.travelIn,
      travelOut: WORK_PARALLAX.mobile.travelOut,
      getWindow: mobileWindow,
    });

    return () => {
      stage.classList.remove('is-parallax-mobile');
      gsap.set(cards, { clearProps: 'transform' });
    };
  });
}

export function destroyWorkParallax() {
  mm?.revert();
  mm = null;
}
