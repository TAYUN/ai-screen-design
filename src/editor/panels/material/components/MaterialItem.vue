<script setup lang="ts">
import type { MaterialItem as MaterialData } from '@/materials'

defineOptions({
  name: 'MaterialItem',
})

defineProps<{
  material: MaterialData
}>()
</script>

<template>
  <div class="material-item container">
    <div class="title">{{ material.name }}</div>

    <div class="icon">
      <Icon :icon="material.icon" class="icon-inner" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.material-item {
  height: 140px;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: bg-mix(24);
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    transform 0.2s ease;

  &:hover {
    border-color: rgba(148, 163, 184, 0.5);
    background: bg-mix(20);
    transform: translateY(-1px);
  }
}

.title {
  width: 100%;
  color: #e2e8f0;
  font-size: 13px;
  line-height: 18px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 8px;
}

.icon {
  width: 100%;
  height: 92px;
  padding: 10px;
  border: 1px dashed rgba(148, 163, 184, 0.24);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7dd3fc;
  background: rgba(255, 255, 255, 0.02);
}

.icon-inner {
  font-size: 34px;
}
</style>
