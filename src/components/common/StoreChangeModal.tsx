import { useEffect } from 'react';

interface StoreChangeModalProps {
    isOpen: boolean;
    currentStoreName: string;
    newStoreName: string;
    cartItemCount: number;
    onConfirm: () => void;
    onCancel: () => void;
}

const StoreChangeModal = ({
    isOpen,
    currentStoreName,
    newStoreName,
    cartItemCount,
    onConfirm,
    onCancel
}: StoreChangeModalProps) => {
    // Cerrar modal con tecla ESC
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onCancel();
            }
        };

        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onCancel}
            ></div>

            {/* Modal */}
            <div className="relative z-10 mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
                {/* Icono de advertencia */}
                <div className="mb-4 flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                        <span className="text-4xl">⚠️</span>
                    </div>
                </div>

                {/* Título */}
                <h2 className="mb-3 text-center text-2xl font-bold text-gray-900">
                    ¿Cambiar de local?
                </h2>

                {/* Mensaje */}
                <div className="mb-6 space-y-3 text-center text-gray-600">
                    <p>
                        Estás a punto de cambiar de <strong>{currentStoreName}</strong> a{' '}
                        <strong>{newStoreName}</strong>.
                    </p>
                    <div className="rounded-md bg-amber-50 p-3 text-sm">
                        <p className="font-semibold text-amber-800">
                            ⚠️ Tu carrito se vaciará automáticamente
                        </p>
                        <p className="mt-1 text-amber-700">
                            {cartItemCount === 1
                                ? 'Perderás 1 producto'
                                : `Perderás ${cartItemCount} productos`}{' '}
                            que agregaste de {currentStoreName}
                        </p>
                    </div>
                    <p className="text-sm">
                        Los productos solo están disponibles en el local donde los agregaste.
                    </p>
                </div>

                {/* Botones */}
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 rounded-md bg-red-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                        Cambiar de local
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StoreChangeModal;
