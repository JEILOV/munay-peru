// src/components/layout/Navbar.jsx
//
// Signature element: el link activo/hover lleva un subrayado que CRECE
// desde el centro hacia los costados (no un underline tradicional de
// izquierda a derecha) — referencia sutil al gesto de "tejer" un hilo,
// sin caer en iconografía literal andina. Se ve en NAV_LINKS más abajo.

import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import clsx from 'clsx';
import Button from '../ui/Button';
import { useScrollPosition } from '../../hooks/useScrollPosition';
import logoMunay from '../../assets/logo-munay.png'; // Asegúrate de que el nombre coincida con tu archivo

const NAV_LINKS = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/nosotros', label: 'Nosotros' },
  { to: '/proyectos', label: 'Proyectos' },
  { to: '/sedes', label: 'Sedes' },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isScrolled = useScrollPosition();

  return (
    <header
      className={clsx(
        'sticky top-0 z-50 transition-all duration-300',
        'bg-primary-700',
        isScrolled && 'shadow-soft-lg backdrop-blur-md bg-primary-700/95',
      )}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 lg:h-20 items-center justify-between">

        {/* Logo Oficial de Munay Perú */}
          <Link to="/" className="flex items-center shrink-0 group">
             <img 
               src={logoMunay} 
               alt="Logo Munay Perú Organization" 
               // 1. Quitamos el div blanco.
               // 2. h-20 y lg:h-24 lo hace enorme.
               // 3. 'brightness-0 invert' convierte el logo marrón en blanco puro para que resalte.
               className="h-40 lg:h-50 w-auto object-contain group-hover:scale-105 transition-all duration-300 brightness-0 invert opacity-90 hover:opacity-100" 
             />
          </Link>

          {/* Links — desktop */}
          <ul className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    clsx(
                      'relative px-4 py-2 text-sm font-medium text-warm-100 transition-colors duration-200',
                      'hover:text-warm-50',
                      // Signature underline: nace desde el centro, vía scaleX
                      'after:content-[""] after:absolute after:left-1/2 after:bottom-0',
                      'after:h-[2px] after:bg-accent-400 after:rounded-full',
                      'after:w-[calc(100%-2rem)] after:-translate-x-1/2',
                      'after:scale-x-0 after:transition-transform after:duration-300 after:origin-center',
                      'hover:after:scale-x-100',
                      isActive && 'text-warm-50 after:scale-x-100',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* CTA + Hamburguesa */}
          <div className="flex items-center gap-3">
            <Link to="/voluntarios" className="hidden sm:block">
              <Button variant="accent" size="md">
                Únete como Voluntario
              </Button>
            </Link>

            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="lg:hidden p-2 text-warm-50 rounded-full hover:bg-primary-600 transition-colors"
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              <HamburgerIcon isOpen={isMenuOpen} />
            </button>
          </div>
        </div>
      </nav>

      {/* Menú móvil */}
      <div
        className={clsx(
          'lg:hidden overflow-hidden transition-all duration-300 ease-in-out',
          isMenuOpen ? 'max-h-96' : 'max-h-0',
        )}
      >
        <ul className="px-4 pb-4 pt-1 space-y-1 bg-primary-700 border-t border-primary-600">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.end}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  clsx(
                    'block rounded-xl px-4 py-3 text-base font-medium transition-colors',
                    isActive
                      ? 'bg-primary-800 text-warm-50'
                      : 'text-warm-100 hover:bg-primary-600 hover:text-warm-50',
                  )
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
          <li className="pt-2 sm:hidden">
            <Link to="/voluntarios" onClick={() => setIsMenuOpen(false)}>
              <Button variant="accent" size="md" fullWidth>
                Únete como Voluntario
              </Button>
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}

function HamburgerIcon({ isOpen }) {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        className={clsx('transition-all duration-300 origin-center', isOpen && 'rotate-45 translate-y-[6px]')}
        strokeLinecap="round"
        d="M4 6h16"
      />
      <path
        className={clsx('transition-opacity duration-200', isOpen && 'opacity-0')}
        strokeLinecap="round"
        d="M4 12h16"
      />
      <path
        className={clsx('transition-all duration-300 origin-center', isOpen && '-rotate-45 -translate-y-[6px]')}
        strokeLinecap="round"
        d="M4 18h16"
      />
    </svg>
  );
}