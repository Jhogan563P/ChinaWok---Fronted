export interface Store {
  id: number;
  name: string;
  address: string;
  deliveryType: 'Delivery' | 'Recojo en tienda' | 'Delivery y Recojo';
}

export const stores: Store[] = [
  {
    id: 1,
    name: 'Real Plaza Villa María del Triunfo',
    address: 'Av. Pachacutec 371 - 537, 2do nivel, Villa María del Triunfo',
    deliveryType: 'Delivery y Recojo'
  },
  {
    id: 2,
    name: 'Mega Plaza Norte',
    address: 'Av. Alfredo Mendiola 3698, Independencia',
    deliveryType: 'Delivery y Recojo'
  },
  {
    id: 3,
    name: 'Jockey Plaza',
    address: 'Av. Javier Prado Este 4200, Santiago de Surco',
    deliveryType: 'Delivery'
  },
  {
    id: 4,
    name: 'Mall del Sur',
    address: 'Av. Los Lirios 301, San Juan de Miraflores',
    deliveryType: 'Delivery y Recojo'
  },
  {
    id: 5,
    name: 'Open Plaza Angamos',
    address: 'Av. Angamos Este 1803, Surquillo',
    deliveryType: 'Recojo en tienda'
  },
  {
    id: 6,
    name: 'Plaza San Miguel',
    address: 'Av. La Marina 2000, San Miguel',
    deliveryType: 'Delivery y Recojo'
  }
];
