// src/components/ui/Card.jsx
//
// Card compuesto: <Card><Card.Header /><Card.Body /></Card>
// Pensado primero para proyectos/noticias (imagen + gradiente + contenido),
// pero CardBody es agnóstico — sirve también para cards sin imagen (ej. sedes
// sin foto de portada aún, o cards de métricas en el dashboard del CMS).

import clsx from 'clsx';

function Card({ children, className, as: Component = 'div', ...rest }) {
  return (
    <Component
      className={clsx(
        'group relative overflow-hidden rounded-2xl bg-white',
        'shadow-soft hover:shadow-soft-lg',
        'transition-all duration-500',
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}

/**
 * CardHeader — la fotografía real es la protagonista.
 * El scale-105 vive en la IMAGEN, no en la card completa, para que el
 * contenido de texto debajo no "tiemble" ni se recorte durante el hover.
 */
function CardHeader({ src, alt = '', overlay = true, badge, className }) {
  return (
    <div className={clsx('relative aspect-video overflow-hidden', className)}>
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        loading="lazy"
      />
      {overlay && (
        <div
          className="absolute inset-0 bg-gradient-to-t from-primary-900/70 via-primary-900/0 to-transparent
                     opacity-80 transition-opacity duration-500 group-hover:opacity-95"
          aria-hidden="true"
        />
      )}
      {badge && (
        <span
          className="absolute top-3 left-3 rounded-full bg-warm-50/95 backdrop-blur-xs
                     px-3 py-1 text-xs font-semibold text-primary-700 shadow-soft"
        >
          {badge}
        </span>
      )}
    </div>
  );
}

function CardBody({ children, className }) {
  return (
    <div className={clsx('p-5 sm:p-6', className)}>
      {children}
    </div>
  );
}

function CardEyebrow({ children, className }) {
  return (
    <span
      className={clsx(
        'text-xs font-semibold uppercase tracking-wider text-accent-600',
        className,
      )}
    >
      {children}
    </span>
  );
}

function CardTitle({ children, className }) {
  return (
    <h3 className={clsx('font-display text-lg font-semibold text-primary-900 mt-1', className)}>
      {children}
    </h3>
  );
}

function CardDescription({ children, className }) {
  return (
    <p className={clsx('mt-2 text-sm text-warm-700 leading-relaxed', className)}>
      {children}
    </p>
  );
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Eyebrow = CardEyebrow;
Card.Title = CardTitle;
Card.Description = CardDescription;

export default Card;
