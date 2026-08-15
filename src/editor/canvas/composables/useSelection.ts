import type { Ref, ShallowRef } from 'vue'
import type { MaterialSchema } from '@/schema/material'
import { useEditorStore } from '@/stores/editor'
import { storeToRefs } from 'pinia'

interface SelectionOptions {
  stageRef: Ref<HTMLElement | null>
  moveableRef: Ref<{ dragStart: (event: MouseEvent) => void } | null>
  selectedTarget: ShallowRef<HTMLElement[] | undefined>
}

/**
 * 管理节点单选、多选和 Selecto 框选，并将 store 中的选中 id 映射为 Moveable 目标。
 */
export function useSelection({ stageRef, moveableRef, selectedTarget }: SelectionOptions) {
  const editorStore = useEditorStore()
  const { selectedNodeIds } = storeToRefs(editorStore)

  watch(
    selectedNodeIds,
    (ids) => {
      selectedTarget.value = ids.map((id) => {
        // 锁定节点不能作为 Moveable 目标。
        return stageRef.value.querySelector(`[data-node-id='${id}']:not([data-node-locked='true'])`)
      })
    },
    { deep: true, flush: 'post' },
  )

  function onSelect(node: MaterialSchema, event: MouseEvent) {
    editorStore.selectNode(node.id)

    nextTick(() => {
      // 等待选中状态驱动 DOM 更新后，再启动首次拖拽。
      moveableRef.value.dragStart(event)
    })
  }

  function onClearSelected() {
    editorStore.clearSelected()
  }

  function onSelectEnd(event) {
    const ids = event.selected.map((element) => element.getAttribute('data-node-id'))
    // 保持现有行为：框选结果直接写回 store。
    editorStore.selectedNodeIds = ids
  }

  return {
    onSelect,
    onClearSelected,
    onSelectEnd,
  }
}
