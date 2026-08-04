import type { MaterialSchema } from "./material"

interface CanvasSchema {
  width: number
  height: number
  backgroundColor: string
}

export interface PageSchema {
  canvas: CanvasSchema
  // 页面上的节点是列表；后续增删、查找、排序都基于数组操作。
  nodes: MaterialSchema[]
}
