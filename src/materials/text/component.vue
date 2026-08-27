<script setup lang="ts">
defineOptions({
  name: 'TextMaterial',
})
const props = defineProps(['schema'])

const textStyle = computed(() => {
  const style = props.schema.style
  return {
    ...style,
    fontSize: style.fontSize + 'px',
  }
})
</script>

<template>
  <div class="container" :style="textStyle">
    <div>{{ schema.props.content }}</div>
  </div>
</template>

<style scoped lang="scss"></style>
