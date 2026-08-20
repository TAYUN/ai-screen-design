import { useEditorStore } from '@/stores/editor'
import { debounce } from '@/utils'
import { storeToRefs } from 'pinia'

/**
 * 管理画布标尺、画布尺寸和根容器尺寸变化。
 * 标尺依赖 Moveable 引用，在缩放画布后需要重新计算节点控制框。
 */
export function useCanvasRuler({ moveableRef, canvasRootRef }) {
  const editorStore = useEditorStore()
  const { canvas } = storeToRefs(editorStore)
  const scale = ref(1)
  const lines = ref({ h: [], v: [] })

  const rectWidth = ref(1000)
  const rectHeight = ref(800)
  // ! 这里不能直接使用 toRef。canvas.value重新赋值新对象会导致canvasWidth与其断开联系
  // const canvasWidth = toRef(canvas.value, 'width')
  // const canvasHeight = toRef(canvas.value, 'height')
  const canvasWidth = computed(() => canvas.value.width)
  const canvasHeight = computed(() => canvas.value.height)

  const canvasStyle = computed(() => {
    return {
      width: canvasWidth.value + 'px',
      height: canvasHeight.value + 'px',
      backgroundColor: canvas.value.backgroundColor,
    }
  })

  // 标尺样式
  const palette = {
    bgColor: '#1f2937',
    longfgColor: '#6b7280',
    fontColor: '#9ca3af',
    fontShadowColor: '#0e8da7',
    shadowColor: 'rgba(14, 141, 167, 0.14)',
    lineColor: '#22c55e',
    lineType: 'solid',
    lockLineColor: '#4b5563',
    borderColor: '#374151',
    hoverBg: '#111827',
    hoverColor: '#ffffff',
  }

  const onRootResize = debounce((rect) => {
    rectWidth.value = rect.width
    rectHeight.value = rect.height
  }, 300)

  function onZoomChange() {
    moveableRef.value.updateRect()
  }

  onMounted(() => {
    const { width, height } = canvasRootRef.value.getBoundingClientRect()
    rectWidth.value = width
    rectHeight.value = height

    const ob = new ResizeObserver((entries) => {
      const entry = entries[0]
      const rect = entry.contentRect
      onRootResize(rect)
    })

    ob.observe(canvasRootRef.value)

    onUnmounted(() => {
      ob.disconnect()
    })
  })

  return {
    scale,
    lines,
    rectWidth,
    rectHeight,
    canvasWidth,
    canvasHeight,
    canvasStyle,
    palette,
    onZoomChange,
  }
}
