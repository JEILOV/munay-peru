// src/pages/public/ProjectsPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import SedeFilterPills from '../../features/projects/components/SedeFilterPills';
import RegistrationButton from '../../features/projects/utils/RegistrationButton';
import { getRegistration } from '../../features/projects/registration';
import { useProjectsBySede } from '../../hooks/useProjects';
import { SEDES } from '../../utils/constants';

const ProjectsPage = () => {
  const [selectedSede, setSelectedSede] = useState(null);
  const { projects, loading, error } = useProjectsBySede(selectedSede);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-500">Cargando proyectos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-red-500">Error al cargar los proyectos. Intenta de nuevo.</p>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Nuestros Proyectos</h1>
      <p className="text-gray-500 mb-8">
        Conoce las iniciativas que Munay Perú lleva adelante en cada sede.
      </p>

      {/* Filtro por sede */}
      <SedeFilterPills
        sedes={SEDES}
        selected={selectedSede}
        onSelect={setSelectedSede}
      />

      {/* Grid de proyectos */}
      {projects.length === 0 ? (
        <p className="text-gray-400 mt-10 text-center">
          No hay proyectos disponibles para esta sede.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {projects.map((project) => (
            // Card con "stretched link": el <Link> del título cubre toda la
            // tarjeta y el botón de inscripción (relative z-10) queda encima,
            // sin anidar <a> dentro de <a>.
            <Card key={project.id}>
              <Card.Header
                src={project.coverImage}
                alt={project.title}
                badge={
                  getRegistration(project).status === 'open'
                    ? '✦ Inscripciones abiertas'
                    : undefined
                }
              />
              <Card.Body>
                <Card.Title>
                  <Link
                    to={`/proyectos/${project.slug}`}
                    className="after:absolute after:inset-0 after:content-['']"
                  >
                    {project.title}
                  </Link>
                </Card.Title>
                <Card.Description>{project.description}</Card.Description>

                {/* Solo se dibuja si hay inscripción abierta con formulario */}
                <RegistrationButton
                  project={project}
                  size="sm"
                  showClosed={false}
                  className="mt-4"
                />
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
};

export default ProjectsPage;