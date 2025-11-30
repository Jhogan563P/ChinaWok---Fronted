export const categoryEmojis: Record<string, string> = {
  "Arroces": "🍚",
  "Tallarines": "🍝",
  "Pollo al wok": "🍗",
  "Carne de res": "🥩",
  "Cerdo": "🐷",
  "Mariscos": "🦐",
  "Entradas": "🥟", // Podría ser un dumpling o similar
  "Guarniciones": "🥔", // Papa frita o similar
  "Sopas": "🍜",
  "Combos": "🥡", // Contenedor de comida para llevar
  "Bebidas": "🥤",
  "Postres": "🍰",
  "Oferta": "🏷️", // Emoji para ofertas, si se usa una categoría "Oferta" para ellas.
  "Defecto": "🍽️" // Emoji por defecto
};

export const getEmojiForCategory = (category: string): string => {
  return categoryEmojis[category] || categoryEmojis["Defecto"];
};

// Devuelve un emoji aproximado basado en palabras clave del texto (nombre de oferta, producto, etc.)
export const getEmojiForText = (text: string): string => {
  if (!text) return categoryEmojis['Defecto'];
  const t = text.toLowerCase();

  if (t.includes('té') || t.includes('te') || t.includes('helado')) return '🧋';
  if (t.includes('agua') || t.includes('bebida') || t.includes('jugo') || t.includes('gaseosa')) return '🥤';
  if (t.includes('arroz')) return '🍚';
  if (t.includes('chaufa') || t.includes('chauf')) return '🍜';
  if (t.includes('pollo')) return '🍗';
  if (t.includes('carne') || t.includes('res')) return '🥩';
  if (t.includes('cerdo') || t.includes('chancho')) return '🐷';
  if (t.includes('marisc') || t.includes('camarón') || t.includes('camaron')) return '🦐';
  if (t.includes('postre') || t.includes('helado') || t.includes('torta')) return '🍰';
  if (t.includes('combo')) return '🥡';
  if (t.includes('oferta') || t.includes('%') || t.includes('descuento')) return '🏷️';

  // Fallback: intentar mapear por categoría conocida en el texto
  for (const key of Object.keys(categoryEmojis)) {
    if (t.includes(key.toLowerCase())) return categoryEmojis[key];
  }

  return categoryEmojis['Defecto'];
};
