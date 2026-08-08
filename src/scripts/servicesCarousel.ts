import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { DURATION, EASE, SERVICES_CARD, SERVICES_TRACK } from './animations/config';

gsap.registerPlugin(ScrollTrigger);

/**
 * Carrusel horizontal de la sección de Servicios.
 *
 * La sección se fija y el track de tarjetas se desplaza en horizontal a golpe
 * de scroll. El `<h2>Servicios</h2>` no se mueve porque lo fijado es la sección
 * entera, no el título por separado.
 *
 * Cada tarjeta se mueve DOS veces: con el track, y además por su cuenta al
 * entrar (fade + deriva lateral). Esas dos velocidades son lo que da la
 * sensación de carrusel en vez de la de una tira rígida.
 *
 * Estado sin JS y con `prefers-reduced-motion`: el `.svc-viewport` es de por sí
 * un scroller horizontal nativo con `scroll-snap` (ver el `<style>` de
 * `index.astro`). Este módulo solo lo apaga —añadiendo `.is-pinned`— cuando
 * toma el control. Es decir: el carrusel funciona a mano aunque esto no corra.
 */

/** Tabla de selectores. Cambiar el markup = cambiar solo esto. */
const SEL = {
  section: '[data-services]',
  viewport: '[data-svc-viewport]',
  track: '[data-svc-track]',
  cards: '[data-svc-card]',
  progress: '[data-svc-progress]',
} as const;

let mm: gsap.MatchMedia | null = null;

export function initServicesCarousel() {
  destroyServicesCarousel();

  const section = document.querySelector<HTMLElement>(SEL.section);
  if (!section) return;

  mm = gsap.matchMedia();

  // Una sola rama: desktop y móvil se comportan igual. Con movimiento reducido
  // no se registra nada y manda el scroller nativo del CSS.
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const viewport = section.querySelector<HTMLElement>(SEL.viewport);
    const track = section.querySelector<HTMLElement>(SEL.track);
    const progress = section.querySelector<HTMLElement>(SEL.progress);
    const cards = gsap.utils.toArray<HTMLElement>(SEL.cards, section);
    if (!viewport || !track || cards.length < 2) return;

    // JS toma el control: fuera el scroll nativo del contenedor, o competiría
    // con el tween del track.
    viewport.classList.add('is-pinned');
    viewport.scrollLeft = 0;

    /** Cuánto tiene que recorrer el track para enseñar la última tarjeta. */
    const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);

    const trackTween = gsap.to(track, {
      x: () => -distance(),
      // `none` es obligatorio: `containerAnimation` necesita que la relación
      // entre progreso y desplazamiento sea lineal para situar las tarjetas.
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${distance() * SERVICES_TRACK.scrollRatio}`,
        pin: true,
        scrub: true,
        // Compensa el salto de un fotograma al fijar en scroll rápido.
        anticipatePin: 1,
        // Los anchos dependen del viewport: hay que remedirlos en cada refresh
        // (resize, carga de fuentes) en vez de congelar el valor inicial.
        invalidateOnRefresh: true,
        onUpdate: progress ? (self) => gsap.set(progress, { scaleX: self.progress }) : undefined,
      },
    });

    // La 01 va aparte: cuando la sección llega, su borde izquierdo ya está a la
    // izquierda del umbral de abajo, así que su progreso contra `trackTween`
    // nace en 1 y no llegaría a animar nunca. Ver `firstTween`.
    const [firstCard, ...restCards] = cards;

    // Entrada de cada tarjeta. `containerAnimation` es la pieza clave: mide la
    // posición de la tarjeta contra el tween del track (que es lo que la mueve)
    // y no contra el scroll de la página, que va en el otro eje.
    restCards.forEach((card) => {
      gsap.from(card, {
        autoAlpha: 0,
        x: () => window.innerWidth * (SERVICES_CARD.shiftVw / 100),
        ease: EASE.enter,
        scrollTrigger: {
          trigger: card,
          containerAnimation: trackTween,
          start: 'left 92%',
          end: 'left 55%',
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    });

    // Entrada de la 01: mismo movimiento que las demás, pero disparado por la
    // llegada de la sección al viewport en vez de por su posición en el track.
    // Una sola vez, igual que la entrada del hero.
    const firstTween = gsap.fromTo(
      firstCard,
      { autoAlpha: 0, x: () => window.innerWidth * (SERVICES_CARD.shiftVw / 100) },
      { autoAlpha: 1, x: 0, duration: DURATION.card, ease: EASE.enter, paused: true },
    );

    ScrollTrigger.create({
      trigger: section,
      // Antes del `top top` que fija la sección.
      start: 'top 75%',
      once: true,
      // `invalidate()` re-evalúa la `x`, que depende del ancho del viewport.
      onEnter: () => firstTween.invalidate().restart(),
    });

    return () => {
      viewport.classList.remove('is-pinned');
      gsap.set([track, ...cards], { clearProps: 'all' });
      if (progress) gsap.set(progress, { clearProps: 'all' });
    };
  });
}

export function destroyServicesCarousel() {
  mm?.revert();
  mm = null;
}
