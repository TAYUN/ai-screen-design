<script setup lang="ts">
import { useDataSource } from '@/composables/useDataSource'
import type { MaterialSchema } from '@/schema/material'
import { init, type EChartsOption, type EChartsType } from 'echarts'
defineOptions({
  name: 'ChartMaterial',
})
const props = defineProps<{ schema: MaterialSchema }>()

const chartRef = useTemplateRef('chartRef')
let chart: EChartsType
const dataId = computed(() => props.schema.dataId)

const { data } = useDataSource(dataId)

const option = computed(() => {
  const _option = props.schema.props.option as EChartsOption
  return {
    ..._option,
    dataset: {
      ..._option.dataset,
      // 重写source，如果数据源中存在这个数据，就使用，否则使用自带的。
      source: data.value || _option.dataset.source,
    },
  }
})

watch(
  option,
  (newValue) => {
    chart.setOption(newValue)
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
  <div class="char-material w-full h-full" ref="chartRef"></div>
</template>

<style scoped lang="scss"></style>
