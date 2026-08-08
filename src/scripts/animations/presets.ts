import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';

import { DEPTH_SCALE, DURATION, EASE, SHIFT, STAGGER } from './config';

gsap.registerPlugin(SplitText);

/**
 * Presets de entrada reutilizables.
 *
 * Cada preset describe un movimiento (`from` -> `to`) pero no decide cuándo
 * ocurre: eso es trabajo de la timeline que lo consume (`heroIntro.ts` y
 * futuros módulos por sección). Añadir un efecto nuevo a la web = añadir un
 * preset aquí; añadir un paso a una secuencia = una línea en su timeline.
 *
 * Todos son `fromTo` y no `from` a propósito: los elementos animados arrancan
 * en `visibility: hidden` desde CSS (los `<script>` de Astro son diferidos y
 * si no se pintarían antes de tiempo). Un `gsap.from({ autoAlpha: 0 })` leería
 * ese `hidden` como estado final y el elemento no llegaría a verse nunca.
 */

/** Par de estados de una animación de entrada. */
export type Enter = { from: gsap.TweenVars; to: gsap.TweenVars };

type Target = gsap.TweenTarget;

/** Mezcla superficial de `from`/`to` para permitir sobrescribir un preset sin
 *  duplicarlo (p. ej. cambiar solo la duración). */
const merge = (base: Enter, over?: Partial<Enter>): Enter => ({
  from: { ...base.from, ...over?.from },
  to: { ...base.to, ...over?.to },
});

/**
 * Fade "de atrás hacia adelante": el elemento entra desde el fondo y crece
 * hasta su tamaño real mientras aparece.
 */
export const fadeInDepth = (over?: Partial<Enter>): Enter =>
  merge(
    {
      from: { autoAlpha: 0, scale: DEPTH_SCALE, transformOrigin: '50% 50%' },
      to: { autoAlpha: 1, scale: 1, duration: DURATION.media, ease: EASE.depth },
    },
    over,
  );

/** Fade direccional: el elemento entra desde la izquierda. */
export const fadeInLeft = (over?: Partial<Enter>): Enter =>
  merge(
    {
      from: { autoAlpha: 0, x: -SHIFT },
      to: { autoAlpha: 1, x: 0, duration: DURATION.cta, ease: EASE.enter },
    },
    over,
  );

/** Fade direccional: el elemento entra desde la derecha. */
export const fadeInRight = (over?: Partial<Enter>): Enter =>
  merge(
    {
      from: { autoAlpha: 0, x: SHIFT },
      to: { autoAlpha: 1, x: 0, duration: DURATION.marquee, ease: EASE.enter },
    },
    over,
  );

/**
 * Añade un preset a una timeline.
 *
 * `position` es el parámetro de posición de GSAP: una etiqueta, `'<'` (a la
 * vez que el paso anterior), `OVERLAP`, un número absoluto...
 */
export function enter(
  tl: gsap.core.Timeline,
  target: Target,
  preset: Enter,
  position?: gsap.Position,
): gsap.core.Timeline {
  return tl.fromTo(target, preset.from, preset.to, position);
}

/* ------------------------------------------------------------------ */
/* Revelados de texto                                                  */
/* ------------------------------------------------------------------ */

/**
 * Texto partido y listo para animar.
 *
 * Se devuelve el preset en vez de un tween ya creado para que el consumidor
 * decida dónde encaja: dentro de una timeline (`enter(tl, split.targets, ...)`)
 * o como tween suelto con su propio delay.
 */
export type Split = { targets: Element[]; preset: Enter; revert: () => void };

/**
 * Parte el elemento en palabras y las funde en cascada.
 *
 * Sin desplazamiento: el texto no se mueve de su sitio, solo aparece de
 * izquierda a derecha. Es el revelado de todos los `<h1>` del sitio.
 *
 * Ojo: hay que llamarlo con las fuentes ya cargadas (`document.fonts.ready`).
 * Con la fuente fallback los anchos de palabra se calculan mal y el texto
 * salta al cambiar.
 */
export function wordsReveal(el: Element, over?: Partial<Enter>): Split {
  const split = SplitText.create(el, { type: 'words' });

  // El contenedor arranca oculto desde CSS; una vez partido ya podemos
  // mostrarlo, porque son las palabras las que llevan la opacidad.
  gsap.set(el, { visibility: 'visible' });

  return {
    targets: split.words,
    preset: merge(
      {
        from: { opacity: 0 },
        to: {
          opacity: 1,
          duration: DURATION.titleWord,
          ease: EASE.soft,
          stagger: STAGGER.titleWord,
        },
      },
      over,
    ),
    revert: () => {
      gsap.killTweensOf(split.words);
      split.revert();
    },
  };
}

/**
 * Parte el elemento en caracteres y los funde en cascada: efecto de escritura
 * sin el reflow de un typewriter literal (el texto ya ocupa su espacio final,
 * así que nada de debajo se desplaza).
 *
 * Se parte también por palabras para que el salto de línea siga ocurriendo
 * entre palabras y no a mitad de una.
 */
export function charsReveal(el: Element, over?: Partial<Enter>): Split {
  const split = SplitText.create(el, { type: 'chars,words' });

  gsap.set(el, { visibility: 'visible' });

  return {
    targets: split.chars,
    preset: merge(
      {
        from: { opacity: 0 },
        to: {
          opacity: 1,
          duration: DURATION.descChar,
          ease: EASE.soft,
          stagger: STAGGER.descChar,
        },
      },
      over,
    ),
    revert: () => {
      gsap.killTweensOf(split.chars);
      split.revert();
    },
  };
}
