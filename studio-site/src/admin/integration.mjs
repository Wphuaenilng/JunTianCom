/**
 * 后台管理系统路由注入 —— 仅在 astro dev 时存在。
 * npm run build 不含任何 admin 路由（无适配器需求，产物零暴露）。
 */
const routes = [
  ["/admin", "./src/admin/pages/index.astro"],
  ["/admin/checkins", "./src/admin/pages/checkins.astro"],
  ["/admin/notes", "./src/admin/pages/notes.astro"],
  ["/admin/posts", "./src/admin/pages/posts.astro"],
  ["/admin/products", "./src/admin/pages/products.astro"],
  ["/admin/roadmap", "./src/admin/pages/roadmap.astro"],
  ["/admin/settings", "./src/admin/pages/settings.astro"],
  ["/api/admin/checkins", "./src/admin/api/checkins.ts"],
  ["/api/admin/notes", "./src/admin/api/notes.ts"],
  ["/api/admin/posts", "./src/admin/api/posts.ts"],
  ["/api/admin/products", "./src/admin/api/products.ts"],
  ["/api/admin/roadmap", "./src/admin/api/roadmap.ts"],
  ["/api/admin/settings", "./src/admin/api/settings.ts"],
  ["/api/admin/git-sync", "./src/admin/api/git-sync.ts"],
];

export function adminIntegration() {
  return {
    name: "admin-panel",
    hooks: {
      "astro:config:setup"({ command, injectRoute }) {
        if (command !== "dev") return;
        for (const [pattern, entrypoint] of routes) {
          injectRoute({ pattern, entrypoint, prerender: false });
        }
      },
    },
  };
}
