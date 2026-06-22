// src/hooks/useCountUp.js
//
// Anima un número de 0 -> target cuando el elemento referenciado entra
// en el viewport. Usa IntersectionObserver (no scroll listeners) por
// performance, y solo dispara UNA vez (no se desestima si el usuario
// vuelve a hacer scroll arriba/abajo).
//
// Por qué un hook aparte y no solo la keyframe `count-up` de Tailwind:
// CSS no puede interpolar el CONTENIDO de un nodo de texto (0, 1, 2... 2000),
// solo propiedades animables como opacity/transform. La keyframe `count-up`
// se sigue usando para la aparición (fade + scale) del bloque; este hook
// se encarga puramente del número.

import { useEffect, useRef, useState } from 'react';

export function useCountUp({ target, duration = 2000, startOnView = true }) {
  const [value, setValue] = useState(0);
  const [hasStarted, setHasStarted] = useState(!startOnView);
  const ref = useRef(null);

  // Disparo por IntersectionObserver
  useEffect(() => {
    if (!startOnView || hasStarted) return;
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [startOnView, hasStarted]);

  // Animación del número vía requestAnimationFrame (más fluido que setInterval)
  useEffect(() => {
    if (!hasStarted) return;

    let rafId;
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo: arranca rápido, desacelera al final — se siente más
      // natural que una interpolación lineal para conteos de impacto.
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setValue(Math.round(eased * target));

      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    }

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [hasStarted, target, duration]);

  return { value, ref };
}
