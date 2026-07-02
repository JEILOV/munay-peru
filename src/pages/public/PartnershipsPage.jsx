// src/pages/public/PartnershipsPage.jsx
import { useState } from 'react';
import { submitPartnershipForm } from '../../features/partnerships/services/partnershipsService';

const ORG_TYPES = [
  'ONG / Asociación civil',
  'Fundación',
  'Empresa privada',
  'Institución educativa',
  'Entidad pública',
  'Organismo internacional',
  'Otra',
];

const INITIAL_FORM = {
  orgName:        '',
  orgType:        '',
  representative: '',
  email:          '',
  phone:          '',
  proposal:       '',
};

export default function PartnershipsPage() {
  const [form,    setForm]    = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await submitPartnershipForm(form);
      setSuccess(true);
      setForm(INITIAL_FORM);
    } catch (err) {
      console.error('[PartnershipsPage] Error al enviar:', err);
      setError('No pudimos enviar tu solicitud. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-warm-50">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative bg-primary-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -left-10 w-72 h-72 bg-warm-50 rounded-full" />
          <div className="absolute -bottom-16 -right-10 w-96 h-96 bg-accent-500 rounded-full" />
        </div>

        <div className="relative container mx-auto max-w-5xl px-4 py-16 md:py-20 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 text-center md:text-left">
            <span className="inline-block bg-accent-500/20 text-accent-300 text-xs font-semibold px-3 py-1 rounded-full mb-4 tracking-wide uppercase">
              Alianzas estratégicas
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-warm-50 leading-tight">
              Construyamos juntos <br />
              <span className="text-accent-400">un Perú mejor.</span>
            </h1>
            <p className="mt-4 text-warm-100 text-lg leading-relaxed max-w-md">
              Si tu organización comparte nuestra visión, queremos conocerte.
              Las alianzas estratégicas multiplican el impacto de cada acción.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              {[
                { icon: <HandshakeIcon />, text: 'Alianza real' },
                { icon: <GlobeIcon />,     text: 'Alcance nacional' },
                { icon: <StarIcon />,      text: 'Impacto medible' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-warm-100">
                  <span className="text-accent-400">{icon}</span>
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="flex-shrink-0 grid grid-cols-2 gap-3 w-full max-w-xs">
            {[
              { value: '+10',  label: 'Aliados actuales' },
              { value: '4',    label: 'Regiones activas' },
              { value: '+50',  label: 'Proyectos conjuntos' },
              { value: '100%', label: 'Transparencia' },
            ].map(({ value, label }) => (
              <div key={label} className="bg-warm-50/10 backdrop-blur rounded-2xl p-4 text-center">
                <p className="font-display text-2xl font-bold text-accent-400">{value}</p>
                <p className="text-xs text-warm-200 mt-1 leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Formulario ────────────────────────────────────────────────────── */}
      <div className="container mx-auto max-w-3xl px-4 py-14">
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl font-bold text-primary-900">
            Cuéntanos sobre tu organización
          </h2>
          <p className="text-warm-600 mt-2 text-sm">
            Revisamos cada solicitud con cuidado. Te contactaremos en un máximo de 5 días hábiles.
          </p>
        </div>

        {success ? (
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <SuccessBanner onReset={() => setSuccess(false)} />
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>

            {/* Tarjeta 1: Datos de la organización */}
            <FormCard title="Datos de la Organización">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field
                  label="Nombre de la organización" name="orgName"
                  placeholder="Ej. Fundación Raíces"
                  value={form.orgName} onChange={handleChange} required
                  className="sm:col-span-2"
                />
                <SelectField
                  label="Tipo de entidad" name="orgType"
                  value={form.orgType} onChange={handleChange}
                  options={ORG_TYPES} required
                  className="sm:col-span-2"
                />
                <Field
                  label="Representante o contacto" name="representative"
                  placeholder="Nombre completo del responsable"
                  value={form.representative} onChange={handleChange} required
                  className="sm:col-span-2"
                />
              </div>
            </FormCard>

            {/* Tarjeta 2: Contacto */}
            <FormCard title="Datos de Contacto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field
                  label="Correo electrónico institucional" name="email" type="email"
                  placeholder="contacto@organizacion.org"
                  value={form.email} onChange={handleChange} required
                />
                <Field
                  label="Teléfono / WhatsApp" name="phone" type="tel"
                  placeholder="+51 999 999 999"
                  value={form.phone} onChange={handleChange} required
                />
              </div>
            </FormCard>

            {/* Tarjeta 3: Propuesta */}
            <FormCard title="Propuesta de Alianza">
              <label className="block text-sm font-medium text-primary-900 mb-1">
                ¿Cómo podríamos colaborar juntos?{' '}
                <span className="text-primary-500">*</span>
              </label>
              <textarea
                name="proposal"
                rows={5}
                placeholder="Describe tu organización, sus objetivos, y en qué áreas ves oportunidades de colaboración con Munay Perú…"
                value={form.proposal}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-warm-200 bg-warm-50 px-4 py-2.5 text-sm text-primary-900 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 transition resize-none"
              />
            </FormCard>

            {error && (
              <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2 mb-4">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent-500 hover:bg-accent-600 text-primary-900 font-semibold py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Enviando solicitud…' : 'Enviar solicitud de alianza'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

/* ── Layout ─────────────────────────────────────────────────────────────── */

function FormCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
      <h3 className="font-display text-lg font-semibold text-primary-900 mb-5">{title}</h3>
      {children}
    </div>
  );
}

/* ── Campos ──────────────────────────────────────────────────────────────── */

function Field({ label, name, type = 'text', placeholder, value, onChange, required, className = '', ...rest }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-primary-900 mb-1">
        {label} {required && <span className="text-primary-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-xl border border-warm-200 bg-warm-50 px-4 py-2.5 text-sm text-primary-900 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 transition"
        {...rest}
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, required, options, placeholder = 'Selecciona una opción…', className = '' }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-primary-900 mb-1">
        {label} {required && <span className="text-primary-500">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-xl border border-warm-200 bg-warm-50 px-4 py-2.5 text-sm text-primary-900 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 transition appearance-none"
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

/* ── Estados ─────────────────────────────────────────────────────────────── */

function SuccessBanner({ onReset }) {
  return (
    <div className="flex flex-col items-center text-center py-10 gap-4">
      <div className="bg-emerald-50 text-emerald-600 rounded-full p-4">
        <CheckIcon className="h-8 w-8" />
      </div>
      <h3 className="font-display text-xl font-bold text-primary-900">¡Solicitud enviada!</h3>
      <p className="text-warm-600 text-sm max-w-sm">
        Gracias por tu interés en aliarte con Munay Perú. Revisaremos tu propuesta
        y nos pondremos en contacto en los próximos 5 días hábiles.
      </p>
      <button
        onClick={onReset}
        className="mt-2 text-sm text-accent-600 hover:underline font-medium"
      >
        Enviar otra solicitud
      </button>
    </div>
  );
}

/* ── Íconos ──────────────────────────────────────────────────────────────── */

function HandshakeIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  );
}
function GlobeIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}
function CheckIcon(props) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}