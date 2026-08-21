<script setup lang="ts">
import { useEditorStore } from '@/stores/editor'
import { ElForm } from 'element-plus'
import { storeToRefs } from 'pinia'

defineOptions({
  name: 'DataSource',
})

const editorStore = useEditorStore()
const { dataSources, selectedNode } = storeToRefs(editorStore)
</script>

<template>
  <div class="container px-20">
    <el-form>
      <el-form-item label="数据源">
        <el-select v-model="selectedNode.dataId" placeholder="请选择数据源">
          <el-option
            v-for="item in dataSources"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped lang="scss"></style>
