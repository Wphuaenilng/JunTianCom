<script setup lang="ts">
/**
 * 导航右侧交互岛：主题色色板 + 明暗切换 + 移动端抽屉
 * （替代原 AccentPicker.astro / ThemeToggle.astro / 移动端菜单脚本）
 */
import { onBeforeUnmount, onMounted, ref } from "vue";
import { Check, Menu, Moon, Orbit, Palette, Sun, X } from "lucide-vue-next";
import { ACCENTS, DEFAULT_ACCENT, SITE } from "../../data/site";
import { useTheme } from "./useTheme";

interface NavItem {
  text: string;
  href: string;
}

const props = defineProps<{
  nav: NavItem[];
  path: string;
}>();

const { theme, accent, applyTheme, applyAccent, withReveal } = useTheme();
const popWrap = ref<HTMLElement | null>(null);
const popOpen = ref(false);

/* ---------- 主题色色板 ---------- */
function syncActiveClasses() {
  // 水合后以 html 上的实际状态为准（SSR 阶段无法读取 localStorage，
  // 勾选态会停留在默认项，需要强制同步一次）
  for (const opt of popWrap.value?.querySelectorAll<HTMLElement>(
    ".accent-opt",
  ) ?? []) {
    const active = opt.dataset.accentId === accent.value;
    opt.classList.toggle("active", active);
    opt.setAttribute("aria-checked", active ? "true" : "false");
  }
}

function pickAccent(id: string, origin: HTMLElement) {
  if (id !== accent.value) {
    withReveal(origin, () => applyAccent(id));
  }
  popOpen.value = false;
}

function onDocClick(e: MouseEvent) {
  if (!popOpen.value) return;
  const t = e.target as Node;
  if (!popWrap.value?.contains(t)) popOpen.value = false;
}

/* ---------- 明暗切换 ---------- */
function toggleTheme(e: MouseEvent) {
  const next: Theme = theme.value === "dark" ? "light" : "dark";
  withReveal(e.currentTarget as HTMLElement, () => applyTheme(next));
}

/* ---------- 移动端抽屉 ---------- */
const drawerOpen = ref(false);

const isActive = (href: string) => {
  const path = props.path.replace(/\/$/, "") || "/";
  return href === "/" ? path === "/" : path === href || path.startsWith(href + "/");
};

function onKeydown(e: KeyboardEvent) {
  if (e.key !== "Escape") return;
  popOpen.value = false;
  drawerOpen.value = false;
}

onMounted(() => {
  // 以 html 上的实际主题状态为准（SSR 渲染的勾选态是默认值）
  accent.value = document.documentElement.dataset.accent || DEFAULT_ACCENT;
  theme.value =
    (document.documentElement.dataset.theme as Theme | undefined) ?? "dark";
  syncActiveClasses();
  document.addEventListener("click", onDocClick);
  document.addEventListener("keydown", onKeydown);
});
onBeforeUnmount(() => {
  document.removeEventListener("click", onDocClick);
  document.removeEventListener("keydown", onKeydown);
});
</script>

<template>
  <div ref="popWrap" class="accent-wrap">
    <button
      class="ic"
      :aria-expanded="popOpen"
      aria-label="切换主题色"
      title="主题色"
      @click="popOpen = !popOpen"
    >
      <Palette :size="17" />
    </button>
    <div v-show="popOpen" class="accent-pop" role="menu" aria-label="选择主题色">
      <button
        v-for="a in ACCENTS"
        :key="a.id"
        type="button"
        class="accent-opt"
        :class="{ active: a.id === (accent || DEFAULT_ACCENT) }"
        role="menuitemradio"
        :aria-checked="a.id === (accent || DEFAULT_ACCENT)"
        :data-accent-id="a.id"
        @click="pickAccent(a.id, $event.currentTarget as HTMLElement)"
      >
        <span class="dot" :style="{ background: a.preview }" />
        {{ a.name }}
        <Check :size="14" class="tick" />
      </button>
    </div>
  </div>

  <button
    class="ic theme-ic"
    aria-label="切换明暗主题"
    title="明 / 暗主题切换"
    @click="toggleTheme"
  >
    <span class="ic-moon"><Moon :size="17" /></span>
    <span class="ic-sun"><Sun :size="17" /></span>
  </button>

  <button
    class="ic menu-btn"
    aria-label="打开菜单"
    :aria-expanded="drawerOpen"
    @click="drawerOpen = !drawerOpen"
  >
    <Menu :size="17" />
  </button>

  <div
    class="drawer-backdrop"
    :class="{ open: drawerOpen }"
    aria-hidden="true"
    @click="drawerOpen = false"
  />
  <aside
    class="mobile-menu"
    :class="{ open: drawerOpen }"
    :aria-hidden="!drawerOpen"
    aria-label="移动端导航"
  >
    <div class="drawer-head">
      <span class="logo" style="font-size: 15px">
        <span class="mark"><Orbit :size="15" /></span>
        <span>{{ SITE.name }}</span>
      </span>
      <button class="ic" aria-label="关闭菜单" @click="drawerOpen = false">
        <X :size="17" />
      </button>
    </div>
    <nav class="drawer-links">
      <a
        v-for="item in nav"
        :key="item.href"
        :href="item.href"
        :class="{ active: isActive(item.href) }"
      >
        {{ item.text }}
      </a>
    </nav>
    <a class="btn primary" href="/about/#coop">联系我</a>
  </aside>
</template>
