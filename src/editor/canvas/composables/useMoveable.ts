import type { OnDrag, OnDragGroup, OnResize, OnResizeGroup } from 'vue3-moveable'
import { useEditorStore } from '@/stores/editor'

/**
 * 管理 Moveable 的单节点和群组拖拽、缩放事件，并同步节点布局数据。
 */
export function useMoveable() {
  const editorStore = useEditorStore()

  function getNodeByTarget(element: HTMLElement) {
    const id = element.getAttribute('data-node-id')
    return editorStore.findNode(id)
  }

  function onDrag(event: OnDrag) {
    // Moveable 不会自动修改目标样式，这里同时同步 DOM 和 store。
    event.target.style.left = event.left + 'px'
    event.target.style.top = event.top + 'px'
    const node = getNodeByTarget(event.target as HTMLElement)
    node.layout.x = event.left
    node.layout.y = event.top
  }

  function onResize(event: OnResize) {
    event.target.style.width = event.width + 'px'
    event.target.style.height = event.height + 'px'
    const node = getNodeByTarget(event.target as HTMLElement)
    node.layout.width = event.width
    node.layout.height = event.height
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
  }
}
