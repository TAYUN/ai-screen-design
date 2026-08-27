<!--
  大屏自适应预览的实现原理：
  1. 画布使用编辑器中配置的固定设计尺寸，节点始终按照设计稿坐标进行绝对定位，
     从而保证不同屏幕下的内容比例和相对位置保持一致。
  2. 分别计算视口宽高与设计稿宽高的比例，取较小值作为统一缩放比例，确保整个画布
     完整显示在视口内，并避免宽高分别缩放导致内容变形。
  3. 根据缩放后的画布尺寸计算水平和垂直偏移，通过 CSS transform 同时完成平移和缩放，
     并将变换原点固定在左上角，便于使用设计稿坐标进行布局。
  4. 监听窗口尺寸变化，在浏览器尺寸变化时重新计算缩放比例和偏移量。
-->
<script setup lang="ts">
import { getMaterialComponent } from '@/materials'
import type { MaterialSchema } from '@/schema/material'
import type { PageSchema } from '@/schema/page'

defineOptions({
  name: 'ScreenRenderer',
})

const props = defineProps<{ page: PageSchema }>()

const nodes = computed(() => props.page.nodes)
const canvas = computed(() => props.page.canvas)
const dataSources = computed(() => props.page.dataSources)

// 画布的统一缩放比例，以及缩放后画布在视口中的水平、垂直偏移量。
const scale = ref(1)
const left = ref(0)
const top = ref(0)

// 向画布内的物料组件提供数据源，避免逐层传递公共数据。
provide('dataSources', dataSources)

// 将画布尺寸、背景色和自适应变换组合成根画布的内联样式。
const canvasStyle = computed(() => {
  return {
    width: canvas.value.width + 'px',
    height: canvas.value.height + 'px',
    backgroundColor: canvas.value.backgroundColor,
    transform: `translate(${left.value}px, ${top.value}px) scale(${scale.value})`,
    transformOrigin: 'left top',
  }
})

/**
 * 根据节点的布局信息生成内联样式（用于绝对定位）
 * @param node 物料节点 schema
 * @returns 包含宽高和左上角坐标的样式对象
 */
function getNodeStyle(node: MaterialSchema, index: number) {
  return {
    width: node.layout.width + 'px',
    height: node.layout.height + 'px',
    left: node.layout.x + 'px',
    top: node.layout.y + 'px',
    zIndex: index + 1,
  }
}

function init() {
  // 分别计算宽度和高度方向的可用缩放比例。
  const x = window.innerWidth / canvas.value.width
  const y = window.innerHeight / canvas.value.height

  // 取较小比例，保证画布在宽高两个方向上都不会超出视口。
  scale.value = Math.min(x, y)

  // 计算缩放后的实际尺寸，并在视口中水平、垂直居中。
  left.value = (window.innerWidth - canvas.value.width * scale.value) / 2
  top.value = (window.innerHeight - canvas.value.height * scale.value) / 2
}
onMounted(() => {
  // 首次进入预览时计算布局，并在窗口尺寸变化后重新计算。
  init()
  addEventListener('resize', init)
  onBeforeUnmount(() => {
    // 页面销毁时移除监听，避免重复监听和无效的布局计算。
    removeEventListener('resize', init)
  })
})
</script>

<template>
  <div class="preview-container">
    <div class="canvas-root" :style="canvasStyle">
      <div
        class="canvas-node"
        v-for="(node, index) in nodes"
        :key="node.id"
        :style="getNodeStyle(node, index)"
      >
        <component :is="getMaterialComponent(node.type)" :schema="node" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.preview-container {
  // 预览容器占满浏览器视口，作为画布居中的参照区域。
  width: 100vw;
  height: 100vh;
  .canvas-root {
    // 节点以画布左上角为坐标原点进行绝对定位。
    position: relative;
    .canvas-node {
      // 节点位置和尺寸来自设计稿，通过父级 transform 统一缩放。
      position: absolute;
    }
  }
}
</style>
