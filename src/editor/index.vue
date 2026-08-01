<script setup lang="ts">
defineOptions({
  name: 'ScreenEditor',
})
</script>
<template>
  <div class="editor h-screen">
    <header class="h-56 bg-red-100">header</header>
    <main class="bg-green-100 h-[calc(100%_-_56px)]"></main>
  </div>
</template>

<style scoped lang="scss"></style>
