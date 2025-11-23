import { ordersClient } from './apiClient';
import type { Offer, ApiResponse } from '../types';
import { getProductByNameAndLocalId } from './productService';

/**
 * Lista todas las ofertas de un local
 */
export const listOffers = async (localId: string): Promise<Offer[]> => {
  try {
    const response = await ordersClient.get<Offer[]>('/ofertas', {
      params: { local_id: localId }
    });

    let offersData: Offer[] = [];
    const data = response.data;

    if (Array.isArray(data)) {
      offersData = data;
    } else if ((data as any).data && Array.isArray((data as any).data)) {
      offersData = (data as any).data;
    }

    // Mapear y tipificar las ofertas del backend
    const mappedOffers: Offer[] = offersData.map((offer: any) => ({
      local_id: offer.local_id,
      oferta_id: offer.oferta_id,
      // Usar el nombre del producto o combo si está disponible, de lo contrario un nombre genérico.
      // El nombre del producto será sobrescrito con el nombre real del producto en el procesamiento posterior.
      nombre: offer.producto_nombre || offer.combo_nombre || offer.nombre || 'Oferta sin nombre',
      descripcion: offer.descripcion,
      imagen_url: offer.imagen_url,
      descuento: (offer.porcentaje_descuento || 0) / 100, // Convertir porcentaje a decimal
      producto_nombre: offer.producto_nombre,
      tipo: offer.combo_id ? 'combo' : 'producto', // Inferir el tipo basado en combo_id
      // precio_original y precio_con_descuento se calcularán más adelante para ofertas de tipo 'producto'
    }));

    console.log("Ofertas mapeadas del backend:", mappedOffers); // DEBUG

    // Filtrar ofertas para mostrar solo las de tipo 'producto'
    const productOffers = mappedOffers.filter(offer => offer.tipo === 'producto');

    // Procesar cada oferta de producto para obtener su precio y calcular el descuento
    const processedOffers = await Promise.all(
      productOffers.map(async (offer) => {
        if (offer.producto_nombre) {
          try {
            const product = await getProductByNameAndLocalId(offer.local_id, offer.producto_nombre);
            if (product) {
              return {
                ...offer,
                nombre: product.nombre, // Usar el nombre del producto como nombre de la oferta
                precio_original: product.precio,
                precio_con_descuento: product.precio * (1 - offer.descuento),
              };
            }
          } catch (productError) {
            console.error(`Error fetching product ${offer.producto_nombre} for offer ${offer.oferta_id}:`, productError);
          }
        }
        return offer; // Retornar la oferta original si no se encuentra el producto o hay un error
      })
    );

    // Filtrar cualquier oferta que no haya podido ser procesada (ej. si no se encontró el producto)
    const finalOffers = processedOffers.filter(offer => offer.precio_original !== undefined);
    console.log("Ofertas finales después de procesamiento y filtrado:", finalOffers); // DEBUG
    return finalOffers;

  } catch (error) {
    console.error('Error fetching offers:', error);
    throw error;
  }
};
