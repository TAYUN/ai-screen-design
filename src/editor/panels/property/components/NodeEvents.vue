<script setup lang="ts">
import type { MaterialEvent } from '@/schema/material'
import { useEditorStore } from '@/stores/editor'
import { deepClone } from '@/utils'
import { Icon } from '@iconify/vue'
import { storeToRefs } from 'pinia'

defineOptions({
  name: 'NodeEvents',
})

const editorStore = useEditorStore()
const { selectedNode } = storeToRefs(editorStore)
/**
 * 深拷贝
 */
const data = ref(deepClone(selectedNode.value.events || []))
const activeEvent = ref()
function selectEvent(event: MaterialEvent) {
  activeEvent.value = event
}

function onAdd() {
  // 新增数据源
  data.value.push({
    name: '未命名',
    type: '',
    code: '',
  })

  selectEvent(data.value.at(-1))
}

function removeEvent(name: string) {
  data.value = data.value.filter((item) => item.name !== name)
  selectEvent(null)
}

defineExpose({
  save() {
    // selectedNode.value.events = data.value
    // 更新节点events
    editorStore.updateNode(selectedNode.value.id, {
      ...selectedNode.value,
      events: data.value,
    })
  },
})
</script>

<template>
  <div class="node-event-container container">
    <div class="node-event-sidebar">
      <el-button type="primary" @click="onAdd" size="small">新增</el-button>
      <div
        class="node-event-item"
        :class="{ active: item.name === activeEvent?.name }"
        v-for="item in data"
        :key="item.name"
        @click="selectEvent(item)"
      >
        <span>{{ item.name }}</span>
        <span @click.stop="removeEvent(item.name)"><Icon icon="ri:delete-bin-line" /></span>
      </div>
    </div>
    <div class="node-event-content">
      <el-form v-if="activeEvent">
        <el-form-item label="名称">
          <el-input v-model="activeEvent.name" />
        </el-form-item>
        <el-form-item label="类型">
          <el-input v-model="activeEvent.type" />
        </el-form-item>
        <el-form-item label="函数体">
          <div class="flex flex-col w-full bg-[#1e1e1e]">
            <div class="flex-none pl-30">function() {</div>
            <monaco-editor class="flex-1" v-model="activeEvent.code" lang="javascript" />
            <div class="flex-none pl-30">}</div>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.node-event-container {
  display: flex;
  gap: 20px;
  height: 600px;
  .node-event-sidebar {
    width: 200px;
    flex: none;
    border: 1px solid var(--border-color);
    padding: 10px;
    overflow: auto;
    .node-event-item {
      display: flex;

      height: 40px;
      align-items: center;
      justify-content: space-between;
      padding: 0 10px;
      margin-top: 10px;
      background-color: bg-mix(80);
      cursor: pointer;
      &.active {
        background-color: var(--el-color-primary);
      }
    }
  }
  .node-event-content {
    flex: 1;
    border: 1px solid var(--border-color);
    padding: 10px;
    overflow: auto;
  }
}
</style>
