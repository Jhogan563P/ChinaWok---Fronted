export interface PromoSlide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  cta: string;
}

export const promoSlides: PromoSlide[] = [
  {
    id: 1,
    image: 'https://www.chinawok.com.pe/img/banner/promos/banner-cyber.webp',
    title: 'Cyber Wok',
    subtitle: 'Promos especiales por tiempo limitado',
    cta: 'Ordena ahora'
  },
  {
    id: 2,
    image: 'https://www.chinawok.com.pe/img/banner/promos/banner-familiar.webp',
    title: 'Combos Familiares',
    subtitle: 'Comparte con los tuyos el mejor sabor oriental',
    cta: 'Ver combos'
  },
  {
    id: 3,
    image: 'https://www.chinawok.com.pe/img/banner/promos/banner-duo.webp',
    title: 'Dúos irresistibles',
    subtitle: 'Elige tus platos favoritos para dos',
    cta: 'Descubrir dúos'
  }
];
