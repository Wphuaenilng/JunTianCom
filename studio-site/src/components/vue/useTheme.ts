/**
 * 主题 / 主题色的 Vue 共享状态与操作
 * （迁移自原 ThemeToggle.astro / AccentPicker.astro 的逻辑）
 */
import { ref, onMounted } from "vue";

export type Theme = "light" | "dark";

/** 模块级共享：多个岛屿间状态一致 */
const theme = ref<Theme>("dark");
const accent = ref<string>("indigo");
let initialized = false;

export function useTheme() {
  type ViewTransitionLike = { ready: Promise<void> };
  if (!initialized && typeof document !== "undefined") {
    initialized = true;
    theme.value =
      (document.documentElement.dataset.theme as Theme | undefined) ?? "dark";
    accent.value = document.documentElement.dataset.accent || "indigo";
  }

  function applyTheme(next: Theme) {
    theme.value = next;
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("starisle-theme", next);
    } catch {
      /* ignore */
    }
  }

  function applyAccent(id: string) {
    accent.value = id;
    document.documentElement.dataset.accent = id;
    try {
      localStorage.setItem("starisle-accent", id);
    } catch {
      /* ignore */
    }
  }

  /** 圆形扩散过渡（与原实现一致），圆心取自触发元素 */
  function withReveal(origin: HTMLElement, update: () => void, duration = 400) {
    if (typeof document === "undefined") {
      // SSR 阶段不执行浏览器逻辑
      update();
      return;
    }
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const doc = document as Document & {
      startViewTransition?: (update: () => void) => ViewTransitionLike;
    };
    if (reduced || typeof doc.startViewTransition !== "function") {
      update();
      return;
    }
    const rect = origin.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const vw = window.visualViewport?.width ?? window.innerWidth;
    const vh = window.visualViewport?.height ?? window.innerHeight;
    const maxRadius = Math.hypot(Math.max(cx, vw - cx), Math.max(cy, vh - cy));
    const transition = doc.startViewTransition(update);
    transition.ready
      .then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${cx}px ${cy}px)`,
              `circle(${maxRadius}px at ${cx}px ${cy}px)`,
            ],
          },
          {
            duration,
            easing: "ease-in-out",
            fill: "forwards",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      })
      .catch(() => {});
  }

  return { theme, accent, applyTheme, applyAccent, withReveal };
}
