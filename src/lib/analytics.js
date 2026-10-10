// USER_ACTION: активируйте счётчики в public/site-config.js. Регистрации и отчёты — docs/SETUP.md.
// MPA: каждый HTML загружается отдельно. Один просмотр на загрузку, без дублирования SPA-хитов.
const cfg = () => window.FORGE_CONFIG?.analytics || {}
const validID = id => /^\d+$/.test(String(id || ''))
const ramblerWidgetID = 'forge-rambler-widget'
let initialized = false
const pending = []
export function getConsent() {try{return localStorage.getItem('forge-analytics-consent')}catch{return null}}
export function setConsent(value) {try{localStorage.setItem('forge-analytics-consent',value)}catch{}}
function loadScript(src, id) {
  if(document.getElementById(id))return
  const script=document.createElement('script');script.id=id;script.async=true;script.src=src
  script.onerror=()=>{if(cfg().debug)console.warn('Счётчик недоступен:',id)}
  document.head.append(script)
}
function anonymousID() {
  // Псевдоним браузера, а не человек и не сквозной ID между устройствами.
  try {let id=localStorage.getItem('forge-anonymous-id');if(!id){id=crypto.randomUUID();localStorage.setItem('forge-anonymous-id',id)}return id}catch{return undefined}
}
export function initAnalytics(page) {
  if(initialized||getConsent()!=='accepted')return
  initialized=true
  const c=cfg()
  const id=anonymousID()
  if(c.liveInternet?.enabled){
    // Раздельный код LiveInternet: хит здесь, логотип в общем подвале.
    const pixel=new Image(1,1)
    pixel.src='https://counter.yadro.ru/hit?t44.6;r'+encodeURIComponent(document.referrer)+';s'+screen.width+'*'+screen.height+'*'+(screen.colorDepth||24)+';u'+encodeURIComponent(location.href)+';h'+encodeURIComponent(document.title.substring(0,150))+';'+Math.random()
  }
  if(validID(c.mail?.id)){
    window._tmr=window._tmr||[]
    window._tmr.push({id:c.mail.id,type:'pageView',start:Date.now(),url:location.href,title:document.title,userid:id})
    loadScript('https://top-fwz1.mail.ru/js/code.js','forge-mail-counter')
  }
  if(validID(c.rambler?.id)){
    window._top100q=window._top100q||[]
    window._top100q.push(()=>{
      try{
        // USER_ACTION [RAMBLER]: включите соответствующие расширенные возможности в кабинете.
        window.top100Counter=new window.top100({
          project:c.rambler.id,userId:id,attributes_dataset:['forge-block'],chapters:[page],
          widgetColor: /^[a-f\d]{6}$/i.test(c.rambler.widgetColor || '') ? c.rambler.widgetColor : 'fe9200',
        })
        // Виджет рисует официальный SDK. Его ошибка не должна мешать событиям.
        if(!safeImage(c.rambler.badgeUrl) && document.getElementById(ramblerWidgetID)){
          try{window.top100Counter.drawLogoTo(ramblerWidgetID)}
          catch(e){if(c.debug)console.warn('Виджет Рамблер недоступен',e)}
        }
        // Совместимость с версиями SDK, где ещё доступен sendCustomVars.
        try{window.top100Counter.sendCustomVars?.({page_group:page})}catch{}
        pending.splice(0).forEach(event=>window.top100Counter.trackEvent(event.name,event.params))
      }catch(e){if(c.debug)console.warn('Ошибка инициализации Рамблер',e)}
    })
    loadScript('https://st.top100.ru/top100/top100.js','forge-rambler-counter')
  }
}
export function track(name, input = {}) {
  if(getConsent()!=='accepted')return
  // Белый список исключает случайную передачу имени, телефона, email и комментария.
  const params=Object.fromEntries(['build','category','channel','value'].filter(key=>input[key]!==undefined).map(key=>[key,input[key]]))
  const c=cfg()
  if(c.debug)console.info('[FORGE analytics]',name,params)
  if(validID(c.mail?.id)){
    window._tmr=window._tmr||[]
    window._tmr.push({id:c.mail.id,type:'sendEvent',category:'forge',action:name,label:params.build||params.category||params.channel||'',value:1})
    if(['config_selected','order_created'].includes(name))window._tmr.push({id:c.mail.id,type:'reachGoal',goal:name,value:params.value||1})
  }
  if(validID(c.rambler?.id)){
    if(window.top100Counter){try{window.top100Counter.trackEvent(name,params)}catch(e){if(c.debug)console.warn('Событие Рамблер не отправлено',e)}}
    else if(pending.length<100)pending.push({name,params})
  }
}
const safeImage = value => {try{const u=new URL(value);return u.protocol==='https:'?u.href:''}catch{return ''}}
export function badges() {
  const c=cfg()
  let site=''
  try{site=new URL(window.FORGE_CONFIG?.siteUrl||location.href).hostname}catch{}
  return [
    {name:'LiveInternet',enabled:!!c.liveInternet?.enabled,href:safeImage(c.liveInternet?.statUrl)||'https://www.liveinternet.ru/stat/'+encodeURIComponent(site)+'/',src:'https://counter.yadro.ru/logo?'+(/^\d+\.\d+$/.test(c.liveInternet?.badgeStyle||'')?c.liveInternet.badgeStyle:'11.6')},
    {name:'Рамблер/Топ-100',widget:!safeImage(c.rambler?.badgeUrl),enabled:validID(c.rambler?.id),href:'https://top100.rambler.ru/'+(validID(c.rambler?.id)?'navi/'+c.rambler.id+'/':''),src:safeImage(c.rambler?.badgeUrl)},
    {name:'Рейтинг Mail.ru',enabled:validID(c.mail?.id),href:'https://top.mail.ru/'+(validID(c.mail?.id)?'jump?from='+c.mail.id:''),src:safeImage(c.mail?.badgeUrl)},
  ]
}
