<script setup lang="ts">
import { ref } from "vue";
import { NCheckbox, NConfigProvider, NInput, NSelect } from "naive-ui";
import { adminThemeOverrides, useAdminTheme } from "../lib/naive";

const { nTheme } = useAdminTheme();

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

const roadmap = ref<RoadmapItem[]>(JSON.parse(JSON.stringify(props.roadmap)));
const reading = ref<ReadingItem[]>(JSON.parse(JSON.stringify(props.reading)));
const msg = ref("");
const msgOk = ref(true);

function addRoadmap() {
  roadmap.value.push({ title: "新路线", icon: "flag", color: "primary", progress: 0, milestones: [] });
}
function addMilestone(item: RoadmapItem) {
  item.milestones.push({ text: "新里程碑", done: false });
}
function addReading() {
  reading.value.push({ title: "新书名", progress: "读到 0%", icon: "book-open", grad: "linear-gradient(135deg,#6d7cff,#38d9f5)" });
}

async function save() {
  const res = await fetch("/api/admin/roadmap", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ roadmap: roadmap.value, reading: reading.value }),
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (res.ok) {
    location.reload();
    return;
  }
  msg.value = data.error ?? "保存失败";
  msgOk.value = false;
}
</script>

<template>
  <n-config-provider :theme="nTheme" :theme-overrides="adminThemeOverrides">
    <div v-for="(item, i) in roadmap" :key="i" class="card">
      <div class="row">
        <div style="flex: 1; max-width: 520px">
          <label>路线标题</label>
          <n-input v-model:value="item.title" />
        </div>
        <div style="width: 190px">
          <label>图标（lucide）</label>
          <n-input v-model:value="item.icon" />
        </div>
        <div style="width: 190px">
          <label>颜色</label>
          <n-select v-model:value="item.color" :options="colorOptions" />
        </div>
        <div style="align-self: flex-end">
          <button class="btn small danger" type="button" @click="roadmap.splice(i, 1)">删除路线</button>
        </div>
      </div>
      <label>进度：{{ item.progress }}%</label>
      <input v-model.number="item.progress" type="range" min="0" max="100" step="5" />
      <label>里程碑</label>
      <div v-for="(m, j) in item.milestones" :key="j" class="row" style="margin-bottom: 8px">
        <n-checkbox v-model:checked="m.done" />
        <n-input v-model:value="m.text" style="flex: 1" />
        <button class="btn small ghost" type="button" @click="item.milestones.splice(j, 1)">移除</button>
      </div>
      <button class="btn small ghost" type="button" @click="addMilestone(item)">+ 添加里程碑</button>
    </div>

    <p><button class="btn ghost" type="button" @click="addRoadmap">+ 新增路线</button></p>

    <div class="card">
      <h2>正在读的书</h2>
      <div v-for="(b, i) in reading" :key="i" class="row" style="margin-bottom: 8px">
        <n-input v-model:value="b.title" placeholder="书名" style="flex: 2" />
        <n-input v-model:value="b.progress" placeholder="读到 61%" style="width: 150px" />
        <n-input v-model:value="b.icon" placeholder="icon" style="width: 150px" />
        <button class="btn small ghost" type="button" @click="reading.splice(i, 1)">移除</button>
      </div>
      <button class="btn small ghost" type="button" @click="addReading">+ 新增书目</button>
    </div>

    <p>
      <button class="btn" type="button" @click="save">保存全部</button>
      <span class="muted" style="margin-left: 10px">保存后学习记录页即时更新</span>
    </p>
    <p class="msg" :class="{ show: msg, ok: msgOk, err: !msgOk }">{{ msg }}</p>
  </n-config-provider>
</template>
