// src/components/layout/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import logoMunay from '../../assets/logo-munay.png'; // ← Logo importado

const NAV_ITEMS = [
  { to: '/admin',             label: 'Dashboard',            icon: DashboardIcon, end: true },
  { to: '/admin/sedes',       label: 'Gestión de Sedes',     icon: SedesIcon                },
  { to: '/admin/proyectos',   label: 'Gestión de Proyectos', icon: ProjectsIcon             },
  { to: '/admin/equipo',      label: 'Gestión de Equipo',    icon: PeopleIcon               },
  { to: '/admin/voluntarios', label: 'Bandeja de Entrada',   icon: InboxIcon                },
];

export default function Sidebar({ basePath = '/admin', onLogout }) {
  const items = NAV_ITEMS.map((item) => ({
    ...item,
    to: basePath === '/admin' ? item.to : item.to.replace('/admin', basePath),
  }));

  return (
    <aside className="w-64 shrink-0 bg-primary-900 text-warm-200 flex flex-col h-screen sticky top-0">
      
  {/* ── Encabezado con Logo ── */}
      <div className="px-6 pt-8 pb-6 border-b border-primary-800 flex flex-col items-center">
        <img 
          src={logoMunay} 
          alt="Logo Munay Perú" 
          className="h-24 w-auto object-contain transition-transform hover:scale-105 duration-300 mb-2 brightness-0 invert opacity-80" 
        />
        <p className="text-[0.65rem] font-bold text-warm-400 uppercase tracking-widest text-center w-full">
          Panel de Control
        </p>
      </div>

      {/* ── Navegación ── */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors duration-200',
                isActive
                  ? 'bg-accent-500 text-primary-900 font-semibold'
                  : 'text-warm-300 hover:bg-primary-800 hover:text-warm-50',
              )
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* ── Cerrar sesión ── */}
      <div className="px-3 py-4 border-t border-primary-800">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium
                     text-warm-300 hover:bg-primary-800 hover:text-warm-50 transition-colors duration-200"
        >
          <LogoutIcon className="h-5 w-5 shrink-0" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}

/* ── Íconos ─────────────────────────────────────────────────────────────── */

function DashboardIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  );
}

function SedesIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function ProjectsIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7a2 2 0 012-2h6.5L21 8.5V17a2 2 0 01-2 2H11a2 2 0 01-2-2z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v12a2 2 0 002 2h10" />
    </svg>
  );
}

function PeopleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function InboxIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" />
    </svg>
  );
}

function LogoutIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 5v1a3 3 0 01-3 3H6a3 3 0 01-3-3V6a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}