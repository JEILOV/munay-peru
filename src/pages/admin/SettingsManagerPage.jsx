// src/pages/admin/SettingsManagerPage.jsx
import { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import {
  getSettings,
  updateVolunteerFormUrl,
} from '../../features/settings/services/settingsService';
import { isValidHttpUrl } from '../../utils/url';

export default function SettingsManagerPage() {
  const [url,       setUrl]       = useState('');
  const [savedUrl,  setSavedUrl]  = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving,  setIsSaving]  = useState(false);
  const [error,     setError]     = useState(null);
  const [success,   setSuccess]   = useState(false);

  useEffect(() => {
    let cancelled = false;
    getSettings()
      .then((data) => {
        if (cancelled) return;
        const current = data.volunteerFormUrl ?? '';
        setUrl(current);
        setSavedUrl(current);
      })
      .catch((err) => {
        console.error('[SettingsManagerPage] Error al cargar:', err);
        if (!cancelled) setError('No se pudo cargar la configuración actual.');
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const trimmed  = url.trim();
  const isDirty  = trimmed !== savedUrl;
  const isActive = isValidHttpUrl(savedUrl);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (trimmed && !isValidHttpUrl(trimmed)) {
      setError('Ingresa una URL válida que empiece con http:// o https://');
      return;
    }

    setIsSaving(true);
    try {
      const saved = await updateVolunteerFormUrl(trimmed);
      setUrl(saved);
      setSavedUrl(saved);
      setSuccess(true);
    } catch (err) {
      console.error('[SettingsManagerPage] Error al guardar:', err);
      setError(err.message || 'No se pudo guardar. Inténtalo de nuevo.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      {/* Encabezado */}
      <h1 className="font-display text-2xl font-semibold text-primary-900">
        Configuración
      </h1>
      <p className="mt-1 text-sm text-warm-600">
        Ajustes generales de la web pública.
      </p>

      {/* Tarjeta del formulario */}
      <form
        onSubmit={handleSubmit}
        className="mt-6 rounded-2xl border border-warm-200 bg-white p-6 shadow-soft space-y-5"
      >
        <div>
          <label htmlFor="volunteerFormUrl" className="block text-sm font-medium text-primary-900">
            URL de inscripción para Voluntarios
          </label>
          <input
            id="volunteerFormUrl"
            type="url"
            inputMode="url"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setSuccess(false); setError(null); }}
            placeholder="https://forms.gle/..."
            disabled={isLoading || isSaving}
            className="input-base mt-1.5"
          />
          <p className="mt-1.5 text-xs text-warm-500">
            Pega el enlace del Google Form. Aparecerá como botón «Postula como voluntario» en la
            portada. Déjalo vacío para ocultar el botón.
          </p>
        </div>

        {/* Estado actual */}
        {!isLoading && (
          <p className="text-xs text-warm-600">
            Estado en la web:{' '}
            <span className={isActive ? 'font-semibold text-green-700' : 'font-semibold text-warm-700'}>
              {isActive ? 'Botón visible' : 'Botón oculto'}
            </span>
            {isActive && (
              <>
                {' · '}
                <a
                  href={savedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary-700 underline hover:text-primary-900"
                >
                  Probar enlace
                </a>
              </>
            )}
          </p>
        )}

        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">
            {error}
          </p>
        )}
        {success && (
          <p role="status" className="rounded-xl bg-green-50 px-4 py-2.5 text-sm text-green-700">
            {savedUrl ? 'Enlace guardado. Ya está activo en la web.' : 'Enlace eliminado. El botón se ocultó de la web.'}
          </p>
        )}

        <div className="flex items-center justify-end border-t border-warm-200 pt-4">
          <Button type="submit" variant="primary" isLoading={isSaving} disabled={isLoading || !isDirty}>
            Guardar cambios
          </Button>
        </div>
      </form>
    </div>
  );
}