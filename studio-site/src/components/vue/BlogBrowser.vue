<script setup lang="ts">
/**
 * 博客交互岛：搜索 + 分类筛选 + 置顶精选卡 + 文章列表
 * 服务端渲染完整列表（SEO 友好），水合后接管筛选交互。
 * （替代原 blog/index.astro 的原生过滤脚本）
 */
import { computed, ref } from "vue";
import {
  Calendar,
  ChevronRight,
  Clock,
  Database,
  FileText,
  LayoutTemplate,
  Network,
  PenLine,
  Search,
  Workflow,
  Cpu,
} from "lucide-vue-next";
import type { Component } from "vue";

export interface PostLite {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  date: string;
  minutes: number;
  pinned?: boolean;
  cover?: string;
  icon?: string;
}

const props = defineProps<{
  posts: PostLite[];
  featured: PostLite;
  categories: string[];
}>();

const activeCategory = ref("全部");
const query = ref("");

const visible = computed(() =>
  props.posts.filter((p) => {
    const okCat =
      activeCategory.value === "全部" || p.category === activeCategory.value;
    const q = query.value.trim().toLowerCase();
    const okSearch =
      !q ||
      [p.title, p.description, p.category, ...p.tags]
        .join(" ")
        .toLowerCase()
        .includes(q);
    return okCat && okSearch;
  }),
);

const featuredVisible = computed(() => {
  const f = props.featured;
  const q = query.value.trim().toLowerCase();
  const okCat =
    activeCategory.value === "全部" || f.category === activeCategory.value;
  const okSearch =
    !q ||
    [f.title, f.description, f.category, ...f.tags]
      .join(" ")
      .toLowerCase()
      .includes(q);
  return okCat && okSearch;
});

const iconMap: Record<string, Component> = {
  "file-text": FileText,
  database: Database,
  "layout-template": LayoutTemplate,
  workflow: Workflow,
  "pen-line": PenLine,
  network: Network,
  cpu: Cpu,
};
const iconOf = (name?: string): Component => iconMap[name ?? ""] ?? FileText;
</script>

<template>
  <div>
    <div class="search" id="search">
      <Search :size="15" />
      <input
        v-model="query"
        type="text"
        placeholder="搜索文章，如 RAG、部署、Astro…"
        aria-label="搜索文章"
      />
    </div>

    <div class="filter" role="group" aria-label="分类筛选">
      <button
        v-for="c in categories"
        :key="c"
        type="button"
        class="pill"
        :class="{ active: c === activeCategory }"
        @click="activeCategory = c"
      >
        {{ c }}
      </button>
    </div>

    <a
      v-if="featuredVisible"
      class="feature"
      :href="`/blog/${featured.id}/`"
      :data-category="featured.category"
    >
      <div class="fcov" :style="{ background: featured.cover }">
        <span class="big-ic">
          <component :is="iconOf(featured.icon)" :size="30" />
        </span>
      </div>
      <div class="fbody">
        <div class="top">
          <span class="tag hot">{{ featured.category }}</span>
          <span class="pin">{{ featured.pinned ? "精选 · 置顶" : "最新" }}</span>
        </div>
        <h3>{{ featured.title }}</h3>
        <p>{{ featured.description }}</p>
        <div class="bottom">
          <span><Calendar :size="13" />{{ featured.date }}</span>
          <span><Clock :size="13" />{{ featured.minutes }} 分钟</span>
        </div>
      </div>
    </a>

    <div class="post-list">
      <article
        v-for="p in visible"
        :key="p.id"
        class="post-card"
        :data-category="p.category"
      >
        <div class="top">
          <span v-for="t in p.tags.slice(0, 3)" :key="t" class="tag">{{ t }}</span>
        </div>
        <h3><a :href="`/blog/${p.id}/`">{{ p.title }}</a></h3>
        <p>{{ p.description }}</p>
        <div class="bottom">
          <span><Calendar :size="13" />{{ p.date }}</span>
          <span><Clock :size="13" />{{ p.minutes }} 分钟</span>
          <span class="go">阅读 <ChevronRight :size="13" /></span>
        </div>
      </article>
    </div>
  </div>
</template>
