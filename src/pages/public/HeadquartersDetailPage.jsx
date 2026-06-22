// src/pages/public/HeadquartersDetailPage.jsx
import { useParams, Link, Navigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import LoadingScreen from '../../components/feedback/LoadingScreen';
import { useHeadquarterById } from '../../hooks/useHeadquarters';
import { useProjectsBySede } from '../../hooks/useProjects';

const HeadquartersDetailPage = () => {
  const { id } = useParams();
  const { headquarter, loading, error } = useHeadquarterById(id);
  const { projects, loading: loadingProjects } = useProjectsBySede(headquarter?.id ?? null);

  if (loading) return <LoadingScreen />;
  if (!loading && !headquarter) return <Navigate to="/sedes" replace />;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-red-500">Error al cargar la sede.</p>
      </div>
    );
  }

  const { phone, whatsapp, facebook, instagram } = headquarter;
  const hasContactInfo = Boolean(phone || whatsapp || facebook || instagram);

  return (
    <main className="container mx-auto px-4 py-10 max-w-4xl">
      <nav className="text-sm text-gray-400 mb-6">
        <Link to="/sedes" className="hover:text-gray-600 transition-colors">← Volver a Sedes</Link>
      </nav>

      {headquarter.coverImage && (
        <img
          src={headquarter.coverImage}
          alt={headquarter.name}
          className="w-full h-72 object-cover rounded-2xl mb-8"
        />
      )}

      <header className="mb-6">
        {headquarter.region && (
          <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            {headquarter.region}
          </span>
        )}
        <h1 className="text-4xl font-bold text-gray-800">{headquarter.name}</h1>
        {headquarter.description && (
          <p className="text-lg text-gray-500 mt-2">{headquarter.description}</p>
        )}
      </header>

     {hasContactInfo && (
        <section className="mb-10 flex flex-wrap gap-3">
          {phone && (
            <a
              href={`tel:${phone}`}
              className="inline-flex items-center gap-2 rounded-full bg-gray-100 text-gray-700 text-sm font-semibold px-4 py-2 hover:bg-gray-200 transition-colors"
            >
              <PhoneIcon className="h-4 w-4" />
              {phone}
            </a>
          )}
          {whatsapp && (
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold px-4 py-2 hover:bg-emerald-200 transition-colors"
            >
              <WhatsappIcon className="h-4 w-4" />
              WhatsApp
            </a>
          )}
          {facebook && (
            <a
              href={facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-2 hover:bg-blue-200 transition-colors"
            >
              <FacebookIcon className="h-4 w-4" />
              Facebook
            </a>
          )}
          {instagram && (
            <a
              href={instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-pink-100 text-pink-700 text-sm font-semibold px-4 py-2 hover:bg-pink-200 transition-colors"
            >
              <InstagramIcon className="h-4 w-4" />
              Instagram
            </a>
          )}
        </section>
      )}
      {/* ── Sección modificada ── */}
      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Proyectos en esta sede</h2>
        {loadingProjects ? (
          <p className="text-gray-400">Cargando proyectos...</p>
        ) : projects.length === 0 ? (
          <p className="text-gray-400">No hay proyectos registrados para esta sede.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link
                key={project.id}
                to={`/proyectos/${project.slug}`}
                className="group block"
              >
                <Card>
                  <Card.Header src={project.coverImage} alt={project.title} />
                  <Card.Body>
                    <p className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
                      {project.title}
                    </p>
                  </Card.Body>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="mt-10">
        <Link to="/contacto">
          <Button variant="primary">Contáctanos</Button>
        </Link>
      </div>
    </main>
  );
};

// ── Íconos (sin cambios) ──────────────────────────────────────────────────────

function PhoneIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h2.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-1.591.795a11.05 11.05 0 005.516 5.516l.795-1.591a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}

function WhatsappIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.5 8.5 0 10-3.8 7.1L21 20l-1.4-3.7a8.46 8.46 0 001.4-4.8z" />
    </svg>
  );
}

function FacebookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 9h2V6h-2a3 3 0 00-3 3v2H9v3h2v6h3v-6h2.5l.5-3H14V9z" />
    </svg>
  );
}

function InstagramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <circle cx="12" cy="12" r="3.2" />
      <circle cx="16.2" cy="7.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default HeadquartersDetailPage;