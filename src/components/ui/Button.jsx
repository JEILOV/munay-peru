// src/components/ui/Button.jsx
//
// Botón base de todo el sistema. Reglas de uso (para mantener la jerarquía
// visual del proyecto):
//   - variant="accent"  -> RESERVADO para CTAs de conversión (Donar, Ser Voluntario).
//                          No usar para acciones secundarias o de UI genérica.
//   - variant="primary" -> Acciones principales no relacionadas a conversión
//                          (ej. "Ver más", "Guardar" en el CMS).
//   - variant="outline" -> Acciones secundarias sobre fondos claros.
//   - variant="ghost"   -> Acciones terciarias / dentro de toolbars, tablas.

import { forwardRef } from 'react';
import clsx from 'clsx';

const VARIANT_STYLES = {
  primary: clsx(
    'bg-primary-700 text-warm-50',
    'hover:bg-primary-800',
    'active:bg-primary-900',
    'focus-visible:ring-primary-300',
  ),
  accent: clsx(
    'bg-accent-500 text-primary-900',
    'hover:bg-accent-600 hover:shadow-glow-accent',
    'active:bg-accent-700',
    'focus-visible:ring-accent-200',
    'font-semibold',
  ),
  outline: clsx(
    'bg-transparent text-primary-700 border-2 border-primary-700',
    'hover:bg-primary-50',
    'active:bg-primary-100',
    'focus-visible:ring-primary-200',
  ),
  ghost: clsx(
    'bg-transparent text-primary-700',
    'hover:bg-primary-50',
    'active:bg-primary-100',
    'focus-visible:ring-primary-200',
  ),
};

const SIZE_STYLES = {
  sm: 'text-sm px-3.5 py-1.5 gap-1.5',
  md: 'text-base px-5 py-2.5 gap-2',
  lg: 'text-lg px-7 py-3.5 gap-2.5',
};

const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    icon = null,
    iconPosition = 'left',
    fullWidth = false,
    className,
    type = 'button',
    ...rest
  },
  ref
) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      className={clsx(
        // Base
        'inline-flex items-center justify-center font-display font-medium',
        'rounded-full transition-all duration-300',
        'focus-visible:outline-none focus-visible:ring-4',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none',
        fullWidth && 'w-full',
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        className,
      )}
      {...rest}
    >
      {isLoading ? (
        <>
          <Spinner />
          <span>Cargando…</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
});

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

export default Button;
