import test from 'node:test'
import assert from 'node:assert/strict'
import { createOrder, saveOrder, readOrder, removeOrder, orderText } from '../src/lib/orders.js'

const input = () => ({configuration: {product: 'daily', ram: '64', ssd: '2', case: 'white'}, name: '  Тестовый пользователь  ', email: 'demo@example.com', phone: '', comment: 'Учебный заказ', consent: true})
const memory = () => {const values = new Map(); return {getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key)}}

test('Заявка сохраняется, восстанавливается после перезагрузки и удаляется', () => {
  const storage = memory()
  const order = createOrder(input())
  saveOrder(order, storage)
  assert.deepEqual(readOrder(storage), order)
  assert.equal(order.name, 'Тестовый пользователь')
  assert.equal(order.estimatedTotal, 149900)
  assert.equal(order.status, 'local_demo')
  assert.match(orderText(order), /владельцу сайта не отправлена/)
  assert.match(orderText(order), /149.?900 ₽/)
  removeOrder(storage)
  assert.equal(readOrder(storage), null)
})

test('Сохраняется только последняя заявка; сумма не принимается от формы', () => {
  const storage = memory()
  const first = createOrder(input())
  const second = createOrder({...input(), name: 'Другой пользователь', estimatedTotal: 1})
  saveOrder(first, storage); saveOrder(second, storage)
  assert.notEqual(first.id, second.id)
  assert.equal(readOrder(storage).id, second.id)
  assert.equal(second.estimatedTotal, 149900)
})

test('Неверные контакты, отсутствие согласия и неизвестная конфигурация отклоняются', () => {
  for (const patch of [{name: ' '}, {email: 'broken'}, {consent: false}, {website: 'bot'}, {configuration: {product: 'unknown'}}]) {
    assert.throws(() => createOrder({...input(), ...patch}))
  }
})

test('Повреждённое или недоступное хранилище не ломает чтение; ошибку записи видит интерфейс', () => {
  assert.equal(readOrder({getItem: () => '{broken'}), null)
  assert.equal(readOrder({getItem: () => JSON.stringify({...createOrder(input()), status: 'sent'})}), null)
  const blocked = {getItem: () => {throw new Error('blocked')}, setItem: () => {throw new Error('blocked')}}
  assert.equal(readOrder(blocked), null)
  const order = createOrder(input())
  assert.throws(() => saveOrder(order, blocked), /blocked/)
  assert.match(orderText(order), /demo@example.com/)
})
