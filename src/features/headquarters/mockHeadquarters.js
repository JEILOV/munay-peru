// src/features/headquarters/mockHeadquarters.js
//
// Mock data con el schema completo de `headquarters` en Firestore
// (name, description, coverImage, coordinatorName, isActive) más algunos
// campos de UI que el detalle necesita (contacto, coordenadas para el mapa)
// y que se agregarán al schema real cuando conectemos Firestore.
//
// El `id` aquí coincide con los sedeId que ya usan mockProjects.js y
// constants.js (SEDES) — 'piura', 'cusco', 'lima', 'iquitos' — para que
// el filtrado cruzado entre features funcione sin fricción.

export const mockHeadquarters = [
  {
    id: 'piura',
    name: 'Piura',
    summary:
      'Sede fundadora de Munay Perú, con foco en seguridad alimentaria, agua y formación técnica para jóvenes.',
    description: `La sede de Piura es donde nació Munay Perú en 2019, impulsada por un grupo de voluntarios universitarios preocupados por la inseguridad alimentaria en escuelas rurales.

Hoy es nuestra sede más consolidada, con presencia activa en biohuertos escolares, talleres de oficios para jóvenes y proyectos de respuesta ante emergencias climáticas (especialmente relevantes tras los episodios de El Niño costero).

El equipo de Piura trabaja en estrecha coordinación con la UGEL regional y gobiernos locales de zonas rurales del Bajo y Medio Piura.`,
    coverImage: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1200&q=80',
    coordinatorName: 'María Elena Castillo',
    isActive: true,
    contact: {
      email: 'piura@munayperu.org',
      phone: '+51 973 124 568',
      address: 'Av. Grau 542, Piura',
    },
    coordinates: { lat: -5.1945, lng: -80.6328 },
  },
  {
    id: 'cusco',
    name: 'Cusco',
    summary:
      'Trabajo en comunidades altoandinas con foco en salud preventiva, telemedicina y acceso a agua segura.',
    description: `La sede de Cusco se estableció en 2021 para atender una necesidad crítica: el acceso a salud de calidad en comunidades altoandinas de difícil acceso geográfico.

Combina telemedicina con especialistas voluntarios, instalación de sistemas de agua segura y educación sanitaria comunitaria.

El equipo de Cusco trabaja principalmente en las provincias de Calca y Urubamba, en coordinación con postas de salud del MINSA y autoridades comunales locales.`,
    coverImage: 'https://images.unsplash.com/photo-1531065208531-4036c0dba3ca?w=1200&q=80',
    coordinatorName: 'Edwin Quispe Mamani',
    isActive: true,
    contact: {
      email: 'cusco@munayperu.org',
      phone: '+51 984 220 117',
      address: 'Calle San Agustín 315, Cusco',
    },
    coordinates: { lat: -13.5320, lng: -71.9675 },
  },
  {
    id: 'lima',
    name: 'Lima',
    summary:
      'Hub de coordinación nacional y proyectos de refuerzo educativo en zonas vulnerables de Lima Este y Sur.',
    description: `La sede de Lima cumple un doble rol: es el hub administrativo y de coordinación nacional de Munay Perú, y al mismo tiempo ejecuta proyectos propios de educación en distritos vulnerables de Lima Este y Lima Sur.

El programa de refuerzo escolar sabatino, que conecta voluntarios universitarios con estudiantes de primaria, es el proyecto insignia de esta sede.

Lima concentra también el mayor número de voluntarios corporativos, gracias a alianzas con empresas que facilitan horas de voluntariado a sus colaboradores.`,
    coverImage: 'https://images.unsplash.com/photo-1531968455001-5c5272a41129?w=1200&q=80',
    coordinatorName: 'Daniela Reyes Soto',
    isActive: true,
    contact: {
      email: 'lima@munayperu.org',
      phone: '+51 987 345 902',
      address: 'Jr. Las Begonias 450, San Isidro, Lima',
    },
    coordinates: { lat: -12.0964, lng: -77.0428 },
  },
  {
    id: 'iquitos',
    name: 'Iquitos',
    summary:
      'Presencia en la Amazonía peruana, con énfasis en protección forestal y trabajo con comunidades indígenas.',
    description: `La sede de Iquitos extiende la presencia de Munay Perú a la Amazonía, trabajando junto a comunidades shipibas en monitoreo forestal participativo y desarrollo de alternativas económicas sostenibles.

Es nuestra sede más reciente y la de mayor complejidad logística, dado que muchas comunidades solo son accesibles por vía fluvial.

El equipo de Iquitos colabora con organizaciones indígenas locales y autoridades ambientales regionales para fortalecer la vigilancia comunitaria del bosque.`,
    coverImage: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200&q=80',
    coordinatorName: 'Jorge Pacaya Ruiz',
    isActive: true,
    contact: {
      email: 'iquitos@munayperu.org',
      phone: '+51 965 110 734',
      address: 'Malecón Tarapacá 280, Iquitos',
    },
    coordinates: { lat: -3.7437, lng: -73.2516 },
  },
];
