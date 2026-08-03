<script setup lang="ts">
/**
 * 画布根组件
 *
 * 职责：
 * 1. 渲染画布舞台（canvas-stage），承载所有已添加的组件节点
 * 2. 处理从物料面板拖拽组件到画布上的放置逻辑（onDrop）
 * 3. 处理画布上节点的选中、拖拽移动、缩放等交互（配合 vue3-moveable）
 * 4. 维护当前选中节点的 DOM 引用，供 Moveable 进行拖拽/缩放控制
 */
import { createNode, getMaterialComponent } from '@/materials'
import type { MaterialSchema } from '@/materials/types'
import { useEditorStore } from '@/stores/editor'
import { storeToRefs } from 'pinia'
import Moveable, { type OnDrag, type OnResize } from 'vue3-moveable'

// 定义组件名称，便于调试与递归组件识别
defineOptions({
  name: 'CanvasRoot',
})

// 获取编辑器全局状态 store
const editorStore = useEditorStore()

// 使用 storeToRefs 解构响应式状态，保持响应性（避免直接解构丢失响应式）
const { nodes, selectedNode } = storeToRefs(editorStore)

// Moveable 组件的模板引用，用于手动触发拖拽开始等操作
const moveableRef = useTemplateRef('moveable')

// 当前被选中的画布节点 DOM 元素（浅层响应式，避免深层代理开销）
const selectedTarget = shallowRef<HTMLElement>()

// 获取当前组件实例，用于通过 $el 访问根 DOM 元素
const vm = getCurrentInstance()

/**
 * 处理物料拖拽到画布上的放置事件
 * @param e 拖拽事件对象
 */
function onDrop(e: DragEvent) {
  // 从拖拽数据中读取物料 schema（由物料面板在 dragstart 时写入）
  const data = e.dataTransfer.getData('schema')
  // 根据 schema 创建画布节点实例
  const node = createNode(JSON.parse(data))
  // 组件中心在鼠标落点：将节点左上角定位到鼠标位置减去组件宽高的一半
  node.layout.x = e.offsetX - node.layout.width / 2
  node.layout.y = e.offsetY - node.layout.height / 2
  // 将新节点加入画布节点列表
  editorStore.addNode(node)
  // 开启放入就选中：放置后立即选中该节点
  editorStore.selectNode(node.id)
  // 等待 DOM 渲染完成后，获取新节点的 DOM 元素并设为 Moveable 的目标
  nextTick(() => {
    selectedTarget.value = vm.proxy.$el.querySelector(`[data-node-id='${node.id}']`)
  })
}

/**
 * 根据节点的布局信息生成内联样式（用于绝对定位）
 * @param node 物料节点 schema
 * @returns 包含宽高和左上角坐标的样式对象
 */
function getNodeStyle(node: MaterialSchema) {
  return {
    width: node.layout.width + 'px',
    height: node.layout.height + 'px',
    left: node.layout.x + 'px',
    top: node.layout.y + 'px',
  }
}

/**
 * 处理画布节点的鼠标按下（选中）事件
 * @param node 被点击的节点
 * @param e 鼠标事件对象
 */
function onSelect(node: MaterialSchema, e: MouseEvent) {
  // 这里记一下笔记为什么用e.currentTarget 而不是 e.target，为什么要断言
  // 原因：e.target 可能是节点内部的子元素，而 e.currentTarget 始终是绑定事件的节点本身；
  // 断言为 HTMLElement 是因为 currentTarget 的类型是 EventTarget，需要手动收窄类型。
  selectedTarget.value = e.currentTarget as HTMLElement
  // 更新 store 中选中的节点 id
  editorStore.selectNode(node.id)

  nextTick(() => {
    // 解决第一次选中不能拖动的问题
    // 在 DOM 更新后手动触发 Moveable 的 dragStart，使首次点击即可进入拖拽状态
    moveableRef.value.dragStart(e)
  })
}

/**
 * 处理 Moveable 拖拽移动事件
 * @param e 拖拽事件（包含最新的 left/top 坐标）
 */
function onDrag(e: OnDrag) {
  // 这里记录笔记 为什么这里要手动设置css？为了手动更新
  // 原因：Moveable 默认不直接修改目标元素的样式，需要手动同步位置，
  // 这样能保证 DOM 与 store 数据保持一致，且避免 Moveable 内部缓存导致的位置偏差。
  selectedTarget.value.style.left = e.left + 'px'
  selectedTarget.value.style.top = e.top + 'px'

  // 同步更新 store 中节点的布局数据
  selectedNode.value.layout.x = e.left
  selectedNode.value.layout.y = e.top
}

/**
 * 处理 Moveable 缩放事件
 * @param e 缩放事件（包含最新的宽高及拖拽信息）
 */
function onResize(e: OnResize) {
  // 手动更新目标元素的宽高样式
  selectedTarget.value.style.width = e.width + 'px'
  selectedTarget.value.style.height = e.height + 'px'

  // 同步更新 store 中节点的尺寸数据
  selectedNode.value.layout.width = e.width
  selectedNode.value.layout.height = e.height
  // 记录这里为什么要调用onDrag？解决往左缩放却往右边缩放不符合预期的问题
  // 原因：缩放时（尤其是从左侧/上侧缩放）会同时改变节点的位置，
  // 调用 onDrag 将缩放产生的位移同步到位置数据，保证缩放行为符合直觉。
  onDrag(e.drag)
}

/**
 * 清除当前选中状态（点击画布空白区域时触发）
 */
function onClearSelected() {
  editorStore.clearSelected()
  selectedTarget.value = null
}
</script>

<template>
  <div class="canvas-root container">
    <!-- 画布舞台：阻止默认拖放行为，接收物料放置，点击空白处清除选中 -->
    <div class="canvas-stage" @dragover.prevent @drop="onDrop" @mousedown.self="onClearSelected">
      <!-- 遍历渲染所有画布节点，按绝对定位摆放 -->
      <div
        class="canvas-node"
        v-for="node in nodes"
        :key="node.id"
        :style="getNodeStyle(node)"
        :data-node-id="node.id"
        @mousedown="onSelect(node, $event)"
      >
        <!-- 根据节点类型动态渲染对应的物料组件 -->
        <component :is="getMaterialComponent(node.type)" :schema="node"></component>
      </div>
    </div>
    <!-- Moveable 交互组件：为选中的节点提供拖拽移动和缩放能力 -->
    <Moveable
      ref="moveable"
      :target="selectedTarget"
      :draggable="true"
      :resizable="true"
      :origin="false"
      @drag="onDrag"
      @resize="onResize"
    ></Moveable>
  </div>
</template>

<style scoped lang="scss">
.canvas-root {
  .canvas-stage {
    position: relative;
    width: 900px;
    height: 600px;
    background: bg-mix(40);
    margin: 100px;
    .canvas-node {
      position: absolute;
    }
  }
}
</style>
