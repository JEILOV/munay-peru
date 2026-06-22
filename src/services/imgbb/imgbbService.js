// src/services/imgbb/imgbbService.js
//
// Servicio aislado, sin dependencias de Firebase ni de ningún feature —
// vive en services/ (no en features/) porque "subir una imagen a ImgBB"
// no sabe ni le importa si esa imagen es de una sede, un proyecto, o un
// perfil de usuario. Cualquier feature que necesite subir imágenes importa
// desde aquí.
//
// compressImage() es una función SEPARADA de uploadImageToImgBB, no un
// paso oculto dentro de ella — así cada función hace una sola cosa, y la
// página orquesta explícitamente "comprimir -> subir" (igual que ya
// orquesta "subir -> guardar en Firestore"), en vez de que la compresión
// sea un efecto secundario invisible al leer el código de la página.

import imageCompression from 'browser-image-compression';

const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload';

const COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true, // evita bloquear el hilo principal mientras comprime
};

/**
 * Comprime una imagen en el navegador antes de subirla. Reduce tanto el
 * tiempo de subida como el peso final que termina sirviendo ImgBB.
 *
 * @param {File} file
 * @returns {Promise<File>} Un nuevo File comprimido (mismo nombre, menor tamaño)
 * @throws {Error} Si la compresión falla — el caller decide si sube el
 *                  original sin comprimir o aborta (ver projectsManagerPage).
 */
export async function compressImage(file) {
  try {
    const compressedFile = await imageCompression(file, COMPRESSION_OPTIONS);
    return compressedFile;
  } catch (err) {
    console.error('[imgbbService] Error al comprimir la imagen:', err);
    throw new Error('No se pudo comprimir la imagen. Intenta con otro archivo.');
  }
}

/**
 * Sube un archivo de imagen a ImgBB y devuelve la URL pública directa.
 * NO comprime internamente — si quieres comprimir antes, llama a
 * compressImage(file) primero y pasa el resultado aquí.
 *
 * @param {File} file - El archivo a subir (idealmente ya comprimido)
 * @returns {Promise<string>} La URL directa de la imagen subida (data.data.url)
 * @throws {Error} Si falta la API key, si la subida falla, o si la respuesta
 *                  de ImgBB no tiene el formato esperado.
 */
export async function uploadImageToImgBB(file) {
  const apiKey = import.meta.env.VITE_IMGBB_API_KEY;

  if (!apiKey) {
    // Falla rápido y con mensaje claro en vez de dejar que el fetch falle
    // con un error críptico de "key inválida" desde la API de ImgBB.
    throw new Error(
      'Falta VITE_IMGBB_API_KEY en tu archivo .env. Revisa la configuración antes de subir imágenes.',
    );
  }

  if (!file) {
    throw new Error('No se proporcionó ningún archivo para subir.');
  }

  const formData = new FormData();
  formData.append('key', apiKey);
  formData.append('image', file);

  let response;
  try {
    response = await fetch(IMGBB_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });
  } catch (networkError) {
    // Error de red (sin conexión, CORS, etc.) — distinto de un error de
    // la API misma, así que lo distinguimos con un mensaje propio.
    throw new Error('No se pudo conectar con ImgBB. Revisa tu conexión a internet.');
  }

  const result = await response.json();

  if (!response.ok || !result?.data?.url) {
    // ImgBB devuelve detalles del error en result.error.message cuando
    // la subida falla (ej. archivo demasiado grande, key inválida).
    const apiMessage = result?.error?.message;
    throw new Error(apiMessage || 'ImgBB no pudo procesar la imagen. Intenta con otro archivo.');
  }

  return result.data.url;
}

/**
 * Atajo conveniente: comprime y sube en un solo paso. Úsalo cuando no
 * necesitas controlar cada paso por separado (ej. mostrar un estado de UI
 * distinto para "comprimiendo" vs "subiendo"). Si SÍ necesitas esa
 * granularidad de UI, llama a compressImage() y uploadImageToImgBB()
 * por separado, como hacemos en ProjectsManagerPage.
 */
export async function compressAndUploadImage(file) {
  const compressed = await compressImage(file);
  return uploadImageToImgBB(compressed);
}
