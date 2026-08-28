<script setup lang="ts">
import { getPublishPage } from '@/utils/publish'
import ScreenRenderer from '@/components/ScreenRenderer/index.vue'
import { useRoute } from 'vue-router'

defineOptions({
  name: 'ScreenPage',
})

const route = useRoute()
/**
 * 从 localStorage 中获取配置，工作中是从后台中获取配置
 */
const page = getPublishPage(route.query.id as string)
</script>

<template>
  <ScreenRenderer :page="page" />
</template>

<style scoped lang="scss"></style>
