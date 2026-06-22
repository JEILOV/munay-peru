// src/features/projects/mockProjects.js
//
// Fuente ÚNICA de datos mock, compartida por ProjectsPage y ProjectDetailPage.
// Antes vivía solo dentro de ProjectsPage.jsx — lo extraje aquí para que
// ambas páginas lean del mismo array y nunca queden desincronizadas
// (ej. editas un título en una página y la otra muestra el viejo).
//
// Agregué `content`, `date` y `status` respecto al mock original: son
// campos que ya existían en nuestro schema de Firestore para `projects`
// pero que ProjectsPage (el grid) no necesitaba renderizar — el detalle sí.
//
// Cuando conectemos Firestore: este archivo se elimina, y tanto
// ProjectsPage como ProjectDetailPage pasan a usar un hook useProjects()/
// useProjectBySlug() que viven en features/projects/hooks/.

export const mockProjects = [
  {
    id: 'p1',
    title: 'Biohuertos escolares para seguridad alimentaria',
    slug: 'biohuertos-escolares-piura',
    description:
      'Implementamos biohuertos en 8 escuelas rurales para fortalecer la nutrición infantil con cultivos propios.',
    content: `Desde 2023, Munay Perú trabaja junto a la UGEL Piura en la implementación de biohuertos escolares como herramienta pedagógica y de seguridad alimentaria.

El proyecto nació de una necesidad concreta: muchas escuelas rurales de la región reportaban altos índices de desnutrición infantil, a pesar de estar rodeadas de tierra cultivable que no se aprovechaba dentro del entorno escolar.

Cada biohuerto es construido y mantenido por los propios estudiantes, con acompañamiento de voluntarios agrónomos. Los cultivos —principalmente hortalizas de ciclo corto— se integran directamente al programa de alimentación escolar (Qali Warma), cerrando el círculo entre lo que se siembra y lo que se come.

A la fecha, 8 instituciones educativas cuentan con biohuertos operativos, beneficiando de forma directa a más de 600 estudiantes y sus familias.`,
    sedeId: 'piura',
    category: 'medio-ambiente',
    coverImage: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=1200&q=80',
    date: '2026-03-12',
    status: 'published',
  },
  {
    id: 'p2',
    title: 'Telemedicina para comunidades altoandinas',
    slug: 'telemedicina-comunidades-cusco',
    description:
      'Llevamos atención médica especializada a 12 comunidades de difícil acceso mediante consultas remotas.',
    content: `El acceso a especialistas médicos sigue siendo uno de los mayores desafíos para las comunidades altoandinas de Cusco, donde el centro de salud más cercano puede estar a varias horas de camino.

Este proyecto equipa postas de salud comunitarias con conexión satelital y personal capacitado para realizar consultas de telemedicina con especialistas voluntarios ubicados en Lima y Cusco capital.

El modelo prioriza medicina preventiva y seguimiento de enfermedades crónicas, dos áreas donde la distancia geográfica suele traducirse directamente en abandono de tratamiento.

Actualmente operamos en 12 comunidades de las provincias de Calca y Urubamba, con más de 40 consultas mensuales en promedio.`,
    sedeId: 'cusco',
    category: 'salud',
    coverImage: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&q=80',
    date: '2026-01-28',
    status: 'published',
  },
  {
    id: 'p3',
    title: 'Refuerzo escolar en zonas vulnerables',
    slug: 'refuerzo-escolar-lima',
    description:
      'Voluntarios universitarios acompañan a más de 300 estudiantes de primaria en matemática y comprensión lectora.',
    content: `Tras detectar brechas significativas de aprendizaje en matemática y comprensión lectora en colegios públicos de Lima Este, lanzamos un programa de refuerzo escolar sabatino con voluntarios universitarios.

Cada voluntario es capacitado en pedagogía básica antes de asumir un grupo de máximo 8 estudiantes, asegurando una atención cercana y personalizada que el aula regular no siempre puede ofrecer.

El programa se desarrolla en alianza con bibliotecas comunales de San Juan de Lurigancho y Villa El Salvador, convirtiendo espacios públicos subutilizados en aulas de refuerzo los fines de semana.

Más de 300 estudiantes de primaria participan actualmente, con evaluaciones trimestrales que han mostrado mejoras sostenidas en comprensión lectora.`,
    sedeId: 'lima',
    category: 'educacion',
    coverImage: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=1200&q=80',
    date: '2025-11-05',
    status: 'published',
  },
  {
    id: 'p4',
    title: 'Protección de bosques comunitarios',
    slug: 'proteccion-bosques-iquitos',
    description:
      'Trabajamos con comunidades shipibas en monitoreo forestal y alternativas económicas sostenibles.',
    content: `La deforestación en la región Loreto avanza, en parte, porque las comunidades que habitan el bosque no siempre cuentan con alternativas económicas que compitan con la tala.

Este proyecto trabaja directamente con comunidades shipibas en dos frentes: monitoreo forestal participativo (usando GPS y reportes comunitarios) y desarrollo de alternativas económicas sostenibles como el manejo de aguaje y artesanía certificada.

El monitoreo forestal ha permitido identificar y reportar oportunamente actividad de tala ilegal en zonas que antes carecían de cualquier forma de vigilancia.

Trabajamos actualmente con 5 comunidades a lo largo del río Ucayali, capacitando a más de 30 monitores forestales comunitarios.`,
    sedeId: 'iquitos',
    category: 'medio-ambiente',
    coverImage: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=1200&q=80',
    date: '2026-02-18',
    status: 'published',
  },
  {
    id: 'p5',
    title: 'Talleres de oficios para jóvenes',
    slug: 'talleres-oficios-piura',
    description:
      'Formación técnica gratuita en electricidad, carpintería y costura para jóvenes de 16 a 24 años.',
    content: `Muchos jóvenes en zonas periurbanas de Piura abandonan sus estudios sin acceso a formación técnica que les permita insertarse rápidamente al mercado laboral.

Los talleres de oficios de Munay Perú ofrecen formación gratuita de 3 meses en electricidad básica, carpintería y costura industrial, dictados por maestros técnicos voluntarios con experiencia en el rubro.

Cada ciclo culmina con un proyecto práctico evaluable y, para los participantes con mejor desempeño, conexión directa con talleres y empresas aliadas que ofrecen primeras oportunidades laborales.

Desde el inicio del programa, más de 150 jóvenes han completado al menos un taller completo.`,
    sedeId: 'piura',
    category: 'desarrollo-social',
    coverImage: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&q=80',
    date: '2025-09-22',
    status: 'published',
  },
  {
    id: 'p6',
    title: 'Agua segura para familias rurales',
    slug: 'agua-segura-cusco',
    description:
      'Instalación de sistemas de filtración de agua en 5 centros poblados de la provincia de Calca.',
    content: `El consumo de agua no tratada sigue siendo una causa frecuente de enfermedades gastrointestinales en centros poblados rurales de la provincia de Calca.

Este proyecto instala sistemas de filtración de bajo mantenimiento directamente en viviendas y locales comunales, acompañado de talleres de educación sanitaria para asegurar el uso correcto y sostenido de los filtros.

A diferencia de soluciones centralizadas (como una planta de tratamiento municipal), este modelo descentralizado permite llegar a centros poblados dispersos donde una obra de gran escala no sería viable económicamente.

5 centros poblados cuentan hoy con sistemas instalados, beneficiando a más de 200 familias de forma directa.`,
    sedeId: 'cusco',
    category: 'salud',
    coverImage: 'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?w=1200&q=80',
    date: '2025-12-10',
    status: 'published',
  },
];
