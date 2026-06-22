// src/components/layout/Footer.jsx
//
// Tono "institucional y limpio" tal como se pidió: sin gradientes vistosos
// ni saturación de íconos sociales gigantes — primary-900 sólido, jerarquía
// tipográfica clara, y el dorado reservado únicamente para el link de Donar
// (consistente con la regla de uso del Button).

import { Link } from 'react-router-dom';
import Button from '../ui/Button';

const SEDES = ['Piura', 'Cusco', 'Lima', 'Iquitos'];

const NAV_COLUMNS = [
  {
    title: 'Organización',
    links: [
      { label: 'Nosotros', to: '/nosotros' },
      { label: 'Proyectos', to: '/proyectos' },
      { label: 'Nuestras sedes', to: '/sedes' },
    ],
  },
  {
    title: 'Participa',
    links: [
      { label: 'Ser voluntario', to: '/voluntarios' },
      { label: 'Donar', to: '/donar' },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary-900 text-warm-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Marca + misión breve */}
          <div className="lg:col-span-1">
            <span className="font-display text-xl font-bold text-warm-50">
              Munay <span className="text-accent-400">Perú</span>
            </span>
            <p className="mt-3 text-sm text-warm-300 leading-relaxed">
              Trabajamos junto a comunidades de todo el país para construir
              futuro desde la identidad y la cercanía.
            </p>
          </div>

          {/* Columnas de navegación */}
          {NAV_COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="font-display text-sm font-semibold text-warm-50 uppercase tracking-wider">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-warm-300 hover:text-accent-400 transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Sedes */}
          <div>
            <h3 className="font-display text-sm font-semibold text-warm-50 uppercase tracking-wider">
              Sedes
            </h3>
            <ul className="mt-4 space-y-2.5">
              {SEDES.map((sede) => (
                <li key={sede} className="text-sm text-warm-300">
                  {sede}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA inferior */}
        <div className="mt-12 pt-8 border-t border-primary-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-sm text-warm-400 text-center sm:text-left">
            © {year} Munay Perú Organization. Todos los derechos reservados.
          </p>
          <Link to="/voluntarios">
            <Button variant="accent" size="md">
              Únete como Voluntario
            </Button>
          </Link>
        </div>
      </div>
    </footer>
  );
}
