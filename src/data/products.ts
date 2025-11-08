export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  category: 'Para compartir' | 'Personales' | 'Familiares' | 'Días especiales' | 'Chijaukay' | 'Combos';
}

export const products: Product[] = [
  {
    id: 1,
    title: 'Promo Dúo Sopa al Wok',
    description: '2 sopas orientales + wantanes crujientes',
    price: 45.9,
    originalPrice: 58.9,
    discount: 25,
    image: 'https://www.chinawok.com.pe/img/menu/promos/duo-sopa.webp',
    category: 'Para compartir'
  },
  {
    id: 2,
    title: 'Dúo Clásico al Wok',
    description: '2 platos de pollo con verduras + 2 bebidas',
    price: 54.9,
    originalPrice: 74.9,
    discount: 45,
    image: 'https://www.chinawok.com.pe/img/menu/promos/duo-clasico.webp',
    category: 'Para compartir'
  },
  {
    id: 3,
    title: 'Cyber para Compartir',
    description: '2 platos + wantanes + bebida 1.5L',
    price: 49.9,
    originalPrice: 89.9,
    discount: 40,
    image: 'https://www.chinawok.com.pe/img/menu/promos/cyber-compartir.webp',
    category: 'Para compartir'
  },
  {
    id: 4,
    title: 'Promo Familiar Deluxe',
    description: '4 platos + 4 bebidas + 8 wantanes',
    price: 89.9,
    originalPrice: 119.9,
    discount: 30,
    image: 'https://www.chinawok.com.pe/img/menu/promos/familiar-deluxe.webp',
    category: 'Familiares'
  },
  {
    id: 5,
    title: 'Chijaukay a lo Pobre',
    description: 'Chijaukay crocante con huevo y plátano',
    price: 32.9,
    image: 'https://www.chinawok.com.pe/img/menu/promos/chijaukay-pobre.webp',
    category: 'Chijaukay'
  },
  {
    id: 6,
    title: 'Combo Personal Clásico',
    description: 'Arroz chaufa + pollo a la naranja + bebida',
    price: 24.9,
    image: 'https://www.chinawok.com.pe/img/menu/promos/combo-personal.webp',
    category: 'Personales'
  },
  {
    id: 7,
    title: 'Cyber Familiar',
    description: '3 platos + 1 bebida 1.5L + wantanes',
    price: 99.8,
    originalPrice: 129.5,
    discount: 23,
    image: 'https://www.chinawok.com.pe/img/menu/promos/cyber-familiar.webp',
    category: 'Familiares'
  },
  {
    id: 8,
    title: 'Promo Dúo Mostaza',
    description: '2 platos de pollo mostaza + 2 bebidas',
    price: 47.9,
    originalPrice: 63.9,
    discount: 25,
    image: 'https://www.chinawok.com.pe/img/menu/promos/duo-mostaza.webp',
    category: 'Para compartir'
  }
];
