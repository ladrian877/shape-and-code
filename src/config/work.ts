/**
 * Proyectos de la sección "Trabajo" de la home.
 *
 * Contenido y parámetros de movimiento viven juntos a propósito: recolocar una
 * tarjeta (moverla de lado, hacerla más grande, que suba antes) se hace aquí,
 * sin abrir `scripts/animations/workParallax.ts`. Ese módulo solo lee la tabla.
 *
 * Para añadir un proyecto basta con una entrada más. Repasa entonces `xOffset`
 * (que no se repita ninguno) y los tramos `start`/`end`, que deben solaparse:
 * es lo que mantiene 2-3 tarjetas en pantalla a la vez.
 */

/**
 * Lado por el que sale el panel de detalles respecto al cursor
 * (`scripts/animations/workHint.ts`).
 */
export type HintSide =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

export type WorkItem = {
  /** Clave estable, usada como `key` del map y en los selectores. */
  id: string;
  name: string;
  /** Disciplina, bajo el nombre. */
  tag: string;
  year: string;
  /** Copy de 2 líneas; solo visible en hover/focus. */
  description: string;
  /**
   * Clave del registro de imágenes: la ruta relativa a `src/assets/images/`.
   * Ver `src/lib/images.ts`. Una clave inexistente rompe el build, no produce
   * un 404. Sin `image`, la tarjeta muestra el hueco vacío ya dimensionado.
   */
  image?: string;
  /** Obligatorio. Cadena vacía solo si la imagen es decorativa. */
  alt: string;
  /** Destino externo. Sin `link`, la tarjeta cae a `/proyectos`. */
  link?: string;

  /* --- Disposición y movimiento (solo desktop; ver `workParallax.ts`) --- */

  /** Ancho de la tarjeta en px. Entre 340 y 520: la variedad rompe la retícula. */
  width: number;
  /** Relación de aspecto del hueco de imagen. */
  aspect: '4/3' | '3/4' | '1/1';
  /** Desplazamiento horizontal respecto al centro, en % del ancho de tarjeta. */
  xOffset: number;
  /** Multiplicador del recorrido vertical. `<1` sube despacio, `>1` deprisa. */
  speed: number;
  /** Inclinación en grados. Entre -2 y 2: lo justo para que no parezca rejilla. */
  rotation: number;
  /** Progreso de scroll (0-1) donde la tarjeta empieza a cruzar. */
  start: number;
  /** Progreso de scroll (0-1) donde termina de cruzar. */
  end: number;

  /**
   * Por donde sale el panel de detalles al pasar el cursor. Se elige segun la
   * posicion de la tarjeta: siempre hacia donde hay hueco, normalmente el
   * centro de la pantalla. Una tarjeta pegada al borde derecho con el panel a
   * la derecha lo tendria recortado contra el borde en cuanto el cursor suba.
   */
  hintSide: HintSide;
};

export const workItems: WorkItem[] = [
  {
    id: 'jadoo',
    name: 'Jadoo',
    tag: 'Web',
    year: '2026',
    description: 'Plataforma de viajes con reserva en tres pasos. Diseño y desarrollo completo.',
    image: 'proyectos/JadooPreview.png',
    alt: 'Página de inicio de Jadoo',
    link: 'https://jadoo-astro.vercel.app/',
    width: 480,
    aspect: '4/3',
    xOffset: -26,
    speed: 0.85,
    rotation: -1.5,
    start: 0,
    end: 0.62,
    hintSide: 'right',
  },
  {
    id: 'novavision',
    name: 'NovaVision',
    tag: 'UX/UI + SEO',
    year: '2025',
    description: 'Rediseño de producto y arquitectura de contenidos orientada a búsqueda.',
    image: 'proyectos/NeoVisionPreview.png',
    alt: 'Página de inicio de NovaVision',
    link: 'https://nova-vision-three.vercel.app/',
    // Mismas medidas que Jadoo a proposito: las dos son capturas de una web y
    // deben leerse como piezas del mismo tipo.
    width: 480,
    aspect: '4/3',
    xOffset: 18,
    speed: 0.95,
    rotation: 1.2,
    start: 0.1,
    end: 0.68,
    hintSide: 'left',
  },
  {
    id: 'cobalt',
    name: 'Cobalt Fintech',
    tag: 'UX/UI + SEO',
    year: '2025',
    description: 'Panel financiero para pymes. Jerarquía de datos y flujos de alta densidad.',
    alt: 'Panel de Cobalt Fintech',
    width: 520,
    aspect: '4/3',
    xOffset: -12,
    speed: 0.7,
    rotation: 0.8,
    start: 0.22,
    end: 0.86,
    hintSide: 'top-right',
  },
  {
    id: 'vela',
    name: 'Vela Estudio',
    tag: 'Identidad',
    year: '2025',
    description: 'Sistema de marca completo: naming, logotipo y guía de uso.',
    alt: 'Identidad de Vela Estudio',
    width: 340,
    aspect: '1/1',
    xOffset: 30,
    speed: 1.4,
    rotation: -2,
    start: 0.34,
    end: 0.9,
    hintSide: 'top-left',
  },
  // Las dos siguientes son relleno visible: sustituye nombre, tag y copy cuando
  // haya proyecto real. La tarjeta ya funciona tal cual.
  {
    id: 'placeholder-05',
    name: 'Proyecto 05',
    tag: '—',
    year: '2025',
    description: 'Espacio reservado para el próximo caso de estudio.',
    alt: '',
    width: 420,
    aspect: '3/4',
    xOffset: -22,
    speed: 1,
    rotation: 1.8,
    start: 0.46,
    end: 1,
    hintSide: 'bottom-right',
  },
  {
    id: 'placeholder-06',
    name: 'Proyecto 06',
    tag: '—',
    year: '2025',
    description: 'Espacio reservado para el próximo caso de estudio.',
    alt: '',
    width: 360,
    aspect: '1/1',
    xOffset: 8,
    speed: 1.15,
    rotation: -0.9,
    start: 0.58,
    end: 1,
    hintSide: 'right',
  },
];
