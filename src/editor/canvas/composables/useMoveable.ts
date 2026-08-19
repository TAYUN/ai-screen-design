import type { OnDrag, OnDragGroup, OnResize, OnResizeGroup } from 'vue3-moveable'
import { useEditorStore } from '@/stores/editor'
import { useUndoRedo } from '@/composables/useUndoRedo'

/**
 * 管理 Moveable 的单节点和群组拖拽、缩放事件，并同步节点布局数据。
 */
export function useMoveable(moveableRef) {
  const { applyChange, startBatch, commitBatch } = useUndoRedo()

  const editorStore = useEditorStore()

  function getNodeByTarget(element: HTMLElement) {
    const id = element.getAttribute('data-node-id')
    return editorStore.findNode(id)
  }

  // 当 moveable 的layout 发生变化后，手动更新movable的选框
  watch(
    () =>
      editorStore.nodes.map((node) => {
        return node.layout
      }),
    () => {
      // 手动更新方法
      moveableRef.value.updateRect(undefined, true)
    },
    { flush: 'post' },
  )

  function onStart() {
    startBatch()
  }

  function onEnd() {
    commitBatch()
  }

  function onDrag(event: OnDrag) {
    // Moveable 不会自动修改目标样式，这里同时同步 DOM 和 store。
    event.target.style.left = event.left + 'px'
    event.target.style.top = event.top + 'px'
    const node = getNodeByTarget(event.target as HTMLElement)
    applyChange(node, 'layout', {
      ...node.layout,
      x: event.left,
      y: event.top,
    })
  }

  function onResize(event: OnResize) {
    event.target.style.width = event.width + 'px'
    event.target.style.height = event.height + 'px'
    const node = getNodeByTarget(event.target as HTMLElement)
    node.layout.width = event.width
    node.layout.height = event.height
    applyChange(node, 'layout', {
      ...node.layout,
      width: event.width,
      height: event.height,
    })
    // 缩放可能同时改变 left/top，复用拖拽逻辑同步位置。
    onDrag(event.drag)
  }

  function onDragGroup(event: OnDragGroup) {
    event.events.forEach(onDrag)
  }

  function onResizeGroup(event: OnResizeGroup) {
    event.events.forEach(onResize)
  }

  return {
    onDrag,
    onResize,
    onDragGroup,
    onResizeGroup,
    onStart,
    onEnd,
  }
}
