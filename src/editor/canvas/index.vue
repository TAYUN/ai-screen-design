<script setup lang="ts">
import { createNode, getMaterialComponent } from '@/materials'
import type { MaterialSchema } from '@/materials/types'

defineOptions({
  name: 'CanvasRoot',
})

const nodes = ref<MaterialSchema[]>([])

function onDrop(e: DragEvent) {
  const data = e.dataTransfer.getData('schema')
  console.log('data', data)
  const node = createNode(JSON.parse(data))
  // 生成uuid
  // node.id = crypto.randomUUID()

  nodes.value.push(node)
}
</script>

<template>
  <div class="canvas-root container">
    <div class="canvas-stage" @dragover.prevent @drop="onDrop">
      <div v-for="node in nodes" :key="node.id">
        <component :is="getMaterialComponent(node.type)" :schema="node"></component>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.canvas-root {
  .canvas-stage {
    width: 900px;
    height: 600px;
    background: bg-mix(40);
    margin: 100px;
  }
}
</style>
