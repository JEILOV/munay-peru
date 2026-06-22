// src/pages/public/HeadquartersPage.jsx
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import { useHeadquarters } from '../../hooks/useHeadquarters';

const HeadquartersPage = () => {
  const { headquarters, loading, error } = useHeadquarters();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-500">Cargando sedes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-red-500">Error al cargar las sedes. Intenta de nuevo.</p>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Nuestras Sedes</h1>
      <p className="text-gray-500 mb-8">
        Munay Perú está presente en distintas regiones del país.
      </p>

      {headquarters.length === 0 ? (
        <p className="text-gray-400 mt-10 text-center">
          No hay sedes registradas aún.
        </p>
      ) : (
        
   // ... (imports iguales)
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
  {headquarters.map((hq) => (
    <Link key={hq.id} to={`/sedes/${hq.id}`}>
      <Card>
        <Card.Header src={hq.coverImage} alt={hq.name} />
        <Card.Body>
          <Card.Title>{hq.name}</Card.Title>
          <Card.Description>{hq.description}</Card.Description>
        </Card.Body>
      </Card>
    </Link>
  ))}
</div>
      )}
    </main>
  );
};

export default HeadquartersPage;