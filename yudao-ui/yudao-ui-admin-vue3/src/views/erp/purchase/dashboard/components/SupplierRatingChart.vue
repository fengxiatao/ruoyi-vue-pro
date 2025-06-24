<template>
  <div ref="chartRef" :style="{ height: height, width: width }" class="chart-container"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts/core'
import { RadarChart } from 'echarts/charts'
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
  RadarChart,
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
  suppliers: {
    type: Array,
    default: () => []
  }
})

const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

// 模拟数据
const generateMockData = () => {
  // 如果没有提供供应商数据，使用默认数据
  if (!props.suppliers || props.suppliers.length === 0) {
    return {
      suppliers: [
        { name: '广州电池厂', data: [95, 90, 85, 80, 75] },
        { name: '杭州轮胎厂', data: [90, 85, 80, 95, 70] },
        { name: '深圳配件厂', data: [80, 75, 90, 70, 85] }
      ],
      indicators: [
        { name: '准时率', max: 100 },
        { name: '质量', max: 100 },
        { name: '价格', max: 100 },
        { name: '服务', max: 100 },
        { name: '响应速度', max: 100 }
      ]
    }
  }
  
  // 使用提供的供应商数据生成雷达图数据
  const radarData = props.suppliers.map((supplier: any) => {
    return {
      name: supplier.supplierName,
      data: [
        supplier.onTimeRate || Math.round(Math.random() * 30 + 70),
        Math.round(Math.random() * 30 + 70),
        Math.round(Math.random() * 30 + 70),
        Math.round(Math.random() * 30 + 70),
        Math.round(Math.random() * 30 + 70)
      ]
    }
  })
  
  return {
    suppliers: radarData,
    indicators: [
      { name: '准时率', max: 100 },
      { name: '质量', max: 100 },
      { name: '价格', max: 100 },
      { name: '服务', max: 100 },
      { name: '响应速度', max: 100 }
    ]
  }
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
  
  const { suppliers, indicators } = generateMockData()
  
  const option: EChartsCoreOption = {
    title: {
      text: '供应商评分',
      left: 'center',
      textStyle: {
        fontSize: 14
      }
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      data: suppliers.map((item: any) => item.name),
      bottom: '0%',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        fontSize: 10
      }
    },
    radar: {
      indicator: indicators,
      center: ['50%', '50%'],
      radius: '60%',
      splitNumber: 4,
      axisName: {
        fontSize: 10
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ['rgba(250,250,250,0.1)', 'rgba(200,200,200,0.1)']
        }
      }
    },
    series: [
      {
        type: 'radar',
        data: suppliers.map((item: any) => {
          return {
            value: item.data,
            name: item.name
          }
        }),
        areaStyle: {
          opacity: 0.1
        },
        lineStyle: {
          width: 2
        }
      }
    ],
    color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']
  }
  
  chart.setOption(option)
}

// 监听属性变化，更新图表
watch(() => props.suppliers, () => {
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
  min-height: 100px;
}
</style> 