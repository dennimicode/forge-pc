<script setup>
import { useId } from 'vue'
defineProps({ color: { default: '#fd742c' }, white: Boolean, compact: Boolean })
const id = 'pc' + useId().replaceAll(':', '')
</script>
<template>
  <svg class="pc-visual" viewBox="0 0 560 570" role="img" aria-label="Иллюстрация компьютера FORGE с прозрачной боковой панелью" :style="{ '--fan': color }">
    <defs>
      <linearGradient :id="id+'body'" x1="0" y1="0" x2="1" y2="1"><stop :stop-color="white ? '#e1e2e4' : '#35363b'"/><stop offset="1" :stop-color="white ? '#8b8d93' : '#0e0f12'"/></linearGradient>
      <linearGradient :id="id+'glass'" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#454a52" stop-opacity=".42"/><stop offset=".45" stop-color="#13151a" stop-opacity=".2"/><stop offset="1" stop-color="#545963" stop-opacity=".35"/></linearGradient>
      <radialGradient :id="id+'ring'"><stop offset=".58" stop-color="#111318"/><stop offset=".7" :stop-color="color" stop-opacity=".3"/><stop offset=".81" :stop-color="color"/><stop offset=".9" :stop-color="color" stop-opacity=".8"/><stop offset="1" :stop-color="color" stop-opacity="0"/></radialGradient>
      <radialGradient :id="id+'ground'"><stop :stop-color="color" stop-opacity=".2"/><stop offset="1" :stop-color="color" stop-opacity="0"/></radialGradient>
      <pattern :id="id+'mesh'" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".8" fill="#7e8189" opacity=".32"/></pattern>
    </defs>
    <ellipse cx="288" cy="501" rx="230" ry="52" :fill="`url(#${id}ground)`"/>
    <path d="M121 468l-5 27 32 8 9-27m241-12-3 28 28-11 1-27" fill="#090a0c" stroke="#34363a"/>
    <path d="M119 119L328 64 447 113 242 170Z" :fill="`url(#${id}body)`" stroke="#656770" stroke-width="1.2"/>
    <path d="M119 119L242 170 242 500 119 451Z" fill="#15161b" stroke="#45474f"/>
    <path d="M242 170L447 113 447 447 242 500Z" :fill="`url(#${id}body)`" stroke="#54565e"/>
    <g transform="matrix(1,-.27,0,1,255,181)">
      <rect x="0" y="0" width="176" height="294" rx="3" fill="#0b0d11"/>
      <rect x="9" y="12" width="104" height="192" rx="2" fill="#22262c" stroke="#474b52"/>
      <path d="M19 34h85M19 45h67M20 152h81M25 17v167M96 18v169" stroke="#3d424b" stroke-width="2"/>
      <rect x="77" y="49" width="8" height="76" rx="2" :fill="color" opacity=".9"/>
      <rect x="90" y="49" width="8" height="76" rx="2" :fill="color" opacity=".65"/>
      <circle cx="45" cy="83" r="29" fill="#111317" stroke="#62646c" stroke-width="3"/>
      <circle cx="45" cy="83" r="23" :fill="`url(#${id}ring)`"/>
      <text x="45" y="87" text-anchor="middle" font-size="9" fill="#dedee3" font-family="monospace">F</text>
      <path d="M34 57C20 1 132 1 131 60M54 59C48 22 119 18 123 65" fill="none" stroke="#12151a" stroke-width="8"/>
      <rect x="10" y="161" width="154" height="34" rx="5" fill="#393d45" stroke="#62656f"/>
      <rect x="14" y="167" width="144" height="5" :fill="color"/>
      <text x="88" y="187" text-anchor="middle" font-size="9" fill="#dadce1" font-family="monospace">GEFORCE RTX</text>
      <path d="M129 195v39h-28v20" stroke="#373b44" stroke-width="7" fill="none"/>
      <rect x="0" y="243" width="176" height="51" fill="#24272d"/>
      <text x="18" y="276" font-size="13" letter-spacing="4" fill="#666a75" font-family="sans-serif" font-weight="bold">FORGE</text>
      <g v-for="y in [46,112,213]" :key="y" :transform="`translate(143 ${y})`"><circle r="28" :fill="`url(#${id}ring)`"/><circle r="8" fill="#2e323b"/><path d="M0-20C17-19 21-3 5-1M18 10C10 25-6 21-3 5M-18 10C-29-4-16-18-4-4" :fill="color" opacity=".18"/></g>
    </g>
    <path d="M250 177l187-51v310l-187 51Z" :fill="`url(#${id}glass)`" stroke="#6a6d76" stroke-opacity=".55"/>
    <path d="M255 178l177-48-168 347Z" fill="#c5d2e6" opacity=".035"/>
    <g transform="matrix(1,.41,0,1,127,137)">
      <rect width="105" height="301" :fill="`url(#${id}mesh)`"/>
      <g v-for="y in [58,144,230]" :key="y" :transform="`translate(52 ${y})`"><circle r="39" :fill="`url(#${id}ring)`"/><circle r="12" fill="#272a30"/><path d="M0-28C24-27 29-5 7-2M25 14C14 34-8 29-4 7M-25 14C-40-6-22-25-6-6" :fill="color" opacity=".24"/></g>
      <text x="52" y="292" text-anchor="middle" fill="#9b9ca3" font-size="9" letter-spacing="3" font-family="sans-serif">FORGE</text>
    </g>
    <path d="M145 117l153-40 74 30-152 41Z" :fill="`url(#${id}mesh)`"/>
    <circle cx="397" cy="118" r="4" :fill="color"/><path d="M374 119l11-3m-25 7 8-2" stroke="#999da5" stroke-width="3"/>
    <g fill="#7a7e87"><circle cx="250" cy="181" r="2"/><circle cx="436" cy="130" r="2"/><circle cx="250" cy="481" r="2"/><circle cx="436" cy="434" r="2"/></g>
  </svg>
</template>
