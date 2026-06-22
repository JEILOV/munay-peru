// src/hooks/useProjects.js
import { useState, useEffect } from 'react';
import {
  fetchPublishedProjects,
  fetchProjectBySlug,
} from '../features/projects/services/projectsService';

/**
 * Hook para obtener todos los proyectos publicados.
 */
export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await fetchPublishedProjects();
        setProjects(data);
      } catch (err) {
        console.error('Error al cargar proyectos:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { projects, loading, error };
};

/**
 * Hook para obtener un proyecto por su slug.
 */
export const useProjectBySlug = (slug) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await fetchProjectBySlug(slug);
        setProject(data);
      } catch (err) {
        console.error('Error al cargar proyecto por slug:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [slug]);

  return { project, loading, error };
};

/**
 * Hook para obtener proyectos filtrados por sede.
 */
export const useProjectsBySede = (sedeId) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        // Pasa el filtro de sede correctamente a la nueva función
        const data = await fetchPublishedProjects(sedeId && sedeId !== 'todos' ? { sedeId } : {});
        setProjects(data);
      } catch (err) {
        console.error('Error al cargar proyectos por sede:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [sedeId]);

  return { projects, loading, error };
};