/**
 * 全局白名单 表示沙箱环境可以访问的全局属性
 */
const globalKeys = new Set(['console', 'Promise'])
/**
 * 在沙箱中运行代码
 * @param code
 */
export function runSandbox(code: string, scoped: Record<string, unknown>) {
  // obj[Symbol.unscopables] = {
  // 排除 b 属性
  // b: true
  // }

  const sandbox = new Proxy(scoped, {
    has() {
      return true
    },
    get(target, key) {
      // 过滤unscopables 属性
      if (key === Symbol.unscopables) return
      if (Object.hasOwn(target, key)) {
        // 访问target属性
        return target[key as string]
      }
      if (globalKeys.has(key as string)) {
        const value = globalThis[key]
        // 处理全局方法this丢失的问题
        return typeof value === 'function' ? value.bind(globalThis) : value
      }
      throw new ReferenceError(`${String(key)} 在沙箱中不可访问`)
    },
  })

  const fn = new Function(
    'sandbox',
    `
      const asyncFn = async() => {
        with (sandbox){
          ${code}
        }
      }
      asyncFn()
    `,
  )

  fn(sandbox)
}
