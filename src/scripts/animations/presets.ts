import gsap from 'gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { SplitText } from 'gsap/SplitText';

import { DEPTH_SCALE, DURATION, EASE, SCRAMBLE, SHIFT, STAGGER } from './config';

gsap.registerPlugin(SplitText, ScrambleTextPlugin);

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

/**
 * Cuenta desde 0 hasta el valor de `target` sobre el propio texto del
 * elemento, conservando cualquier prefijo/sufijo no numérico (`+`, `%`,
 * " años"...). Por defecto usa la misma duración/ease que `fadeInDepth` para
 * que el conteo termine justo cuando el bloque llega a su estado final.
 *
 * No devuelve un `Enter`: no es un `fromTo` de `TweenVars`, lleva su propio
 * `onUpdate` con estado, así que añade el tween directamente a la timeline.
 */
export function countUp(
  tl: gsap.core.Timeline,
  el: HTMLElement,
  target: number,
  position?: gsap.Position,
  over?: Partial<{ duration: number; ease: string }>,
): gsap.core.Timeline {
  const text = el.textContent ?? '';
  const digits = String(target);
  const idx = text.indexOf(digits);
  const prefix = idx >= 0 ? text.slice(0, idx) : '';
  const suffix = idx >= 0 ? text.slice(idx + digits.length) : '';

  const proxy = { value: 0 };
  return tl.to(proxy, {
    value: target,
    duration: over?.duration ?? DURATION.media,
    ease: over?.ease ?? EASE.depth,
    snap: { value: 1 },
    onUpdate: () => { el.textContent = `${prefix}${Math.round(proxy.value)}${suffix}`; },
  }, position);
}

/**
 * Revela el texto del elemento con el efecto scramble de GSAP: baraja
 * caracteres hasta asentarse en el texto real (`el.textContent`, leído antes
 * de animar). El elemento arranca oculto por CSS como el resto de presets, así
 * que se hace visible en el mismo instante en que arranca el tween.
 *
 * No devuelve un `Enter`: igual que `countUp`, `scrambleText` necesita su
 * propio objeto de configuración, no un `fromTo` de `TweenVars`.
 */
export function scrambleReveal(
  tl: gsap.core.Timeline,
  el: HTMLElement,
  position?: gsap.Position,
  over?: Partial<{ duration: number; ease: string }>,
): gsap.core.Timeline {
  const text = el.textContent ?? '';
  tl.set(el, { visibility: 'visible' }, position);
  return tl.to(el, {
    duration: over?.duration ?? DURATION.scramble,
    ease: over?.ease ?? EASE.soft,
    scrambleText: {
      text,
      chars: SCRAMBLE.chars,
      speed: SCRAMBLE.speed,
      revealDelay: SCRAMBLE.revealDelay,
    },
  }, position);
}
