import React, { useState, useEffect, useRef } from 'react';
import { HERO_SLIDES } from '../data/mockData';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const HeroCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === HERO_SLIDES.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        nextSlide();
      }, 5000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, currentIndex]);

  return (
    <div
      className="relative w-full h-[320px] sm:h-[400px] md:h-[480px] lg:h-[500px] rounded-3xl overflow-hidden shadow-lg group border-4 border-white select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="Carrossel de fotos da campanha"
    >
      {/* Slides */}
      {HERO_SLIDES.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          <img
            src={slide.url}
            alt={slide.title}
            className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out"
            loading={index === 0 ? 'eager' : 'lazy'}
            referrerPolicy="no-referrer"
            onError={(e) => {
              if (slide.fallbackUrl && e.currentTarget.src !== slide.fallbackUrl) {
                e.currentTarget.src = slide.fallbackUrl;
              }
            }}
          />

          {/* Gradient Overlay for Text Legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex flex-col justify-end p-6 md:p-8 text-white">
            <h3 className="font-['Nunito'] font-black text-xl md:text-2xl drop-shadow-md text-white">
              {slide.title}
            </h3>
            <p className="text-sm md:text-base text-white/95 drop-shadow-xs max-w-lg mt-0.5 font-medium">
              {slide.subtitle}
            </p>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        aria-label="Foto anterior"
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-[#0854A7] hover:text-[#FF2D78] flex items-center justify-center backdrop-blur-md shadow-md opacity-80 md:opacity-0 group-hover:opacity-100 transition-all duration-200 transform hover:scale-110 active:scale-95 cursor-pointer"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Próxima foto"
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-[#0854A7] hover:text-[#FF2D78] flex items-center justify-center backdrop-blur-md shadow-md opacity-80 md:opacity-0 group-hover:opacity-100 transition-all duration-200 transform hover:scale-110 active:scale-95 cursor-pointer"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slide Indicators / Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-xs px-3.5 py-1.5 rounded-full">
        {HERO_SLIDES.map((_, dotIndex) => (
          <button
            key={dotIndex}
            onClick={() => setCurrentIndex(dotIndex)}
            aria-label={`Ir para a foto ${dotIndex + 1}`}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              dotIndex === currentIndex
                ? 'w-6 h-2 bg-[#FFC300]'
                : 'w-2 h-2 bg-white/60 hover:bg-white'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
