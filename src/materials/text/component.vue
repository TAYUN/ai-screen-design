<script setup lang="ts">
defineOptions({
  name: 'TextMaterial',
})
defineProps(['schema'])
</script>

<template>
  <div class="container" :style="schema.style">
    <div>{{ schema.props.content }}</div>
  </div>
</template>

<style scoped lang="scss"></style>
