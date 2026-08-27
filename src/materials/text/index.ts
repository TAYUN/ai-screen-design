import type { MaterialModule } from '@/materials'
import type { MaterialDefinition } from '@/schema/material.ts'
import TextMaterial from './component.vue'
// 文本物料直接提供默认节点 DSL，后续拖入画布时可直接作为初始状态。
const textMaterial: MaterialDefinition = {
  name: '文本',
  group: 'components',
  icon: 'ri:text',
  setters: [
    {
      type: 'input',
      label: '内容',
      key: 'props.content',
    },
    {
      type: 'color',
      label: '颜色',
      key: 'style.color',
    },
    {
      type: 'number',
      label: '字号',
      key: 'style.fontSize',
    },
  ],
  schema: {
    type: 'text',
    name: '文本',
    layout: {
      x: 0,
      y: 0,
      width: 240,
      height: 64,
    },
    style: {
      color: 'white',
      fontSize: 16,
    },
    props: {
      content: '双击编辑文本',
      ellipsis: false,
      writingMode: 'horizontal-tb',
    },
  },
}

// 单物料模块直接注册即可，保持每个目录都有统一的 install 入口。
export const install: MaterialModule['install'] = (register) => {
  register(textMaterial, TextMaterial)
}
