<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{ entries: { date: string; topics: string[] }[] }>();

const today = new Date().toLocaleDateString("sv-SE");
const addDate = ref(today);
const addTopics = ref("");
const editing = ref<string | null>(null);
const editDate = ref("");
const editTopics = ref("");
const msg = ref("");
const msgOk = ref(true);
const armed = ref<string | null>(null);
const saving = ref(false);
let armTimer: ReturnType<typeof setTimeout> | undefined;

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

async function add() {
  const topics = addTopics.value.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  if (!addDate.value || topics.length === 0) {
    msg.value = "请填写日期和至少一个主题";
    msgOk.value = false;
    return;
  }
  saving.value = true;
  if (await send("/api/admin/checkins", "POST", { date: addDate.value, topics })) {
    location.reload();
  }
  saving.value = false;
}

function startEdit(date: string, topics: string[]) {
  editing.value = date;
  editDate.value = date;
  editTopics.value = topics.join("\n");
  msg.value = "";
}

async function saveEdit() {
  const topics = editTopics.value.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  if (topics.length === 0) {
    msg.value = "至少一个主题";
    msgOk.value = false;
    return;
  }
  saving.value = true;
  if (await send("/api/admin/checkins", "PUT", { originalDate: editing.value, date: editDate.value, topics })) {
    location.reload();
  }
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
  <div class="card">
    <h2>新增 / 合并打卡</h2>
    <div class="field-row">
      <div style="width: 190px; flex-shrink: 0">
        <label>日期</label>
        <input v-model="addDate" type="date" />
        <button
          class="btn"
          type="button"
          :disabled="saving"
          style="width: 100%; margin-top: 10px"
          @click="add"
        >{{ saving ? "保存中…" : "保存" }}</button>
      </div>
      <div class="flex-1">
        <label>主题（每行一个 · 同日自动合并）</label>
        <textarea v-model="addTopics" rows="4" placeholder="Rust 所有权&#10;Agent 编排"></textarea>
      </div>
    </div>
  </div>

  <div class="card">
    <h2>全部记录（{{ props.entries.length }} 天）</h2>
    <table>
      <thead>
        <tr>
          <th style="width: 130px">日期</th>
          <th>主题</th>
          <th style="width: 150px">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="e in props.entries" :key="e.date">
          <template v-if="editing === e.date">
            <td><input v-model="editDate" type="date" /></td>
            <td><textarea v-model="editTopics" rows="3"></textarea></td>
            <td>
              <button class="btn small" type="button" @click="saveEdit">保存</button>
              <button class="btn small ghost" type="button" @click="editing = null">取消</button>
            </td>
          </template>
          <template v-else>
            <td>{{ e.date }}</td>
            <td><span v-for="t in e.topics" :key="t" class="tag">{{ t }}</span></td>
            <td>
              <button class="btn small ghost" type="button" @click="startEdit(e.date, e.topics)">编辑</button>
              <button
                class="btn small danger"
                :class="{ armed: armed === e.date }"
                type="button"
                @click="del(e.date)"
              >{{ armed === e.date ? "确认删除" : "删除" }}</button>
            </td>
          </template>
        </tr>
      </tbody>
    </table>
    <p v-if="props.entries.length === 0" class="muted">还没有打卡记录</p>
  </div>

  <p class="msg" :class="{ show: msg, ok: msgOk, err: !msgOk }">{{ msg }}</p>
</template>
