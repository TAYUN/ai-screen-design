import { useUndoRedo } from '@/composables/useUndoRedo'
import type { MaterialSchema } from '@/schema/material'
import { type PageSchema } from '@/schema/page'
import { defineStore } from 'pinia'

/**
 * 编辑器全局状态 Store（Pinia setup 语法）
 *
 * 职责：
 * 1. 管理编辑器各面板（物料/图层/属性）的显示/隐藏状态
 * 2. 管理画布上所有组件节点（nodes）的增删与选中状态
 * 3. 支持单选与多选（框选）两种选中模式
 * 4. 提供选中节点的派生状态（selectedNode），供属性面板等消费
 */
export const useEditorStore = defineStore('editor', () => {
  const { applyChange } = useUndoRedo()
  // 面板可见性控制：material（物料面板）、layer（图层面板）、property（属性面板）
  const panelVisible = reactive({
    material: true,
    layer: true,
    property: true,
  })

  const page = ref<PageSchema>({
    canvas: {
      width: 1920,
      height: 1080,
      backgroundColor: '#0d121b',
    },
    nodes: [],
    dataSources: [
      {
        type: 'static',
        id: '123',
        name: '销售数据',
        data: [
          {
            label: '一月',
            value: 100,
          },
          {
            label: '二月',
            value: 200,
          },
          {
            label: '三月',
            value: 300,
          },
        ],
      },
      {
        type: 'static',
        id: '456',
        name: '访问数据',
        data: [
          {
            label: '一月',
            value: 1000,
          },
          {
            label: '二月',
            value: 800,
          },
          {
            label: '三月',
            value: 1100,
          },
        ],
      },
      {
        type: 'api',
        id: '567',
        name: '上升趋势',
        url: '/api/data',
        method: 'get',
        // interval: 2000,
        params: {
          date: '2026-01-01',
        },
        data: [],
      },
    ],
  })

  const canvas = toRef(page.value, 'canvas')
  // 画布上的所有组件节点列表
  const nodes = toRef(page.value, 'nodes')
  /**
   * 数据源
   */
  const dataSources = toRef(page.value, 'dataSources')
  // 设置 page
  function setPage(newPage: PageSchema) {
    // !!! 要这样写 不能这样：page.value = newPage，赋值新对象会导致 toRef(page.value, 'nodes') 断开联系
    Object.assign(page.value, newPage)
  }

  // 当前选中节点的 id 列表（数组为空 [] 表示未选中任何节点；支持多选）
  const selectedNodeIds = ref<string[]>([])

  // 当前"单选"场景下的节点 id：仅当选中 id 列表长度为 1 时返回该 id，否则返回 null
  // （null 表示未选中任何节点，或者当前处于多选状态）
  const selectedNodeId = computed(() => {
    return selectedNodeIds.value.length === 1 ? selectedNodeIds.value[0] : null
  })

  // 派生状态：根据 selectedNodeId 从 nodes 中查找当前单选选中的节点对象
  // （仅在单选时有效；多选或未选中时为 undefined）
  const selectedNode = computed(() => {
    return nodes.value.find((node) => node.id === selectedNodeId.value)
  })

  function setNodes(newNodes) {
    applyChange(nodes, 'value', newNodes)
  }

  /**
   * 向画布添加一个新节点
   * @param node 要添加的物料节点 schema
   */
  function addNode(node: MaterialSchema) {
    setNodes([...nodes.value, node])
  }

  /**
   * 选中指定节点（单选：将选中列表重置为仅包含该节点）
   * @param id 要选中的节点 id
   */
  function selectNode(id: string) {
    selectedNodeIds.value = [id]
  }
  /**
   * 选中多个节点（多选：直接替换整个选中 id 列表，通常由框选结果触发）
   * @param ids 要选中的节点 id 数组
   */
  function selectNodes(ids: string[]) {
    selectedNodeIds.value = ids
  }

  /**
   * 根据节点 id 查找画布上的节点数据
   * @param id 节点 id
   */
  function findNode(id: string) {
    return nodes.value.find((node) => node.id === id)
  }

  /**
   * 清除当前选中状态（将选中 id 列表清空为空数组）
   */
  function clearSelected() {
    selectedNodeIds.value = []
  }

  function copyNode(node: MaterialSchema) {
    const newNode = JSON.parse(JSON.stringify(node))
    newNode.id = crypto.randomUUID()
    newNode.layout.x += 20
    newNode.layout.y += 20
    addNode(newNode)
    selectNode(newNode.id)
  }
  function removeNode(node: MaterialSchema) {
    setNodes(nodes.value.filter((item) => node.id !== item.id))

    selectedNodeIds.value = selectedNodeIds.value.filter((id) => id !== node.id)
  }
  function moveTop(node: MaterialSchema) {
    const index = nodes.value.findIndex((item) => item.id === node.id)
    const splicedNodes = nodes.value.toSpliced(index, 1)
    setNodes([node, ...splicedNodes])
  }
  function moveBottom(node: MaterialSchema) {
    const index = nodes.value.findIndex((item) => item.id === node.id)
    const splicedNodes = nodes.value.toSpliced(index, 1)
    setNodes([...splicedNodes, node])
  }
  function toggleLock(node: MaterialSchema) {
    applyChange(node, 'locked', !node.locked)
  }

  function updateNode(id, newNode) {
    // 使用 map 返回新列表，在新列表中做了替换
    const newNodes = nodes.value.map((node) => (node.id === id ? newNode : node))
    // 设置新的 nodes
    setNodes(newNodes)
  }

  return {
    panelVisible,
    page,
    nodes,
    dataSources,
    canvas,
    selectedNode,
    selectNode,
    selectNodes,
    selectedNodeId,
    selectedNodeIds,
    addNode,
    findNode,
    clearSelected,
    copyNode,
    removeNode,
    moveTop,
    moveBottom,
    toggleLock,
    updateNode,
    setPage,
  }
})
