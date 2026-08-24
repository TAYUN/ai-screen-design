<script setup lang="ts">
import { useEditorStore } from '@/stores/editor'
import { ElMessage } from 'element-plus'
import { storeToRefs } from 'pinia'
import DataSourceManger from './components/DataSourceManger.vue'

defineOptions({
  name: 'ToolbarRight',
})
const editorStore = useEditorStore()
const { page } = storeToRefs(editorStore)

const visiable = ref(false)
// 全局数据源弹框
const dataSourceVisible = ref(false)
const jsonText = ref('')

const inputRef = useTemplateRef('inputRef')

const dataSourceManagerRef = useTemplateRef('dataSourceManagerRef')

function previewJson() {
  jsonText.value = JSON.stringify(page.value, null, 2)
  visiable.value = true
}

function onConfirm() {
  // 拿到更新后的节点
  const newPage = JSON.parse(jsonText.value)
  // 更新
  editorStore.setPage(newPage)
  // 关闭抽屉
  visiable.value = false
}

// 导出JSON
function onExport() {
  const json = JSON.stringify(page.value, null, 2)
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
  // 创建文件的 blob 的 URL
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'screen-design.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  // 需要手动释放
  URL.revokeObjectURL(url)
}

// 导入 JSON
function onInport() {
  inputRef.value.click()
}

async function onFileChange(e) {
  const file: File = e.target.files[0]
  if (!file) return
  const text = await file.text()
  try {
    const newPage = JSON.parse(text)
    editorStore.setPage(newPage)
    ElMessage.success('导入成功')
  } catch {
    ElMessage.error('请检查 JSON 是否合法')
  }
}

function openDataSource() {
  dataSourceVisible.value = true
}

function onSave() {
  // 调用dataSourceManger 中暴露的保存方法
  dataSourceManagerRef.value.save()
  dataSourceVisible.value = false
}
</script>

<template>
  <div class="flex gap-8 items-center justify-end">
    <button type="button" class="tool-btn" aria-label="预览">
      <Icon icon="ri:eye-line" />
    </button>
    <button type="button" class="tool-btn" aria-label="json" @click="previewJson">
      <Icon icon="ri:braces-line" />
    </button>
    <button type="button" class="tool-btn" aria-label="发布">
      <Icon icon="ri:upload-line" />
    </button>
    <button type="button" class="tool-btn" aria-label="数据源" @click="openDataSource">
      <Icon icon="ri:database-2-line" />
    </button>
    <button type="button" class="tool-btn" aria-label="导入" @click="onInport">
      <Icon icon="ri:download-2-line" />
    </button>
    <button type="button" class="tool-btn" aria-label="导出" @click="onExport">
      <Icon icon="ri:upload-2-line" />
    </button>

    <input ref="inputRef" type="file" v-show="false" @change="onFileChange" />

    <el-drawer :destroy-on-close="true" v-model="visiable" title="编辑 JSON" size="800">
      <MonacoEditor v-model="jsonText" />

      <template #footer>
        <el-button @click="visiable = false">取消</el-button>
        <el-button type="primary" @click="onConfirm">确认</el-button>
      </template>
    </el-drawer>

    <el-dialog destroy-on-close title="数据源配置" v-model="dataSourceVisible" width="800">
      <DataSourceManger ref="dataSourceManagerRef"></DataSourceManger>

      <template #footer>
        <el-button @click="dataSourceVisible = false">取消</el-button>
        <el-button @click="onSave">确认</el-button>
      </template>
    </el-dialog>
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
