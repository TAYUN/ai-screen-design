<script setup lang="ts">
defineOptions({
  name: 'ToolbarRight',
})
</script>

<template>
  <div class="flex gap-8 items-center justify-end">
    <button type="button" class="tool-btn" aria-label="预览">
      <Icon icon="ri:eye-line" />
    </button>
    <button type="button" class="tool-btn" aria-label="json">
      <Icon icon="ri:braces-line" />
    </button>
    <button type="button" class="tool-btn" aria-label="发布">
      <Icon icon="ri:upload-line" />
    </button>
    <button type="button" class="tool-btn" aria-label="导入">
      <Icon icon="ri:download-2-line" />
    </button>
    <button type="button" class="tool-btn" aria-label="导出">
      <Icon icon="ri:upload-2-line" />
    </button>
  </div>
</template>

<style scoped lang="scss">
.tool-btn {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: #e2e8f0;
  background: rgba(15, 23, 42, 0.35);
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;

  &:hover {
    border-color: #60a5fa;
    background: rgba(59, 130, 246, 0.12);
    transform: translateY(-1px);
  }
}
</style>
