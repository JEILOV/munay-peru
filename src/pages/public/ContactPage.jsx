import { useState } from 'react';
import { submitContactForm } from '../../features/contact/services/contactService';

const INITIAL_FORM = { name: '', email: '', subject: '', message: '' };

const ContactPage = () => {
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
      await submitContactForm(form);
      setSuccess(true);
      setForm(INITIAL_FORM);
    } catch (err) {
      console.error(err);
      setError('No pudimos enviar tu mensaje. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">

      {/* ── Hero strip ─────────────────────────────────────────────────── */}
      <div className="bg-[#7A1F2D] py-14 px-4 text-center">
        <h1 className="text-4xl font-bold text-white tracking-tight">Contáctanos</h1>
        <p className="mt-2 text-red-200 text-lg">
          Estamos aquí para escucharte y crecer juntos.
        </p>
      </div>

      {/* ── Cuerpo dos columnas ────────────────────────────────────────── */}
      <div className="container mx-auto max-w-5xl px-4 py-14 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

        {/* ── Columna izquierda: info ──────────────────────────────────── */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 leading-snug">
            Tu voz importa,<br />
            <span className="text-[#7A1F2D]">hablemos.</span>
          </h2>
          <p className="text-gray-500 leading-relaxed mb-8">
            Si tienes preguntas sobre nuestros proyectos, deseas ser voluntario o
            simplemente quieres conocer más sobre Munay Perú, escríbenos.
            Respondemos a la brevedad.
          </p>

     <ul className="space-y-5 text-sm">
            <ContactInfo 
              icon={<MailIcon />} 
              label="Correo" 
              value="munayperu02@gmail.com" 
              href="mailto:munayperu02@gmail.com"
            />
            <ContactInfo 
              icon={<PhoneIcon />} 
              label="Teléfono (WhatsApp)" 
              value="+51 939 389 478" 
              href="https://wa.me/51939389478"
            />
            <ContactInfo 
              icon={<LocationIcon />} 
              label="Sede central" 
              value="Lima, Perú" 
            />
          </ul>
        </div>

        {/* ── Columna derecha: formulario ──────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {success ? (
            <SuccessBanner onReset={() => setSuccess(false)} />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <Field
                label="Nombre completo"
                name="name"
                type="text"
                placeholder="María García"
                value={form.name}
                onChange={handleChange}
                required
              />
              <Field
                label="Correo electrónico"
                name="email"
                type="email"
                placeholder="maria@ejemplo.com"
                value={form.email}
                onChange={handleChange}
                required
              />
              <Field
                label="Asunto"
                name="subject"
                type="text"
                placeholder="¿Sobre qué quieres escribirnos?"
                value={form.subject}
                onChange={handleChange}
                required
              />

              {/* Textarea: no usa <Field> para controlar las filas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensaje <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  rows={5}
                  placeholder="Cuéntanos con detalle..."
                  value={form.message}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7A1F2D]/30 focus:border-[#7A1F2D] transition resize-none"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 rounded-lg px-4 py-2">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#7A1F2D] hover:bg-[#5e1722] text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Enviando…' : 'Enviar mensaje'}
              </button>
            </form>
          )}

        </div>
      </div>
    </main>
  );
};

/* ── Sub-componentes locales ────────────────────────────────────────────── */

function Field({ label, name, type, placeholder, value, onChange, required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7A1F2D]/30 focus:border-[#7A1F2D] transition"
      />
    </div>
  );
}

function SuccessBanner({ onReset }) {
  return (
    <div className="flex flex-col items-center text-center py-8 gap-4">
      <div className="bg-green-100 text-green-600 rounded-full p-4">
        <CheckIcon className="h-8 w-8" />
      </div>
      <h3 className="text-xl font-bold text-gray-800">¡Mensaje enviado!</h3>
      <p className="text-gray-500 text-sm max-w-xs">
        Gracias por escribirnos. Nos pondremos en contacto contigo a la brevedad.
      </p>
      <button
        onClick={onReset}
        className="mt-2 text-sm text-[#7A1F2D] hover:underline font-medium"
      >
        Enviar otro mensaje
      </button>
    </div>
  );
}

function ContactInfo({ icon, label, value, href }) {
  const innerContent = (
    <div>
      <p className="font-semibold text-gray-700 group-hover:text-[#7A1F2D] transition-colors">{label}</p>
      <p className="text-gray-500 group-hover:text-gray-800 transition-colors">{value}</p>
    </div>
  );

  return (
    <li className="flex items-start gap-3 group">
      <span className="mt-0.5 flex-shrink-0 text-[#7A1F2D] group-hover:scale-110 transition-transform">{icon}</span>
      {href ? (
        <a 
          href={href} 
          target={href.includes('wa.me') ? "_blank" : undefined}
          rel={href.includes('wa.me') ? "noopener noreferrer" : undefined}
          className="cursor-pointer"
        >
          {innerContent}
        </a>
      ) : (
        innerContent
      )}
    </li>
  );
}

/* ── Íconos inline ──────────────────────────────────────────────────────── */

function MailIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h2.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-1.591.795a11.05 11.05 0 005.516 5.516l.795-1.591a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
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

export default ContactPage;