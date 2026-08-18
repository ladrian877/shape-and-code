/**
 * Registro de imágenes locales.
 *
 * Todo lo que vive en `src/assets/images/` se descubre solo: no hay una lista
 * que mantener ni un `import` por imagen. Para añadir una imagen basta con
 * dejar el archivo en esa carpeta y referenciarla por su ruta relativa desde
 * `src/assets/images/` (ver `src/assets/images/README.md`).
 *
 * El motivo de que exista este módulo es que `astro:assets` solo optimiza
 * imágenes que pasan por el bundler, y para eso tienen que estar importadas
 * desde `src/`. Con `import.meta.glob` conseguimos esos imports sin escribirlos
 * a mano, y los arrays de datos de las páginas siguen guardando strings planos.
 */

/** Prefijo que se recorta de las claves del glob para formar la clave pública. */
const ROOT = '/src/assets/images/';

/* `eager: true` porque el registro se consulta en el frontmatter (síncrono) y
   porque lo que se importa es metadata (ancho, alto, ruta), no el binario. */
const modules = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/images/**/*.{png,jpg,jpeg,webp,avif}',
  { eager: true },
);

/**
 * Cada archivo se registra con dos claves: su ruta relativa
 * (`servicios/ServiciosWeb.png`) y su nombre suelto (`ServiciosWeb.png`).
 * Así mover una imagen de carpeta no rompe las referencias existentes.
 *
 * El nombre suelto solo se registra si es único: con dos archivos homónimos en
 * carpetas distintas la clave corta sería ambigua, y es preferible obligar a
 * usar la ruta completa que resolver a una de las dos en silencio.
 */
const registry = new Map<string, ImageMetadata>();
const ambiguous = new Set<string>();

for (const [path, mod] of Object.entries(modules)) {
  const key = path.slice(ROOT.length);
  registry.set(key, mod.default);

  const bare = key.slice(key.lastIndexOf('/') + 1);
  if (bare === key) continue;
  if (registry.has(bare)) ambiguous.add(bare);
  else registry.set(bare, mod.default);
}

for (const bare of ambiguous) registry.delete(bare);

/** Lo que acepta `<Img>`: una clave del registro o metadata ya importada. */
export type ImageSource = string | ImageMetadata;

/** Claves disponibles, ordenadas. Útil para mensajes de error y para depurar. */
export function listImages(): string[] {
  return [...registry.keys()].sort();
}

/**
 * Resuelve una clave a la metadata de su imagen.
 *
 * Lanza si la clave no existe. Como el sitio es estático, eso rompe el build
 * en lugar de dejar un 404 silencioso en producción — que es exactamente el
 * fallo que teníamos con las rutas escritas a mano contra `public/`.
 */
export function resolveImage(source: ImageSource): ImageMetadata {
  if (typeof source !== 'string') return source;

  const found = registry.get(source);
  if (found) return found;

  throw new Error(
    `[images] No existe la imagen "${source}" en src/assets/images/.\n` +
      `Disponibles:\n${listImages().map((k) => `  - ${k}`).join('\n')}`,
  );
}
