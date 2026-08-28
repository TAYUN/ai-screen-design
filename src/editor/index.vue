<script setup lang="ts">
import { useEditorStore } from '@/stores/editor.ts'
import ToolbarLeft from './toolbar/ToolbarLeft.vue'
import ToolbarRight from './toolbar/ToolbarRight.vue'
import MaterialPanel from './panels/material/index.vue'
import LayerPanel from './panels/layer/index.vue'
import CanvasRoot from './canvas/index.vue'
import PropertyPanel from './panels/property/index.vue'
import { useRoute } from 'vue-router'
import { getPublishPage } from '@/utils/publish.ts'

defineOptions({
  name: 'ScreenEditor',
})

const editStore = useEditorStore()

const route = useRoute()
// /preview?id=1&id=2 query: {id: [1, 2]}
const pageId = route.query.id
if (pageId) {
  // 如果pageId有，去查询数据库（localStorage）
  const page = getPublishPage(pageId as string)
  editStore.setPage(page)
}

// const { dataSources } = storeToRefs(editStore)
// provide('dataSources', dataSources)

const materialWidth = computed(() => (editStore.panelVisible.material ? '260px' : 0))
const layerWidth = computed(() => (editStore.panelVisible.layer ? '220px' : 0))
const propertyWidth = computed(() => (editStore.panelVisible.property ? '360px' : 0))
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
        <PropertyPanel />
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
