import { products, upgrades, configuration, money } from './catalog.js'

const key = 'forge-demo-order-v1'
const clean = (value, max) => typeof value === 'string' ? value.trim().slice(0, max) : ''

// Учебная форма целиком выполняется в браузере. Здесь нет сетевой отправки.
export function createOrder(input, metadata = {}) {
  if (input.website) throw new Error('Проверьте поля заявки.')
  const name = clean(input.name, 80)
  const email = clean(input.email, 160)
  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Укажите имя и корректный тестовый email.')
  if (input.consent !== true) throw new Error('Подтвердите локальное сохранение учебной заявки.')
  const selected = input.configuration || {}
  if (!products.some(p => p.id === selected.product) || !Object.entries(upgrades).every(([k, options]) => options.some(o => o.id === selected[k]))) throw new Error('Выберите доступную комплектацию.')
  const build = configuration(selected)
  return {
    version: 1,
    id: metadata.id || 'FG-DEMO-' + crypto.randomUUID(),
    createdAt: metadata.createdAt || new Date().toISOString(),
    status: 'local_demo',
    notice: 'Учебная заявка. Создана в браузере, владельцу сайта не отправлена. Оплата и реальный заказ не оформлены.',
    configuration: {product: build.product.id, ...Object.fromEntries(Object.entries(build.selected).map(([k, v]) => [k, v.id]))},
    name, email, phone: clean(input.phone, 32), comment: clean(input.comment, 2000), consent: true,
    estimatedTotal: build.total,
  }
}

export function saveOrder(order, storage = localStorage) {
  // Сохраняется только последняя отправленная пользователем форма, не черновики.
  storage.setItem(key, JSON.stringify(order))
}

export function readOrder(storage) {
  try {
    storage ||= globalThis.localStorage
    const row = JSON.parse(storage.getItem(key) || 'null')
    if (!row || row.version !== 1 || row.status !== 'local_demo' || !/^FG-DEMO-[\da-f-]{36}$/.test(row.id) || !Number.isFinite(Date.parse(row.createdAt))) return null
    return createOrder(row, {id: row.id, createdAt: row.createdAt})
  } catch { return null }
}

export function removeOrder(storage = localStorage) { storage.removeItem(key) }

export function orderText(order) {
  const build = configuration(order.configuration)
  return [
    'FORGE — УЧЕБНАЯ ЗАЯВКА', order.id,
    'Создана: ' + new Date(order.createdAt).toLocaleString('ru-RU'),
    order.notice, '', 'Комплектация: FORGE ' + build.product.name,
    build.product.cpu, build.product.gpu,
    ...Object.values(build.selected).map(v => v.label),
    'Предварительная стоимость: ' + money(order.estimatedTotal), '',
    'Имя: ' + order.name, 'Email: ' + order.email,
    'Телефон: ' + (order.phone || 'не указан'),
    'Комментарий: ' + (order.comment || 'нет'),
  ].join('\n')
}
