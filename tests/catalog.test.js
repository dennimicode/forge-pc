import test from 'node:test'
import assert from 'node:assert/strict'
// Node 22+: JSON импорт с атрибутом; рабочая библиотека используется Vite.
import catalog from '../src/data/catalog.json' with { type: 'json' }
test('Все комбинации имеют известные AM5-сборки и положительную цену', () => {
  assert.equal(new Set(catalog.products.map(p=>p.id)).size,4)
  for(const p of catalog.products) for(const ram of catalog.upgrades.ram) for(const ssd of catalog.upgrades.ssd) for(const body of catalog.upgrades.case) {
    assert.match(p.board,/AM5/)
    assert.ok(p.price+ram.price+ssd.price+body.price>=p.price)
  }
})
test('Стоимость выбранной DAILY с тремя улучшениями равна 149900',()=>{
 const p=catalog.products.find(p=>p.id==='daily')
 assert.equal(p.price+catalog.upgrades.ram[1].price+catalog.upgrades.ssd[1].price+catalog.upgrades.case[1].price,149900)
})
