/**
 * Tokens de animación del sitio.
 *
 * Única fuente de verdad para duraciones, eases y ritmo. Los módulos de
 * animación (`presets.ts`, `heroIntro.ts`, `textReveal.ts`) no deben contener
 * números sueltos: si hay que retocar el pulso general de la web, se toca
 * aquí y nada más.
 */

/** Retardo antes del primer fotograma de cualquier entrada. Convención del
 *  sitio, compartida con el marquee (ver `Marquee.tsx`). */
export const START_DELAY = 0.5;

/**
 * Solape entre pasos consecutivos de una timeline de entrada. Al ser un valor
 * relativo negativo, cada paso arranca antes de que termine el anterior y la
 * secuencia se siente encadenada en vez de troceada.
 *
 * Ponlo a `0` para una secuencia estrictamente en cola (cada paso espera al
 * anterior); súbelo en negativo para acelerar el conjunto.
 */
export const OVERLAP = '-=0.3';

/** Duraciones por tipo de elemento. Las marcadas "por X" son la duración de
 *  cada fragmento del split, no la del bloque entero. */
export const DURATION = {
  nav: 0.8,
  titleWord: 1.1, // por palabra
  media: 1.4,
  descChar: 0.5, // por carácter
  cta: 0.7,
  marquee: 0.9,
  card: 0.9,
} as const;

/** Desfase entre fragmentos consecutivos de un texto partido. */
export const STAGGER = {
  titleWord: 0.08,
  descChar: 0.012,
} as const;

/** Desfase entre varios títulos de la misma página (ver `textReveal.ts`). */
export const GROUP_OFFSET = 0.06;

export const EASE = {
  /** Entradas direccionales: arranca rápido y frena. */
  enter: 'power3.out',
  /** Entradas en profundidad: frenada más suave, la escala no rebota. */
  depth: 'power2.out',
  /** Fundidos de texto: sin aceleración marcada, el ojo no persigue palabras. */
  soft: 'sine.out',
} as const;

/** Desplazamiento lateral de los fades direccionales, en px. */
export const SHIFT = 44;

/** Escala de partida del fade "de atrás hacia adelante": el elemento entra
 *  desde el fondo y crece hasta su tamaño real. */
export const DEPTH_SCALE = 0.92;

/* --- Scroll: suavizado y parallax (`scrollSmooth.ts`, `parallax.ts`) --- */

/**
 * Inercia del scroll, en segundos que tarda el contenido en alcanzar la
 * posición real de la barra (`ScrollSmoother.smooth`). Más alto = más flotante.
 * En táctil se deja casi a cero: el scroll nativo del móvil ya tiene su propia
 * inercia y suavizarlo encima se siente pastoso.
 */
export const SMOOTH = { desktop: 1.2, touch: 0.1 } as const;

/**
 * Velocidad de los elementos con parallax, relativa al scroll de la página.
 * `1` = va pegado al scroll; `< 1` = se queda atrás (el clásico "fondo lento").
 * El valor de móvil es más cercano a 1 a propósito: mismo efecto, amplitud
 * reducida, que es lo que aguanta bien una pantalla pequeña.
 */
export const PARALLAX_SPEED = {
  heroMedia: { desktop: 0.7, mobile: 0.9 },
} as const;

/* --- Carrusel horizontal de Servicios (`servicesCarousel.ts`) --- */

export const SERVICES_TRACK = {
  /**
   * Scroll vertical consumido por cada píxel de desplazamiento horizontal del
   * track. `1` = 1:1, el gesto se siente directo. Súbelo para que las tarjetas
   * pasen más despacio (y la sección se quede fijada más rato).
   */
  scrollRatio: 1,
} as const;

export const SERVICES_CARD = {
  /**
   * Deriva lateral extra de cada tarjeta al entrar, en % del ancho del
   * viewport. La tarjeta se mueve con el track y además por su cuenta: son las
   * dos velocidades que dan el efecto de carrusel.
   *
   * En % y no en px a propósito: así móvil y desktop se sienten igual sin
   * necesidad de una segunda rama de `matchMedia`.
   */
  shiftVw: 12,
} as const;
