<script setup lang="ts">
/**
 * Hero 背景：Vue Bits ShapeGrid（Canvas 2D 滚动网格）
 * - 对角线慢速滚动（speed 0.4，用户要求频率调慢）；
 * - 网格线用中性半透明色，悬停单元格以主题色填充并带拖尾；
 * - 边缘暗角颜色跟随明暗主题；主题切换发生在 HeaderActions 岛，
 *   这里用 MutationObserver 监听 html 属性变化；
 * - listenOnParent：鼠标事件挂在 hero 区块上（背景层收不到事件）；
 * - prefers-reduced-motion 用户不渲染。
 */
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import ShapeGrid from "./bits/ShapeGrid.vue";
import { ACCENTS, DEFAULT_ACCENT } from "../../data/site";

const theme = ref<"dark" | "light">("dark");
const accent = ref<string>(DEFAULT_ACCENT);
const allowMotion = ref(false);

const readState = () => {
  theme.value =
    (document.documentElement.dataset.theme as "dark" | "light") ?? "dark";
  accent.value = document.documentElement.dataset.accent || DEFAULT_ACCENT;
};

let observer: MutationObserver | null = null;
onMounted(() => {
  allowMotion.value = !window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  readState();
  observer = new MutationObserver(readState);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme", "data-accent"],
  });
});
onBeforeUnmount(() => observer?.disconnect());

const entry = computed(
  () => ACCENTS.find((a) => a.id === accent.value) ?? ACCENTS[0],
);
const hoverFillColor = computed(() =>
  theme.value === "dark" ? entry.value.hexDark : entry.value.hexLight,
);
const borderColor = computed(() =>
  theme.value === "dark"
    ? "rgba(148, 163, 184, 0.28)"
    : "rgba(15, 23, 42, 0.07)"
);
const vignetteColor = computed(() =>
  theme.value === "dark" ? "#0a0e16" : "#f5f7fb",
);
</script>

<template>
  <div class="hero-particles" aria-hidden="true">
    <ShapeGrid
      v-if="allowMotion"
      direction="diagonal"
      :speed="0.4"
      :border-color="borderColor"
      :hover-fill-color="hoverFillColor"
      :square-size="40"
      :hover-trail-amount="10"
      :vignette-color="vignetteColor"
      :listen-on-parent="true"
    />
  </div>
</template>
