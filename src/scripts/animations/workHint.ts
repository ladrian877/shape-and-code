import gsap from 'gsap';

import { EASE, WORK_HINT } from './config';

/**
 * Panel de detalles al vuelo de la sección "Trabajo".
 *
 * Al pasar el cursor por una tarjeta, sus datos salen en un panel que aparece
 * con un pop junto al ratón y lo acompaña con algo de arrastre. Así la imagen
 * del proyecto —que es lo que la tarjeta está enseñando— no se tapa.
 *
 * Cada tarjeta declara por qué lado sale el panel (`data-hint-side`, desde
 * `src/config/work.ts`). El lado se elige segun donde este la tarjeta, hacia
 * donde haya hueco; el clamp del final se encarga de que aun asi no se salga
 * nunca de la pantalla.
 *
 * El panel vive FUERA de `#smooth-wrapper` (ver el markup en `index.astro`):
 * ScrollSmoother traslada `#smooth-content` con `matrix3d` y dentro de un
 * ancestro transformado `position: fixed` deja de referirse al viewport. Es el
 * mismo motivo por el que el `<Navbar>` esta fuera. De paso, se libra del
 * `overflow: hidden` de `.work-stage`, que lo recortaria.
 *
 * El contenido se copia del `.work-card-overlay` de la tarjeta: ese bloque ya
 * existe —es lo que se ve en movil— asi que el texto tiene una sola fuente.
 */

/** Tabla de selectores. Cambiar el markup = cambiar solo esto. */
const SEL = {
  section: '[data-work]',
  cards: '[data-work-card]',
  overlay: '.work-card-overlay',
  panel: '[data-work-hint]',
  link: '.work-card-link',
} as const;

type Offset = { dx: number; dy: number };

/**
 * Desplazamiento del panel respecto al punto de anclaje, segun el lado pedido.
 * `w` y `h` son las medidas reales del panel ya con su contenido dentro.
 */
function offsetFor(side: string, w: number, h: number): Offset {
  const g = WORK_HINT.gap;

  switch (side) {
    case 'left':
      return { dx: -(w + g), dy: -h / 2 };
    case 'top':
      return { dx: -w / 2, dy: -(h + g) };
    case 'bottom':
      return { dx: -w / 2, dy: g };
    case 'top-left':
      return { dx: -(w + g), dy: -(h + g) };
    case 'top-right':
      return { dx: g, dy: -(h + g) };
    case 'bottom-left':
      return { dx: -(w + g), dy: g };
    case 'bottom-right':
      return { dx: g, dy: g };
    case 'right':
    default:
      return { dx: g, dy: -h / 2 };
  }
}

let mm: gsap.MatchMedia | null = null;

export function initWorkHint() {
  destroyWorkHint();

  const section = document.querySelector<HTMLElement>(SEL.section);
  const panel = document.querySelector<HTMLElement>(SEL.panel);
  if (!section || !panel) return;

  mm = gsap.matchMedia();

  // `hover: hover` deja fuera tactiles e hibridos: un panel pegado al cursor no
  // tiene sentido sin cursor. Ahi manda el overlay de la propia tarjeta.
  mm.add('(min-width: 768px) and (hover: hover)', () => {
    const cards = gsap.utils.toArray<HTMLElement>(SEL.cards, section);
    if (cards.length === 0) return;

    // Con movimiento reducido no se apaga la rama: el panel sigue apareciendo y
    // colocandose, solo se quedan a cero el pop y el arrastre. Mismo trato que
    // en `navMorph.ts`.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const speed = reduced ? 0 : 1;

    // `quickTo` es el helper de GSAP para escribir una propiedad muchas veces
    // por segundo. La duracion es lo que da el arrastre: el panel persigue al
    // cursor en vez de ir clavado a el.
    //
    // OJO: no crea un tween por llamada, sino UNO reutilizable que reinicia en
    // cada invocacion. Un `gsap.killTweensOf(panel)` en cualquier sitio mata
    // tambien estos dos y el arrastre deja de funcionar a partir de ese momento
    // —sin error ninguno, solo se queda quieto—. No los mates mientras la rama
    // viva; para que la entrada y la salida no se pisen esta `pop`, que es un
    // unico tween reversible.
    const moveX = gsap.quickTo(panel, 'x', {
      duration: WORK_HINT.follow * speed,
      ease: EASE.enter,
    });
    const moveY = gsap.quickTo(panel, 'y', {
      duration: WORK_HINT.follow * speed,
      ease: EASE.enter,
    });

    // Aparicion y desaparicion en un solo tween, creado una vez y en pausa: se
    // reproduce al entrar y se invierte al salir. Al ser el mismo, no hay dos
    // tweens que puedan solaparse ni nada que barrer entre hover y hover.
    const pop = gsap.fromTo(
      panel,
      { autoAlpha: 0, scale: WORK_HINT.popScale },
      {
        autoAlpha: 1,
        scale: 1,
        duration: WORK_HINT.popIn * speed,
        ease: EASE.depth,
        paused: true,
      },
    );

    // `reverse()` usa la duracion de ida, y la salida es mas corta. El cociente
    // la recupera. Es constante, asi que sigue valiendo con movimiento reducido,
    // donde ambas duraciones son cero.
    const outRatio = WORK_HINT.popIn / WORK_HINT.popOut;

    let active: HTMLElement | null = null;

    /** Coloca el panel a partir de un punto de anclaje en coordenadas de viewport. */
    const place = (x: number, y: number, side: string, immediate = false) => {
      const w = panel.offsetWidth;
      const h = panel.offsetHeight;
      const { dx, dy } = offsetFor(side, w, h);

      // El clamp respeta la direccion elegida mientras haya sitio y solo actua
      // en el ultimo tramo: sin el, acercar el cursor a un borde dejaria el
      // panel medio fuera de la pantalla.
      const left = gsap.utils.clamp(
        WORK_HINT.edge,
        Math.max(WORK_HINT.edge, window.innerWidth - w - WORK_HINT.edge),
        x + dx,
      );
      const top = gsap.utils.clamp(
        WORK_HINT.edge,
        Math.max(WORK_HINT.edge, window.innerHeight - h - WORK_HINT.edge),
        y + dy,
      );

      // Al entrar el panel se planta donde toca sin arrastre: si no, saldria
      // volando desde la posicion de la tarjeta anterior.
      if (immediate) gsap.set(panel, { x: left, y: top });
      else {
        moveX(left);
        moveY(top);
      }
    };

    const show = (card: HTMLElement, x: number, y: number) => {
      const overlay = card.querySelector<HTMLElement>(SEL.overlay);
      if (!overlay) return;

      active = card;
      panel.innerHTML = overlay.innerHTML;

      // Hay que medir el panel ya relleno, asi que se coloca antes de animarlo.
      place(x, y, card.dataset.hintSide ?? 'right', true);

      pop.timeScale(1).play();
    };

    const hide = () => {
      if (!active) return;
      active = null;
      pop.timeScale(outRatio).reverse();
    };

    const onMove = (event: PointerEvent) => {
      if (!active) return;
      place(event.clientX, event.clientY, active.dataset.hintSide ?? 'right');
    };

    // Con `Tab` no hay cursor: el panel se ancla al borde de la tarjeta con la
    // misma tabla de lados. Sin esto, navegar con teclado perderia los detalles
    // que hoy si muestra el overlay al recibir el foco.
    const onFocusIn = (event: FocusEvent) => {
      const card = (event.target as HTMLElement).closest<HTMLElement>(SEL.cards);
      if (!card) return;
      const box = card.getBoundingClientRect();
      show(card, box.left + box.width / 2, box.top + box.height / 2);
    };

    const enterHandlers = cards.map((card) => {
      const onEnter = (event: PointerEvent) => show(card, event.clientX, event.clientY);
      card.addEventListener('pointerenter', onEnter);
      card.addEventListener('pointerleave', hide);
      return { card, onEnter };
    });

    section.addEventListener('pointermove', onMove);
    section.addEventListener('focusin', onFocusIn);
    section.addEventListener('focusout', hide);

    // Las tarjetas se mueven por `transform`. Si el cursor se queda quieto
    // mientras una se desplaza por debajo, el navegador no dispara
    // `pointerleave` de forma fiable y el panel se quedaria colgado.
    window.addEventListener('scroll', hide, { passive: true });

    return () => {
      enterHandlers.forEach(({ card, onEnter }) => {
        card.removeEventListener('pointerenter', onEnter);
        card.removeEventListener('pointerleave', hide);
      });
      section.removeEventListener('pointermove', onMove);
      section.removeEventListener('focusin', onFocusIn);
      section.removeEventListener('focusout', hide);
      window.removeEventListener('scroll', hide);

      // Aqui si toca matarlo todo: la rama se esta desmontando y con ella los
      // `quickTo` y el `pop`, que no sobreviven a la revert.
      pop.kill();
      gsap.killTweensOf(panel);
      gsap.set(panel, { clearProps: 'all' });
      panel.innerHTML = '';
      active = null;
    };
  });
}

export function destroyWorkHint() {
  mm?.revert();
  mm = null;
}
