<script setup lang="ts">
import { computed, ref } from "vue";
import { NConfigProvider, NInput, NInputNumber, NModal } from "naive-ui";
import { adminThemeOverrides, useAdminTheme } from "../lib/naive";

const { isDark, nTheme } = useAdminTheme();

interface Note {
  week: number;
  date: string;
  title: string;
  highlights: string[];
  body: string;
}
const props = defineProps<{ notes: Note[]; nextWeek: number; nextMonday: string }>();

const modalOpen = ref(false);
const editing = ref<number | null>(null); // 原 week,null = 新增
const form = ref({ week: 0, date: "", title: "", highlights: "", body: "" });
const msg = ref("");
const msgOk = ref(true);
const armed = ref<number | null>(null);
const saving = ref(false);
let armTimer: ReturnType<typeof setTimeout> | undefined;

const modalTitle = computed(() => (editing.value ? `编辑周记 · 第 ${editing.value} 周` : "新建周记"));

function openCreate() {
  editing.value = null;
  form.value = { week: props.nextWeek, date: props.nextMonday, title: "", highlights: "", body: "" };
  msg.value = "";
  modalOpen.value = true;
}
function openEdit(n: Note) {
  editing.value = n.week;
  form.value = {
    week: n.week,
    date: n.date,
    title: n.title,
    highlights: n.highlights.join("\n"),
    body: n.body,
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
  const payload = {
    week: Number(form.value.week),
    date: form.value.date,
    title: form.value.title,
    highlights: form.value.highlights,
    body: form.value.body,
  };
  const ok = editing.value
    ? await send("/api/admin/notes", "PUT", { originalWeek: editing.value, ...payload })
    : await send("/api/admin/notes", "POST", payload);
  if (ok) location.reload();
  saving.value = false;
}

/** 两段式删除：第一次点变成「确认删除」，2.5s 后还原 */
function del(week: number) {
  if (armed.value !== week) {
    armed.value = week;
    clearTimeout(armTimer);
    armTimer = setTimeout(() => (armed.value = null), 2500);
    return;
  }
  armed.value = null;
  send(`/api/admin/notes?week=${week}`, "DELETE").then((ok) => ok && location.reload());
}
</script>

<template>
  <n-config-provider :theme="nTheme" :theme-overrides="adminThemeOverrides(isDark)">
    <div class="card">
      <h2>周记列表（{{ props.notes.length }} 篇）</h2>
      <button class="btn" type="button" @click="openCreate">新建周记</button>
      <table style="margin-top: 12px">
        <thead>
          <tr>
            <th style="width: 70px">周次</th>
            <th style="width: 110px">日期</th>
            <th>标题</th>
            <th style="width: 150px">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="n in props.notes" :key="n.week">
            <td>第 {{ n.week }} 周</td>
            <td>{{ n.date }}</td>
            <td>{{ n.title }}</td>
            <td>
              <button class="btn small ghost" type="button" @click="openEdit(n)">编辑</button>
              <button
                class="btn small danger"
                :class="{ armed: armed === n.week }"
                type="button"
                @click="del(n.week)"
              >{{ armed === n.week ? "确认删除" : "删除" }}</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="props.notes.length === 0" class="muted">还没有周记</p>
    </div>

    <n-modal
      v-model:show="modalOpen"
      preset="card"
      :title="modalTitle"
      style="width: 680px; max-width: calc(100vw - 48px)"
      :bordered="false"
      @after-leave="close"
    >
      <label>周次 / 日期（该周周一）</label>
      <div class="row">
        <n-input-number v-model:value="form.week" :min="1" :max="53" style="width: 140px" />
        <input v-model="form.date" type="date" />
      </div>
      <label>标题</label>
      <n-input v-model:value="form.title" placeholder="本周主题一句话" />
      <label>要点（每行一条，展示在时间线上）</label>
      <n-input v-model:value="form.highlights" type="textarea" :rows="3" />
      <label>正文（Markdown）</label>
      <n-input v-model:value="form.body" type="textarea" :rows="9" placeholder="随手记，十分钟以内" />
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
