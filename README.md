# JunTianCom · 星屿工作室

个人工作室官网：对外名片 + 产品橱窗 + 学习日志。

- `studio-site/` — 官网源码（Astro 5 + Vue 岛屿 + Tailwind 4）
- `个人工作室官网-*.md` — 产品方案与实现计划
- `设计图-工作室官网.html` — 高保真设计稿

## 本地开发

```bash
cd studio-site
npm install
npm run dev      # http://localhost:4321
npm run build    # 产物在 studio-site/dist
```

## 学习打卡（热力图数据来源）

在 GitHub 上新建 Issue 即完成打卡，机器人自动记录，无需碰代码：

1. 进入本仓库 **Issues → New issue → 选「打卡」模板**
2. 填「今天学了什么」（一行一个主题）；日期不填默认为今天（北京时间）
3. 提交后，Action 自动把记录写入 `studio-site/src/data/checkins.json` 并关闭 issue

说明：

- 热力图在构建期读取该数据文件，页面保持零 JS 纯静态
- 同一天多次打卡会自动合并主题；写错了直接编辑 `checkins.json` 纠正（日期格式 `YYYY-MM-DD`）
- 深浅规则：1 个主题 = 1 级，2 个 = 2 级，3~4 个 = 3 级，5 个及以上 = 4 级
