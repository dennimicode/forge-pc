import test from 'node:test'
import assert from 'node:assert/strict'
const values=new Map()
globalThis.localStorage={getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value)}
globalThis.window={FORGE_CONFIG:{analytics:{mail:{id:'12345'},rambler:{id:'67890'},liveInternet:{enabled:true}}}}
globalThis.location={href:'https://example.com/forge/index.html'}
globalThis.screen={width:1920,height:1080,colorDepth:24}
const widget={id:'forge-rambler-widget'}
const painted=[]
const inserted=[]
globalThis.document={referrer:'',title:'FORGE',getElementById:id=>id===widget.id?widget:inserted.find(s=>s.id===id),createElement:()=>({}),head:{append:script=>inserted.push(script)}}
const pixels=[]
globalThis.Image=class{set src(value){pixels.push(value)}}
const analytics=await import('../src/lib/analytics.js')
test('Без согласия скрипты, хиты и события не отправляются',()=>{
 analytics.initAnalytics('index');analytics.track('order_created',{email:'private@example.com'})
 assert.equal(inserted.length,0);assert.equal(pixels.length,0);assert.equal(window._tmr,undefined)
})
test('После согласия один pageView на страницу; блоки, разделы и официальный виджет настроены',()=>{
 analytics.setConsent('accepted');analytics.initAnalytics('index');analytics.initAnalytics('index')
 assert.equal(inserted.length,2);assert.equal(pixels.length,1)
 assert.equal(window._tmr.filter(e=>e.type==='pageView').length,1)
 let options
 window.top100=class{constructor(o){options=o}drawLogoTo(id){painted.push(id)}trackEvent(){}}
 window._top100q[0]()
 assert.deepEqual(options.attributes_dataset,['forge-block']);assert.deepEqual(options.chapters,['index'])
 assert.equal(options.widgetColor,'fe9200');assert.deepEqual(painted,['forge-rambler-widget'])
 assert.equal(analytics.badges().find(b=>b.name==='Рамблер/Топ-100').widget,true)
})
test('Цели отправляются, персональные данные отбрасываются',()=>{
 const calls=[];window.top100Counter.trackEvent=(name,params)=>calls.push({name,params})
 analytics.track('order_created',{build:'daily',value:149900,email:'private@example.com',name:'Иван',phone:'+79999999999',comment:'secret'})
 assert.deepEqual(calls,[{name:'order_created',params:{build:'daily',value:149900}}])
 const goal=window._tmr.find(e=>e.type==='reachGoal')
 assert.equal(goal.goal,'order_created');assert.equal(goal.value,149900)
 assert.ok(!JSON.stringify(window._tmr).includes('private@example.com'))
})
test('Скачивание не дублирует цель создания учебной заявки',()=>{
 const before=window._tmr.filter(e=>e.type==='reachGoal').length
 analytics.track('request_exported',{build:'daily'})
 assert.equal(window._tmr.filter(e=>e.type==='reachGoal').length,before)
 analytics.setConsent('declined');const count=window._tmr.length;analytics.track('order_created');assert.equal(window._tmr.length,count)
})


test('Ошибка виджета не теряет события, накопленные до загрузки SDK',async()=>{
 analytics.setConsent('accepted');delete window.top100Counter
 const events=[]
 window.top100=class{drawLogoTo(){throw new Error('widget unavailable')}trackEvent(name,params){events.push({name,params})}}
 const fresh=await import('../src/lib/analytics.js?widget-failure')
 fresh.initAnalytics('catalog');fresh.track('config_selected',{build:'core'})
 assert.doesNotThrow(()=>window._top100q.at(-1)())
 assert.deepEqual(events,[{name:'config_selected',params:{build:'core'}}])
})

test('Собственная HTTPS-картинка отключает SDK-виджет; цвет сохраняется',async()=>{
 delete window.top100Counter
 const options=[];let drawings=0
 window.FORGE_CONFIG.analytics.rambler={id:'67890',widgetColor:'000000',badgeUrl:'https://example.com/logo.png'}
 window.top100=class{constructor(o){options.push(o)}drawLogoTo(){drawings++}trackEvent(){}}
 const fresh=await import('../src/lib/analytics.js?custom-widget')
 fresh.initAnalytics('service');window._top100q.at(-1)()
 assert.equal(options[0].widgetColor,'000000');assert.equal(drawings,0)
 assert.equal(fresh.badges().find(b=>b.name==='Рамблер/Топ-100').widget,false)
})
