import type { MaterialItem, MaterialModule } from '@/materials'

const chartMaterials: MaterialItem[] = [
  {
    name: '柱状图',
    group: 'charts',
    icon: 'ri:bar-chart-box-line',
  },
  {
    name: '折线图',
    group: 'charts',
    icon: 'ri:line-chart-line',
  },
  {
    name: '饼图',
    group: 'charts',
    icon: 'ri:pie-chart-2-line',
  },
]

// 图表分类一次注册多个物料，便于按目录拆分维护。
export const install: MaterialModule['install'] = (register) => {
  chartMaterials.forEach((material) => {
    register(material)
  })
}
