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
