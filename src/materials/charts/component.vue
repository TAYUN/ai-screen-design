<script setup lang="ts">
import type { MaterialSchema } from '@/schema/material'
import { init, type EChartsOption, type EChartsType } from 'echarts'
defineOptions({
  name: 'ChartMaterial',
})
const props = defineProps<{ schema: MaterialSchema }>()
const chartRef = useTemplateRef('chart')
let chart: EChartsType
const option = computed(() => props.schema.props.option as EChartsOption)
watch(
  option,
  () => {
    chart.setOption(option.value)
  },
  { deep: true },
)
onMounted(() => {
  chart = init(chartRef.value)
  chart.setOption(option.value)
  const observer = new ResizeObserver(() => {
    chart.resize()
  })

  observer.observe(chartRef.value)

  onBeforeMount(() => {
    observer.disconnect()
    chart.dispose()
  })
})
</script>

<template>
  <div class="char-material w-full h-full" ref="chart"></div>
</template>

<style scoped lang="scss"></style>
