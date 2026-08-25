import Mock from 'mockjs'

Mock.setup({
  timeout: 3000,
})

Mock.mock(/\/api\/data/, 'get', (options) => {
  // 创建 完整URL
  const url = new URL(options.url, location.origin)
  // 创建 URL 参数对象
  const search = new URLSearchParams(url.search)
  const date = search.get('date')
  const data = Mock.mock({
    // 数组模板会按 list|8 的规则生成八条独立记录。
    'list|8': [
      {
        'label|+1': ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月'],
        'value|100-1000': 100,
        date,
      },
    ],
  })

  return data.list
})
