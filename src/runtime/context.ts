import type { MaterialSchema } from '@/schema/material'
import type { PageSchema } from '@/schema/page'
import { setValue } from '@/utils'

interface RuntimeContext {
  /**
   * 获取节点
   * @param id
   */
  getNode(id: string): MaterialSchema | undefined

  /**
   * 修改节点属性
   * setAttribute('123', 'props.content', '你好啊')
   */
  setAttribute(id: string, key: string, value: unknown): void
  /**
   * 修改节点 props
   * setProp('123', 'content', '你好啊')
   */
  setProp(id: string, key: string, value: unknown): void

  /**
   * 设置样式
   *
   */
  setStyle(id: string, key: string, value: unknown): void

  /**
   * 注册组件实例用的
   */
  registerNodeInstance(instances: Record<string, unknown>): void

  /**
   * 触发组件实例的方法
   * trigger('123', refresh)
   * 通知 id 为123 的组件执行刷新
   */

  trigger(id: string, name: string, ...args: unknown[]): unknown

  /**
   * 通过dataId 刷新所有组件中的数据
   */

  refreshNodesByDataId(dataId: string, ...args: unknown[]): void

  dispatch(id: string, name: string, payload?: unknown): void
}

export function createRuntimeContext(page: Ref<PageSchema>): RuntimeContext {
  let instanceMap = {}
  const getNode: RuntimeContext['getNode'] = (id) => {
    return page.value.nodes.find((node) => node.id === id)
  }

  const setAttribute: RuntimeContext['setAttribute'] = (id, key, value) => {
    const node = getNode(id)
    if (!node) {
      console.warn(`没有找到${id}节点`)
      return
    }
    setValue(node, key, value)
  }
  const setProp: RuntimeContext['setProp'] = (id, key, value) => {
    setAttribute(id, `props.${key}`, value)
  }
  const setStyle: RuntimeContext['setProp'] = (id, key, value) => {
    setAttribute(id, `style.${key}`, value)
  }

  const registerNodeInstance: RuntimeContext['registerNodeInstance'] = (instances) => {
    instanceMap = instances
  }

  const trigger: RuntimeContext['trigger'] = (id, name, ...args) => {
    const instance = instanceMap[id]
    if (!instance) {
      console.warn(`没找到id 为 ${id} 的组件实例`)
    }
    /**
     * 假设调用了组件的getData，那么getData 返回 123, trigger 也返回 123
     */
    return instance[name]?.(...args)
  }

  const refreshNodesByDataId: RuntimeContext['refreshNodesByDataId'] = (dataId, ...args) => {
    const nodes = page.value.nodes.filter((node) => node.dataId === dataId)
    nodes.forEach((node) => {
      trigger(node.id, 'refresh', ...args)
    })
  }

  const dispatch: RuntimeContext['dispatch'] = (id, name, payload) => {
    // 执行事件
    const node = getNode(id)
    if (!node) {
      console.warn(`没有找到${id}节点`)
      return
    }
    const event = node.events?.find((event) => event.name === name)
    if (event) {
      // 找到事件了，就执行
      event.handle?.(payload)
    }
  }

  return {
    getNode,
    setAttribute,
    setProp,
    setStyle,
    registerNodeInstance,
    trigger,
    refreshNodesByDataId,
    dispatch,
  }
}
