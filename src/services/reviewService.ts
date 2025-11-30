import axios, { AxiosInstance } from 'axios';
import type { Review, ApiResponse } from '../types';

// Cliente para el microservicio de Empleados (donde están las reseñas)
const employeesClient: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_EMPLEADOS_URL || '',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Agregar token de autenticación
employeesClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/**
 * Crea una nueva reseña para un pedido
 * @param localId - ID del local
 * @param pedidoId - ID del pedido
 * @param calificacion - Calificación de 0 a 5
 * @param resena - Comentario de la reseña (opcional)
 */
export const createReview = async (
    localId: string,
    pedidoId: string,
    calificacion: number,
    resena: string = ''
): Promise<Review> => {
    try {
        console.log('reviewService: Creando reseña:', { localId, pedidoId, calificacion, resena });

        const response = await employeesClient.post<any>(`/resenas`, {
            local_id: localId,
            pedido_id: pedidoId,
            calificacion,
            resena
        });

        console.log('reviewService: Reseña creada exitosamente:', response.data);

        // El backend devuelve { message, resena }
        const reviewData = response.data.resena || response.data.data || response.data;

        return {
            resena_id: reviewData.resena_id,
            local_id: reviewData.local_id,
            pedido_id: reviewData.pedido_id,
            cocinero_dni: reviewData.cocinero_dni,
            despachador_dni: reviewData.despachador_dni,
            repartidor_dni: reviewData.repartidor_dni,
            resena: reviewData.resena,
            calificacion: Number(reviewData.calificacion) // Convertir de Decimal a number
        };
    } catch (error: any) {
        console.error('reviewService: Error al crear reseña:', error);

        // Proporcionar mensajes de error más amigables
        if (error.response?.status === 400) {
            const errorMsg = error.response.data?.error || 'Datos de reseña inválidos';
            throw new Error(errorMsg);
        } else if (error.response?.status === 404) {
            throw new Error('Pedido o local no encontrado');
        } else if (error.response?.status === 500) {
            throw new Error('Error del servidor al crear la reseña. Por favor, intenta nuevamente.');
        }

        throw error;
    }
};

/**
 * Actualiza una reseña existente
 * @param localId - ID del local
 * @param resenaId - ID de la reseña
 * @param calificacion - Nueva calificación de 0 a 5
 * @param resena - Nuevo comentario
 */
export const updateReview = async (
    localId: string,
    resenaId: string,
    calificacion: number,
    resena: string
): Promise<Review> => {
    try {
        console.log('reviewService: Actualizando reseña:', { localId, resenaId, calificacion, resena });

        const response = await employeesClient.put<any>(`/resenas/${resenaId}`, {
            calificacion,
            resena
        });

        console.log('reviewService: Reseña actualizada exitosamente:', response.data);

        const reviewData = response.data.resena || response.data.data || response.data;

        return {
            resena_id: reviewData.resena_id,
            local_id: reviewData.local_id,
            pedido_id: reviewData.pedido_id,
            cocinero_dni: reviewData.cocinero_dni,
            despachador_dni: reviewData.despachador_dni,
            repartidor_dni: reviewData.repartidor_dni,
            resena: reviewData.resena,
            calificacion: Number(reviewData.calificacion)
        };
    } catch (error: any) {
        console.error('reviewService: Error al actualizar reseña:', error);

        if (error.response?.status === 400) {
            throw new Error('Datos de reseña inválidos');
        } else if (error.response?.status === 404) {
            throw new Error('Reseña no encontrada');
        } else if (error.response?.status === 500) {
            throw new Error('Error del servidor al actualizar la reseña');
        }

        throw error;
    }
};

/**
 * Elimina una reseña
 * @param localId - ID del local
 * @param resenaId - ID de la reseña
 */
export const deleteReview = async (
    localId: string,
    resenaId: string
): Promise<void> => {
    try {
        console.log('reviewService: Eliminando reseña:', { localId, resenaId });

        await employeesClient.delete(`/resenas/${resenaId}`);

        console.log('reviewService: Reseña eliminada exitosamente');
    } catch (error: any) {
        console.error('reviewService: Error al eliminar reseña:', error);

        if (error.response?.status === 404) {
            throw new Error('Reseña no encontrada');
        } else if (error.response?.status === 500) {
            throw new Error('Error del servidor al eliminar la reseña');
        }

        throw error;
    }
};

/**
 * Obtiene todas las reseñas de un local
 * @param localId - ID del local
 */
export const getReviewsByLocal = async (localId: string): Promise<Review[]> => {
    try {
        console.log('reviewService: Obteniendo reseñas del local:', localId);

        const response = await employeesClient.get<any>(`/locales/${localId}/resenas`);

        console.log('reviewService: Reseñas obtenidas:', response.data);

        const reviews = response.data.resenas || response.data.data || [];

        return reviews.map((review: any) => ({
            resena_id: review.resena_id,
            local_id: review.local_id,
            pedido_id: review.pedido_id,
            cocinero_dni: review.cocinero_dni,
            despachador_dni: review.despachador_dni,
            repartidor_dni: review.repartidor_dni,
            resena: review.resena,
            calificacion: Number(review.calificacion)
        }));
    } catch (error: any) {
        console.error('reviewService: Error al obtener reseñas:', error);

        // Si no hay reseñas, devolver array vacío en lugar de error
        if (error.response?.status === 404) {
            return [];
        }

        throw error;
    }
};

/**
 * Obtiene la reseña de un pedido específico (si existe)
 * @param localId - ID del local
 * @param pedidoId - ID del pedido
 */
export const getReviewByOrder = async (
    localId: string,
    pedidoId: string
): Promise<Review | null> => {
    try {
        const reviews = await getReviewsByLocal(localId);
        const orderReview = reviews.find(review => review.pedido_id === pedidoId);
        return orderReview || null;
    } catch (error) {
        console.error('reviewService: Error al obtener reseña del pedido:', error);
        return null;
    }
};
