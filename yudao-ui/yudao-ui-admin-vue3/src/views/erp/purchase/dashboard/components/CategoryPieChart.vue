<template>
  <div ref="chartRef" :style="{ height: height, width: width }" class="chart-container"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts/core'
import { PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsCoreOption } from 'echarts/core'

// 注册必要的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  PieChart,
  CanvasRenderer
])

const props = defineProps({
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '100%'
  },
  data: {
    type: Array,
    default: () => []
  }
})

const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

// 模拟数据
const generateMockData = () => {
  // 如果没有提供数据，使用默认数据
  if (!props.data || props.data.length === 0) {
    return [
      { value: 35, name: '电池' },
      { value: 25, name: '轮胎' },
      { value: 15, name: '刹车系统' },
      { value: 12, name: '车灯' },
      { value: 8, name: '电控系统' },
      { value: 5, name: '其他' }
    ]
  }
  
  return props.data
}

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return
  
  chart = echarts.init(chartRef.value)
  updateChart()
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    chart?.resize()
  })
}

// 更新图表数据
const updateChart = () => {
  if (!chart) return
  
  const data = generateMockData()
  
  const option: EChartsCoreOption = {
    title: {
      text: '品类采购占比',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: '0%',
      data: data.map((item: any) => item.name)
    },
    series: [
      {
        name: '采购占比',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: data.map((item: any) => {
          return {
            value: item.value,
            name: item.name
          }
        })
      }
    ],
    color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#9B59B6', '#3498DB']
  }
  
  chart.setOption(option)
}

// 监听属性变化，更新图表
watch(() => props.data, () => {
  updateChart()
}, { deep: true })

// 监听容器尺寸变化
const resizeChart = () => {
  nextTick(() => {
    chart?.resize()
  })
}

// 监听高度变化
watch(() => props.height, () => {
  resizeChart()
})

// 组件挂载时初始化图表
onMounted(() => {
  initChart()
  
  // 添加ResizeObserver监听容器大小变化
  if (chartRef.value) {
    const resizeObserver = new ResizeObserver(() => {
      resizeChart()
    })
    resizeObserver.observe(chartRef.value)
  }
})

// 组件卸载时销毁图表
onUnmounted(() => {
  if (chart) {
    chart.dispose()
    chart = null
  }
})
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
  min-height: 250px;
}
</style> 