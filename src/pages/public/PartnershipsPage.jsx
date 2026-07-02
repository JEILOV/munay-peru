// src/pages/public/PartnershipsPage.jsx
import AnimatedCounter from '../../components/ui/AnimatedCounter';
import { useState } from 'react';
import { submitPartnershipForm } from '../../features/partnerships/services/partnershipsService';
import Section from '../../components/layout/Section';

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
      <Section
        variant="primary"
        backgroundImage="https://i.pinimg.com/1200x/78/b6/ef/78b6efab8a7896522e18996bb1e6a4b2.jpg" // Aquí pegas tu URL de ImgBB
        containerClassName="flex flex-col md:flex-row items-center gap-10 lg:gap-16"
      >
        <div className="flex-1 text-center md:text-left">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent-400">
            <HandshakeIcon />
            Alianzas estratégicas
          </span>

          <h1 className="mt-5 font-display text-3xl md:text-4xl lg:text-5xl font-bold text-warm-50 leading-tight">
            Construyamos juntos un futuro con identidad
          </h1>

          <p className="mt-4 text-warm-200 text-base md:text-lg max-w-xl mx-auto md:mx-0">
            Sumamos organizaciones, empresas e instituciones comprometidas con
            el desarrollo de comunidades en todo el Perú.
          </p>

         <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-3 text-warm-100 text-sm">
            <div className="flex items-center gap-1.5">
              <GlobeIcon />
              <AnimatedCounter value={30} prefix="+" className="font-bold text-accent-400 text-base" /> 
              <span>organizaciones aliadas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <StarIcon />
              <span>Presencia en</span>
              <AnimatedCounter value={4} className="font-bold text-accent-400 text-base" /> 
              <span>regiones</span>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Formulario ────────────────────────────────────────────────────── */}
      <Section variant="warm" containerClassName="max-w-3xl">
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl font-bold text-primary-900">
            Cuéntanos sobre tu organización
          </h2>
          <p className="mt-2 text-warm-600 text-sm max-w-lg mx-auto">
            Completa el formulario y nuestro equipo evaluará tu propuesta de alianza.
          </p>
        </div>

        {success ? (
          <SuccessBanner onReset={() => setSuccess(false)} />
        ) : (
          <form onSubmit={handleSubmit}>
            <FormCard title="Datos de la organización">
              <div className="grid sm:grid-cols-2 gap-5">
                <Field
                  label="Nombre de la organización"
                  name="orgName"
                  value={form.orgName}
                  onChange={handleChange}
                  required
                />
                <SelectField
                  label="Tipo de organización"
                  name="orgType"
                  value={form.orgType}
                  onChange={handleChange}
                  options={ORG_TYPES}
                  required
                />
              </div>
            </FormCard>

            <FormCard title="Datos de contacto">
              <div className="grid sm:grid-cols-2 gap-5">
                <Field
                  label="Representante"
                  name="representative"
                  value={form.representative}
                  onChange={handleChange}
                  required
                />
                <Field
                  label="Correo electrónico"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
                <Field
                  label="Teléfono"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="sm:col-span-2"
                />
              </div>
            </FormCard>

            <FormCard title="Propuesta">
              <label className="block text-sm font-medium text-primary-900 mb-1">
                Cuéntanos brevemente tu propuesta de alianza{' '}
                <span className="text-primary-500">*</span>
              </label>
              <textarea
                name="proposal"
                rows={5}
                value={form.proposal}
                onChange={handleChange}
                required
                placeholder="¿Cómo te imaginas colaborando con Munay Perú?"
                className="w-full rounded-xl border border-warm-200 bg-warm-50 px-4 py-2.5 text-sm text-primary-900 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 transition"
              />
            </FormCard>

            {error && (
              <p className="text-sm text-red-600 mb-4 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-accent-500 hover:bg-accent-600 text-primary-900 font-semibold py-3 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Enviando…' : 'Enviar solicitud'}
            </button>
          </form>
        )}
      </Section>
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