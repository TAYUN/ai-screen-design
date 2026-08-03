
import type { MaterialItem, MaterialModule } from '@/materials'

const textMaterial: MaterialItem = {
  name: '文本',
  group: 'components',
  icon: 'ri:text',
}

// 单物料模块直接注册即可，保持每个目录都有统一的 install 入口。
export const install: MaterialModule['install'] = (register) => {
  register(textMaterial)
}
