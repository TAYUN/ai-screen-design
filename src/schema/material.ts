
export interface MaterialGroup {
  key: string
  name: string
  icon: string
  // 后续如需支持分组说明、排序、权限控制，可继续在这里扩展字段。
}

export interface MaterialLayout {
  x: number
  y: number
  width: number
  height: number
}

export interface MaterialSchema {
  id: string
  type: string
  name: string
  layout: MaterialLayout
  locked: boolean
  style: Record<string, unknown>
  props: Record<string, unknown>
}

interface SetterSchema {
  key: string
  type: string
  label: string
  [key: string]: unknown
}

// DSL 定义，既描述物料面板展示信息，也提供拖入画布时的默认节点模板。
export interface MaterialDefinition {
  //  物料唯一标识，供注册、拖拽和后续渲染映射使用。
  name: string
  group: MaterialGroup['key']
  icon: string
  setters: SetterSchema[]
  schema: Omit<MaterialSchema, 'id'>
  // 后续如需支持物料描述、标签、组件配置等信息，可继续在这里扩展字段。
}
