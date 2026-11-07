<script setup lang="ts">
import { ref } from "vue";

interface Product {
  slug: string;
  name: string;
  tagline: string;
  cover: string;
  icon: string;
  status: string;
  stack: string[];
  metrics: string[];
  site: string;
  repo: string;
  order: number;
  body: string;
}
const props = defineProps<{ products: Product[] }>();

const creating = ref(false);
const editing = ref<string | null>(null);
const msg = ref("");
const msgOk = ref(true);
const armed = ref<string | null>(null);
const saving = ref(false);
let armTimer: ReturnType<typeof setTimeout> | undefined;
const form = ref(blank());

function blank() {
  return {
    originalSlug: "",
    slug: "",
    name: "",
    tagline: "",
    cover: "primary",
    icon: "box",
    status: "building",
    stack: "",
    metrics: "",
    site: "",
    repo: "",
    order: 99,
    body: "## 它解决什么问题\n\n- ",
  };
}
function startCreate() {
  creating.value = true;
  editing.value = null;
  form.value = blank();
  window.scrollTo({ top: 0 });
}
function startEdit(p: Product) {
  creating.value = false;
  editing.value = p.slug;
  form.value = {
    originalSlug: p.slug,
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    cover: p.cover,
    icon: p.icon,
    status: p.status,
    stack: p.stack.join("\n"),
    metrics: p.metrics.join("\n"),
    site: p.site,
    repo: p.repo,
    order: p.order,
    body: p.body,
  };
  window.scrollTo({ top: 0 });
}
function cancel() {
  creating.value = false;
  editing.value = null;
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
  const ok = editing.value
    ? await send("/api/admin/products", "PUT", form.value)
    : await send("/api/admin/products", "POST", form.value);
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
  send(`/api/admin/products?slug=${encodeURIComponent(slug)}`, "DELETE").then(
    (ok) => ok && location.reload(),
  );
}
</script>

<template>
  <div v-if="creating || editing" class="card">
    <h2>{{ editing ? "编辑产品" : "新建产品" }}</h2>
    <div class="admin-form">
    <div class="row">
      <div style="flex: 1">
        <label>名称</label>
        <input v-model="form.name" />
      </div>
      <div style="width: 200px">
        <label>slug</label>
        <input v-model="form.slug" placeholder="resume-optimizer" />
      </div>
      <div style="width: 130px">
        <label>状态</label>
        <select v-model="form.status">
          <option value="online">online（在线）</option>
          <option value="building">building（开发中）</option>
          <option value="beta">beta（内测）</option>
        </select>
      </div>
    </div>
    <label>一句话简介</label>
    <input v-model="form.tagline" />
    <div class="row">
      <div style="width: 160px">
        <label>封面色</label>
        <input v-model="form.cover" placeholder="primary / violet / cyan / green / slate" />
      </div>
      <div style="width: 160px">
        <label>图标（lucide 名）</label>
        <input v-model="form.icon" placeholder="file-text" />
      </div>
      <div style="width: 120px">
        <label>排序</label>
        <input v-model.number="form.order" type="number" />
      </div>
    </div>
    <div class="row">
      <div style="flex: 1">
        <label>技术栈（每行一个）</label>
        <textarea v-model="form.stack" rows="3"></textarea>
      </div>
      <div style="flex: 1">
        <label>指标（每行一个，如"3.4k 用户"）</label>
        <textarea v-model="form.metrics" rows="3"></textarea>
      </div>
    </div>
    <div class="row">
      <div style="flex: 1">
        <label>线上地址（可选）</label>
        <input v-model="form.site" placeholder="https://..." />
      </div>
      <div style="flex: 1">
        <label>仓库地址（可选）</label>
        <input v-model="form.repo" placeholder="https://github.com/..." />
      </div>
    </div>
    <label>正文（Markdown）</label>
    <textarea v-model="form.body" rows="8"></textarea>
    <p>
      <button class="btn" type="button" :disabled="saving" @click="save">{{ saving ? "保存中…" : "保存" }}</button>
      <button class="btn ghost" type="button" @click="cancel">取消</button>
    </p>
    </div>
  </div>

  <div class="card">
    <h2>产品列表（{{ props.products.length }} 个）</h2>
    <button v-if="!creating && !editing" class="btn" type="button" @click="startCreate">新建产品</button>
    <table style="margin-top: 10px">
      <thead>
        <tr>
          <th>名称</th>
          <th style="width: 100px">状态</th>
          <th style="width: 70px">排序</th>
          <th style="width: 150px">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in props.products" :key="p.slug">
          <td>{{ p.name }}<br /><span class="muted">{{ p.slug }}</span></td>
          <td>
            <span class="badge" :class="p.status === 'online' ? 'green' : p.status === 'beta' ? 'amber' : 'gray'">
              {{ p.status }}
            </span>
          </td>
          <td>{{ p.order }}</td>
          <td>
            <button class="btn small ghost" type="button" @click="startEdit(p)">编辑</button>
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

  <p class="msg" :class="{ show: msg, ok: msgOk, err: !msgOk }">{{ msg }}</p>
</template>
