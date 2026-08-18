import gsap from 'gsap';

import { CTA_TRAIL, EASE } from './config';

/**
 * Cursor trail de imágenes en la sección CTA: mientras el puntero se mueve
 * sobre `[data-cta]`, va estampando imágenes del set (`[data-cta-trail-img]`,
 * recicladas en round-robin) junto al cursor, con pop-in/pop-out.
 *
 * Mismo esqueleto que `workHint.ts` (`gsap.matchMedia` para excluir touch,
 * clamp a los bordes del viewport, cleanup vía la función que devuelve la
 * rama de `matchMedia`), pero estampando en vez de arrastrando un panel
 * único. Puramente decorativo — a diferencia del panel de Trabajo, que sí
 * informa, aquí no hay contenido que perder, así que bajo
 * `prefers-reduced-motion` se desactiva por completo en vez de solo acelerar
 * las duraciones.
 */

const SEL = {
  section: '[data-cta]',
  images: '[data-cta-trail-img]',
} as const;

let mm: gsap.MatchMedia | null = null;

export function initCtaTrail() {
  destroyCtaTrail();

  const section = document.querySelector<HTMLElement>(SEL.section);
  const images = gsap.utils.toArray<HTMLElement>(SEL.images);
  if (!section || !images.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  mm = gsap.matchMedia();
  mm.add('(min-width: 768px) and (hover: hover)', () => {
    let index = 0;
    let z = 60;
    let lastX = 0;
    let lastY = 0;
    let hasLast = false;

    const spawn = (x: number, y: number) => {
      const img = images[index];
      index = (index + 1) % images.length;
      z += 1;

      const half = CTA_TRAIL.size / 2;
      const left = gsap.utils.clamp(CTA_TRAIL.edge, window.innerWidth - CTA_TRAIL.size - CTA_TRAIL.edge, x - half);
      const top = gsap.utils.clamp(CTA_TRAIL.edge, window.innerHeight - CTA_TRAIL.size - CTA_TRAIL.edge, y - half);
      const rotate = gsap.utils.random(-CTA_TRAIL.maxRotate, CTA_TRAIL.maxRotate);

      gsap.killTweensOf(img);
      gsap.set(img, {
        x: left, y: top, rotate, zIndex: z, autoAlpha: 0, scale: CTA_TRAIL.popScale,
      });
      gsap.timeline()
        .to(img, {
          autoAlpha: 1, scale: 1, duration: CTA_TRAIL.popIn, ease: EASE.depth,
        })
        .to(img, {
          autoAlpha: 0, scale: CTA_TRAIL.outScale, duration: CTA_TRAIL.popOut, ease: EASE.depth,
        }, `+=${CTA_TRAIL.hold}`);
    };

    const onMove = (e: PointerEvent) => {
      if (!hasLast) {
        hasLast = true;
        lastX = e.clientX;
        lastY = e.clientY;
        spawn(e.clientX, e.clientY);
        return;
      }
      if (Math.hypot(e.clientX - lastX, e.clientY - lastY) < CTA_TRAIL.spawnDistance) return;
      lastX = e.clientX;
      lastY = e.clientY;
      spawn(e.clientX, e.clientY);
    };
    const onLeave = () => { hasLast = false; };

    section.addEventListener('pointermove', onMove);
    section.addEventListener('pointerleave', onLeave);

    return () => {
      section.removeEventListener('pointermove', onMove);
      section.removeEventListener('pointerleave', onLeave);
      gsap.killTweensOf(images);
      gsap.set(images, { clearProps: 'all' });
    };
  });
}

export function destroyCtaTrail() {
  mm?.revert();
  mm = null;
}
