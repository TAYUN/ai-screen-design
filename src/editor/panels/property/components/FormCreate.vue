<script setup lang="ts">
import { ElInput, ElInputNumber, ElColorPicker } from 'element-plus'
import { getValue, setValue } from '@/utils'

defineOptions({
  name: 'FormCreate',
})

defineProps(['setters', 'formData'])

const componentMap = {
  input: ElInput,
  // 细节封装
  number: (props, { slots }) => h(ElInputNumber, { precision: 0, ...props }, slots),
  color: ElColorPicker,
}
</script>

<template>
  <div class="container">
    <el-form class="p-20" size="small" label-width="60">
      <el-row>
        <el-col v-for="item in setters" :key="item.key" :span="item.span || 24">
          <el-form-item :label="item.label">
            <component
              :is="componentMap[item.type]"
              :modelValue="getValue(formData, item.key)"
              @update:modelValue="(val) => setValue(formData, item.key, val)"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<style scoped lang="scss"></style>
