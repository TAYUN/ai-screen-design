export interface MaterialGroup {
  key: string
  name: string
  icon: string
  // 后续如需支持分组说明、排序、权限控制，可继续在这里扩展字段。
}

export interface MaterialItem {
  name: string
  group: MaterialGroup['key']
  icon: string
  // 后续如需支持物料描述、标签、组件配置等信息，可继续在这里扩展字段。
}

export type MaterialRegister = (material: MaterialItem) => void

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

const materials: MaterialItem[] = []

// 统一注册物料定义，并基于名称去重，避免重复加载同一物料模块。
export function register(material: MaterialItem) {
  const exists = materials.some(item => item.name === material.name)

  if (exists) {
    return
  }

  materials.push(material)
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
