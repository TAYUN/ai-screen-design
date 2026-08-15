<script setup lang="ts">
import { useEditorStore } from '@/stores/editor.ts'
import CanvasProperty from './components/CanvasProperty.vue'
import { storeToRefs } from 'pinia'
import NodePropterty from './components/NodePropterty.vue'

defineOptions({
  name: 'PropertyPanel',
})
const editorStore = useEditorStore()
const { selectedNode } = storeToRefs(editorStore)
</script>

<template>
  <div class="container">
    <NodePropterty v-if="selectedNode" />
    <CanvasProperty v-else />
  </div>
</template>

<style scoped lang="scss"></style>
