<script setup lang="ts">
import { useDataSource } from '@/composables/useDataSource'
import type { MaterialSchema } from '@/schema/material'
import { init, type DatasetComponentOption, type EChartsOption, type EChartsType } from 'echarts'
defineOptions({
  name: 'ChartMaterial',
})
const props = defineProps<{ schema: MaterialSchema }>()

const chartRef = useTemplateRef('chartRef')
let chart: EChartsType
const dataId = computed(() => props.schema.dataId)

const { data } = useDataSource(dataId)

const option = computed(() => {
  const baseOption = props.schema.props.option as EChartsOption
  const baseDataset = (
    Array.isArray(baseOption.dataset) ? baseOption.dataset[0] : baseOption.dataset
  ) as DatasetComponentOption

  return {
    ...baseOption,
    dataset: {
      ...baseDataset,
      // dataId 未绑定或找不到时，保留物料默认数据。
      source: data.value ?? baseDataset?.source,
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
