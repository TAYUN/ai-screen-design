<script setup lang="ts">
import { useUndoRedo } from '@/composables/useUndoRedo'
import { useEditorStore } from '@/stores/editor'
defineComponent({
  name: 'ToolbarLeft',
})
const { panelVisible } = useEditorStore()
const { undo, redo, canRedo, canUndo } = useUndoRedo()
</script>

<template>
  <div class="toolbar-left flex items-center gap-8">
    <button
      type="button"
      :class="{ 'tool-btn': true, active: panelVisible.material }"
      aria-label="左面板"
      @click="panelVisible.material = !panelVisible.material"
    >
      <Icon icon="ri:layout-left-line" />
    </button>
    <button
      type="button"
      :class="{ 'tool-btn': true, active: panelVisible.property }"
      aria-label="右面板"
      @click="panelVisible.property = !panelVisible.property"
    >
      <Icon icon="ri:layout-right-line" />
    </button>
    <button
      type="button"
      :class="{ 'tool-btn': true, active: panelVisible.layer }"
      aria-label="图层"
      @click="panelVisible.layer = !panelVisible.layer"
    >
      <Icon icon="ri:stack-line" />
    </button>
    <button
      type="button"
      :class="{ 'tool-btn': true, disabled: !canUndo }"
      aria-label="撤销"
      @click="undo"
    >
      <Icon icon="ri:arrow-go-back-line" />
    </button>
    <button
      type="button"
      :class="{ 'tool-btn': true, disabled: !canRedo }"
      aria-label="反撤销"
      @click="redo"
    >
      <Icon icon="ri:arrow-go-forward-line" />
    </button>
  </div>
</template>

<style scoped lang="scss">
.tool-btn {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: #e2e8f0;
  background: rgba(15, 23, 42, 0.35);
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;

  &:hover {
    border-color: #60a5fa;
    background: rgba(59, 130, 246, 0.12);
    transform: translateY(-1px);
  }

  &.active {
    border-color: #38bdf8;
    background: rgba(56, 189, 248, 0.2);
    color: #f8fafc;
    box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.25) inset;
  }
  &.disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}
</style>
