<script setup>
import PcVisual from './PcVisual.vue'
import { money } from '../lib/catalog'
defineProps({ product: Object })
</script>
<template>
  <article class="product-card" :data-forge-block="'catalog::'+product.id">
    <div class="product-art" :style="{'--accent':product.color}"><span class="micro">{{ product.tag }}</span><span class="art-word" aria-hidden="true">{{ product.name }}</span><PcVisual :color="product.color"/><span class="art-index">F / {{ product.id.toUpperCase() }}</span></div>
    <div class="product-info"><div class="product-heading"><h3>FORGE {{ product.name }}</h3><span class="tiny-tag">{{ product.category === 'game' ? 'GAMING' : 'WORK' }}</span></div><p>{{ product.description }}</p>
      <dl class="specs"><div><dt>Процессор</dt><dd>{{ product.cpu }}</dd></div><div><dt>Видеокарта</dt><dd>{{ product.gpu }}</dd></div><div><dt>Память / SSD</dt><dd>{{ product.ram }} / {{ product.ssd }}</dd></div></dl>
      <div class="product-bottom"><strong>{{ money(product.price) }}</strong><a class="square-button" :href="'./configurator.html?build='+product.id" :aria-label="'Настроить FORGE '+product.name">↗</a></div>
    </div>
  </article>
</template>
