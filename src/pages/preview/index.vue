<script setup lang="ts">
import { useEditorStore } from '@/stores/editor'
import { storeToRefs } from 'pinia'
import ScreenRenderer from '@/components/ScreenRenderer/index.vue'

defineOptions({
  name: 'ScreenPreview',
})
/**
 * 点击预览，从 editorStorage 中获取配置
 */
const editorStore = useEditorStore()
const { page } = storeToRefs(editorStore)
</script>

<template>
  <ScreenRenderer :page="page" />
</template>
