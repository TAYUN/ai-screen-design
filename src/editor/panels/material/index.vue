<script setup lang="ts">
import MaterialItem from './components/MaterialItem.vue'
import { getMaterialGroup, getMaterialGroups, getMaterialsByGroup } from '@/materials'

defineOptions({
  name: 'MaterialPanel',
})

// 当前使用本地 mock 数据，后续接入服务端物料时保留同一层消费方式即可。
const groups = getMaterialGroups()
const activeGroup = ref(groups[0]?.key ?? '')

const currentGroup = computed(() => {
  return getMaterialGroup(activeGroup.value)
})

const currentMaterials = computed(() => {
  return getMaterialsByGroup(activeGroup.value)
})
</script>

<template>
  <div class="material-panel h-full flex">
    <div class="nav">
      <button
        v-for="category in groups"
        :key="category.key"
        type="button"
        :class="{ 'nav-item': true, active: activeGroup === category.key }"
        @click="activeGroup = category.key"
      >
        <Icon :icon="category.icon" class="nav-icon" />
        <span class="nav-label">{{ category.name }}</span>
      </button>
    </div>
    <div class="panel-body flex-1">
      <div class="panel-head">
        <span class="panel-title">{{ currentGroup?.name ?? '物料库' }}</span>
        <span class="panel-desc">拖拽组件到画布开始编辑</span>
      </div>
      <div class="material-list">
        <MaterialItem v-for="item in currentMaterials" :key="item.name" :material="item" />
        <div v-if="!currentMaterials.length" class="empty-state">
          当前分类下还没有可用物料
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.material-panel {
  background: bg-mix(12);

  .nav {
    width: 64px;
    padding: 8px;
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .nav-item {
    min-height: 56px;
    padding: 8px 4px;
    border: 1px solid transparent;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    color: #94a3b8;
    background: transparent;
    cursor: pointer;
    transition:
      color 0.2s ease,
      background-color 0.2s ease,
      border-color 0.2s ease;

    &:hover {
      color: #e2e8f0;
      background: rgba(148, 163, 184, 0.08);
    }

    &.active {
      color: #f8fafc;
      border-color: rgba(56, 189, 248, 0.35);
      background: bg-mix(20);
    }
  }

  .nav-icon {
    font-size: 16px;
  }

  .nav-label {
    font-size: 12px;
    line-height: 1;
  }

  .panel-body {
    padding: 12px;
    overflow: hidden;
  }

  .panel-head {
    margin-bottom: 12px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .panel-title {
    font-size: 15px;
    font-weight: 600;
    color: #f8fafc;
  }

  .panel-desc {
    font-size: 12px;
    color: #94a3b8;
  }

  .material-list {
    height: calc(100% - 42px);
    padding-right: 4px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    overflow-y: auto;
  }

  .empty-state {
    min-height: 120px;
    border: 1px dashed rgba(148, 163, 184, 0.24);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
    font-size: 12px;
    background: rgba(255, 255, 255, 0.02);
  }
}
</style>
