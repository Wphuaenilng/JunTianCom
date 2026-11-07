<script setup lang="ts">
import { ref } from "vue";

interface Note {
  week: number;
  date: string;
  title: string;
  highlights: string[];
  body: string;
}
const props = defineProps<{ notes: Note[]; nextWeek: number; nextMonday: string }>();

const creating = ref(false);
const editing = ref<number | null>(null);
const form = ref({ week: 0, date: "", title: "", highlights: "", body: "" });
const msg = ref("");
const msgOk = ref(true);

function blank() {
  return { week: props.nextWeek, date: props.nextMonday, title: "", highlights: "", body: "" };
}
function startCreate() {
  creating.value = true;
  editing.value = null;
  form.value = blank();
}
function startEdit(n: Note) {
  creating.value = false;
  editing.value = n.week;
  form.value = {
    week: n.week,
    date: n.date,
    title: n.title,
    highlights: n.highlights.join("\n"),
    body: n.body,
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
}

async function del(week: number) {
  if (!confirm(`删除第 ${week} 周周记？`)) return;
  if (await send(`/api/admin/notes?week=${week}`, "DELETE")) location.reload();
}
</script>

<template>
  <div v-if="creating || editing" class="card">
    <h2>{{ editing ? `编辑第 ${editing} 周` : "新建周记" }}</h2>
    <div class="row">
      <div style="width: 110px">
        <label>周次</label>
        <input v-model.number="form.week" type="number" min="1" max="53" />
      </div>
      <div style="flex: 1">
        <label>日期（该周周一）</label>
        <input v-model="form.date" type="date" />
      </div>
    </div>
    <label>标题</label>
    <input v-model="form.title" placeholder="本周主题一句话" />
    <label>要点（每行一条，展示在时间线上）</label>
    <textarea v-model="form.highlights" rows="3"></textarea>
    <label>正文（Markdown）</label>
    <textarea v-model="form.body" rows="10" placeholder="随手记，十分钟以内"></textarea>
    <p>
      <button class="btn" type="button" @click="save">保存</button>
      <button class="btn ghost" type="button" @click="cancel">取消</button>
    </p>
  </div>

  <div class="card">
    <h2>周记列表（{{ props.notes.length }} 篇）</h2>
    <button v-if="!creating && !editing" class="btn" type="button" @click="startCreate">新建周记</button>
    <table style="margin-top: 10px">
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
            <button class="btn small ghost" type="button" @click="startEdit(n)">编辑</button>
            <button class="btn small danger" type="button" @click="del(n.week)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-if="props.notes.length === 0" class="muted">还没有周记</p>
  </div>

  <p class="msg" :class="{ show: msg, ok: msgOk, err: !msgOk }">{{ msg }}</p>
</template>
