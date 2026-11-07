<script setup lang="ts">
import { ref } from "vue";
import { NConfigProvider, NInput, NTabs, NTabPane } from "naive-ui";
import { adminThemeOverrides, useAdminTheme } from "../lib/naive";

const { isDark, nTheme } = useAdminTheme();

interface TimelineItem {
  year: string;
  title: string;
  desc: string;
}
interface CoopItem {
  icon: string;
  title: string;
  desc: string;
}
const props = defineProps<{
  identity: Record<string, string>;
  skills: string[];
  timeline: TimelineItem[];
  coops: CoopItem[];
}>();

const identity = ref<Record<string, string>>({ ...props.identity });
const skills = ref(props.skills.join("\n"));
const timeline = ref<TimelineItem[]>(JSON.parse(JSON.stringify(props.timeline)));
const coops = ref<CoopItem[]>(JSON.parse(JSON.stringify(props.coops)));
const msg = ref("");
const msgOk = ref(true);

const ID_FIELDS: [string, string][] = [
  ["name", "品牌名"],
  ["latin", "拉丁名"],
  ["domain", "域名"],
  ["url", "站点 URL"],
  ["title", "默认标题"],
  ["description", "默认描述"],
  ["author", "作者名"],
  ["authorEn", "作者英文名"],
  ["role", "角色定位"],
  ["location", "位置"],
  ["email", "邮箱"],
  ["github", "GitHub 主页"],
];

async function save() {
  const payload = {
    identity: identity.value,
    skills: skills.value.split(/\r?\n/).map((s) => s.trim()).filter(Boolean),
    timeline: timeline.value,
    coops: coops.value,
  };
  const res = await fetch("/api/admin/settings", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
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
  <n-config-provider :theme="nTheme" :theme-overrides="adminThemeOverrides(isDark)">
    <div class="card">
      <n-tabs type="line" animated>
        <n-tab-pane name="basic" tab="基本信息">
          <div class="settings-grid">
            <div v-for="[key, label] in ID_FIELDS" :key="key" :class="{ full: ['url', 'title', 'description', 'role'].includes(key) }">
              <label>{{ label }}（{{ key }}）</label>
              <n-input v-model:value="identity[key]" />
            </div>
          </div>
        </n-tab-pane>

        <n-tab-pane name="skills" tab="技能栈">
          <div class="admin-form-narrow">
            <n-input v-model:value="skills" type="textarea" :rows="8" />
          </div>
        </n-tab-pane>

        <n-tab-pane name="timeline" tab="时间线">
          <div v-for="(t, i) in timeline" :key="i" class="card" style="margin-bottom: 10px; padding: 12px 14px">
            <div class="row">
              <n-input v-model:value="t.year" placeholder="年份" style="width: 170px" />
              <n-input v-model:value="t.title" placeholder="标题" style="flex: 1" />
              <button class="btn small ghost" type="button" @click="timeline.splice(i, 1)">移除</button>
            </div>
            <n-input v-model:value="t.desc" type="textarea" :rows="2" style="margin-top: 8px" placeholder="一句话描述" />
          </div>
          <button class="btn small ghost" type="button" @click="timeline.push({ year: '', title: '', desc: '' })">
            + 新增时间线
          </button>
        </n-tab-pane>

        <n-tab-pane name="coops" tab="合作方式">
          <div v-for="(c, i) in coops" :key="i" class="card" style="margin-bottom: 10px; padding: 12px 14px">
            <div class="row">
              <n-input v-model:value="c.icon" placeholder="icon（lucide）" style="width: 190px" />
              <n-input v-model:value="c.title" placeholder="标题" style="flex: 1" />
              <button class="btn small ghost" type="button" @click="coops.splice(i, 1)">移除</button>
            </div>
            <n-input v-model:value="c.desc" type="textarea" :rows="2" style="margin-top: 8px" placeholder="描述" />
          </div>
          <button
            class="btn small ghost"
            type="button"
            @click="coops.push({ icon: 'message-circle', title: '', desc: '' })"
          >
            + 新增合作方式
          </button>
        </n-tab-pane>
      </n-tabs>

      <p class="msg" :class="{ show: msg, ok: msgOk, err: !msgOk }">{{ msg }}</p>
      <div class="row" style="margin-top: 14px">
        <button class="btn" type="button" @click="save">保存全部</button>
        <span class="muted">保存后头部/关于页即时更新 · 各页签内容一起保存</span>
      </div>
    </div>
  </n-config-provider>
</template>
