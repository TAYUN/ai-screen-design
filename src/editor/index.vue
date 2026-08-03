<script setup lang="ts">
import { useEditorStore } from '@/stores/editor.ts'
import ToolbarLeft from './toolbar/ToolbarLeft.vue'
import ToolbarRight from './toolbar/ToolbarRight.vue'
import MaterialPanel from './panels/material/index.vue'
import LayerPanel from './panels/layer/index.vue'
import CanvasRoot from './canvas/index.vue'

defineOptions({
  name: 'ScreenEditor',
})

const editStore = useEditorStore()

const materialWidth = computed(() => (editStore.panelVisible.material ? '260px' : 0))
const layerWidth = computed(() => (editStore.panelVisible.layer ? '220px' : 0))
const propertyWidth = computed(() => (editStore.panelVisible.property ? '260px' : 0))
</script>
<template>
  <div class="editor h-screen select-none">
    <header class="header h-56 flex items-center px-20">
      <ToolbarLeft class="w-300" />
      <div class="flex-1 text-center">中</div>
      <ToolbarRight class="w-300" />
    </header>
    <main class="h-[calc(100%-56px)] flex">
      <aside class="material overflow-hidden transition-all" :style="{ width: materialWidth }">
        <MaterialPanel />
      </aside>
      <aside class="layer overflow-hidden transition-all" :style="{ width: layerWidth }">
        <LayerPanel />
      </aside>
      <div class="canvas flex-1">
        <CanvasRoot />
      </div>
      <aside class="property overflow-hidden transition-all" :style="{ width: propertyWidth }">
        属性
      </aside>
    </main>
  </div>
</template>

<style scoped lang="scss">
.editor {
  background: var(--bg-color);

  .header {
    border-bottom: 1px solid var(--border-color);
  }

  .material,
  .layer {
    border-right: 1px solid var(--border-color);
  }

  .layer {
    background: bg-mix(12);
  }

  .property {
    border-left: 1px solid var(--border-color);
  }
}
</style>
