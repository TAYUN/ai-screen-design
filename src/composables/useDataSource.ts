import type { DataSourceSchema } from '@/schema/page'
import { getValue } from '@/utils'
import axios from 'axios'

export function useDataSource(dataId: Ref<string>) {
  let timer
  const loading = ref(false)
  const error = ref()
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

  async function loadData(params?: Record<string, unknown>) {
    // 取消上一次的定时任务
    clearTimeout(timer)
    if (!source.value) return
    if (source.value.type === 'api') {
      const url = source.value.url
      if (!url) {
        data.value = []
        return
      }
      try {
        // 请求之前设置 loading
        loading.value = true
        const res = await fetchData(source.value, params)

        // 图表 dataset.source 使用数组数据，与静态数据源保持一致。
        data.value = res
      } catch (e) {
        error.value = e
        console.error(`加载数据源“${source.value.name}”失败`, e)
        data.value = []
      } finally {
        // 请求回来了，取消loading
        loading.value = false
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
  watch(
    source,
    () => {
      loadData()
    },
    { immediate: true },
  )

  return {
    data,
    loading,
    error,
    refresh: loadData,
  }
}
/**
 * 请求复用
 * 相同url、params、method 做请求复用
 * {'key': promise}
 */
const requestMap = {}
export async function fetchData(source: DataSourceSchema, data?: Record<string, unknown>) {
  // 获取url参数
  const search = new URLSearchParams(location.search)
  // 把url参数转成对象
  const params = Object.fromEntries(search.entries())
  const queryParams = {
    // 请求的参数
    ...source.params,
    // URL 上面的参数优先级高，可以覆盖预设参数
    ...params,
    // 手动传递的参数优先级最高
    ...data,
  }

  const paramsKey = source.method === 'post' ? 'post' : 'params'

  const config = {
    url: source.url,
    method: source.method,
    [paramsKey]: queryParams,
  }

  const key = JSON.stringify(config)
  if (requestMap[key]) {
    // 有缓存 使用缓存
    return requestMap[key]
  }

  // 没有缓存发送请求
  // const res = await axios.request(config)
  // res.data = {list : []}
  // responsePath = 'list'
  // return getValue(res.data, source.responsePath)

  const promise = axios
    .request(config)
    .then((res) => {
      return getValue(res.data, source.responsePath)
    })
    .finally(() => {
      // 请求回来了就删除
      delete requestMap[key]
    })

  requestMap[key] = promise
  return promise
}
