import catalog from '../data/catalog.json' with { type: 'json' }
export const products = catalog.products
export const upgrades = catalog.upgrades
export const money = value => new Intl.NumberFormat('ru-RU').format(value) + ' ₽'
export function configuration(input = {}) {
  const product = products.find(p => p.id === input.product) || products[0]
  const selected = Object.fromEntries(Object.entries(upgrades).map(([key, options]) => [key, options.find(o => o.id === input[key]) || options[0]]))
  return { product, selected, total: product.price + Object.values(selected).reduce((sum, o) => sum + o.price, 0) }
}
