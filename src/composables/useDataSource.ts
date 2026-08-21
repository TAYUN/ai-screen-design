import type { DataSourceSchema } from '@/schema/page'

export function useDataSource(dataId: Ref<string>) {
  /**
   * 物料状态来源
   * 1. 编辑时的状态 => 编辑器在用的状态
   * 2. 运行时的状态 => 渲染器在用的状态
   */
  const dataSources = inject<Ref<DataSourceSchema[]>>('dataSources')
  /**
   * source：
   * id
   * type = static | api
   * name
   * data
   */
  const source = computed(() => {
    const source = dataSources.value.find((item) => item.id === dataId.value)
    return source
  })

  /**
   * 保存用于组件消费的数据
   */
  const data = computed(() => source.value?.data)
  return {
    data,
  }
}
