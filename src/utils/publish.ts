import type { PageSchema } from '@/schema/page'

/**
 * 存到 localStorage 的 key
 */
const SCREEN_PUBLISH = 'screen-published'

/**
 * 存储结构
 * {
 *  '123': JSON.stringify(page)
 * }
 */

export function publishPage(page: PageSchema) {
  let value: string | Record<string, unknown> = localStorage.getItem(SCREEN_PUBLISH)
  if (value) {
    value = JSON.parse(value)
  } else {
    // 没有值，改成对象
    value = {}
  }
  // 如果page.id存在，直接用，否则创建 UUID
  const id = page.id || crypto.randomUUID()
  value[id] = page
  page.id = id

  localStorage.setItem(SCREEN_PUBLISH, JSON.stringify(value))
  return id
}

export function getPublishPage(id) {
  const value = localStorage.getItem(SCREEN_PUBLISH)
  const map = JSON.parse(value)
  const page = map[id]
  if (!page) {
    // 如果 localStorage 没有
    throw new Error(`数据库没查到 id 为 ${id} 的数据 `)
  }
  return page
}
