# 框架适配总览

本文档汇总 Ebin Player 在各主流前端框架中的接入方式与要点。

## 适配矩阵

| 框架 | 包 | 最低版本 | SSR | 样式注入 |
|---|---|---|---|---|
| React | `@ebin-player/react` | React 18 | 支持（仅客户端渲染播放器实例） | 默认自动，支持手动 `import '@ebin-player/core/styles'` |
| Vue 2 | `@ebin-player/vue2` | Vue 2.6/2.7 | 支持 | 同上 |
| Vue 3 | `@ebin-player/vue3` | Vue 3.0+ | 支持 | 同上 |
| Angular | `@ebin-player/angular` | Angular 17/20 | 支持（Angular Universal） | 默认自动，可手动 |

## 通用要点
- 建议优先使用框架包组件进行接入（统一事件与属性）。
- SSR：在服务端不创建播放器实例，组件内部已做客户端保护。
- 样式：生产环境建议锁定核心样式版本或本地托管，确保一致性。
- 事件：遵循 HTML5 视频事件 + 自定义事件，详见各包 README。

## 快速链接
- React: `packages/react/README.md`
- Vue2: `packages/vue2/README.md`
- Vue3: `packages/vue3/README.md`
- Angular: `packages/angular/README.md`
