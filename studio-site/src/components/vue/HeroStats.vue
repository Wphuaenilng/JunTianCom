<script setup lang="ts">
/**
 * Hero 统计数字：Vue Bits CountUp 弹簧滚动
 */
import CountUp from "./bits/CountUp.vue";

interface StatItem {
  value: number;
  label: string;
  decimals?: number;
  suffix?: string;
}

defineProps<{ stats: StatItem[] }>();
</script>

<template>
  <div class="stats">
    <div v-for="s in stats" :key="s.label" class="stat">
      <b>
        <CountUp :to="s.value" :decimals="s.decimals ?? 0" :duration="1.1" /><span
          v-if="s.suffix"
          class="stat-suffix"
        >{{ s.suffix }}</span>
      </b>
      <span>{{ s.label }}</span>
    </div>
  </div>
</template>
