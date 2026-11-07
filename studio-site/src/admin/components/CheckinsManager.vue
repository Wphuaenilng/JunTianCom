<script setup lang="ts">
import { computed, ref } from "vue";
import { NConfigProvider, NModal, NInput } from "naive-ui";
import { adminThemeOverrides, useAdminTheme } from "../lib/naive";

const { isDark, nTheme } = useAdminTheme();

const props = defineProps<{ entries: { date: string; topics: string[] }[] }>();

const today = new Date().toLocaleDateString("sv-SE");
const modalOpen = ref(false);
const editing = ref<string | null>(null); // 原日期,null = 新增
const form = ref({ date: today, topics: "" });
const msg = ref("");
const msgOk = ref(true);
const armed = ref<string | null>(null);
const saving = ref(false);
let armTimer: ReturnType<typeof setTimeout> | undefined;

const modalTitle = computed(() => (editing.value ? `编辑打卡 · ${editing.value}` : "新增打卡"));

function openCreate() {
  editing.value = null;
  form.value = { date: today, topics: "" };
  msg.value = "";
  modalOpen.value = true;
}
function openEdit(date: string, topics: string[]) {
  editing.value = date;
  form.value = { date, topics: topics.join("\n") };
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
  const topics = form.value.topics.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  if (!form.value.date || topics.length === 0) {
    msg.value = "请填写日期和至少一个主题";
    msgOk.value = false;
    return;
  }
  saving.value = true;
  const ok = editing.value
    ? await send("/api/admin/checkins", "PUT", { originalDate: editing.value, date: form.value.date, topics })
    : await send("/api/admin/checkins", "POST", { date: form.value.date, topics });
  if (ok) location.reload();
  saving.value = false;
}

/** 两段式删除：第一次点变成「确认删除」并脉动提醒，2.5s 后还原 */
function del(date: string) {
  if (armed.value !== date) {
    armed.value = date;
    clearTimeout(armTimer);
    armTimer = setTimeout(() => (armed.value = null), 2500);
    return;
  }
  armed.value = null;
  send(`/api/admin/checkins?date=${encodeURIComponent(date)}`, "DELETE").then(
    (ok) => ok && location.reload(),
  );
}
</script>

<template>
  <n-config-provider :theme="nTheme" :theme-overrides="adminThemeOverrides(isDark)">
    <div class="card">
      <h2>全部记录（{{ props.entries.length }} 天）</h2>
      <button class="btn" type="button" @click="openCreate">新增打卡</button>
      <table style="margin-top: 12px">
        <thead>
          <tr>
            <th style="width: 130px">日期</th>
            <th>主题</th>
            <th style="width: 150px">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in props.entries" :key="e.date">
            <td>{{ e.date }}</td>
            <td><span v-for="t in e.topics" :key="t" class="tag">{{ t }}</span></td>
            <td>
              <button class="btn small ghost" type="button" @click="openEdit(e.date, e.topics)">编辑</button>
              <button
                class="btn small danger"
                :class="{ armed: armed === e.date }"
                type="button"
                @click="del(e.date)"
              >{{ armed === e.date ? "确认删除" : "删除" }}</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="props.entries.length === 0" class="muted">还没有打卡记录</p>
    </div>

    <n-modal
      v-model:show="modalOpen"
      preset="card"
      :title="modalTitle"
      style="width: 640px; max-width: calc(100vw - 48px)"
      :bordered="false"
      @after-leave="close"
    >
      <div class="field-row">
        <div style="width: 190px; flex-shrink: 0">
          <label>日期</label>
          <input v-model="form.date" type="date" />
        </div>
        <div class="flex-1">
          <label>主题（每行一个 · 同日自动合并）</label>
          <n-input
            v-model:value="form.topics"
            type="textarea"
            :rows="4"
            placeholder="Rust 所有权&#10;Agent 编排"
          />
        </div>
      </div>
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
