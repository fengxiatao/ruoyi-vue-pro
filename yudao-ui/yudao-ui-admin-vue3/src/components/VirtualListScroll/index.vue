<template>
  <div class="virtual-container" ref="containerRef">
    <div
      class="virtual-content"
      ref="contentRef"
      @scroll.passive="handleScroll"
      :style="{ '--item-width': itemWidth, '--item-height': itemHeight }"
    >
      <div
        class="virtual-list"
        :style="{
          ...listStyle,
          padding: `0 ${gap}px`, // 添加水平内边距
          margin: '0 auto' // 水平居中
        }"
      >
        <div
          class="virtual-item"
          v-for="item in visibleItems"
          :key="item[dataKey]"
          :style="itemStyle"
        >
          <slot name="item" :item="item" :width="itemWidth"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useElementSize, useScroll } from '@vueuse/core'
import { ProductItem } from '@/types/types'

const props = defineProps({
  dataKey: {
    type: String,
    default: 'id'
  },
  dataSource: {
    type: Array as PropType<ProductItem[]>,
    required: true
  },
  itemWidth: {
    type: Number,
    required: true
  },
  itemHeight: {
    type: Number,
    required: true
  },
  gap: {
    type: Number,
    default: 2
  }
})

const emit = defineEmits(['scroll-end'])
// DOM Refs
const containerRef = ref<HTMLElement>()
const contentRef = ref<HTMLElement>()
// 响应式获取容器尺寸
const { width: containerWidth } = useElementSize(containerRef) 
const columns = computed(() => {
  if (!containerWidth.value) return 1
  // 新计算公式：列数 = (容器宽度 + 间隙) / (项目宽度 + 间隙)
  return Math.max(1, Math.floor(
    (containerWidth.value + props.gap) / 
    (props.itemWidth + props.gap)
  ))
})

const rowHeight = computed(() => props.itemHeight + props.gap)

// 可见区域计算
const visibleRows = computed(() => {
  if (!contentRef.value) return 0
  return Math.ceil(contentRef.value.clientHeight / rowHeight.value) + 2
})

const startIndex = ref(0)
const endIndex = computed(() =>
  Math.min(props.dataSource.length, startIndex.value + visibleRows.value * columns.value)
)

const visibleItems = computed(() => props.dataSource.slice(startIndex.value, endIndex.value))

// 列表样式
// 调整列表容器宽度计算
const listStyle = computed(() => ({
  // 新宽度公式：列数*项目宽度 + (列数-1)*间隙
  width: `${columns.value * props.itemWidth + (columns.value - 1) * props.gap}px`,
  height: `${Math.ceil(props.dataSource.length / columns.value) * rowHeight.value}px`,
  transform: `translateY(${Math.floor(startIndex.value / columns.value) * rowHeight.value}px)`,
  gridTemplateColumns: `repeat(${columns.value}, ${props.itemWidth}px)`, // 直接使用props值
  gap: `${props.gap}px`,
  margin: '0 auto' // 确保水平居中
}))

// 单个项目样式
const itemStyle = computed(() => ({
  width: `${props.itemWidth}px`,
  height: `${props.itemHeight}px`
}))

// 滚动处理
const { y: scrollY } = useScroll(contentRef)
watch(scrollY, (newY) => {
  const scrollRow = Math.floor(newY / rowHeight.value)
  startIndex.value = scrollRow * columns.value

  // 触底检测
  if (endIndex.value >= props.dataSource.length) {
    emit('scroll-end')
  }
})

// 响应式重置
watch([containerWidth, columns], () => {
  startIndex.value = Math.floor((scrollY.value || 0) / rowHeight.value) * columns.value
})

// 自适应窗口resize
const resizeObserver = new ResizeObserver(() => {
  startIndex.value = Math.floor((scrollY.value || 0) / rowHeight.value) * columns.value
})

onMounted(() => {
  if (contentRef.value) {
    resizeObserver.observe(contentRef.value)
  }
})

onUnmounted(() => {
  resizeObserver.disconnect()
})
// 在 setup 函数中明确声明
const handleScroll = (e: Event) => {
  // 滚动处理逻辑
}

// 导出方法到组件实例
defineExpose({
  handleScroll
})
</script>

<style scoped>
.virtual-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.virtual-content {
  width: 100%;
  height: 100%;
  overflow-y: auto;
}

.virtual-list {
  display: grid;
  grid-template-columns: repeat(var(--columns), var(--item-width));
  grid-auto-rows: var(--item-height);
  gap: v-bind('props.gap + "px"');
  padding: v-bind('props.gap + "px"');
}

.virtual-item {
  box-sizing: border-box;
  transition: transform 0.2s ease;
  will-change: transform;
}
</style>
