interface Props {
    type: 'product' | 'combo' | 'offer';
    category?: string;
}

// Mapeo de emojis por tipo y categoría
const EMOJI_MAP: Record<string, string> = {
    // Por tipo
    product: '🍜',
    combo: '🎁',
    offer: '🏷️',

    // Por categoría (más específico)
    'Para compartir': '🍲',
    'Bebidas': '🥤',
    'Postres': '🍰',
    'Entradas': '🥟',
    'Sopas': '🍜',
    'Arroz': '🍚',
    'Tallarín': '🍝',
    'Chaufa': '🍛',
};

const ProductEmoji = ({ type, category }: Props) => {
    // Priorizar emoji por categoría, luego por tipo
    const emoji = (category && EMOJI_MAP[category]) || EMOJI_MAP[type] || '🍜';

    return (
        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary/20 via-primary/10 to-secondary/20 shadow-inner">
            <span className="text-4xl drop-shadow-sm">{emoji}</span>
        </div>
    );
};

export default ProductEmoji;
