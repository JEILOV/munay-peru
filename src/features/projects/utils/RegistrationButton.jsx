// src/features/projects/components/RegistrationButton.jsx
//
// Botón de inscripción a formulario externo (Google Forms, etc.).
// Es un <a> con los estilos del Button accent (no <Link><Button/></Link>) para
// no anidar elementos interactivos.
//
//   size="md"  -> detalle del proyecto
//   size="sm"  -> tarjetas (dentro de una card con "stretched link", ver
//                 EventsPage/ProjectsPage: lleva relative z-10 para quedar
//                 por encima del enlace que cubre toda la tarjeta)
import clsx from 'clsx';
import { getRegistration } from '../registration';

const SIZES = {
  sm: 'text-xs px-3.5 py-1.5',
  md: 'text-base px-6 py-3',
};

export default function RegistrationButton({
  project,
  size = 'md',
  showClosed = true,
  className,
}) {
  const { status, url } = getRegistration(project);

  if (status === 'open') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={clsx(
          'relative z-10 inline-flex items-center justify-center rounded-full font-display font-semibold',
          'bg-accent-500 text-primary-900 transition-all duration-300',
          'hover:bg-accent-600 hover:shadow-glow-accent',
          'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-200',
          SIZES[size],
          className,
        )}
      >
        Inscribirme
      </a>
    );
  }

  if (status === 'closed' && showClosed) {
    return (
      <span
        className={clsx(
          'inline-flex items-center justify-center rounded-full bg-warm-200 font-display font-medium text-warm-600',
          SIZES[size],
          className,
        )}
      >
        Inscripciones cerradas
      </span>
    );
  }

  return null;
}