/**
 * 站点配置 —— 可编辑内容（身份/关于页时间线/技能/合作方式）在 site-settings.json，
 * 由后台「站点配置」模块维护；结构性的 NAV/主题色等留在本文件。
 */
import settingsData from "./site-settings.json";

export const SITE = { ...settingsData.identity } as const;

export const SKILLS: string[] = settingsData.skills;

export const TIMELINE: { year: string; title: string; desc: string }[] =
  settingsData.timeline;

export const COOPS: { icon: string; title: string; desc: string }[] =
  settingsData.coops;

export const NAV = [
  { text: "首页", href: "/" },
  { text: "产品", href: "/products" },
  { text: "博客", href: "/blog" },
  { text: "学习记录", href: "/learning" },
  { text: "关于", href: "/about" },
] as const;

/**
 * 主题色预设（强调色）：主色 + 渐变副色，各有明暗两档。
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
