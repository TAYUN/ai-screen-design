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
import type { MaterialSchema } from '@/materials/types'
import { useEditorStore } from '@/stores/editor'
import { debounce } from '@/utils'
import { storeToRefs } from 'pinia'
import Moveable, {
  type OnDrag,
  type OnDragGroup, // 多选群组拖拽事件类型
  type OnResize,
  type OnResizeGroup, // 多选群组缩放事件类型
} from 'vue3-moveable'
// Selecto 框选组件：用于在画布上拖拽框选多个节点
import Selecto from 'vue3-selecto'
import SketchRuler from 'vue3-sketch-ruler'
import 'vue3-sketch-ruler/lib/style.css'

// 定义组件名称，便于调试与递归组件识别
defineOptions({
  name: 'CanvasRoot',
})

// 获取编辑器全局状态 store
const editorStore = useEditorStore()

// 使用 storeToRefs 解构响应式状态，保持响应性（避免直接解构丢失响应式）
// 这里仅解构 nodes；选中状态（selectedNodeIds）由框选/点击事件直接写入 store
const { nodes, selectedNodeIds } = storeToRefs(editorStore)

// Moveable 组件的模板引用，用于手动触发拖拽开始等操作
const moveableRef = useTemplateRef('moveable')

// 画布舞台的模板引用，作为 Selecto 框选的容器与拖拽范围
const stageRef = useTemplateRef('stage')

const canvasRootRef = useTemplateRef('canvasRoot')

// Moveable 的目标：单选时为单个节点 DOM 元素，多选框选时为一个 DOM 元素数组
// （浅层响应式，避免深层代理开销；类型标注为 HTMLElement，实际可能保存数组）
const selectedTarget = shallowRef<HTMLElement[]>()
const scale = ref(1)
const lines = ref({ h: [], v: [] })

const rectWidth = ref(1000)
const rectHeight = ref(800)

const canvasWidth = ref(1920)
const canvasHeight = ref(1080)

const canvasStyle = computed(() => {
  return {
    width: canvasWidth.value + 'px',
    height: canvasHeight.value + 'px',
  }
})

// 标尺样式
const palette = {
  bgColor: '#1f2937',
  longfgColor: '#6b7280',
  fontColor: '#9ca3af',
  fontShadowColor: '#0e8da7',
  shadowColor: 'rgba(14, 141, 167, 0.14)',
  lineColor: '#22c55e',
  lineType: 'solid',
  lockLineColor: '#4b5563',
  borderColor: '#374151',
  hoverBg: '#111827',
  hoverColor: '#ffffff',
}

watch(
  selectedNodeIds,
  (ids) => {
    selectedTarget.value = ids.map((id) => {
      return stageRef.value.querySelector(`[data-node-id='${id}']`)
    })
  },
  { deep: true, flush: 'post' },
)

const onRootResize = debounce((rect) => {
  rectWidth.value = rect.width
  rectHeight.value = rect.height
}, 300)

onMounted(() => {
  const { width, height } = canvasRootRef.value.getBoundingClientRect()
  rectWidth.value = width
  rectHeight.value = height

  const ob = new ResizeObserver((entries) => {
    const entry = entries[0]
    const rect = entry.contentRect
    onRootResize(rect)
  })

  ob.observe(canvasRootRef.value)

  onUnmounted(() => {
    ob.disconnect()
  })
})

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
  // selectedTarget.value = e.currentTarget as HTMLElement
  // 更新 store 中选中的节点 id
  editorStore.selectNode(node.id)

  nextTick(() => {
    // 解决第一次选中不能拖动的问题
    // 在 DOM 更新后手动触发 Moveable 的 dragStart，使首次点击即可进入拖拽状态
    moveableRef.value.dragStart(e)
  })
}

/**
 * 根据 DOM 元素反向查找对应的画布节点数据
 * @param element 画布节点 DOM 元素（带有 data-node-id 属性）
 */
function getNodeByTarget(element: HTMLElement) {
  const id = element.getAttribute('data-node-id')
  return editorStore.findNode(id)
}

/**
 * 处理 Moveable 拖拽移动事件
 * @param e 拖拽事件（包含最新的 left/top 坐标）
 */
function onDrag(e: OnDrag) {
  // 这里记录笔记 为什么这里要手动设置css？为了手动更新
  // 原因：Moveable 默认不直接修改目标元素的样式，需要手动同步位置，
  // 这样能保证 DOM 与 store 数据保持一致，且避免 Moveable 内部缓存导致的位置偏差。
  // 注意：这里统一使用 e.target 而非 selectedTarget，
  // 以便单选（目标为单个元素）与多选群组拖拽（遍历每个元素的拖拽事件）都能正确更新对应的 DOM。
  e.target.style.left = e.left + 'px'
  e.target.style.top = e.top + 'px'
  // 根据被拖拽的 DOM 元素反向查找对应的节点数据
  const node = getNodeByTarget(e.target as HTMLElement)
  // 同步更新 store 中节点的布局数据
  node.layout.x = e.left
  node.layout.y = e.top
}

/**
 * 处理 Moveable 缩放事件
 * @param e 缩放事件（包含最新的宽高及拖拽信息）
 */
function onResize(e: OnResize) {
  // 手动更新目标元素的宽高样式（同理使用 e.target 以兼容单/多选）
  e.target.style.width = e.width + 'px'
  e.target.style.height = e.height + 'px'
  // 根据被缩放的 DOM 元素反向查找对应的节点数据
  const node = getNodeByTarget(e.target as HTMLElement)
  // 同步更新 store 中节点的尺寸数据
  node.layout.width = e.width
  node.layout.height = e.height
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
}

/**
 * 处理 Selecto 框选结束事件
 * @param e 框选结束事件（包含最终选中的 DOM 元素列表）
 */
function onSelectEnd(e) {
  // 提取选中元素的节点 id 列表，并同步到 store（支持多选）
  const ids = e.selected.map((element) => element.getAttribute('data-node-id'))
  editorStore.selectedNodeIds = ids
}

/**
 * 处理多选群组拖拽事件
 * 遍历每个元素的拖拽事件，逐个复用 onDrag 同步 DOM 样式与 store 数据
 * @param e 群组拖拽事件（包含每个元素各自的拖拽信息）
 */
function onDragGroup(e: OnDragGroup) {
  e.events.forEach(onDrag)
}

/**
 * 处理多选群组缩放事件
 * 遍历每个元素的缩放事件，逐个复用 onResize 同步 DOM 样式与 store 数据
 * @param e 群组缩放事件（包含每个元素各自的缩放信息）
 */
function onResizeGroup(e: OnResizeGroup) {
  e.events.forEach(onResize)
}

function onZoomChange() {
  moveableRef.value.updateRect()
}
</script>

<template>
  <div ref="canvasRoot" class="canvas-root container">
    <SketchRuler
      :scale="scale"
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
      @dragGroup="onDragGroup"
      @resize="onResize"
      @resizeGroup="onResizeGroup"
    ></Moveable>
  </div>
</template>

<style scoped lang="scss">
.canvas-root {
  height: 100%;
  .canvas-stage {
    position: relative;
    background: bg-mix(40);
    .canvas-node {
      position: absolute;
    }
  }
}
</style>
