/**
 * Perfiles de imagen del sitio.
 *
 * Un preset agrupa las decisiones que dependen de DÓNDE se usa la imagen —
 * a qué anchos se sirve, cuánto espacio ocupa, si carga de inmediato — para
 * que los call sites no las repitan. Mismo reparto que en `nav.ts` o en
 * `scripts/animations/config.ts`: el componente es genérico, lo específico de
 * este sitio vive en `config/`.
 *
 * Para cambiar la calidad de todo el sitio, toca `QUALITY` y nada más.
 * Para un tipo de imagen nuevo, añade una entrada aquí.
 */

/**
 * Calidad de compresión WebP (0-100).
 *
 * 92 está calibrado sobre las imágenes actuales: pesan ~90% menos que los PNG
 * originales sin banding visible en los degradados. Por debajo de 85 empieza a
 * notarse en el fondo del hero. Astro por defecto usa un preset bastante más
 * agresivo, y por eso una prueba anterior descartó WebP por "perder calidad".
 */
export const QUALITY = 92;

/** Anchos que NO deben superar el tamaño de origen: Astro avisa si se pide
 *  upscale, y ampliar un PNG no añade detalle, solo peso. Los orígenes de hoy
 *  son 1672px (hero, servicios) y 1905px (previews). */
export const IMAGE_PRESETS = {
  /** Imagen decorativa del hero: ocupa el 78% del alto del viewport. */
  hero: {
    widths: [768, 1152, 1672],
    sizes: '(max-width: 640px) 120vw, 70vw',
    quality: QUALITY,
    loading: 'eager',
    fetchpriority: 'high',
  },

  /** Fondo del hero en móvil: cubre toda la sección, centrado (cover). */
  heroMobile: {
    widths: [480, 640, 768, 916],
    sizes: '100vw',
    quality: QUALITY,
    loading: 'eager',
    fetchpriority: 'high',
  },

  /** Fondo de las tarjetas del carrusel de servicios.
   *  Tope real: `.svc-card { width: min(86vw, 1040px) }`. */
  card: {
    widths: [640, 860, 1040],
    sizes: '(max-width: 640px) 100vw, min(86vw, 1040px)',
    quality: QUALITY,
    loading: 'lazy',
    fetchpriority: 'auto',
  },

  /** Miniaturas de la grilla de trabajo: 2 columnas dentro de 1320px. */
  preview: {
    widths: [480, 640, 960],
    sizes: '(max-width: 640px) 100vw, 640px',
    quality: QUALITY,
    loading: 'lazy',
    fetchpriority: 'auto',
  },

  /** Modelo decorativo de Estudio: columna izquierda de la sección, bajo el fold. */
  studioModel: {
    widths: [240, 380, 520, 640],
    sizes: '(max-width: 640px) 240px, (max-width: 1024px) 300px, 380px',
    quality: QUALITY,
    loading: 'lazy',
    fetchpriority: 'auto',
  },

  /** Imágenes del cursor trail de CTA: cuadros pequeños, siempre el mismo tamaño en pantalla. */
  ctaTrail: {
    widths: [180, 270, 360],
    sizes: '180px',
    quality: QUALITY,
    loading: 'lazy',
    fetchpriority: 'auto',
  },
} as const;

export type ImagePreset = keyof typeof IMAGE_PRESETS;
