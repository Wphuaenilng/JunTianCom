<script setup lang="ts">
import { computed, ref } from "vue";
import { NCheckbox, NConfigProvider, NInput, NModal } from "naive-ui";
import { adminThemeOverrides, useAdminTheme } from "../lib/naive";

const { isDark, nTheme } = useAdminTheme();

interface Post {
  slug: string;
  title: string;
  description: string;
  pubDate: string;
  category: string;
  tags: string[];
  draft: boolean;
  pinned: boolean;
  body: string;
}
const props = defineProps<{ posts: Post[]; today: string }>();

const modalOpen = ref(false);
const editing = ref<string | null>(null); // 原 slug,null = 新增
const msg = ref("");
const msgOk = ref(true);
const armed = ref<string | null>(null);
const saving = ref(false);
let armTimer: ReturnType<typeof setTimeout> | undefined;
const form = ref({
  originalSlug: "",
  slug: "",
  title: "",
  description: "",
  pubDate: props.today,
  category: "随笔",
  tags: "",
  draft: true,
  pinned: false,
  body: "",
});

const modalTitle = computed(() => (editing.value ? "编辑文章" : "新建文章草稿"));

function openCreate() {
  editing.value = null;
  form.value = {
    originalSlug: "",
    slug: "",
    title: "",
    description: "",
    pubDate: props.today,
    category: "随笔",
    tags: "",
    draft: true,
    pinned: false,
    body: "## 问题背景\n\n## 我的方案\n\n## 关键代码 / 步骤\n\n## 踩坑记录\n\n## 总结与改进方向\n",
  };
  msg.value = "";
  modalOpen.value = true;
}
function openEdit(p: Post) {
  editing.value = p.slug;
  form.value = {
    originalSlug: p.slug,
    slug: p.slug,
    title: p.title,
    description: p.description,
    pubDate: p.pubDate,
    category: p.category,
    tags: p.tags.join("\n"),
    draft: p.draft,
    pinned: p.pinned,
    body: p.body,
  };
  msg.value = "";
  modalOpen.value = true;
}
function close() {
  modalOpen.value = false;
  armed.value = null;
}

async function send(url: string, method: string, body?: unknown): Promise<boolean> {
  const res = await fetch(url, {
    method,
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) {
    msg.value = data.error ?? "请求失败";
    msgOk.value = false;
    return false;
  }
  return true;
}

async function save() {
  saving.value = true;
  const payload = { ...form.value, tags: form.value.tags };
  const ok = editing.value
    ? await send("/api/admin/posts", "PUT", payload)
    : await send("/api/admin/posts", "POST", payload);
  if (ok) location.reload();
  saving.value = false;
}

/** 两段式删除：第一次点变成「确认删除」，2.5s 后还原 */
function del(slug: string) {
  if (armed.value !== slug) {
    armed.value = slug;
    clearTimeout(armTimer);
    armTimer = setTimeout(() => (armed.value = null), 2500);
    return;
  }
  armed.value = null;
  send(`/api/admin/posts?slug=${encodeURIComponent(slug)}`, "DELETE").then(
    (ok) => ok && location.reload(),
  );
}
</script>

<template>
  <n-config-provider :theme="nTheme" :theme-overrides="adminThemeOverrides(isDark)">
    <div class="card">
      <h2>文章列表（{{ props.posts.length }} 篇）</h2>
      <button class="btn" type="button" @click="openCreate">新建文章</button>
      <table style="margin-top: 12px">
        <thead>
          <tr>
            <th>标题</th>
            <th style="width: 110px">日期</th>
            <th style="width: 90px">分类</th>
            <th style="width: 130px">状态</th>
            <th style="width: 150px">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in props.posts" :key="p.slug">
            <td>{{ p.title }}<br /><span class="muted">{{ p.slug }}</span></td>
            <td>{{ p.pubDate }}</td>
            <td>{{ p.category }}</td>
            <td>
              <span class="badge" :class="p.draft ? 'gray' : 'green'">{{ p.draft ? "草稿" : "已发布" }}</span>
              <span v-if="p.pinned" class="badge amber" style="margin-left: 4px">置顶</span>
            </td>
            <td>
              <button class="btn small ghost" type="button" @click="openEdit(p)">编辑</button>
              <button
                class="btn small danger"
                :class="{ armed: armed === p.slug }"
                type="button"
                @click="del(p.slug)"
              >{{ armed === p.slug ? "确认删除" : "删除" }}</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <n-modal
      v-model:show="modalOpen"
      preset="card"
      :title="modalTitle"
      style="width: 800px; max-width: calc(100vw - 48px)"
      :bordered="false"
      @after-leave="close"
    >
      <div class="row">
        <div style="flex: 2">
          <label>标题</label>
          <n-input v-model:value="form.title" />
        </div>
        <div style="flex: 1">
          <label>slug（留空自动生成）</label>
          <n-input v-model:value="form.slug" placeholder="rag-accuracy-notes" />
        </div>
      </div>
      <label>描述</label>
      <n-input v-model:value="form.description" placeholder="一句话描述这篇文章解决什么问题" />
      <div class="row">
        <div style="width: 170px">
          <label>发布日期</label>
          <input v-model="form.pubDate" type="date" />
        </div>
        <div style="width: 170px">
          <label>分类</label>
          <n-input v-model:value="form.category" />
        </div>
        <div style="display: flex; align-items: center; gap: 18px; padding-bottom: 8px">
          <n-checkbox v-model:checked="form.draft">草稿（不显示在站点）</n-checkbox>
          <n-checkbox v-model:checked="form.pinned">置顶</n-checkbox>
        </div>
      </div>
      <label>标签（每行一个）</label>
      <n-input v-model:value="form.tags" type="textarea" :rows="2" />
      <label>正文（Markdown）</label>
      <n-input v-model:value="form.body" type="textarea" :rows="14" />
      <p class="msg" :class="{ show: msg, ok: msgOk, err: !msgOk }">{{ msg }}</p>
      <template #footer>
        <div class="row" style="justify-content: flex-end">
          <button class="btn ghost" type="button" @click="close">取消</button>
          <button class="btn" type="button" :disabled="saving" @click="save">{{ saving ? "保存中…" : "保存" }}</button>
        </div>
      </template>
    </n-modal>
  </n-config-provider>
</template>
