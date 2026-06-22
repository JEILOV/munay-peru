// src/pages/public/ProjectDetailPage.jsx
import { useParams, Link, Navigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import LoadingScreen from '../../components/feedback/LoadingScreen';
import { useProjectBySlug } from '../../hooks/useProjects';
import { SEDES } from '../../utils/constants';

// Extrae el ID de YouTube de cualquier formato de URL común
function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    // Formato: youtube.com/watch?v=ID
    if (parsed.hostname.includes('youtube.com')) {
      const videoId = parsed.searchParams.get('v');
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
    // Formato: youtu.be/ID
    if (parsed.hostname === 'youtu.be') {
      const videoId = parsed.pathname.slice(1);
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
    // Formato: youtube.com/embed/ID (ya es embed, lo devolvemos tal cual)
    if (parsed.hostname.includes('youtube.com') && parsed.pathname.startsWith('/embed/')) {
      return url;
    }
  } catch {
    return null;
  }
  return null;
}

const ProjectDetailPage = () => {
  const { slug } = useParams();
  const { project, loading, error } = useProjectBySlug(slug);

  if (loading) return <LoadingScreen />;
  if (!loading && !project) return <Navigate to="/proyectos" replace />;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-red-500">Error al cargar el proyecto.</p>
      </div>
    );
  }

  const sede = SEDES.find((s) => s.id === project?.sedeId);
  const embedUrl = getYouTubeEmbedUrl(project.videoUrl);

  return (
    <main className="container mx-auto px-4 py-10 max-w-4xl">

      {/* ── Navegación ───────────────────────────────────────────────────── */}
      <nav className="text-sm text-gray-400 mb-6">
        <Link to="/proyectos" className="hover:text-gray-600 transition-colors">
          ← Volver a Proyectos
        </Link>
      </nav>

      {/* ── Hero: imagen de portada ───────────────────────────────────────── */}
      {project.coverImage && (
        <div className="w-full h-80 md:h-96 rounded-2xl overflow-hidden mb-8 shadow-md">
          <img
            src={project.coverImage}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* ── Encabezado y metadatos ────────────────────────────────────────── */}
      <header className="mb-8">
        {/* Badges: categoría y sede */}
        <div className="flex flex-wrap gap-2 mb-4">
          {project.category && (
            <span className="inline-block bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full">
              {project.category}
            </span>
          )}
          {sede && (
            <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
              {sede.name}
            </span>
          )}
        </div>

        <h1 className="text-4xl font-bold text-gray-800 leading-tight">
          {project.title}
        </h1>

        {/* Description corta destacada */}
        {project.description && (
          <p className="mt-4 text-lg text-gray-500 italic leading-relaxed border-l-4 border-orange-300 pl-4">
            {project.description}
          </p>
        )}
      </header>

      {/* ── Contenido largo ───────────────────────────────────────────────── */}
      {project.content && (
        <section className="mb-10">
          <p className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">
            {project.content}
          </p>
        </section>
      )}

      {/* ── Video de YouTube ──────────────────────────────────────────────── */}
      {embedUrl && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Video del proyecto</h2>
          <div className="aspect-video w-full rounded-xl overflow-hidden shadow-md">
            <iframe
              src={embedUrl}
              title={`Video: ${project.title}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </section>
      )}

      {/* ── CTA final ─────────────────────────────────────────────────────── */}
      <section className="mt-12 bg-orange-50 border border-orange-100 rounded-2xl px-6 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          ¿Quieres ser parte del cambio?
        </h2>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          Tu apoyo hace posible que este proyecto siga transformando vidas.
          Escríbenos y cuéntanos cómo quieres contribuir.
        </p>
        <Link to="/contacto">
          <Button variant="primary">Quiero apoyar este proyecto</Button>
        </Link>
      </section>

    </main>
  );
};

export default ProjectDetailPage;