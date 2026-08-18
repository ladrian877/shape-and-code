import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { GROUP_OFFSET, START_DELAY } from './animations/config';
import { wordsReveal, type Split } from './animations/presets';

gsap.registerPlugin(ScrollTrigger);

/**
 * Reveal de entrada por palabras para los titulos de las paginas interiores.
 *
 * Cualquier elemento marcado con `data-reveal-words` se parte con SplitText
 * (solo palabras) y cada palabra se funde desde `opacity: 0` en cascada — sin
 * mascara ni desplazamiento, el texto no se mueve de su sitio. El efecto en si
 * vive en `animations/presets.ts` (`wordsReveal`), compartido con la timeline
 * del hero para que todos los titulos del sitio se vean igual.
 *
 * El H1 del hero de la home queda fuera: lo orquesta `animations/heroIntro.ts`
 * junto al resto de la secuencia, de ahi el `:not([data-hero-title])`.
 *
 * Cada titulo tiene su propio ScrollTrigger: dispara al entrar en el viewport y
 * SOLO UNA VEZ (`once`), igual que la entrada del hero. No se rebobina nunca —
 * eso ademas evita que el titulo se apague a media pantalla al subir. Marcar un
 * titulo nuevo = anadirle `data-reveal-words` y nada mas.
 *
 * El elemento arranca en `visibility: hidden` desde CSS (global.css) para que
 * no parpadee antes de que corra este modulo: los `<script>` de Astro son
 * diferidos. `wordsReveal` lo hace visible justo despues de partirlo.
 */

const SELECTOR = '[data-reveal-words]:not([data-hero-title])';

let cleanup: (() => void) | null = null;

export function initTextReveal() {
  destroyTextReveal();

  const targets = gsap.utils.toArray<HTMLElement>(SELECTOR);
  if (!targets.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.set(targets, { visibility: 'visible' });
    return;
  }

  let splits: Split[] = [];
  let triggers: ScrollTrigger[] = [];
  let cancelled = false;

  // Partimos despues de que carguen las fuentes: si no, el ancho de palabra y
  // la altura de linea (y con ella la mascara) se calculan con la fuente
  // fallback y saltan al cambiar.
  document.fonts.ready.then(() => {
    if (cancelled) return;

    targets.forEach((el, i) => {
      const split = wordsReveal(el);
      splits.push(split);

      // `wordsReveal` hace visible el contenedor nada mas partirlo. Sin fijar
      // aqui el estado inicial, las palabras se verian a opacidad 1 hasta que
      // dispare el trigger — antes daba igual porque el tween arrancaba ya.
      gsap.set(split.targets, split.preset.from);

      // Los titulos ya en pantalla al cargar conservan el retardo de convencion
      // (START_DELAY, compartido con el marquee) y se desfasan entre si para no
      // arrancar todos en el mismo fotograma. Los que llegan por scroll
      // arrancan al instante: medio segundo de espera tras entrar se siente
      // roto.
      const inView = el.getBoundingClientRect().top < window.innerHeight;

      // Sin timeline: cada titulo es independiente y lo gobierna su trigger.
      const tween = gsap.fromTo(split.targets, split.preset.from, {
        ...split.preset.to,
        delay: inView ? START_DELAY + i * GROUP_OFFSET : 0,
        paused: true,
      });

      // `restart(true)` incluye el `delay`, que es lo que conserva el
      // START_DELAY de los titulos ya en pantalla al cargar.
      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start: 'top 85%',
          once: true,
          onEnter: () => tween.restart(true),
        }),
      );
    });

    // SplitText inyecta wrappers y cambia la altura del documento: hay que
    // recalcular los ScrollTriggers (pin de Servicios, umbral del navbar).
    ScrollTrigger.refresh();
  });

  cleanup = () => {
    cancelled = true;
    // `once` ya los mata al disparar, pero hay que poder matarlos tambien si se
    // navega antes de que lleguen a disparar.
    triggers.forEach((t) => t.kill());
    triggers = [];
    // `revert()` mata tambien el tween de cada split (`killTweensOf`).
    splits.forEach((s) => s.revert());
    splits = [];
  };
}

export function destroyTextReveal() {
  cleanup?.();
  cleanup = null;
}
