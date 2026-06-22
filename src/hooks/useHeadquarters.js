// src/hooks/useHeadquarters.js
import { useState, useEffect } from 'react';
import {
  fetchActiveHeadquarters,
  fetchHeadquarterById,
} from '../features/headquarters/services/headquartersService';

/**
 * Hook para obtener todas las sedes activas.
 */
export const useHeadquarters = () => {
  const [headquarters, setHeadquarters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await fetchActiveHeadquarters();
        setHeadquarters(data);
      } catch (err) {
        console.error('Error al cargar sedes:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { headquarters, loading, error };
};

/**
 * Hook para obtener una sede por su ID de documento (usado en
 * HeadquartersDetailPage). Las sedes se identifican por `id`, no por
 * `slug` — a diferencia de Proyectos.
 */
export const useHeadquarterById = (id) => {
  const [headquarter, setHeadquarter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await fetchHeadquarterById(id);
        setHeadquarter(data);
      } catch (err) {
        console.error('Error al cargar sede por id:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  return { headquarter, loading, error };
};

/**
 * Hook para obtener sedes filtradas por región.
 */
export const useHeadquartersByRegion = (region) => {
  const [headquarters, setHeadquarters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await fetchActiveHeadquarters();
        const filtered = region ? data.filter(s => s.region === region) : data;
        setHeadquarters(filtered);
      } catch (err) {
        console.error('Error al cargar sedes por región:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [region]);

  return { headquarters, loading, error };
};