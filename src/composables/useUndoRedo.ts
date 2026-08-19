import { getValue, setValue } from '@/utils'

// 撤销和重做栈在多个组件实例之间共享，保证属性表单与工具栏操作的是同一份历史记录。
const undoStack = shallowReactive([])
const redoStack = shallowReactive([])

/**
 * 提供属性修改的历史记录能力。
 * 每条记录保存修改目标、字段路径以及修改前后的值，便于在两个栈之间移动。
 */
export function useUndoRedo() {
  const canUndo = computed(() => undoStack.length > 0)
  const canRedo = computed(() => redoStack.length > 0)

  let activeBatch = null
  /**
   * 开始批次处理
   */
  function startBatch() {
    activeBatch = []
  }
  /**
   * 提交当前批处理
   */
  function commitBatch() {
    if (activeBatch.length) {
      undoStack.push(activeBatch)
    }
    activeBatch = null
  }

  /**
   * 应用一次字段修改并记录历史。
   * 新修改会使此前的重做记录失效，这是编辑器历史栈的标准分支行为。
   */
  function applyChange(target, key, newValue) {
    const oldValue = getValue(target, key)
    if (newValue === oldValue) return

    // 保存修改前后的值，撤销时恢复 oldValue，重做时恢复 newValue。
    const record = { target, key, newValue, oldValue }
    if (activeBatch) {
      // 优化多次记录同类操作的问题
      const _record = activeBatch.find((item) => item.target === target && item.key === key)
      if (_record) {
        // 之前改过，更新newValue就行
        _record.newValue = newValue
      } else {
        // 存在批处理，且是第一次修改，就放进去
        activeBatch.push(record)
      }
    } else {
      undoStack.push([record])
    }
    setValue(target, key, newValue)
    redoStack.length = 0
  }

  /** 将最近一次修改恢复为修改前的值，并转移到重做栈。 */
  function undo() {
    const records = undoStack.pop()
    if (!records) return
    records.toReversed().forEach((record) => {
      const { target, key, oldValue } = record
      // 撤销是回退老值
      setValue(target, key, oldValue)
    })
    // 放入到重做的栈中
    redoStack.push(records)
  }

  /** 将最近一次撤销的修改重新应用，并转移回撤销栈。 */
  function redo() {
    const records = redoStack.pop()
    if (!records) return
    records.toReversed().forEach((record) => {
      const { target, key, newValue } = record
      // 重做是设置新值
      setValue(target, key, newValue)
    })
    // 放入到撤销的栈中
    undoStack.push(records)
  }
  return {
    canUndo,
    canRedo,
    applyChange,
    undo,
    redo,
    startBatch,
    commitBatch,
  }
}
