// src/pages/public/HomePage.jsx

import HeroSection from '../../features/home/components/HeroSection';
import ImpactCounters from '../../features/home/components/ImpactCounters';
import Reconocimientos from '../../features/home/components/Reconocimientos';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ImpactCounters />
      <Reconocimientos />
    </>
  );
}