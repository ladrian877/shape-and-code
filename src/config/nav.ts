export type NavLink = { label: string; href: string };

/** Contenido del navbar de este sitio. El componente <Navbar /> es genérico;
 *  todo lo específico de Shape and Code vive aquí. */
export const siteBrand = 'Shape and Code';
export const siteLogo = '/assets/mark-black.png';

export const navLinks: NavLink[] = [
  { label: 'Servicios', href: '/servicios' },
  { label: 'Proyectos', href: '/proyectos' },
  { label: 'Sobre Nosotros', href: '/sobre-nosotros' },
  { label: 'Contacto', href: '/contacto' },
];

export const navCta = { label: 'Hablemos', href: 'mailto:hola@shapeandcode.agency' };
