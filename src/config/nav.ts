export type NavLink = { label: string; href: string };

/** Contenido del navbar de este sitio. El componente <Navbar /> es genérico;
 *  todo lo específico de Shape and Code vive aquí. */
export const siteBrand = 'Shape and Code';
/** Vive en `public/` a propósito: los SVG no pasan por `astro:assets`. */
export const siteLogo = '/assets/mark-white.svg';

export const navLinks: NavLink[] = [
  { label: 'Servicios', href: '/servicios' },
  { label: 'Proyectos', href: '/proyectos' },
  { label: 'Sobre Nosotros', href: '/sobre-nosotros' },
  { label: 'Contacto', href: '/contacto' },
];

export const navCta = { label: 'Hablemos', href: 'mailto:hola@shapeandcode.agency' };
