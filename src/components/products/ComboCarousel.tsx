import { useState, useEffect } from 'react';
import ComboCard from './ComboCard';
import type { Combo } from '../../types';

interface Props {
    combos: Combo[];
}

const ComboCarousel = ({ combos }: Props) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemsPerView, setItemsPerView] = useState(3);

    // Responsive: ajustar cantidad de items según el viewport
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) {
                setItemsPerView(1); // Móvil: 1 card
            } else if (window.innerWidth < 1024) {
                setItemsPerView(2); // Tablet: 2 cards
            } else {
                setItemsPerView(3); // Desktop: 3 cards
            }
        };

        handleResize(); // Ejecutar al montar
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Calcular total de slides
    const totalSlides = Math.ceil(combos.length / itemsPerView);

    // Navegación
    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % totalSlides);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
    };

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    if (combos.length === 0) {
        return null;
    }

    // Si solo hay items para 1 slide, no mostrar controles de navegación
    const showControls = totalSlides > 1;

    return (
        <div className="relative">
            {/* Botón anterior */}
            {showControls && (
                <button
                    onClick={prevSlide}
                    className="absolute left-0 top-1/2 z-10 -translate-y-1/2 -translate-x-4 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg transition hover:bg-gray-50 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-secondary"
                    aria-label="Anterior"
                >
                    <svg
                        className="h-6 w-6 text-gray-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                </button>
            )}

            {/* Container del carrusel */}
            <div className="overflow-hidden">
                <div
                    className="flex gap-6 transition-transform duration-500 ease-in-out"
                    style={{
                        transform: `translateX(-${currentIndex * 100}%)`,
                    }}
                >
                    {combos.map((combo) => (
                        <div
                            key={combo.combo_id}
                            style={{
                                flex: `0 0 calc(${100 / itemsPerView}% - ${(itemsPerView - 1) * 24 / itemsPerView}px)`,
                            }}
                        >
                            <ComboCard combo={combo} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Botón siguiente */}
            {showControls && (
                <button
                    onClick={nextSlide}
                    className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-4 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg transition hover:bg-gray-50 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-secondary"
                    aria-label="Siguiente"
                >
                    <svg
                        className="h-6 w-6 text-gray-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                        />
                    </svg>
                </button>
            )}

            {/* Indicadores (dots) */}
            {showControls && (
                <div className="mt-6 flex justify-center gap-2">
                    {Array.from({ length: totalSlides }).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`h-2 rounded-full transition-all ${currentIndex === index
                                    ? 'w-8 bg-secondary'
                                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                                }`}
                            aria-label={`Ir al slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ComboCarousel;
