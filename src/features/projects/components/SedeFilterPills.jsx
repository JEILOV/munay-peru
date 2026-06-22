import clsx from 'clsx';

// 1. Añadimos `= []` para que options nunca sea undefined
export default function SedeFilterPills({ options = [], activeId, onChange }) {
  
  // 2. Seguro de vida: Si el arreglo está vacío, no intentamos dibujar botones fantasma
  if (options.length === 0) return null;

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap
                 scrollbar-hide snap-x snap-mandatory"
      role="tablist"
      aria-label="Filtrar proyectos por sede"
    >
      {options.map((option) => {
        const isActive = option.id === activeId;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.id)}
            className={clsx(
              'shrink-0 snap-start rounded-full px-5 py-2.5 text-sm font-medium',
              'transition-all duration-200 border',
              isActive
                ? 'bg-accent-500 text-primary-900 border-accent-500 shadow-soft font-semibold'
                : 'bg-white text-primary-700 border-warm-200 hover:border-primary-300 hover:bg-primary-50',
            )}
          >
            {option.name}
          </button>
        );
      })}
    </div>
  );
}