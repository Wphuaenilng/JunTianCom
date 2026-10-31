<script setup lang="ts">
/**
 * CTA 带背景：改编自 Inspira UI 的 AuroraBackground
 * （unovue/inspira-ui，MIT）——去掉整页 main/h-screen 结构，
 * 色彩改用站点设计令牌（跟随主题色切换），作为绝对定位层使用。
 */
</script>

<template>
  <div class="aurora-cta" aria-hidden="true">
    <div class="aurora-layer" />
  </div>
</template>

<style scoped>
.aurora-cta {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}
.aurora-layer {
  position: absolute;
  inset: -10px;
  --aurora: repeating-linear-gradient(
    100deg,
    var(--primary) 10%,
    var(--cyan) 15%,
    color-mix(in srgb, var(--cyan) 45%, #fff) 20%,
    var(--purple) 25%,
    var(--primary) 30%
  );
  --dark-gradient: repeating-linear-gradient(
    100deg,
    #000 0%,
    #000 7%,
    transparent 10%,
    transparent 12%,
    #000 16%
  );
  background-image: var(--dark-gradient), var(--aurora);
  background-size: 200%, 100%;
  background-position: 50% 50%;
  opacity: 0.5;
  filter: blur(10px);
  animation: aurora-move 60s linear infinite;
  will-change: background-position;
}
@keyframes aurora-move {
  from {
    background-position: 50% 50%, 50% 50%;
  }
  to {
    background-position: 350% 50%, 10% 50%;
  }
}
@media (prefers-reduced-motion: reduce) {
  .aurora-layer {
    animation: none;
  }
}
</style>
