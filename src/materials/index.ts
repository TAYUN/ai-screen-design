import type { Component } from 'vue'
import type { MaterialDefinition, MaterialGroup } from './types'
// export type { MaterialDefinition, MaterialGroup, MaterialLayout, MaterialSchema } from './types'

export type MaterialRegister = (material: MaterialDefinition, component: Component) => void

export interface MaterialModule {
  install: (register: MaterialRegister) => void
}

const groups: MaterialGroup[] = [
  {
    key: 'charts',
    name: '图表',
    icon: 'ri:bar-chart-grouped-line',
  },
  {
    key: 'components',
    name: '组件',
    icon: 'ri:apps-2-line',
  },
  {
    key: 'decoration',
    name: '装饰',
    icon: 'ri:sparkling-line',
  },
]

const materials: MaterialDefinition[] = []
const componentMap = new Map()
// 统一注册物料定义，并基于名称去重，避免重复加载同一物料模块。
export function register(material: MaterialDefinition, component: Component) {
  materials.push(material)
  componentMap.set(material.schema.type, component)
}

const materialModules = import.meta.glob<MaterialModule>('./*/index.ts', {
  eager: true,
})

// 自动执行各物料模块的安装逻辑，后续新增物料目录后无需手动维护入口。
Object.values(materialModules).forEach((module) => {
  module.install(register)
})

const groupMap = new Map(groups.map(group => [group.key, group]))

// 返回物料分组定义，供物料面板左侧导航使用。
export function getMaterialGroups() {
  return groups
}

// 按分组筛选已注册的物料，供右侧物料列表展示。
export function getMaterialsByGroup(group: string) {
  return materials.filter(item => item.group === group)
}

// 根据分组 key 获取分组信息，便于面板展示当前标题。
export function getMaterialGroup(group: string) {
  return groupMap.get(group)
}

// 根据 type 获取组件，供画布渲染组件使用
export function getMaterialComponent(type: string) {
  return componentMap.get(type)
}
// 创建节点函数
export function createNode(node) {
  return {
    ...node,
    id: crypto.randomUUID(),
  }
}