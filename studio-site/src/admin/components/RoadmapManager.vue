<script setup lang="ts">
import { computed, ref } from "vue";
import { NCheckbox, NConfigProvider, NInput, NModal, NSelect } from "naive-ui";
import { adminThemeOverrides, useAdminTheme } from "../lib/naive";

const { isDark, nTheme } = useAdminTheme();

interface Milestone {
  text: string;
  done: boolean;
}
interface RoadmapItem {
  title: string;
  icon: string;
  color: string;
  progress: number;
  milestones: Milestone[];
}
interface ReadingItem {
  title: string;
  progress: string;
  icon: string;
  grad: string;
}
const props = defineProps<{ roadmap: RoadmapItem[]; reading: ReadingItem[] }>();

const colorOptions = [
  { label: "primary（主色）", value: "primary" },
  { label: "amber（橙）", value: "amber" },
  { label: "green（绿）", value: "green" },
];
const colorHex: Record<string, string> = {
  primary: "#6d7cff",
  amber: "#fbbf24",
  green: "#34d399",
};

const roadmap = ref<RoadmapItem[]>(JSON.parse(JSON.stringify(props.roadmap)));
const reading = ref<ReadingItem[]>(JSON.parse(JSON.stringify(props.reading)));
const msg = ref("");
const msgOk = ref(true);
const modalOpen = ref(false);
const editingIndex = ref<number | null>(null); // 数组下标,null = 新增
const armed = ref<number | null>(null);
const saving = ref(false);
const savingReading = ref(false);
let armTimer: ReturnType<typeof setTimeout> | undefined;
const form = ref(blankForm());

const modalTitle = computed(() =>
  editingIndex.value === null ? "新增路线" : `编辑路线 · ${form.value.title || "未命名"}`,
);

function blankForm() {
  return { title: "", icon: "flag", color: "primary", progress: 0, milestones: [] as Milestone[] };
}
function openCreate() {
  editingIndex.value = null;
  form.value = blankForm();
  msg.value = "";
  modalOpen.value = true;
}
function openEdit(i: number) {
  editingIndex.value = i;
  form.value = JSON.parse(JSON.stringify(roadmap.value[i]));
  msg.value = "";
  modalOpen.value = true;
}
function close() {
  modalOpen.value = false;
  armed.value = null;
}
function doneCount(item: RoadmapItem) {
  return item.milestones.filter((m) => m.done).length;
}

async function putAll(): Promise<boolean> {
  const res = await fetch("/api/admin/roadmap", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ roadmap: roadmap.value, reading: reading.value }),
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) {
    msg.value = data.error ?? "保存失败";
    msgOk.value = false;
    return false;
  }
  return true;
}

function toast(message: string, ok = true) {
  (window as unknown as { adminToast?: (m: string, t?: "ok" | "err") => void }).adminToast?.(
    message,
    ok ? "ok" : "err",
  );
}

/** 弹窗保存:合并进数组并立即持久化(连同在读书单当前状态) */
async function saveItem() {
  if (!form.value.title.trim()) {
    msg.value = "路线标题必填";
    msgOk.value = false;
    return;
  }
  saving.value = true;
  const item = JSON.parse(JSON.stringify(form.value)) as RoadmapItem;
  if (editingIndex.value === null) roadmap.value.push(item);
  else roadmap.value[editingIndex.value] = item;
  const ok = await putAll();
  if (ok) location.reload();
  saving.value = false;
}

/** 上移/下移:交换后立即持久化 */
async function move(i: number, dir: -1 | 1) {
  const j = i + dir;
  if (j < 0 || j >= roadmap.value.length) return;
  [roadmap.value[i], roadmap.value[j]] = [roadmap.value[j], roadmap.value[i]];
  if (await putAll()) toast("顺序已更新");
}

/** 两段式删除 */
function del(i: number) {
  if (armed.value !== i) {
    armed.value = i;
    clearTimeout(armTimer);
    armTimer = setTimeout(() => (armed.value = null), 2500);
    return;
  }
  armed.value = null;
  roadmap.value.splice(i, 1);
  putAll().then((ok) => ok && location.reload());
}

/** 只保存在读书单的改动 */
async function saveReading() {
  savingReading.value = true;
  const ok = await putAll();
  if (ok) toast("在读书单已保存");
  savingReading.value = false;
}
</script>

<template>
  <n-config-provider :theme="nTheme" :theme-overrides="adminThemeOverrides(isDark)">
    <div class="card">
      <h2>路线列表（{{ roadmap.length }} 条）</h2>
      <button class="btn" type="button" @click="openCreate">新增路线</button>
      <table style="margin-top: 12px">
        <thead>
          <tr>
            <th>路线</th>
            <th style="width: 210px">进度</th>
            <th style="width: 110px">里程碑</th>
            <th style="width: 250px">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in roadmap" :key="i">
            <td>
              <span class="dot" :style="{ background: colorHex[item.color] ?? '#6d7cff' }"></span>
              <b>{{ item.title }}</b>
              <span class="muted" style="margin-left: 8px">{{ item.icon }}</span>
            </td>
            <td>
              <span class="mini-progress"><i :style="{ width: item.progress + '%' }"></i></span>
              <span class="muted" style="margin-left: 8px">{{ item.progress }}%</span>
            </td>
            <td class="muted">{{ doneCount(item) }}/{{ item.milestones.length }} 完成</td>
            <td>
              <button
                class="btn small ghost"
                type="button"
                :disabled="i === 0"
                title="上移"
                @click="move(i, -1)"
              >↑</button>
              <button
                class="btn small ghost"
                type="button"
                :disabled="i === roadmap.length - 1"
                title="下移"
                @click="move(i, 1)"
              >↓</button>
              <button class="btn small ghost" type="button" @click="openEdit(i)">编辑</button>
              <button
                class="btn small danger"
                :class="{ armed: armed === i }"
                type="button"
                @click="del(i)"
              >{{ armed === i ? "确认删除" : "删除" }}</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="roadmap.length === 0" class="muted">还没有路线</p>
    </div>

    <n-modal
      v-model:show="modalOpen"
      preset="card"
      :title="modalTitle"
      style="width: 640px; max-width: calc(100vw - 48px)"
      :bordered="false"
      @after-leave="close"
    >
      <label>路线标题</label>
      <n-input v-model:value="form.title" placeholder="如：大模型应用开发（Agent / RAG）" />
      <div class="row">
        <div style="flex: 1">
          <label>图标（lucide 名）</label>
          <n-input v-model:value="form.icon" placeholder="brain-circuit" />
        </div>
        <div style="width: 200px">
          <label>颜色</label>
          <n-select v-model:value="form.color" :options="colorOptions" />
        </div>
      </div>
      <label>进度：{{ form.progress }}%</label>
      <input v-model.number="form.progress" type="range" min="0" max="100" step="5" />
      <label>里程碑</label>
      <div v-for="(m, j) in form.milestones" :key="j" class="row" style="margin-bottom: 8px">
        <n-checkbox v-model:checked="m.done" />
        <n-input v-model:value="m.text" placeholder="里程碑内容" style="flex: 1" />
        <button class="btn small ghost" type="button" @click="form.milestones.splice(j, 1)">移除</button>
      </div>
      <button class="btn small ghost" type="button" @click="form.milestones.push({ text: '新里程碑', done: false })">
        + 添加里程碑
      </button>
      <p class="msg" :class="{ show: msg, ok: msgOk, err: !msgOk }">{{ msg }}</p>
      <template #footer>
        <div class="row" style="justify-content: flex-end">
          <button class="btn ghost" type="button" @click="close">取消</button>
          <button class="btn" type="button" :disabled="saving" @click="saveItem">{{ saving ? "保存中…" : "保存" }}</button>
        </div>
      </template>
    </n-modal>

    <div class="card">
      <h2>正在读的书</h2>
      <div v-for="(b, i) in reading" :key="i" class="row" style="margin-bottom: 8px">
        <n-input v-model:value="b.title" placeholder="书名" style="flex: 2" />
        <n-input v-model:value="b.progress" placeholder="读到 61%" style="width: 150px" />
        <n-input v-model:value="b.icon" placeholder="icon" style="width: 150px" />
        <button class="btn small ghost" type="button" @click="reading.splice(i, 1)">移除</button>
      </div>
      <button class="btn small ghost" type="button" @click="addReading">+ 新增书目</button>
      <p>
        <button class="btn ghost" type="button" :disabled="savingReading" @click="saveReading">
          {{ savingReading ? "保存中…" : "保存在读书单" }}
        </button>
      </p>
    </div>
  </n-config-provider>
</template>

<style scoped>
.dot { width: 9px; height: 9px; border-radius: 50%; display: inline-block; margin-right: 8px; flex-shrink: 0; }
.mini-progress {
  width: 140px;
  height: 6px;
  border-radius: 4px;
  background: rgba(148, 163, 184, 0.2);
  overflow: hidden;
  display: inline-block;
  vertical-align: middle;
}
.mini-progress i { display: block; height: 100%; background: var(--grad); border-radius: 4px; }
</style>
