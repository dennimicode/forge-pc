<script setup>
import { computed, ref, watch, onMounted, nextTick } from 'vue'
import PcVisual from './components/PcVisual.vue'
import ProductCard from './components/ProductCard.vue'
import { products, upgrades, configuration, money } from './lib/catalog'
import { createOrder, saveOrder, readOrder, removeOrder, orderText } from './lib/orders'
import { initAnalytics, track, badges, getConsent, setConsent } from './lib/analytics'

const settings = window.FORGE_CONFIG || {}
const company = settings.company || {}
const page = location.pathname.split('/').pop()?.replace('.html', '') || 'index'
const links = [{id:'index',name:'Главная'}, {id:'catalog',name:'Готовые ПК'}, {id:'configurator',name:'Конфигуратор'}, {id:'service',name:'Сервис'}, {id:'contacts',name:'Контакты'}]
const menu = ref(false)
const filter = ref('all')
const budget = ref('all')
const visibleProducts = computed(() => products.filter(p => (filter.value==='all'||p.category===filter.value)&&(budget.value==='all'||p.price<=Number(budget.value))))
let saved = {}
try { saved = JSON.parse(sessionStorage.getItem('forge-build') || '{}') } catch {}
const requested = new URLSearchParams(location.search).get('build')
const selection = ref({product:products.some(p=>p.id===requested)?requested:(saved.product || 'core'),ram:saved.ram||'32',ssd:saved.ssd||'1',case:saved.case||'black'})
const build = computed(() => configuration(selection.value))
const form = ref({name:'',email:'',phone:'',comment:'',consent:false,website:''})
const savedOrder = ref(readOrder())
const persisted = ref(Boolean(savedOrder.value))
const orderCopied = ref(false)
const result = ref(null)
const error = ref('')
const privacy = ref(false)
const privacyPanel = ref(null)
let previousFocus
watch(privacy, async opened => {
  if(opened){previousFocus=document.activeElement;await nextTick();privacyPanel.value?.focus();document.body.style.overflow='hidden'}
  else{document.body.style.overflow='';previousFocus?.focus()}
})
function dialogKeys(event){
  if(event.key==='Escape'){privacy.value=false;return}
  if(event.key!=='Tab')return
  const items=privacyPanel.value?.querySelectorAll('button,a,input,[tabindex="0"]')
  if(!items?.length)return
  if(event.shiftKey&&(document.activeElement===items[0]||document.activeElement===privacyPanel.value)){event.preventDefault();items[items.length-1].focus()}
  else if(!event.shiftKey&&(document.activeElement===items[items.length-1]||document.activeElement===privacyPanel.value)){event.preventDefault();items[0].focus()}
}
const cookieChoice = ref(getConsent())
const showCookies = ref(!cookieChoice.value)
const copied = ref(false)
let formStarted = false
watch(selection, () => { result.value=null; try {sessionStorage.setItem('forge-build',JSON.stringify(selection.value))}catch{}; track('configuration_changed', {build:build.value.product.id}) }, {deep:true})
function acceptCookies(value) { setConsent(value); cookieChoice.value=value; showCookies.value=false; if(value==='accepted') initAnalytics(page); else location.reload() }
function toForm() { track('config_selected',{build:build.value.product.id,value:build.value.total}); document.getElementById('order-form').scrollIntoView({behavior:'smooth'}); setTimeout(()=>document.getElementById('customer-name')?.focus({preventScroll:true}),400) }
function startForm() {if(!formStarted){formStarted=true;track('form_started',{build:build.value.product.id})}}
function payload() {return {configuration:{product:build.value.product.id,...Object.fromEntries(Object.entries(build.value.selected).map(([k,v])=>[k,v.id]))},name:form.value.name.trim(),email:form.value.email.trim(),phone:form.value.phone.trim(),comment:form.value.comment.trim(),consent:form.value.consent,website:form.value.website}}
function submitOrder() {
  error.value='';result.value=null
  try {
    const order=createOrder(payload())
    savedOrder.value=order
    try {saveOrder(order);persisted.value=true}
    catch {persisted.value=false}
    result.value=true
    track('order_created',{build:order.configuration.product,value:order.estimatedTotal})
  }catch(e){error.value=e.message}
}
function exportOrder(format) {
  if(!savedOrder.value)return
  const order=savedOrder.value
  const content=format==='json'?JSON.stringify(order,null,2):orderText(order)
  const url=URL.createObjectURL(new Blob([content],{type:format==='json'?'application/json':'text/plain;charset=utf-8'}))
  const a=document.createElement('a');a.href=url;a.download=order.id+'.'+format;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)
  track('request_exported',{build:order.configuration.product})
}
async function copyOrder() {
  try {await navigator.clipboard.writeText(orderText(savedOrder.value));orderCopied.value=true;setTimeout(()=>orderCopied.value=false,2500)}
  catch {error.value='Копирование недоступно. Скачай заявку в TXT.'}
}
function deleteOrder() {
  try {removeOrder();savedOrder.value=null;persisted.value=false;result.value=null;form.value={name:'',email:'',phone:'',comment:'',consent:false,website:''};error.value=''}
  catch {error.value='Браузер не разрешил удалить сохранённые данные. Удали данные сайта в настройках браузера.'}
}
async function copyBuild(){
 const text=`FORGE ${build.value.product.name}\n${build.value.product.cpu}\n${build.value.product.gpu}\n${Object.values(build.value.selected).map(v=>v.label).join(' / ')}\nОриентировочно: ${money(build.value.total)}`
 try{await navigator.clipboard.writeText(text);copied.value=true;setTimeout(()=>copied.value=false,2500)}catch{error.value='Браузер не разрешил копирование. Комплектацию можно скачать вместе с заявкой.'}
}
onMounted(()=>{if(cookieChoice.value==='accepted')initAnalytics(page)})
</script>

<template>
  <a class="skip-link" href="#main">Перейти к содержимому</a>
  <header class="site-header" :inert="privacy"><div class="container header-inner">
    <a href="./index.html" class="brand" aria-label="FORGE — главная"><svg viewBox="0 0 32 36" aria-hidden="true"><path d="M0 0h32l-6 10H10v5h15l-6 10h-9v11H0Z" fill="currentColor"/></svg><span>FORGE<span class="brand-dot">®</span></span></a>
    <button class="menu-toggle" @click="menu=!menu" :aria-expanded="menu" aria-controls="navigation">{{menu?'Закрыть ✕':'Меню ☰'}}</button>
    <nav id="navigation" :class="{open:menu}" aria-label="Основная навигация"><a v-for="link in links" :key="link.id" :href="'./'+link.id+'.html'" :class="{active:page===link.id}" :aria-current="page===link.id?'page':undefined">{{link.name}}</a></nav>
    <a class="header-cta" href="./configurator.html">Собрать свой ПК <span>↗</span></a>
  </div></header>
  <main id="main" :inert="privacy">
    <template v-if="page==='index'">
      <section class="hero container" data-forge-block="home::hero">
        <div class="hero-content"><p class="eyebrow"><span class="status-dot"></span> ИНЖЕНЕРИЯ ТВОИХ ВОЗМОЖНОСТЕЙ</p><h1>ТВОЙ МИР.<br>ТВОИ ПРАВИЛА.<br><span>ТВОЙ ПК.</span></h1><p class="hero-description">Для побед, больших идей и новых миров.<br>Соберём компьютер, который подходит тебе.</p><div class="hero-actions"><a class="button primary" href="./catalog.html">Выбрать готовый ПК <span>↗</span></a><a class="text-link" href="./configurator.html">Собрать свой <span>→</span></a></div><div class="hero-note"><span class="mini-chip">AM5</span><span>Продуманная платформа.<br>Пространство для апгрейда.</span></div></div>
        <div class="hero-art"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><span class="hero-background-word" aria-hidden="true">FORGE</span><span class="art-coordinate top">ASSEMBLED WITH PURPOSE / 01</span><PcVisual/><div class="hero-art-label"><span class="status-dot"></span><div><strong>FORGE CORE</strong><small>МАЛЕНЬКИЙ ШАГ. БОЛЬШИЕ ВОЗМОЖНОСТИ.</small></div><a href="./configurator.html?build=core" aria-label="Настроить FORGE CORE">↗</a></div><span class="art-coordinate bottom">DESIGNED FOR YOUR NEXT LEVEL</span></div>
      </section>
      <div class="principle-strip"><div class="container"><span><b>01</b> Подбор под твои задачи</span><span><b>02</b> Аккуратная сборка</span><span><b>03</b> Проверка под нагрузкой</span><span><b>04</b> Поддержка после покупки</span></div></div>
      <section class="section container" data-forge-block="home::builds"><div class="section-heading"><div><p class="eyebrow">ВЫБЕРИ СВОЙ УРОВЕНЬ</p><h2>Начни с хорошей базы.</h2></div><a class="text-link" href="./catalog.html">Все сборки <span>↗</span></a></div><div class="product-grid home-products"><ProductCard v-for="p in products.slice(0,3)" :key="p.id" :product="p"/></div><p class="fine-print">Учебный каталог. Цены ориентировочные; наличие и стоимость подтверждаются отдельно.</p></section>
      <section class="manifesto container" data-forge-block="home::workshop"><div><p class="eyebrow">БОЛЬШЕ, ЧЕМ КОМПЛЕКТУЮЩИЕ</p><h2>Хороший ПК —<br>это когда всё<br><em>на своём месте.</em></h2></div><div class="manifesto-content"><p>Совместимые детали, свободный поток воздуха и кабели, которые не мешают. Мы начинаем с твоих задач и уделяем внимание тому, что скрыто за боковой панелью.</p><a class="text-link" href="./service.html">Как устроена сборка <span>↗</span></a></div></section>
      <section class="cta-banner container"><div><p class="eyebrow">НЕ НАШЁЛ СВОЮ СБОРКУ?</p><h2>Давай соберём твою.</h2></div><a class="button dark" href="./configurator.html">Открыть конфигуратор <span>↗</span></a></section>
    </template>

    <template v-else-if="page==='catalog'">
      <section class="page-intro container"><p class="breadcrumb"><a href="./index.html">Главная</a> / Готовые ПК</p><p class="eyebrow">ЧЕТЫРЕ ХАРАКТЕРА. ОДИН ПОДХОД.</p><h1>ВЫБЕРИ СВОЮ<br><span>ТОЧКУ СТАРТА.</span></h1><p>Сбалансированные комплектации для игр и работы.<br>Любую сборку можно настроить под себя.</p></section>
      <section class="container catalog-section"><div class="catalog-toolbar"><div class="filter-tabs" aria-label="Назначение компьютера"><button v-for="f in [{id:'all',label:'Все сборки'},{id:'game',label:'Для игр'},{id:'work',label:'Для работы'}]" :key="f.id" @click="filter=f.id;track('catalog_filter',{category:f.id})" :aria-pressed="filter===f.id" :class="{selected:filter===f.id}">{{f.label}}</button></div><label class="budget-label">Бюджет <select v-model="budget"><option value="all">Любой</option><option value="130000">До 130 000 ₽</option><option value="180000">До 180 000 ₽</option></select></label></div><p class="results-count" aria-live="polite">Сборок: {{visibleProducts.length}}</p><div class="product-grid catalog-grid"><ProductCard v-for="p in visibleProducts" :key="p.id" :product="p"/></div><div v-if="!visibleProducts.length" class="empty-state"><h2>Под эту комбинацию пока нет сборок.</h2><button class="button secondary" @click="filter='all';budget='all'">Сбросить фильтры</button></div><p class="fine-print">Цены и комплектации — примеры для учебного проекта. Это предварительная оценка, а не предложение о покупке. Точные модели компонентов, совместимость, наличие и итоговую цену подтверждает мастерская.</p></section>
      <section class="cta-banner container"><div><p class="eyebrow">БОЛЬШЕ ПАМЯТИ? ДРУГОЙ ЦВЕТ?</p><h2>Сделай его своим.</h2></div><a class="button dark" href="./configurator.html">Настроить комплектацию <span>↗</span></a></section>
    </template>

    <template v-else-if="page==='configurator'">
      <section class="page-intro container compact-intro"><p class="breadcrumb"><a href="./index.html">Главная</a> / Конфигуратор</p><p class="eyebrow">ТВОЙ ПК НАЧИНАЕТСЯ ЗДЕСЬ</p><h1>СОБЕРИ <span>ПОД СЕБЯ.</span></h1><p>Выбери основу, добавь нужное и создай учебную заявку.</p></section>
      <section class="config-layout container" data-forge-block="configurator::builder"><div class="config-controls"><div class="step-title"><span>01</span><h2>Основа сборки</h2></div><div class="base-options"><button v-for="p in products" :key="p.id" @click="selection.product=p.id" :class="{selected:build.product.id===p.id}" :aria-pressed="build.product.id===p.id"><span><strong>{{p.name}}</strong><small>{{p.category==='game'?'Для игр':'Для работы'}}</small></span><span>{{money(p.price)}} <i>{{build.product.id===p.id?'●':'○'}}</i></span></button></div><dl class="config-specs"><div><dt>Процессор</dt><dd>{{build.product.cpu}}</dd></div><div><dt>Видеокарта</dt><dd>{{build.product.gpu}}</dd></div><div><dt>Плата / питание</dt><dd>{{build.product.board}} / {{build.product.psu}}</dd></div></dl>
        <div class="step-title"><span>02</span><h2>Больше возможностей</h2></div><fieldset v-for="(options,key) in upgrades" :key="key" class="upgrade-group"><legend>{{{ram:'Оперативная память',ssd:'Накопитель',case:'Цвет корпуса'}[key]}}</legend><div><label v-for="option in options" :key="option.id" :class="{selected:build.selected[key].id===option.id}"><input type="radio" :name="key" :value="option.id" v-model="selection[key]"><span>{{option.label}}<small>{{option.price?'+'+money(option.price):'Включено'}}</small></span></label></div></fieldset>
      </div><aside class="build-summary"><div class="summary-art"><span class="micro">YOUR NEXT LEVEL</span><PcVisual :color="build.product.color" :white="build.selected.case.id==='white'"/></div><div class="summary-content"><p class="eyebrow">ТВОЯ КОМПЛЕКТАЦИЯ</p><h2>FORGE {{build.product.name}}</h2><p>{{build.selected.ram.label}} · {{build.selected.ssd.label}}<br>{{build.selected.case.label}}</p><div class="summary-price"><span>Предварительная стоимость</span><strong>{{money(build.total)}}</strong></div><button class="button primary" @click="toForm">К оформлению заявки <span>↘</span></button><button class="copy-button" @click="copyBuild">{{copied?'✓ Комплектация скопирована':'⧉ Скопировать комплектацию'}}</button><p class="fine-print">Итоговую цену и точные модели подтвердим после проверки наличия. Оплата на сайте не требуется.</p></div></aside></section>
      <section class="order-section container" id="order-form" data-forge-block="configurator::order"><div class="order-intro"><p class="eyebrow">ПОСЛЕДНИЙ ШАГ</p><h2>Сохраним <br>твою сборку.</h2><p>Попробуй оформление заказа с тестовыми контактами. Готовую заявку можно сохранить себе или скачать файлом.</p><div class="order-steps"><span><b>01</b> Выбираешь комплектацию</span><span><b>02</b> Создаёшь учебную заявку</span><span><b>03</b> Скачиваешь результат</span></div></div>
        <form class="order-form" @submit.prevent="submitOrder" @focusin="startForm">
          <div class="demo-notice"><strong>Учебный заказ · без отправки</strong><span>Заявка остаётся в этом браузере. Владелец сайта её не получает. Введи тестовые контакты — оплата и реальный заказ не оформляются.</span></div>
          <div class="form-grid"><label>Как тебя зовут <input id="customer-name" v-model="form.name" required minlength="2" maxlength="80" autocomplete="off" placeholder="Александр"></label><label>Тестовый email <input v-model="form.email" required type="email" maxlength="160" autocomplete="off" placeholder="demo@example.com"></label><label class="full-width">Телефон <span class="optional">необязательно</span><input v-model="form.phone" type="tel" maxlength="32" autocomplete="off" placeholder="+7 900 000-00-00"></label><label class="full-width">Для чего нужен компьютер? <span class="optional">необязательно</span><textarea v-model="form.comment" maxlength="2000" rows="4" placeholder="Любимые игры, рабочие программы, пожелания к сборке…"></textarea></label></div>
          <label class="honeypot" aria-hidden="true">Сайт<input v-model="form.website" tabindex="-1" autocomplete="off"></label>
          <label class="checkbox-label"><input type="checkbox" v-model="form.consent" required><span>Разрешаю сохранить учебную заявку в этом браузере. Новая заменит предыдущую. <button type="button" class="inline-link" @click="privacy=true">Подробнее</button></span></label>
          <div class="form-total"><span>FORGE {{build.product.name}}</span><strong>{{money(build.total)}}</strong></div>
          <button class="button primary full-width">Создать учебную заявку <span>↗</span></button>
          <p v-if="error" class="form-error" role="alert">{{error}}</p>
          <div v-if="result" class="form-success" role="status"><strong>{{persisted?'Заявка сохранена в этом браузере.':'Заявка создана для скачивания.'}}</strong><p>{{persisted?'Она доступна ниже и после перезагрузки страницы.':'Браузер запретил локальное хранилище. Скачай файл до закрытия страницы.'}} Владельцу сайта ничего не отправлено.</p></div>
          <section v-if="savedOrder" class="saved-order" aria-labelledby="saved-order-title">
            <p class="eyebrow">{{persisted?'ПОСЛЕДНЯЯ СОХРАНЁННАЯ ЗАЯВКА':'ЗАЯВКА В ЭТОЙ ВКЛАДКЕ'}}</p>
            <h3 id="saved-order-title">FORGE {{configuration(savedOrder.configuration).product.name}}</h3>
            <p class="order-reference">{{savedOrder.id}}</p>
            <p>{{new Date(savedOrder.createdAt).toLocaleString('ru-RU')}} · {{money(savedOrder.estimatedTotal)}}</p>
            <p>{{Object.values(configuration(savedOrder.configuration).selected).map(v=>v.label).join(' · ')}}</p>
            <p class="fine-print">Учебная заявка, без отправки и оплаты. Скачанные файлы содержат введённые контакты.</p>
            <div class="saved-actions"><button type="button" class="button secondary" @click="exportOrder('txt')">Скачать TXT ↓</button><button type="button" class="button secondary" @click="exportOrder('json')">Скачать JSON ↓</button></div>
            <div class="saved-actions"><button type="button" class="inline-link" @click="copyOrder">{{orderCopied?'✓ Текст скопирован':'Скопировать текст'}}</button><button type="button" class="inline-link delete-order" @click="deleteOrder">Удалить заявку</button></div>
          </section>
        </form>
      </section>
    </template>

    <template v-else-if="page==='service'">
      <section class="page-intro container"><p class="breadcrumb"><a href="./index.html">Главная</a> / Сервис</p><p class="eyebrow">ВНИМАНИЕ К КАЖДОЙ ДЕТАЛИ</p><h1>СОБИРАЕМ ПК.<br><span>ПРОДУМЫВАЕМ ВСЁ.</span></h1><p>Красиво внутри. Стабильно в работе.<br>Понятно на каждом этапе.</p></section>
      <section class="service-feature container"><div class="service-visual"><span class="micro">THE DETAILS MAKE THE DIFFERENCE</span><PcVisual color="#91dfcb"/><span class="service-stamp">CHECK.<br>BUILD.<br>TEST.</span></div><div class="service-copy"><p class="eyebrow">ПОДХОД FORGE</p><h2>Не просто<br>закрутить винты.</h2><p>Хорошая сборка начинается до первого винта. Проверяем платформу, питание, размеры компонентов и возможности охлаждения.</p><p>После сборки — настройка, проверка температур и нагрузочные тесты. Перед передачей обсуждаем результаты и рекомендации по уходу.</p><a href="./configurator.html" class="text-link">Подобрать комплектацию <span>↗</span></a></div></section>
      <section class="section container"><div class="section-heading"><div><p class="eyebrow">ОТ ИДЕИ ДО ПЕРВОГО ЗАПУСКА</p><h2>Прозрачный процесс.</h2></div></div><div class="process-grid"><article v-for="(item,i) in [{title:'Знакомство',text:'Разбираемся в задачах, программах, играх и бюджете. Обсуждаем важное для тебя.'},{title:'Подбор',text:'Проверяем совместимость и наличие. Фиксируем состав, цену и сроки до начала сборки.'},{title:'Сборка и тесты',text:'Собираем, укладываем кабели и проверяем работу системы под нагрузкой.'},{title:'Передача',text:'Показываем готовую систему, результаты проверки и объясняем дальнейший уход.'}]" :key="i"><span class="process-number">0{{i+1}}</span><h3>{{item.title}}</h3><p>{{item.text}}</p></article></div></section>
      <section class="faq-section container"><div><p class="eyebrow">ПЕРЕД ЗАКАЗОМ</p><h2>Есть вопросы?</h2><p>Начнём с самых частых.</p></div><div class="faq-list"><details v-for="item in [{q:'Можно изменить готовую сборку?',a:'Да. В конфигураторе можно выбрать объём памяти, накопитель и цвет корпуса. Другие пожелания оставь в комментарии к заявке — мастерская проверит совместимость и стоимость.'},{q:'Какие сроки сборки?',a:'Срок зависит от наличия деталей и очереди заказов. Его согласуют до начала работы. Учебный сайт не отображает реальные складские остатки.'},{q:'Можно привезти свои комплектующие?',a:'Укажи модели и состояние деталей в заявке. Возможность использования и стоимость работ обсуждаются после проверки.'},{q:'Как устроена гарантия?',a:'Сроки и условия гарантии на комплектующие и работы фиксируются при согласовании заказа. До коммерческого запуска владелец должен опубликовать реальные условия.'},{q:'Как получить готовый компьютер?',a:'Самовывоз или доставка согласуются с мастерской. Доступные города, стоимость упаковки и перевозки уточняются до оплаты.'}]" :key="item.q"><summary>{{item.q}}<span>+</span></summary><p>{{item.a}}</p></details></div></section>
      <section class="cta-banner container"><div><p class="eyebrow">ОСТАЛОСЬ ВЫБРАТЬ НАПРАВЛЕНИЕ</p><h2>Начнём с твоих задач.</h2></div><a class="button dark" href="./configurator.html#order-form">Обсудить сборку <span>↗</span></a></section>
    </template>

    <template v-else>
      <section class="page-intro container"><p class="breadcrumb"><a href="./index.html">Главная</a> / Контакты</p><p class="eyebrow">ЧЕЛОВЕК ПО ТУ СТОРОНУ ЭКРАНА</p><h1>НА СВЯЗИ.<br><span>НА ТВОЕЙ СТОРОНЕ.</span></h1><p>Поможем разобраться в комплектующих<br>и найти твою конфигурацию.</p></section>
      <section class="contact-layout container"><div class="contact-main"><p class="eyebrow">ДАВАЙ ЗНАКОМИТЬСЯ</p><h2>Твоя идея.<br>Наше внимание<br>к деталям.</h2><p>Расскажи, что хочешь делать за новым компьютером. С конкретным списком деталей или пока только с идеей — начнём с любого этапа.</p><a class="button primary" href="./configurator.html#order-form">Оставить заявку <span>↗</span></a></div><div class="contact-details"><div><span class="micro">01 / НАПИСАТЬ</span><a v-if="company.email" :href="'mailto:'+company.email" @click="track('contact_click',{channel:'email'})">{{company.email}} ↗</a><p v-else>Почта будет указана<br>после запуска мастерской.</p></div><div><span class="micro">02 / ПОЗВОНИТЬ</span><a v-if="company.phone" :href="'tel:'+company.phone.replace(/[^+\d]/g,'')" @click="track('contact_click',{channel:'phone'})">{{company.phone}} ↗</a><p v-else>Телефон пока не опубликован.</p><small>{{company.hours}}</small></div><div><span class="micro">03 / ЗАЙТИ В ГОСТИ</span><p>{{company.address||'Адрес мастерской будет опубликован здесь.'}}</p><small>Визит — по предварительной договорённости.</small></div></div></section>
      <section class="contact-note container"><span class="status-dot"></span><p>FORGE — самостоятельный учебный концепт мастерской ПК. Контакты, наличие, цены и условия обслуживания требуют заполнения владельцем перед реальным запуском.</p></section>
    </template>
  </main>
  <footer class="site-footer" :inert="privacy"><div class="container footer-main"><div><a class="brand" href="./index.html"><svg viewBox="0 0 32 36" aria-hidden="true"><path d="M0 0h32l-6 10H10v5h15l-6 10h-9v11H0Z" fill="currentColor"/></svg><span>FORGE<span class="brand-dot">®</span></span></a><p>Собрано с вниманием.<br>Создано для тебя.</p></div><nav aria-label="Навигация в подвале"><a v-for="link in links.slice(1)" :key="link.id" :href="'./'+link.id+'.html'">{{link.name}}</a></nav><div class="footer-right"><span class="micro">ТВОЙ СЛЕДУЮЩИЙ УРОВЕНЬ</span><a class="footer-arrow" href="./configurator.html" aria-label="Перейти в конфигуратор">↗</a></div></div><div class="container footer-bottom"><p>© {{new Date().getFullYear()}} FORGE. Учебный проект.</p><div><button @click="privacy=true">О данных</button><button @click="showCookies=true">Настройки аналитики</button></div><div class="counter-badges" aria-label="Счётчики статистики"><template v-for="badge in badges()" :key="badge.name"><a v-if="cookieChoice==='accepted'&&badge.enabled" :href="badge.href" target="_blank" rel="noopener noreferrer" :title="badge.name"><img v-if="badge.src" :src="badge.src" :alt="badge.name" width="88" height="31"><span v-else>{{badge.name}} ↗</span></a><span v-else class="counter-placeholder" :title="badge.enabled?'Аналитика отключена посетителем':'Счётчик ещё не настроен'">{{badge.name}} <i>○</i></span></template></div></div></footer>
  <div v-if="showCookies" :inert="privacy" class="cookie-banner" role="region" aria-label="Настройки аналитики"><div><strong>Немного данных, чтобы стать лучше.</strong><p>С вашего согласия используем LiveInternet, Рамблер/Топ-100 и Mail.ru для анализа посещений. Контакты из заявки в счётчики не передаём. <button class="inline-link" @click="privacy=true">Подробнее</button></p></div><div class="cookie-actions"><button class="button secondary" @click="acceptCookies('declined')">Без аналитики</button><button class="button primary" @click="acceptCookies('accepted')">Разрешить</button></div></div>
  <div v-if="privacy" class="modal-backdrop" @click.self="privacy=false"><section ref="privacyPanel" class="privacy-modal" role="dialog" aria-modal="true" aria-labelledby="privacy-title" tabindex="-1" @keydown="dialogKeys"><button class="modal-close" aria-label="Закрыть" @click="privacy=false">✕</button><p class="eyebrow">ПРОЗРАЧНО О ДАННЫХ</p><h2 id="privacy-title">Твои данные.</h2><p>Это учебная форма: используй тестовые имя, email, телефон и комментарий. Последняя созданная заявка хранится локально в браузере до удаления или замены новой. На сервер и почту она не отправляется. Скачать TXT или JSON можно только по твоему нажатию; файл содержит введённые контакты.</p><p>Удалить заявку можно кнопкой «Удалить заявку» под формой или очистив данные сайта в браузере. Скачанные файлы удаляются отдельно с устройства. Если хранилище недоступно, заявка существует только до закрытия страницы. Выбор комплектации хранится в текущей сессии браузера. Решение об аналитике хранится локально, чтобы не спрашивать его при каждом переходе.</p><p>При разрешении аналитики подключаются настроенные счётчики LiveInternet, Рамблер/Топ-100 и Mail.ru. Они могут получать адрес страницы, источник перехода, технические параметры браузера и обезличенные события. Имя, email, телефон и комментарий в события не включаются.</p><p>Отключить дальнейший сбор можно в «Настройках аналитики» внизу страницы. Уже собранные данные и cookies поставщиков управляются по правилам сервисов; для удаления cookies используйте настройки браузера.</p><p class="fine-print">Заявки доступны только в браузере, где они созданы. У владельца сайта нет общего списка заказов. Аналитика получает только события и технические параметры, без контактов из формы.</p><button class="button primary" @click="privacy=false">Понятно</button></section></div>
</template>
