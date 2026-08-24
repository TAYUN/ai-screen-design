<script setup lang="ts">
import { useEditorStore } from '@/stores/editor'
import { deepClone } from '@/utils'
import { Icon } from '@iconify/vue'
import { storeToRefs } from 'pinia'

defineOptions({
  name: 'DataSourceManager',
})

const editorStore = useEditorStore()
const { dataSources } = storeToRefs(editorStore)
/**
 * 深拷贝
 * 1. data params 这些需要转字符串
 * 2. 弹框需要点击确认，才能应用到全局数据，而不是实时改动生效
 */
const data = ref(
  deepClone(dataSources.value).map((item) => {
    return {
      ...item,
      data: item.data ? JSON.stringify(item.data, null, 2) : undefined,
      params: item.params ? JSON.stringify(item.params, null, 2) : undefined,
    }
  }),
)
const activeSource = ref()
function selectDataSource(source) {
  activeSource.value = source
  console.log('source', source)
}

function onAdd() {
  // 新增数据源
  data.value.push({
    id: crypto.randomUUID(),
    name: '未命名',
    type: 'static',
    data: '',
    params: '{}',
  })

  selectDataSource(data.value.at(-1))
}

function removeDataSource(id: string) {
  data.value = data.value.filter((item) => item.id !== id)
  selectDataSource(null)
}

defineExpose({
  save() {
    const _data = deepClone(data.value).map((item) => {
      return {
        ...item,
        data: item.data ? JSON.parse(item.data) : undefined,
        params: item.params ? JSON.parse(item.params) : undefined,
      }
    })
    // 更新页面数据源
    editorStore.page.dataSources = _data
  },
})
</script>

<template>
  <div class="data-source-container container">
    <div class="data-source-sidebar">
      <el-button type="primary" @click="onAdd" size="small">新增</el-button>
      <div
        class="data-source-item"
        :class="{ active: item.id === activeSource?.id }"
        v-for="item in data"
        :key="item.id"
        @click="selectDataSource(item)"
      >
        <span>{{ item.name }}</span>
        <span @click.stop="removeDataSource(item.id)"><Icon icon="ri:delete-bin-line" /></span>
      </div>
    </div>
    <div class="data-source-content">
      <el-form v-if="activeSource">
        <el-form-item label="名称">
          <el-input v-model="activeSource.name" />
        </el-form-item>
        <el-form-item label="类型">
          <el-radio-group v-model="activeSource.type">
            <el-radio-button label="静态" value="static"></el-radio-button>
            <el-radio-button label="API" value="api"></el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="数据" v-if="activeSource.type === 'static'">
          <monaco-editor v-model="activeSource.data"></monaco-editor>
        </el-form-item>
        <!-- api数据源 -->
        <div v-else>
          <el-form-item label="请求地址">
            <el-input v-model="activeSource.url" />
          </el-form-item>
          <el-form-item label="轮询周期">
            <el-input v-model="activeSource.interval" />
          </el-form-item>
          <el-form-item label="参数">
            <monaco-editor v-model="activeSource.params" />
          </el-form-item>
        </div>
      </el-form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.data-source-container {
  display: flex;
  gap: 20px;
  height: 600px;
  .data-source-sidebar {
    width: 200px;
    flex: none;
    border: 1px solid var(--border-color);
    padding: 10px;
    overflow: auto;
    .data-source-item {
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
  .data-source-content {
    flex: 1;
    border: 1px solid var(--border-color);
    padding: 10px;
    overflow: auto;
  }
}
</style>
