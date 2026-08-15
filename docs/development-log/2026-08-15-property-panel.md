# 属性面板设计与实现

- 日期：2026-08-15
- 状态：进行中
- 关联提交：未提交（当前 Git 工作区快照）

## 目标

为大屏编辑器补齐右侧属性面板：未选中节点时编辑画布属性，选中节点时根据物料类型展示对应的节点属性配置。

## 已完成

- 新增属性面板入口 `src/editor/panels/property/index.vue`，根据 `selectedNode` 在画布属性与节点属性之间切换。
- 新增画布属性组件 `CanvasProperty.vue`，可编辑画布宽度、高度和背景色，并直接绑定编辑器 Store 中的 `canvas`。
- 新增节点属性组件和动态表单组件，用于承载按物料配置生成的属性编辑表单。
- 在编辑器布局中接入属性面板，并将展开宽度从 `260px` 调整为 `360px`，为表单保留足够空间。
- 为文本物料补充“内容”和“颜色”两个 setter 配置。
- 在物料注册中心中维护 `type -> setters` 映射，并新增 `getMaterialSetters`，供节点属性面板按节点类型读取配置。
- 增加 `getValue`、`setValue` 工具函数，支持通过 `props.content`、`style.color` 这类路径读取和写入节点数据。
- 将标尺缩放参数改为双向绑定，使标尺交互产生的缩放值能回写到画布。
- 自动生成 Element Plus 表单、颜色选择器和数字输入框的全局组件类型声明。

## 设计与取舍

- 属性面板以“画布 / 当前选中节点”作为唯一切换条件，避免在同一区域同时维护两套编辑状态。
- setter 配置跟随物料定义注册，而不是散落在属性面板中；新增物料时只需声明自身字段配置。
- 表单字段使用点路径定位嵌套数据，减少为每一种物料属性编写专用数据同步逻辑。

## 影响范围

- `src/editor/index.vue`
- `src/editor/panels/property/`
- `src/materials/index.ts`
- `src/materials/text/index.ts`
- `src/schema/material.ts`
- `src/utils/index.ts`
- `src/editor/canvas/index.vue`
- `components.d.ts`

## 验证

- 已完成：通过 Git diff 核对当前工作区改动与本记录一致。
- 未执行：类型检查、构建、浏览器手工验证。
- 待确认：选中不同物料后，动态表单是否正确读取 setter 配置并将修改同步到节点；标尺缩放回写后画布缩放是否符合预期。

## 后续事项

- 执行 `pnpm type-check` 和 `pnpm build`，修复发现的类型或构建问题。
- 在浏览器中验证画布属性和文本节点属性的编辑链路。
- 为更多物料补充 setter 配置，并补齐对应表单控件类型。
- 完成验证后，将本日志状态改为“已完成”，并填写关联提交哈希。
