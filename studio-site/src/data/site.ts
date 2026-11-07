/**
 * 站点配置 —— 品牌占位信息集中在此，确定品牌后全局替换即可。
 */
export const SITE = {
  name: "星屿工作室",
  latin: "STARISLE STUDIO",
  domain: "starisle.dev",
  url: "https://starisle.dev",
  title: "星屿工作室 · 把想法做成产品，把学习写成作品",
  description:
    "独立开发者屿的数字花园：产品橱窗、学习日志与技术文章。每篇都力求解决一个具体问题。",
  author: "屿",
  authorEn: "Yǔ",
  role: "独立开发者 / 前端工程师 / 终身学习者",
  location: "中国 · 远程协作",
  email: "hi@starisle.dev",
  github: "https://github.com/starisle",
} as const;

export const NAV = [
  { text: "首页", href: "/" },
  { text: "产品", href: "/products" },
  { text: "博客", href: "/blog" },
  { text: "学习记录", href: "/learning" },
  { text: "关于", href: "/about" },
] as const;

/**
 * 主题色预设（强调色）：主色 + 渐变副色，各有明暗两档。
 * 色值需与 tokens.css 中 [data-accent=…] 区块保持一致。
 * hexDark/hexLight 供 WebGL 动效（RippleGrid）使用——着色器只接受 hex。
 */
export const ACCENTS = [
  {
    id: "indigo",
    name: "星屿蓝",
    preview: "linear-gradient(135deg,#6d7cff,#38d9f5)",
    hexDark: "#6d7cff",
    hexLight: "#4f46e5",
  },
  {
    id: "aurora",
    name: "极光青",
    preview: "linear-gradient(135deg,#0d9488,#22d3ee)",
    hexDark: "#0d9488",
    hexLight: "#0f766e",
  },
  {
    id: "sunset",
    name: "落日橙",
    preview: "linear-gradient(135deg,#ea580c,#f59e0b)",
    hexDark: "#ea580c",
    hexLight: "#c2410c",
  },
  {
    id: "sakura",
    name: "樱花紫",
    preview: "linear-gradient(135deg,#a855f7,#ec4899)",
    hexDark: "#a855f7",
    hexLight: "#7e22ce",
  },
  {
    id: "rose",
    name: "蔷薇红",
    preview: "linear-gradient(135deg,#e11d48,#f97316)",
    hexDark: "#e11d48",
    hexLight: "#be123c",
  },
] as const;

export const DEFAULT_ACCENT = "indigo";

export const SOCIALS = [
  { name: "GitHub", icon: "github", href: SITE.github },
  { name: "邮箱", icon: "mail", href: `mailto:${SITE.email}` },
  { name: "RSS", icon: "rss", href: "/rss.xml" },
] as const;

/** 关于页 · 技能栈 */
export const SKILLS = [
  "TypeScript",
  "React / Next.js",
  "Astro",
  "Node.js",
  "Python",
  "Rust（学习中）",
  "RAG / Agent",
  "微信小程序",
  "Docker",
  "PostgreSQL",
  "UI 设计",
];

/** 关于页 · 时间线 */
export const TIMELINE = [
  {
    year: "2026",
    title: "成立星屿工作室",
    desc: "独立开发，上线 3 个产品，开始公开学习记录",
  },
  {
    year: "2024 – 2025",
    title: "某互联网公司 · 高级前端工程师",
    desc: "负责大型 B 端产品前端架构与工程效率",
  },
  {
    year: "2022 – 2024",
    title: "创业公司 · 全栈工程师",
    desc: "从 0 到 1 搭建产品，经历 0 → 10w 用户的完整周期",
  },
  {
    year: "2019 – 2022",
    title: "独立接单 & 开源",
    desc: "维护多个开源项目，累计 1.2k Stars",
  },
];

/** 关于页 · 合作方式 */
export const COOPS = [
  {
    icon: "rocket",
    title: "项目定制开发",
    desc: "小程序 / Web 应用 / AI 工具，从需求到上线，报价透明、周期明确。",
  },
  {
    icon: "message-circle",
    title: "技术咨询",
    desc: "RAG 落地、前端架构、工程效率改进，按次或按月咨询。",
  },
  {
    icon: "feather",
    title: "内容合作",
    desc: "技术写作、开源共建、产品测评，欢迎邮件详聊。",
  },
];
