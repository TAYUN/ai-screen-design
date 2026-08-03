<script setup lang="ts">
import { createNode, getMaterialComponent } from '@/materials'
import type { MaterialSchema } from '@/materials/types'
import { useEditorStore } from '@/stores/editor'
import { storeToRefs } from 'pinia'
import Moveable, { type OnDrag, type OnResize } from 'vue3-moveable'

defineOptions({
  name: 'CanvasRoot',
})

const editorStore = useEditorStore()

const { nodes, selectedNode } = storeToRefs(editorStore)

const moveableRef = useTemplateRef('moveable')

const selectedTarget = shallowRef<HTMLElement>()

const vm = getCurrentInstance()

function onDrop(e: DragEvent) {
  const data = e.dataTransfer.getData('schema')
  const node = createNode(JSON.parse(data))
  // 组件中心在鼠标落点
  node.layout.x = e.offsetX - node.layout.width / 2
  node.layout.y = e.offsetY - node.layout.height / 2
  editorStore.addNode(node)
  // 开启放入就选中
  editorStore.selectNode(node.id)
  nextTick(() => {
    selectedTarget.value = vm.proxy.$el.querySelector(`[data-node-id='${node.id}']`)
  })
}

function getNodeStyle(node: MaterialSchema) {
  return {
    width: node.layout.width + 'px',
    height: node.layout.height + 'px',
    left: node.layout.x + 'px',
    top: node.layout.y + 'px',
  }
}
function onSelect(node: MaterialSchema, e: MouseEvent) {
  // 这里记一下笔记为什么用e.currentTarget 而不是 e.target，为什么要断言
  selectedTarget.value = e.currentTarget as HTMLElement
  editorStore.selectNode(node.id)

  nextTick(() => {
    // 解决第一次选中不能拖动的问题
    moveableRef.value.dragStart(e)
  })
}
function onDrag(e: OnDrag) {
  // 这里记录笔记 为什么这里要手动设置css？为了手动更新
  selectedTarget.value.style.left = e.left + 'px'
  selectedTarget.value.style.top = e.top + 'px'

  selectedNode.value.layout.x = e.left
  selectedNode.value.layout.y = e.top
}

function onResize(e: OnResize) {
  selectedTarget.value.style.width = e.width + 'px'
  selectedTarget.value.style.height = e.height + 'px'

  selectedNode.value.layout.width = e.width
  selectedNode.value.layout.height = e.height
  // 记录这里为什么要调用onDrag？解决往左缩放却往右边缩放不符合预期的问题
  onDrag(e.drag)
}
function onClearSelected() {
  editorStore.clearSelected()
  selectedTarget.value = null
}
</script>

<template>
  <div class="canvas-root container">
    <div class="canvas-stage" @dragover.prevent @drop="onDrop" @mousedown.self="onClearSelected">
      <div
        class="canvas-node"
        v-for="node in nodes"
        :key="node.id"
        :style="getNodeStyle(node)"
        :data-node-id="node.id"
        @mousedown="onSelect(node, $event)"
      >
        <component :is="getMaterialComponent(node.type)" :schema="node"></component>
      </div>
    </div>
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
