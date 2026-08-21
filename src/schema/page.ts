import type { MaterialSchema } from './material'

export interface DataSourceSchema {
  /**
   * 数据源类型
   * static 静态数据
   * api 接口请求数据
   */
  type: 'static' | 'api'
  id: string
  name: string
  /**
   * 数据源载体
   */
  data: unknown
}

interface CanvasSchema {
  width: number
  height: number
  backgroundColor: string
}

export interface PageSchema {
  canvas: CanvasSchema
  // 页面上的节点是列表；后续增删、查找、排序都基于数组操作。
  nodes: MaterialSchema[]
  dataSources: DataSourceSchema[]
}
