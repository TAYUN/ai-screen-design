import type { MaterialSchema } from "@/materials/types";
import { defineStore } from "pinia";

/**
 * 编辑器全局状态 Store（Pinia setup 语法）
 *
 * 职责：
 * 1. 管理编辑器各面板（物料/图层/属性）的显示/隐藏状态
 * 2. 管理画布上所有组件节点（nodes）的增删与选中状态
 * 3. 提供选中节点的派生状态（selectedNode），供属性面板等消费
 */
export const useEditorStore = defineStore('editor', () => {
  // 面板可见性控制：material（物料面板）、layer（图层面板）、property（属性面板）
  const panelVisible = reactive({
    material: true,
    layer: true,
    property: true,
  })

  // 画布上的所有组件节点列表
  const nodes = ref<MaterialSchema[]>([])

  // 当前选中节点的 id（null 表示未选中任何节点）
  const selectedNodeId = ref()

  // 派生状态：根据 selectedNodeId 从 nodes 中查找当前选中的节点对象
  const selectedNode = computed(() => {
    return nodes.value.find((node) => node.id === selectedNodeId.value)
  })

  /**
   * 向画布添加一个新节点
   * @param node 要添加的物料节点 schema
   */
  function addNode(node: MaterialSchema) {
    nodes.value.push(node)
  }

  /**
   * 选中指定节点
   * @param id 要选中的节点 id
   */
  function selectNode(id: string) {
    selectedNodeId.value = id
  }

  /**
   * 清除当前选中状态（将 selectedNodeId 置为 null）
   */
  function clearSelected() {
    selectedNodeId.value = null
  }


  return {
    panelVisible,
    nodes,
    selectedNode,
    selectNode,
    selectedNodeId,
    addNode,
    clearSelected,
  }
})