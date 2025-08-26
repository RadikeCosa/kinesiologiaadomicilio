"use client";

import { useState, useEffect } from "react";

interface ScrollDownButtonProps {
  targetId?: string;
  className?: string;
}

export function ScrollDownButton({
  targetId = "servicios-preview",
  className = "",
}: ScrollDownButtonProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Mostrar el botón después de un breve delay
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    const handleScroll = () => {
      // Ocultar el botón cuando el usuario hace scroll hacia abajo
      const scrolled = window.scrollY > 100;
      setIsVisible(!scrolled);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      clearTimeout(showTimer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToSection = () => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToSection}
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-sky-600 text-white shadow-xl transition-all duration-300 hover:bg-sky-500 hover:scale-110 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 animate-bounce ${className}`}
      aria-label={`Ir a la sección ${targetId}`}
      title="Ver más contenido"
    >
      <svg
        className="h-7 w-7"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M19 14l-7 7m0 0l-7-7m7 7V3"
        />
      </svg>
    </button>
  );
}
