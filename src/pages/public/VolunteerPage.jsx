import { useState } from 'react';
import { submitVolunteerForm } from '../../features/volunteers/services/volunteerService';

const SEDES_OPTIONS = ['Piura', 'Cusco', 'Lima', 'Iquitos'];
const GENDER_OPTIONS = ['Femenino', 'Masculino', 'Prefiero no decir'];
const EXPERIENCE_OPTIONS = ['Sí', 'No'];
const AVAILABILITY_OPTIONS = ['Tiempo completo', 'Medio tiempo', 'Fines de semana', 'Eventual / por proyecto'];
const SOURCE_OPTIONS = ['Redes sociales', 'Recomendación de un amigo o familiar', 'Página web', 'Evento o charla', 'Otro'];

const INITIAL_FORM = {
  name: '',
  dni: '',
  birthdate: '',
  gender: '',
  sede: '',
  location: '',
  phone: '',
  email: '',
  profession: '',
  previousExperience: '',
  availability: '',
  source: '',
  motivation: '',
};

const VolunteerPage = () => {
  const [form, setForm]       = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await submitVolunteerForm(form);
      setSuccess(true);
      setForm(INITIAL_FORM);
    } catch (err) {
      console.error(err);
      setError('No pudimos enviar tu postulación. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-warm-50">

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <div className="relative bg-primary-900 overflow-hidden">
        {/* Decoración geométrica de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -left-10 w-72 h-72 bg-warm-50 rounded-full" />
          <div className="absolute -bottom-16 -right-10 w-96 h-96 bg-accent-500 rounded-full" />
        </div>

        <div className="relative container mx-auto max-w-5xl px-4 py-16 md:py-20 flex flex-col md:flex-row items-center gap-10">
          {/* Texto hero */}
          <div className="flex-1 text-center md:text-left">
            <span className="inline-block bg-accent-500/20 text-accent-300 text-xs font-semibold px-3 py-1 rounded-full mb-4 tracking-wide uppercase">
              Únete a nuestra comunidad
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-warm-50 leading-tight">
              Sé el cambio que <br />
              <span className="text-accent-400">el Perú necesita.</span>
            </h1>
            <p className="mt-4 text-warm-100 text-lg leading-relaxed max-w-md">
              Como voluntario de Munay Perú, transformas vidas desde adentro.
              Tu tiempo, talento y corazón son el motor de nuestra misión.
            </p>

            {/* Tres íconos de beneficio */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              {[
                { icon: <HeartIcon />,   text: 'Impacto real' },
                { icon: <PeopleIcon />,  text: 'Comunidad' },
                { icon: <GrowthIcon />,  text: 'Crecimiento personal' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-warm-100">
                  <span className="text-accent-400">{icon}</span>
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Stat cards */}
          <div className="flex-shrink-0 grid grid-cols-2 gap-3 w-full max-w-xs">
            {[
              { value: '+200',  label: 'Voluntarios activos' },
              { value: '4',     label: 'Sedes en el Perú'    },
              { value: '+50',   label: 'Proyectos realizados' },
              { value: '100%',  label: 'Corazón puesto'       },
            ].map(({ value, label }) => (
              <div key={label} className="bg-warm-50/10 backdrop-blur rounded-2xl p-4 text-center">
                <p className="font-display text-2xl font-bold text-accent-400">{value}</p>
                <p className="text-xs text-warm-200 mt-1 leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Formulario ─────────────────────────────────────────────────── */}
      <div className="container mx-auto max-w-3xl px-4 py-14">
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl font-bold text-primary-900">Completa tu postulación</h2>
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

            {/* Tarjeta 1: Datos Personales */}
            <FormCard title="Datos Personales">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field
                  label="Nombres y Apellidos" name="name"
                  placeholder="María García Flores"
                  value={form.name} onChange={handleChange} required
                />
                <Field
                  label="N° DNI / CE" name="dni"
                  placeholder="12345678" maxLength={12}
                  value={form.dni} onChange={handleChange} required
                />
                <Field
                  label="Fecha de nacimiento" name="birthdate" type="date"
                  value={form.birthdate} onChange={handleChange} required
                />
                <RadioGroup
                  label="Género" name="gender"
                  value={form.gender} onChange={handleChange}
                  options={GENDER_OPTIONS} required
                />
              </div>
            </FormCard>

            {/* Tarjeta 2: Contacto y Ubicación */}
            <FormCard title="Contacto y Ubicación">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field
                  label="Celular / WhatsApp" name="phone" type="tel"
                  placeholder="+51 999 999 999"
                  value={form.phone} onChange={handleChange} required
                />
                <Field
                  label="Correo electrónico" name="email" type="email"
                  placeholder="maria@ejemplo.com"
                  value={form.email} onChange={handleChange} required
                />
                <Field
                  label="Lugar de Residencia (Provincia y Distrito)" name="location"
                  placeholder="Piura, Castilla"
                  value={form.location} onChange={handleChange} required
                  className="sm:col-span-2"
                />
                <SelectField
                  label="Sede a la que postulas" name="sede"
                  value={form.sede} onChange={handleChange}
                  options={SEDES_OPTIONS} required
                  className="sm:col-span-2"
                />
              </div>
            </FormCard>

            {/* Tarjeta 3: Perfil y Disponibilidad */}
            <FormCard title="Perfil y Disponibilidad">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field
                  label="Profesión u Oficio" name="profession"
                  placeholder="Educador, médico, diseñador…"
                  value={form.profession} onChange={handleChange} required
                />
                <RadioGroup
                  label="¿Perteneciste a otra ONG antes?" name="previousExperience"
                  value={form.previousExperience} onChange={handleChange}
                  options={EXPERIENCE_OPTIONS} required
                />
                <SelectField
                  label="Disponibilidad de tiempo" name="availability"
                  value={form.availability} onChange={handleChange}
                  options={AVAILABILITY_OPTIONS} required
                />
                <SelectField
                  label="¿Cómo te enteraste de nosotros?" name="source"
                  value={form.source} onChange={handleChange}
                  options={SOURCE_OPTIONS} required
                />
              </div>

              <div className="mt-5">
                <label className="block text-sm font-medium text-primary-900 mb-1">
                  ¿Por qué quieres unirte a Munay Perú? <span className="text-primary-500">*</span>
                </label>
                <textarea
                  name="motivation"
                  rows={5}
                  placeholder="Cuéntanos qué te motiva, qué habilidades aportas y qué esperas de esta experiencia…"
                  value={form.motivation}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-warm-200 bg-warm-50 px-4 py-2.5 text-sm text-primary-900 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 transition resize-none"
                />
              </div>
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
              {loading ? 'Enviando postulación…' : 'Enviar postulación'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
};

/* ── Sub-componentes de layout ─────────────────────────────────────────── */

function FormCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
      <h3 className="font-display text-lg font-semibold text-primary-900 mb-5">{title}</h3>
      {children}
    </div>
  );
}

/* ── Sub-componentes de campo ───────────────────────────────────────────── */

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

/**
 * RadioGroup — radio nativo oculto (sr-only) + label estilizada como
 * píldora. Mantiene la accesibilidad/navegación por teclado del input
 * nativo, pero visualmente se ve como un selector de chips, no como
 * radio buttons clásicos.
 */
function RadioGroup({ label, name, value, onChange, required, options }) {
  return (
    <div>
      <label className="block text-sm font-medium text-primary-900 mb-1.5">
        {label} {required && <span className="text-primary-500">*</span>}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const checked = value === opt;
          return (
            <label
              key={opt}
              className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                checked
                  ? 'bg-primary-900 border-primary-900 text-warm-50'
                  : 'bg-warm-50 border-warm-200 text-primary-900 hover:border-primary-300'
              }`}
            >
              <input
                type="radio"
                name={name}
                value={opt}
                checked={checked}
                onChange={onChange}
                required={required}
                className="sr-only"
              />
              {opt}
            </label>
          );
        })}
      </div>
    </div>
  );
}

function SuccessBanner({ onReset }) {
  return (
    <div className="flex flex-col items-center text-center py-10 gap-4">
      <div className="bg-emerald-50 text-emerald-600 rounded-full p-4">
        <CheckIcon className="h-8 w-8" />
      </div>
      <h3 className="font-display text-xl font-bold text-primary-900">¡Postulación enviada!</h3>
      <p className="text-warm-600 text-sm max-w-sm">
        Gracias por querer ser parte de Munay Perú. Revisaremos tu información
        y nos pondremos en contacto contigo en los próximos 5 días hábiles.
      </p>
      <button
        onClick={onReset}
        className="mt-2 text-sm text-accent-600 hover:underline font-medium"
      >
        Enviar otra postulación
      </button>
    </div>
  );
}

/* ── Íconos inline ──────────────────────────────────────────────────────── */

function HeartIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function GrowthIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
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

export default VolunteerPage;