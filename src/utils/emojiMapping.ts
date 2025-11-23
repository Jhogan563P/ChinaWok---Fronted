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
