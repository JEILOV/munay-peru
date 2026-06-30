// src/pages/public/HomePage.jsx

import HeroSection from '../../features/home/components/HeroSection';
import ImpactCounters from '../../features/home/components/ImpactCounters';
import TestimonialsSection from '../../features/testimonials/components/TestimonialsSection'; // <-- 1. IMPORTAR AQUÍ

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ImpactCounters />
      <TestimonialsSection /> {/* <-- 2. RENDERIZAR AQUÍ */}
    </>
  );
}