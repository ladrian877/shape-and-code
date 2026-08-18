import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Navbar en dos estados:
 *
 * - "hero": la cápsula es transparente y ancha (1320px), alineada con el
 *   contenedor del hero, y ACOMPAÑA AL SCROLL hasta salir de pantalla.
 * - "pinned": la cápsula se contrae a 900px con fondo, borde, blur y sombra —
 *   el navbar de siempre— y cae desde arriba.
 *
 * El `<header>` es `fixed` en ambos estados (ver el `<style>` de `Navbar.astro`):
 * con ScrollSmoother el contenido vive dentro de un wrapper transformado y el
 * navbar queda fuera. Por eso, en el estado "hero", que no sea sticky no puede
 * salir del CSS: hay que trasladarlo a mano con `y` siguiendo el scroll (ver
 * `heroTrigger`). Si no, la barra transparente se queda clavada arriba tapando
 * el título del hero. Ese es el motivo de que `pin()` entre desde `y: -24`: al
 * fijarse, el navbar viene de estar fuera de la pantalla.
 *
 * Dos umbrales, a propósito distintos (histéresis): se fija al pasar el final
 * del hero, pero solo vuelve al estado ancho al regresar al top del documento.
 * Así un scroll corto hacia arriba a media página no hace parpadear la cápsula.
 *
 * Requiere `<Navbar morph />` (marca `[data-nav-morph]`) y un `#hero`.
 */

const PINNED_MAX_WIDTH = 900;
const HERO_MAX_WIDTH = 1320;
const UNPIN_AT = 4; // px de scroll por debajo de los cuales volvemos al hero

let cleanup: (() => void) | null = null;

export function initNavMorph() {
  destroyNavMorph();

  const root = document.querySelector<HTMLElement>('[data-nav-morph]');
  const header = root?.querySelector<HTMLElement>('.site-nav');
  const shell = root?.querySelector<HTMLElement>('[data-nav-shell]');
  const hero = document.querySelector<HTMLElement>('#hero');
  if (!root || !header || !shell || !hero) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const speed = reduced ? 0 : 1;

  let pinned = false;
  // Se crea más abajo, pero `unpin()` necesita poder devolverle el control.
  let heroTrigger: ScrollTrigger | null = null;

  // Padding horizontal de la cápsula fija (equivalente a `px-4 sm:px-5`).
  const shellPadding = () => (window.matchMedia('(min-width: 640px)').matches ? 20 : 16);

  // Altura visual del header (incluye su `pt-4`/`pt-5`): desplazarlo esa
  // distancia lo deja justo fuera de la pantalla.
  //
  // Cacheada a proposito. `offsetHeight` fuerza un recalculo de layout, y
  // leerlo en cada evento de scroll —intercalado con las escrituras de
  // transform de GSAP— es layout thrashing: se ve como un temblor de la pagina,
  // sobre todo donde el contenido deberia estar quieto (la seccion fijada de
  // Servicios). Se remide solo en los refresh (resize, fuentes, cambios de
  // altura del documento).
  let navH = header.offsetHeight;

  const pin = (animate = true) => {
    if (pinned) return;
    pinned = true;
    gsap.killTweensOf([header, shell]);
    header.classList.add('is-pinned');

    const d = animate ? speed : 0;
    gsap
      .timeline()
      .fromTo(
        header,
        { y: -24, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.45 * d, ease: 'power3.out' },
      )
      .to(
        shell,
        {
          maxWidth: PINNED_MAX_WIDTH,
          paddingLeft: shellPadding(),
          paddingRight: shellPadding(),
          backgroundColor: 'rgba(17,17,17,0.9)',
          borderColor: 'rgba(42,42,42,1)',
          boxShadow: '0 2px 24px rgba(0,0,0,0.07)',
          backdropFilter: 'blur(16px)',
          duration: 0.5 * d,
          ease: 'power3.out',
        },
        '<',
      );
  };

  const unpin = (animate = true) => {
    if (!pinned) return;
    pinned = false;
    gsap.killTweensOf([header, shell]);
    header.classList.remove('is-pinned');
    // `y` vuelve a ser de `heroTrigger`: que lo reescriba ya, sin esperar al
    // siguiente evento de scroll.
    heroTrigger?.update();

    const d = animate ? speed : 0;
    gsap.to(shell, {
      maxWidth: HERO_MAX_WIDTH,
      paddingLeft: 0,
      paddingRight: 0,
      backgroundColor: 'rgba(17,17,17,0)',
      borderColor: 'rgba(42,42,42,0)',
      boxShadow: '0 2px 24px rgba(0,0,0,0)',
      backdropFilter: 'blur(0px)',
      duration: 0.45 * d,
      ease: 'power3.inOut',
      onComplete: () => gsap.set(header, { clearProps: 'opacity,visibility' }),
    });
  };

  // Umbral de fijado: el final del hero llega a la altura del header. `start`
  // como función + `invalidateOnRefresh` para que se remida solo tras un
  // resize o un `ScrollTrigger.refresh()` (SplitText cambia alturas).
  const pinTrigger = ScrollTrigger.create({
    trigger: hero,
    start: () => `bottom top+=${header.offsetHeight}`,
    end: 'max',
    invalidateOnRefresh: true,
    onEnter: () => pin(),
    // Sin `onLeaveBack`: el estado ancho solo vuelve arriba del todo.
    onRefresh: () => {
      // El padding de la cápsula depende del breakpoint: reaplicar si toca.
      if (pinned) gsap.set(shell, { paddingLeft: shellPadding(), paddingRight: shellPadding() });
    },
  });

  // El header del hero acompaña al scroll hasta salir de pantalla. `self.scroll()`
  // es la posición ya suavizada por ScrollSmoother, así que va clavado al
  // contenido del hero. `end: 'max'` a propósito: el trigger está vivo en toda
  // la página y el clamp lo hace el `Math.min`, sin depender de si ScrollTrigger
  // emite un último `onUpdate` al salir del rango. `pinned` manda: con la
  // cápsula fija, `y` es de `pin()`/`unpin()` y aquí no se escribe nada.
  heroTrigger = ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      if (pinned) return;
      gsap.set(header, { y: -Math.min(self.scroll(), navH) });
    },
    onRefresh: () => {
      navH = header.offsetHeight;
    },
  });

  // Umbral de vuelta: `start` numérico = píxeles absolutos de scroll.
  const topTrigger = ScrollTrigger.create({
    start: UNPIN_AT,
    end: 'max',
    onLeaveBack: () => unpin(),
  });

  // Estado inicial sin animación (recarga a media página, entrada con ancla).
  if (pinTrigger.isActive) pin(false);

  cleanup = () => {
    pinTrigger.kill();
    topTrigger.kill();
    heroTrigger?.kill();
    heroTrigger = null;
    gsap.killTweensOf([header, shell]);
  };
}

export function destroyNavMorph() {
  cleanup?.();
  cleanup = null;
}
