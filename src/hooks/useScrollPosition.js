// src/hooks/useScrollPosition.js
//
// Usado por el Navbar para activar glassmorphism/sombra una vez que el
// usuario se aleja del tope de la página (donde el navbar es transparente
// sobre el hero).

import { useState, useEffect } from 'react';

export function useScrollPosition(threshold = 24) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > threshold);
    }
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return isScrolled;
}
