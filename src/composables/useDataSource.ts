import type { DataSourceSchema } from '@/schema/page'
import axios from 'axios'

export function useDataSource(dataId: Ref<string>) {
  let timer
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
  const data = ref()

  async function loadData() {
    if (!source.value) return
    if (source.value.type === 'api') {
      const url = source.value.url
      if (!url) {
        data.value = []
        return
      }

      try {
        // 获取url参数
        const search = new URLSearchParams(location.search)
        // 把url参数转成对象
        const params = Object.fromEntries(search.entries())
        const res = await axios.get(url, {
          params: {
            // 请求的参数
            ...source.value.params,
            // URL 上面的参数优先级高，可以覆盖预设参数
            ...params,
          },
        })

        // 图表 dataset.source 使用数组数据，与静态数据源保持一致。
        data.value = Array.isArray(res.data) ? res.data : []
      } catch (error) {
        console.error(`加载数据源“${source.value.name}”失败`, error)
        data.value = []
      } finally {
        if (source.value.interval) {
          timer = setTimeout(() => {
            loadData()
          }, source.value.interval)
        }
      }
    } else {
      data.value = source.value?.data
    }
  }

  onBeforeUnmount(() => {
    // 组件销毁前，清理定时器
    clearTimeout(timer)
  })
  /**
   * source 发生变化时立即加载对应数据。
   */
  watch(source, loadData, { immediate: true })

  return {
    data,
  }
}
