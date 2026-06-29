// scripts/generate-sitemap.js
//
// Genera public/sitemap.xml ANTES del build de Vite, leyendo las colecciones
// públicas 'projects' y 'headquarters' de Firestore.
//
// Por qué corre como script de Node separado (no dentro de la app React):
// el sitemap es un artefacto estático que Google rastrea por HTTP directo,
// no algo que el navegador del usuario necesite generar en runtime.
//
// Requiere que las env vars VITE_FIREBASE_* estén disponibles en el entorno
// de build de Vercel (Project Settings → Environment Variables). Como ya las
// usas para el cliente, deberían estar configuradas — Vercel las expone a
// CUALQUIER proceso de build, no solo al bundle de Vite.

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SITE_URL = 'https://munay-peru.vercel.app';

// ── Config de Firebase (mismas env vars que usa el cliente) ────────────────
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Validación temprana: si falta alguna env var, mejor fallar con un mensaje
// claro ahora que dejar que Firebase tire un error críptico más abajo.
const missing = Object.entries(firebaseConfig).filter(([, v]) => !v);
if (missing.length > 0) {
  console.error(
    `[sitemap] Faltan variables de entorno: ${missing.map(([k]) => k).join(', ')}`
  );
  console.error('[sitemap] Verifica Project Settings → Environment Variables en Vercel.');
  process.exit(1);
}

// ── Rutas estáticas (las que NO dependen de Firestore) ──────────────────────
// Mantener esta lista sincronizada a mano con AppRouter.jsx cada vez que
// agregues/quites una ruta pública. Las rutas /admin/* quedan fuera a propósito.
const STATIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/proyectos', priority: '0.8', changefreq: 'weekly' },
  { path: '/sedes', priority: '0.8', changefreq: 'monthly' },
  { path: '/voluntarios', priority: '0.8', changefreq: 'monthly' },
  { path: '/nosotros', priority: '0.6', changefreq: 'monthly' },
  { path: '/contacto', priority: '0.6', changefreq: 'monthly' },
];

function urlEntry(path, priority, changefreq) {
  return `  <url>
    <loc>${SITE_URL}${path}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

async function generateSitemap() {
  console.log('[sitemap] Inicializando Firebase...');
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const entries = STATIC_ROUTES.map((r) => urlEntry(r.path, r.priority, r.changefreq));

  // ── Proyectos: usan el campo 'slug', NO el doc.id ────────────────────────
  console.log('[sitemap] Leyendo colección "projects"...');
  const projectsSnap = await getDocs(collection(db, 'projects'));
  let projectCount = 0;
  projectsSnap.forEach((doc) => {
    const data = doc.data();
    if (!data.slug) {
      console.warn(`[sitemap] Proyecto ${doc.id} no tiene "slug", se omite del sitemap.`);
      return;
    }
    entries.push(urlEntry(`/proyectos/${data.slug}`, '0.7', 'monthly'));
    projectCount++;
  });
  console.log(`[sitemap] ${projectCount} proyectos agregados.`);

  // ── Sedes: usan el doc.id directamente ───────────────────────────────────
  console.log('[sitemap] Leyendo colección "headquarters"...');
  const hqSnap = await getDocs(collection(db, 'headquarters'));
  hqSnap.forEach((doc) => {
    entries.push(urlEntry(`/sedes/${doc.id}`, '0.6', 'monthly'));
  });
  console.log(`[sitemap] ${hqSnap.size} sedes agregadas.`);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`;

  const outputPath = join(__dirname, '..', 'public', 'sitemap.xml');
  writeFileSync(outputPath, xml, 'utf-8');
  console.log(`[sitemap] Escrito en ${outputPath}`);
  console.log(`[sitemap] Total de URLs: ${entries.length}`);
}

generateSitemap().catch((err) => {
  console.error('[sitemap] Error generando el sitemap:', err);
  // No queremos que un fallo de Firestore tumbe todo el deploy del sitio.
  // Mejor avisar fuerte en los logs y dejar que el build continúe sin sitemap
  // nuevo (Vercel servirá el sitemap.xml anterior que ya esté en public/, si existe).
  console.error('[sitemap] El build continuará sin actualizar el sitemap.');
});