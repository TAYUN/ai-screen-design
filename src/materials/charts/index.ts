import type { MaterialModule } from '@/materials'
import ChartMaterial from './component.vue'
import { barMaterial } from './bar.ts'
import { areaMaterial } from './area.ts'
import { lineMaterial } from './line.ts'
import { pieMaterial } from './pie.ts'

const chartMaterials = [barMaterial, areaMaterial, lineMaterial, pieMaterial]

export const install: MaterialModule['install'] = (register) => {
  // 图表分类一次注册多个物料，便于按目录拆分维护。
  chartMaterials.forEach((material) => {
    register(material, ChartMaterial)
  })
}
