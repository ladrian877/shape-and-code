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
  scramble: 1.2, // duración del efecto scramble por elemento (título, email de CTA)
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

/* --- Tarjetas en parallax de Trabajo (`animations/workParallax.ts`) --- */

export const WORK_PARALLAX = {
  /**
   * Amortiguación del seguimiento del scroll, en segundos que tarda la
   * animación en alcanzar la posición real. Es la inercia de la sección: a `0`
   * las tarjetas irían 1:1 con la rueda y el movimiento se sentiría seco.
   */
  scrub: 1.2,

  /**
   * Recorrido de scroll que consume la sección mientras está fijada, en % de
   * la altura del viewport. `300` = tres pantallas extra, cuatro en total
   * contando la propia sección. Súbelo para que las tarjetas pasen más
   * despacio y el titular aguante más tiempo en pantalla.
   */
  pinLength: 300,

  /**
   * Punto de partida del recorrido vertical, en múltiplos de la altura del
   * viewport. Es un umbral, no una variable de diseño: por encima de `1` la
   * tarjeta queda fuera de cuadro por abajo, que es lo único que tiene que
   * garantizar.
   *
   * NO lo escales por el `speed` de la tarjeta. Al hacerlo, las lentas
   * arrancaban por debajo de `1` —o sea, ya dentro de la pantalla— y se veían
   * asomando y quietas hasta que el scroll alcanzaba su tramo.
   */
  travelIn: 1.2,

  /**
   * Punto final del recorrido, en múltiplos de la altura del viewport. Negativo
   * porque las tarjetas salen por arriba. Este sí lo escala cada tarjeta por su
   * `speed`: recorrer más distancia en el mismo tramo de scroll es lo que hace
   * que se perciba más rápida. Al ir hacia arriba, subirlo solo aleja más la
   * tarjeta del encuadre.
   */
  travelOut: -1.4,

  /**
   * Versión móvil: una sola tarjeta en pantalla a la vez, así que no necesita
   * el margen extra de `travelIn`/`travelOut` de arriba (pensado para dejar
   * sitio a la superposición del escritorio). El reposo de cada tarjeta
   * (`.work-card { top: 0 }`, sin centrado por flex porque `.work-cards` es
   * `position: absolute; inset: 0`) queda pegado al borde SUPERIOR del stage,
   * no al centro — por eso `travelIn`/`travelOut` no son simétricos:
   *
   * - `travelIn` tiene que superar `1` para que la tarjeta en espera quede
   *   por debajo del borde inferior del viewport (su `top` ya arranca en el
   *   borde superior, así que hace falta una altura de viewport entera).
   * - `travelOut` solo tiene que superar la altura de la propia tarjeta
   *   (~0.35 del viewport en un móvil típico) para que salga por completo
   *   por arriba — no hace falta otra altura de viewport completa como abajo.
   *
   * Con esto el tramo "vacío" (tarjeta totalmente fuera de cuadro) queda casi
   * en cero: una termina de salir justo cuando entra la siguiente.
   * `pinLength` también baja frente a desktop: cada tarjeta ya no necesita
   * tanto recorrido de scroll para completar un cruce tan corto.
   */
  mobile: {
    pinLength: 200,
    travelIn: 1.05,
    travelOut: -0.4,
  },
} as const;

/* --- Entrada de Estudio (`animations/studioIntro.ts`) --- */

export const STUDIO_INTRO = {
  /** Punto del viewport en el que dispara el trigger de entrada. */
  start: 'top 75%',
} as const;

/* --- Scramble de texto de CTA (`animations/ctaIntro.ts`) --- */

export const SCRAMBLE = {
  /**
   * Charset del glitch: mayúsculas + espacio. Sin el espacio en el pool, el
   * plugin sustituye también los espacios del texto mientras barajea —
   * durante la animación el título se convierte en una sola palabra sin
   * puntos de corte y desborda el contenedor. Con el espacio incluido, el
   * propio plugin lo trata como carácter válido (usa `&nbsp;` internamente
   * para no colapsar espacios dobles).
   */
  chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ ',
  /** Veces por segundo que cambian los caracteres aún sin revelar. */
  speed: 0.4,
  /** Fracción de la duración antes de empezar a revelar el carácter final. */
  revealDelay: 0.3,
} as const;

/* --- Entrada de CTA (`animations/ctaIntro.ts`) --- */

export const CTA_INTRO = {
  /** Punto del viewport en el que dispara el trigger de entrada. */
  start: 'top 75%',
} as const;

/* --- Cursor trail de CTA (`animations/ctaTrail.ts`) --- */

export const CTA_TRAIL = {
  /** Distancia mínima del cursor entre dos imágenes consecutivas, en px. */
  spawnDistance: 70,
  /** Tamaño de cada imagen en pantalla, en px (cuadrado). */
  size: 180,
  /** Duración de la aparición y de la salida, en segundos. */
  popIn: 0.28,
  popOut: 0.5,
  /** Segundos que la imagen aguanta a tamaño completo antes de empezar a salir. */
  hold: 0.3,
  /** Escala de partida (entra creciendo) y de salida (se aleja creciendo un poco más). */
  popScale: 0.85,
  outScale: 1.05,
  /** Rotación aleatoria máxima por imagen, en grados — rompe la sensación de rejilla. */
  maxRotate: 6,
  /** Distancia mínima al borde del viewport, en px. Mismo criterio que `WORK_HINT.edge`. */
  edge: 12,
} as const;

/* --- Panel de detalles al vuelo de Trabajo (`animations/workHint.ts`) --- */

export const WORK_HINT = {
  /** Separación entre el cursor y el borde más cercano del panel, en px. */
  gap: 18,

  /**
   * Segundos que tarda el panel en alcanzar la posición del cursor. Es el
   * arrastre: a `0` iría clavado al ratón y se sentiría rígido. No lo subas
   * mucho o el panel parecerá que va a remolque en vez de acompañar.
   */
  follow: 0.4,

  /** Duración de la aparición y de la salida del panel, en segundos. */
  popIn: 0.32,
  popOut: 0.2,

  /** Escala de partida del pop: entra creciendo hasta su tamaño real. */
  popScale: 0.9,

  /** Distancia mínima del panel a cada borde del viewport, en px. */
  edge: 12,
} as const;
