// lib/resolve-price.js
// Единственное место, где живёт логика расчёта цены услуги под модель устройства.
// Используется и калькулятором, и любым UI "цена для моей модели" на странице услуги.

/**
 * @param {{modelId: string|{toString(): string}}[]|undefined} priceVariants
 * @param {string} modelId
 */
function findVariant(priceVariants, modelId) {
  if (!priceVariants || !modelId) return undefined;
  return priceVariants.find((v) => String(v.modelId) === String(modelId));
}

/**
 * Резолвит цену услуги для конкретных бренда и модели устройства.
 *
 * @param {{price?: string, basePrice?: number, priceVariants?: {modelId: any, price: number}[]}} service
 * @param {{multiplier?: number}} [brand]
 * @param {{gen?: number}} [model]
 * @returns {{type: 'exact', price: number} | {type: 'estimate', price: number} | {type: 'display', price: string}}
 */
export function resolvePrice(service, brand, model) {
  const variant = findVariant(service?.priceVariants, model?._id ?? model?.id);
  if (variant) {
    return { type: 'exact', price: variant.price };
  }

  if (typeof service?.basePrice === 'number') {
    const multiplier = brand?.multiplier ?? 1;
    const gen = model?.gen ?? 1;
    return { type: 'estimate', price: Math.round(service.basePrice * multiplier * gen) };
  }

  return { type: 'display', price: service?.price ?? 'Уточняйте' };
}
