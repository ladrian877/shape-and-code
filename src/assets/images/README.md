# Imágenes del sitio

Todo lo de esta carpeta pasa por `astro:assets`: se sirve en WebP, redimensionado
al hueco donde se pinta y con el nombre versionado por hash (cacheable para
siempre). Los originales se quedan aquí sin tocar.

## Añadir una imagen

1. Deja el archivo en la subcarpeta que corresponda (`hero/`, `servicios/`,
   `proyectos/`, o una nueva).
2. Referénciala por su ruta relativa a esta carpeta:

```astro
---
import Img from '../components/Img.astro';
---
<Img src="proyectos/MiProyecto.png" alt="Mi Proyecto" preset="preview" />
```

No hace falta ningún `import` de la imagen: `src/lib/images.ts` las descubre
solas con `import.meta.glob`. El nombre suelto (`MiProyecto.png`) también vale
como clave mientras sea único.

Si escribes mal la clave, **el build falla** con la lista de claves válidas.
No hay 404 silenciosos.

## Elegir preset

Los presets viven en `src/config/imagePresets.ts`.

| preset | para qué | anchos |
|---|---|---|
| `hero` | imagen grande sobre el fold, carga inmediata | 768 / 1152 / 1672 |
| `card` | fondo de tarjeta del carrusel de servicios | 640 / 860 / 1040 |
| `preview` | miniatura de la grilla de trabajo | 480 / 640 / 960 |

Si tu imagen es más pequeña que los anchos del preset, `Img.astro` recorta la
lista sola: nunca se escala hacia arriba.

Para un uso nuevo que no encaje, añade una entrada a `IMAGE_PRESETS` en vez de
pasar `widths`/`sizes` sueltos en el markup.

## Calidad

WebP a `quality: 92`, definido una sola vez en `QUALITY` (`imagePresets.ts`).
Está calibrado para que no haya banding en los degradados del hero. Si algún día
hace falta más margen, ese número es el único sitio que tocar.

## Qué NO va aquí

Los SVG y el favicon siguen en `public/assets/`: Astro no transforma SVG, y el
favicon necesita una URL fija que no cambie con cada build.
