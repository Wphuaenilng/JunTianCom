<script setup lang="ts">
/**
 * Hero 编辑器卡：3D 反转 + 打字机
 * - 每次加载：正面自动逐字打出（带闪烁光标）；
 * - 鼠标移入 → 翻到背面并逐字打出 learning.config.ts；
 * - 移出 → 翻回正面并逐字重打；
 * - prefers-reduced-motion / 无 JS：直接展示完整内容。
 */
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

type Face = "front" | "back";

/** streak / week 由首页传入（构建期从真实打卡与周记数据计算） */
const props = withDefaults(
  defineProps<{ streak?: number; week?: number }>(),
  { streak: 0, week: 0 },
);

const SNIPPETS = computed<Record<Face, { file: string; code: string }>>(() => ({
  front: {
    file: "studio.config.ts",
    code: `// 把每一次学习，都沉淀为可见的产出
const studio = {
  name: "星屿工作室",
  focus: ["AI 应用", "效率工具"],
  openSource: true,
  shipping: true,
};`,
  },
  back: {
    file: "learning.config.ts",
    code: `// 学以致用，用输出倒逼输入
const learning = {
  tracks: ["Agent / RAG", "Rust", "雅思 7.0"],
  streak: ${props.streak},
  weekly: "第 ${props.week} 周周记已发布",
};

learning.ship(); // 🚀`,
  },
}));

const flipped = ref(false);
const typingFace = ref<Face | null>(null);
const typed = ref<Record<Face, string>>({ front: "", back: "" });

/** 交互代际号：移出/再次移入会使进行中的打字作废 */
let runId = 0;
const timers: ReturnType<typeof setTimeout>[] = [];

const sleep = (ms: number, gen: number) =>
  new Promise<void>((resolve) => {
    const t = setTimeout(() => resolve(), ms);
    timers.push(t);
    void gen;
  });

const stale = (gen: number) => gen !== runId;

const prefersReduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

async function typeInto(face: Face, gen: number) {
  const code = SNIPPETS.value[face].code;
  typingFace.value = face;
  typed.value[face] = "";
  for (let i = 1; i <= code.length; i++) {
    if (stale(gen)) return;
    typed.value[face] = code.slice(0, i);
    await sleep(18 + Math.random() * 26, gen);
    if (stale(gen)) return;
  }
}

const flipEvent = () =>
  document.dispatchEvent(new CustomEvent("editor:flip"));

async function onEnter() {
  if (prefersReduced()) return;
  const gen = ++runId;
  flipped.value = true;
  flipEvent();
  await sleep(350, gen); // 等翻面过半再开始打字
  if (stale(gen)) return;
  await typeInto("back", gen);
}

async function onLeave() {
  if (prefersReduced()) return;
  const gen = ++runId;
  flipped.value = false;
  flipEvent();
  await sleep(350, gen); // 等翻回正面过半后，正面也逐字打出
  if (stale(gen)) return;
  await typeInto("front", gen);
}

onMounted(() => {
  // 每次加载：正面自动打字；reduced-motion 直接展示完整内容
  if (prefersReduced()) {
    typed.value.front = SNIPPETS.value.front.code;
    typed.value.back = SNIPPETS.value.back.code;
    return;
  }
  const gen = ++runId;
  (async () => {
    await sleep(350, gen);
    if (stale(gen)) return;
    await typeInto("front", gen);
  })();
});

onBeforeUnmount(() => {
  runId++;
  timers.forEach(clearTimeout);
});
</script>

<template>
  <div
    class="editor editor-flip"
    :class="{ 'editor-flipped': flipped }"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
  >
    <div class="editor-flip-inner">
      <div class="editor-face editor-face-front">
        <div class="ed-bar">
          <i></i><i></i><i></i>
          <span class="fname">{{ SNIPPETS.front.file }}</span>
        </div>
        <pre>{{ typed.front }}<span
            v-if="typingFace === 'front'"
            class="type-cursor"
          /></pre>
      </div>
      <div class="editor-face editor-face-back" aria-hidden="true">
        <div class="ed-bar">
          <i></i><i></i><i></i>
          <span class="fname">{{ SNIPPETS.back.file }}</span>
        </div>
        <pre>{{ typed.back }}<span
            v-if="typingFace === 'back'"
            class="type-cursor"
          /></pre>
      </div>
    </div>
  </div>
</template>
