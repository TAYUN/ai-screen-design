<script setup lang="ts">
import { getMaterialSetters } from '@/materials'
import { useEditorStore } from '@/stores/editor'
import { storeToRefs } from 'pinia'

import FormCreate from './FormCreate.vue'
import DataSource from './DataSource.vue'
import NodeEvents from './nodeEvents.vue'
defineOptions({
  name: 'NodeProperty',
})

const editorStore = useEditorStore()
const { selectedNode } = storeToRefs(editorStore)

const setters = computed(() => {
  return getMaterialSetters(selectedNode.value.type)
})

const layoutSetters = [
  {
    label: '宽度',
    key: 'layout.width',
    type: 'number',
    span: 12,
  },
  {
    label: '高度',
    key: 'layout.height',
    type: 'number',
    span: 12,
  },
  {
    label: 'x',
    key: 'layout.x',
    type: 'number',
    span: 12,
  },
  {
    label: 'y',
    key: 'layout.y',
    type: 'number',
    span: 12,
  },
]
const activeTab = ref('property')
const active = ref('node')
const jsonVisible = ref(false)
const eventVisible = ref(false)
const jsonText = ref('')
const nodeEvents = useTemplateRef('nodeEvents')
function previewJson() {
  jsonText.value = JSON.stringify(selectedNode.value, null, 2)
  jsonVisible.value = true
}

function onConfirm() {
  // 拿到更新后的节点
  const newNode = JSON.parse(jsonText.value)
  // 更新
  editorStore.updateNode(selectedNode.value.id, {
    ...newNode,
    // id 和 type 不能修改，沿用之前的
    id: selectedNode.value.id,
    type: selectedNode.value.type,
  })
  // 关闭抽屉
  jsonVisible.value = false
}

function onConfirmEvent() {
  nodeEvents.value.save()
  eventVisible.value = false
}
</script>

<template>
  <div class="node-property container">
    <div class="node-title">
      <span>{{ selectedNode.name }}</span>
      <div class="flex gap-20">
        <button
          type="button"
          class="cursor-pointer"
          aria-label="event"
          @click="eventVisible = true"
        >
          <Icon icon="ri:flashlight-line" />
        </button>
        <button type="button" class="cursor-pointer" aria-label="json" @click="previewJson">
          <Icon icon="ri:braces-line" />
        </button>
      </div>
    </div>
    <el-tabs v-model="activeTab" stretch>
      <el-tab-pane label="属性" name="property">
        <el-collapse v-model="active" accordion>
          <el-collapse-item title="布局属性" name="layout">
            <form-create :setters="layoutSetters" :form-data="selectedNode"></form-create>
          </el-collapse-item>
          <el-collapse-item title="组件属性" name="node">
            <form-create :setters="setters" :form-data="selectedNode"></form-create>
          </el-collapse-item>
        </el-collapse>
      </el-tab-pane>
      <el-tab-pane label="数据源" name="data-source">
        <DataSource />
      </el-tab-pane>
    </el-tabs>
    <!-- 预览json -->
    <el-drawer :destroy-on-close="true" v-model="jsonVisible" title="编辑 JSON" size="800">
      <MonacoEditor v-model="jsonText" />
      <template #footer>
        <el-button @click="jsonVisible = false">取消</el-button>
        <el-button type="primary" @click="onConfirm">确认</el-button>
      </template>
    </el-drawer>
    <!-- 事件配置 -->
    <el-dialog destroy-on-close title="事件配置" width="800" v-model="eventVisible">
      <NodeEvents ref="nodeEvents" />
      <template #footer>
        <el-button @click="eventVisible = false">取消</el-button>
        <el-button type="primary" @click="onConfirmEvent">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.node-property {
  .node-title {
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: bg-mix(40);
    font-weight: 600;
    padding: 0 20px;
  }
  :deep(.el-collapse) {
    --el-collapse-border-color: var(--border-color);
    --el-collapse-header-height: 48px;
    --el-collapse-header-bg-color: transparent;
    --el-collapse-header-text-color: var(--el-text-color-primary);
    --el-collapse-header-font-size: 13px;
    --el-collapse-content-bg-color: transparent;
    --el-collapse-content-font-size: 13px;
    --el-collapse-content-text-color: var(--el-text-color-primary);
    border-top: 1px solid var(--el-collapse-border-color);
    border-bottom: 1px solid var(--el-collapse-border-color);
    .el-collapse-item__title {
      padding-left: 20px;
    }
  }
}
</style>
