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
  /**
   * 接口请求的地址
   */
  url?: string

  /**
   * 请求方法
   */
  method?: 'get' | 'post'

  /**
   * 响应路径
   * 'res.list'
   */
  responsePath?: string
  /**
   * 接口轮询间隔 ms
   */
  interval?: number
  /**
   * 预设参数，会发送给后端
   */
  params?: Record<string, unknown>
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
