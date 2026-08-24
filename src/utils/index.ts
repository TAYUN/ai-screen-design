export function debounce(fn, ms) {
  let timer
  return function (this, ...args) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, ms)
  }
}

export function getValue(target, key) {
  const keys = key.split('.')
  while (keys.length) {
    const key = keys.shift()
    target = target[key]
  }
  return target
}

export function setValue(target, key, value) {
  const keys = key.split('.')
  const lastKey = keys.pop()
  if (keys.length) {
    target = getValue(target, keys.join('.'))
  }
  target[lastKey] = value
}

/**
 * 深拷贝
 * 此处暂时不处理复杂情况，不做严格深拷贝后续再优化
 */
export function deepClone<T>(value: T): T {
  // 拦截基础类型
  if (typeof value !== 'object' || typeof value === null) return value
  return JSON.parse(JSON.stringify(value))
}
