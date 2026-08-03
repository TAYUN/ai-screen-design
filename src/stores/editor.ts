import type { MaterialSchema } from "@/materials/types";
import { defineStore } from "pinia";

export const useEditorStore = defineStore('editor', () => {
  const panelVisible = reactive({
    material: true,
    layer: true,
    property: true,
  })

  const nodes = ref<MaterialSchema[]>([])

  const selectedNodeId = ref()

  const selectedNode = computed(() => {
    return nodes.value.find((node) => node.id === selectedNodeId.value)
  })

  function addNode(node: MaterialSchema) {
    nodes.value.push(node)
  }

  function selectNode(id: string) {
    selectedNodeId.value = id
  }

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