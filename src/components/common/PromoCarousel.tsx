import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { promoSlides } from '../../data/carousel';

const AUTO_PLAY_INTERVAL = 5000;

const PromoCarousel = () => {
  const [active, setActive] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % promoSlides.length);
    }, AUTO_PLAY_INTERVAL);

    return () => clearInterval(timer);
  }, []);

  const handleCTAClick = (slide: typeof promoSlides[0]) => {
    // Si tiene un link, navegar a esa página
    if (slide.link) {
      navigate(slide.link);
    }
    // Si tiene scrollTo, hacer scroll suave a esa sección
    else if (slide.scrollTo) {
      const element = document.getElementById(slide.scrollTo);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gray-100">
      <div
        className="flex transition-transform duration-700"
        style={{ transform: `translateX(-${active * 100}%)` }}
      >
        {promoSlides.map((slide) => (
          <article key={slide.id} className="min-w-full">
            <div className="grid gap-8 bg-gradient-to-r from-primary to-secondary px-10 py-12 text-white lg:grid-cols-[1.2fr,1fr]">
              <div className="flex flex-col justify-center space-y-4">
                <span className="inline-flex w-max rounded-full bg-white/15 px-4 py-1 text-xs uppercase tracking-widest">
                  {slide.subtitle}
                </span>
                <h2 className="text-3xl font-bold lg:text-4xl">{slide.title}</h2>
                <p className="text-sm text-white/80 lg:text-base">
                  Descubre combinaciones irresistibles con ingredientes frescos y el toque oriental
                  que amas.
                </p>
                <button
                  onClick={() => handleCTAClick(slide)}
                  className="w-max rounded-full bg-white px-6 py-2 text-sm font-semibold text-primary transition hover:bg-white/80"
                >
                  {slide.cta}
                </button>
              </div>
              <img src={slide.image} alt={slide.title} className="w-full rounded-2xl object-cover shadow-lg" />
            </div>
          </article>
        ))}
      </div>
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-3">
        {promoSlides.map((slide, index) => (
          <button
            type="button"
            key={slide.id}
            onClick={() => setActive(index)}
            className={`h-2 rounded-full transition-all ${active === index ? 'w-8 bg-white' : 'w-3 bg-white/50'
              }`}
            aria-label={`Ir al slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default PromoCarousel;
