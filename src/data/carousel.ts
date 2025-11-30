export interface PromoSlide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  cta: string;
  link?: string; // Optional navigation link
  scrollTo?: string; // Optional scroll target ID
}

export const promoSlides: PromoSlide[] = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=1200&h=600&fit=crop',
    title: 'Promociones Exclusivas',
    subtitle: 'Descuentos especiales por tiempo limitado',
    cta: 'Ver ofertas',
    link: '/promociones'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=1200&h=600&fit=crop',
    title: 'Combos Familiares',
    subtitle: 'Comparte con los tuyos el mejor sabor oriental',
    cta: 'Ver combos',
    scrollTo: 'combos-section'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=1200&h=600&fit=crop',
    title: 'Platos Deliciosos',
    subtitle: 'Elige tus platos favoritos preparados al momento',
    cta: 'Explorar menú',
    scrollTo: 'products-section'
  }
];
