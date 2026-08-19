<script setup lang="ts">
/**
 * 画布根组件
 *
 * 职责：
 * 1. 渲染画布舞台（canvas-stage），承载所有已添加的组件节点
 * 2. 处理从物料面板拖拽组件到画布上的放置逻辑（onDrop）
 * 3. 处理画布上节点的选中、拖拽移动、缩放等交互（配合 vue3-moveable）
 * 4. 支持框选与多选操作（配合 vue3-selecto），可对多个节点进行群组拖拽/缩放
 * 5. 维护当前选中节点的 DOM 引用，供 Moveable 进行拖拽/缩放控制
 */
import { createNode, getMaterialComponent } from '@/materials'
import type { MaterialSchema } from '@/schema/material'
import { useEditorStore } from '@/stores/editor'
import { storeToRefs } from 'pinia'
import Moveable from 'vue3-moveable'
// Selecto 框选组件：用于在画布上拖拽框选多个节点
import Selecto from 'vue3-selecto'
import SketchRuler from 'vue3-sketch-ruler'
import 'vue3-sketch-ruler/lib/style.css'
import { useCanvasRuler } from './composables/useCanvasRuler'
import { useMoveable } from './composables/useMoveable'
import { useSelection } from './composables/useSelection'

// 定义组件名称，便于调试与递归组件识别
defineOptions({
  name: 'CanvasRoot',
})

// 获取编辑器全局状态 store
const editorStore = useEditorStore()

// 使用 storeToRefs 解构响应式状态，保持响应性（避免直接解构丢失响应式）
// 这里仅解构 nodes；选中状态（selectedNodeIds）由框选/点击事件直接写入 store
const { nodes } = storeToRefs(editorStore)

// Moveable 组件的模板引用，用于手动触发拖拽开始等操作
const moveableRef = useTemplateRef('moveable')

// 画布舞台的模板引用，作为 Selecto 框选的容器与拖拽范围
const stageRef = useTemplateRef('stage')

const canvasRootRef = useTemplateRef('canvasRoot')

// Moveable 的目标：单选时为单个节点 DOM 元素，多选框选时为一个 DOM 元素数组
// （浅层响应式，避免深层代理开销；类型标注为 HTMLElement，实际可能保存数组）
const selectedTarget = shallowRef<HTMLElement[]>()
const {
  scale,
  lines,
  rectWidth,
  rectHeight,
  canvasWidth,
  canvasHeight,
  canvasStyle,
  palette,
  onZoomChange,
} = useCanvasRuler({ moveableRef, canvasRootRef })
const { onSelect, onClearSelected, onSelectEnd } = useSelection({
  stageRef,
  moveableRef,
  selectedTarget,
})
const { onDrag, onResize, onDragGroup, onResizeGroup, onStart, onEnd } = useMoveable(moveableRef)

// 获取当前组件实例，用于通过 $el 访问根 DOM 元素
// const vm = getCurrentInstance()

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
  // nextTick(() => {
  //   selectedTarget.value = vm.proxy.$el.querySelector(`[data-node-id='${node.id}']`)
  // })
}

/**
 * 根据节点的布局信息生成内联样式（用于绝对定位）
 * @param node 物料节点 schema
 * @returns 包含宽高和左上角坐标的样式对象
 */
function getNodeStyle(node: MaterialSchema, index: number) {
  return {
    width: node.layout.width + 'px',
    height: node.layout.height + 'px',
    left: node.layout.x + 'px',
    top: node.layout.y + 'px',
    zIndex: index + 1,
  }
}

const commandMap = {
  copy: () => editorStore.copyNode(editorStore.selectedNode),
  remove: () => editorStore.removeNode(editorStore.selectedNode),
  moveBottom: () => editorStore.moveTop(editorStore.selectedNode),
  moveTop: () => editorStore.moveBottom(editorStore.selectedNode),
  toggleLock: () => {
    editorStore.toggleLock(editorStore.selectedNode)
    selectedTarget.value = []
  },
}

function onCommand(command: string) {
  commandMap[command]()
}
</script>

<template>
  <div ref="canvasRoot" class="canvas-root container">
    <SketchRuler
      v-model:scale="scale"
      :thick="20"
      :palette="palette"
      :width="rectWidth"
      :height="rectHeight"
      :canvasWidth="canvasWidth"
      :canvasHeight="canvasHeight"
      :lines="lines"
      @zoomchange="onZoomChange"
    >
      <!-- 画布舞台：阻止默认拖放行为，接收物料放置，点击空白处清除选中 -->
      <div
        ref="stage"
        class="canvas-stage"
        :style="canvasStyle"
        @dragover.prevent
        @drop="onDrop"
        @mousedown.self="onClearSelected"
      >
        <!-- 遍历渲染所有画布节点，按绝对定位摆放 -->
        <el-dropdown
          v-for="(node, index) in nodes"
          :key="node.id"
          trigger="contextmenu"
          @command="onCommand"
        >
          <div
            class="canvas-node"
            :style="getNodeStyle(node, index)"
            :data-node-id="node.id"
            :data-node-locked="node.locked"
            @mousedown="onSelect(node, $event)"
          >
            <!-- 根据节点类型动态渲染对应的物料组件 -->
            <component :is="getMaterialComponent(node.type)" :schema="node"></component>
          </div>
          <template #dropdown>
            <el-dropdown-item command="copy">复制</el-dropdown-item>
            <el-dropdown-item command="remove">删除</el-dropdown-item>
            <el-dropdown-item command="moveTop">置顶</el-dropdown-item>
            <el-dropdown-item command="moveBottom">置底</el-dropdown-item>
            <el-dropdown-item command="toggleLock">{{
              node.locked ? '解锁' : '锁定'
            }}</el-dropdown-item>
          </template>
        </el-dropdown>
      </div>
    </SketchRuler>

    <!-- Selecto 框选组件：支持鼠标拖拽框选多个节点（按住 shift 可追加选择） -->
    <Selecto
      v-if="stageRef"
      :container="stageRef"
      :dragContainer="stageRef"
      :selectableTargets="['.canvas-node']"
      :selectFromInside="false"
      :toggleContinueSelect="'shift'"
      @selectEnd="onSelectEnd"
    ></Selecto>
    <!-- Moveable 交互组件：为选中的节点提供拖拽移动和缩放能力
         单选时作用于 target 对应的单个元素；
         多选（框选）时通过 dragGroup / resizeGroup 对整组元素进行群组拖拽与缩放 -->
    <Moveable
      ref="moveable"
      :target="selectedTarget"
      :draggable="true"
      :resizable="true"
      :origin="false"
      @drag="onDrag"
      @dragStart="onStart"
      @dragEnd="onEnd"
      @dragGroup="onDragGroup"
      @dragGroupStart="onStart"
      @dragGroupEnd="onEnd"
      @resize="onResize"
      @resizeGroup="onResizeGroup"
      @resizeGroupStart="onStart"
      @resizeGroupEnd="onEnd"
      @resizeStart="onStart"
      @resizeEnd="onEnd"
    ></Moveable>
  </div>
</template>

<style scoped lang="scss">
.canvas-root {
  height: 100%;
  .canvas-stage {
    position: relative;
    .canvas-node {
      position: absolute;
    }
  }
}
</style>
