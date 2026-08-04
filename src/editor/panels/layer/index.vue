<script setup lang="ts">
import { useEditorStore } from '@/stores/editor'
import { storeToRefs } from 'pinia'
import { useDraggable } from 'vue-draggable-plus'

defineOptions({
  name: 'LayerPanel',
})
const editorStore = useEditorStore()
const { nodes, selectedNodeIds } = storeToRefs(editorStore)

useDraggable('.layer-list', nodes, { animation: 150 })
</script>

<template>
  <div class="container h-full">
    <div class="layer-panel h-full overflow-auto">
      <div class="panel-head">图层</div>

      <div class="layer-list">
        <button
          v-for="node in nodes"
          :key="node.id"
          type="button"
          :class="{ 'layer-item': true, active: selectedNodeIds.includes(node.id) }"
          @click="editorStore.selectNode(node.id)"
        >
          <span class="layer-icon">
            <Icon icon="ri:bar-chart-grouped-line" />
          </span>
          <span class="layer-name">{{ node.name }}</span>
          <span class="layer-drag">
            <Icon icon="ri:draggable" />
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.layer-panel {
  display: flex;
  flex-direction: column;
  background: bg-mix(12);
}

.panel-head {
  padding: 12px 12px 0;
  font-size: 15px;
  font-weight: 600;
  color: #f8fafc;
}

.layer-list {
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
}

.layer-item {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #e2e8f0;
  background: bg-mix(20);
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;

  &:hover {
    border-color: rgba(148, 163, 184, 0.4);
    background: bg-mix(18);
  }

  &.active {
    border-color: rgba(56, 189, 248, 0.4);
    background: bg-mix(10);

    .layer-icon {
      color: #38bdf8;
    }
  }
}

.layer-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.04);
}

.layer-name {
  min-width: 0;
  flex: 1;
  font-size: 13px;
  line-height: 18px;
  font-weight: 500;
  color: #e2e8f0;
  text-align: left;
}

.layer-drag {
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #64748b;
}
</style>
