/**
 * Naive UI 主题桥接 —— 跟随后台明暗主题(data-theme),品牌色对齐官网 token。
 */
import { darkTheme, type GlobalThemeOverrides } from "naive-ui";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const isDark = ref(true);

export function useAdminTheme() {
  onMounted(() => {
    const read = () => {
      isDark.value = (document.documentElement.dataset.theme ?? "dark") !== "light";
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    onBeforeUnmount(() => observer.disconnect());
  });
  const nTheme = computed(() => (isDark.value ? darkTheme : null));
  return { isDark, nTheme };
}

export function adminThemeOverrides(isDark: boolean): GlobalThemeOverrides {
  return {
    common: {
      primaryColor: "#6d7cff",
      primaryColorHover: "#8b93ff",
      primaryColorPressed: "#5a67e6",
      primaryColorSuppl: "#38d9f5",
      infoColor: "#38d9f5",
      successColor: "#34d399",
      warningColor: "#fbbf24",
      errorColor: "#f87171",
      borderRadius: "9px",
      fontSize: "13.5px",
      fontFamily: 'system-ui, "Microsoft YaHei", "PingFang SC", sans-serif',
    },
    // 弹窗卡片对齐后台卡片色(仅暗色需要,浅色用默认白)
    Card: {
      borderRadius: "14px",
      ...(isDark ? { color: "#101827" } : {}),
    },
  };
}
