# 画布组合式函数抽离

- 日期：2026-08-15
- 状态：已完成

## 目标

在不改变画布交互逻辑的前提下，拆分 `src/editor/canvas/index.vue` 中过于集中的标尺、选中和 Moveable 交互代码，降低组件维护成本。

## 已完成

- 完整实现 `useCanvasRuler`，承接标尺状态、画布尺寸、根容器尺寸监听和缩放刷新逻辑。
- 实现 `useSelection`，承接节点单选、多选、框选以及 Moveable 目标同步逻辑。
- 实现 `useMoveable`，承接节点拖拽、缩放和群组交互逻辑。
- 保留 `index.vue` 的画布模板、物料拖入、节点样式和右键命令职责。
- 为各组合式函数补充职责说明和关键同步逻辑注释。
- 保留现有 `moveTop` / `moveBottom` 命令映射，以及框选结果直接写入 `selectedNodeIds` 的行为。

## 设计与取舍

- 组合式函数只接收实际需要的模板引用，避免将组件模板和具体交互实现相互耦合。
- `useMoveable` 不接收 `selectedTarget`，因为 Moveable 事件处理只依赖事件对象和编辑器 Store。
- 未新增额外的命令 composable，右键命令数量较少且仍属于画布组件自身职责。

## 验证

- `pnpm exec vue-tsc --noEmit --pretty false`：通过。
- `pnpm build-only`：通过。
- `pnpm type-check`：仍受项目已有的 `src/materials/charts/index.ts` 参数错误影响。
- 未执行浏览器手工交互验证。

## 后续事项

- 修复 `src/materials/charts/index.ts` 的既有类型错误后，再恢复完整 `pnpm type-check` 验证。
- 后续如画布命令或节点渲染逻辑继续增长，再考虑进一步拆分。
