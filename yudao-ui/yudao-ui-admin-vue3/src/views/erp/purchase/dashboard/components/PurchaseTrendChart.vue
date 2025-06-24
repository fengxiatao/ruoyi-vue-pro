<template>
  <div ref="chartRef" :style="{ height: height, width: width }" class="chart-container"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsCoreOption } from 'echarts/core'

// 注册必要的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  BarChart,
  LineChart,
  CanvasRenderer,
  DataZoomComponent
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
  timeRange: {
    type: String,
    default: '6m'
  }
})

const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

// 模拟数据
const generateMockData = () => {
  const months = props.timeRange === '3m' ? 3 : props.timeRange === '6m' ? 6 : 12
  const dates: string[] = []
  const purchaseAmountData: number[] = []
  const purchaseCountData: number[] = []
  
  // 基础采购金额和数量
  let basePurchaseAmount = 50000
  let basePurchaseCount = 200
  
  // 生成日期和数据
  const today = new Date()
  for (let i = 0; i < months; i++) {
    const date = new Date(today)
    date.setMonth(date.getMonth() - (months - 1) + i)
    dates.push(`${date.getFullYear()}-${date.getMonth() + 1}`)
    
    // 采购金额和数量有波动
    const amountNoise = Math.random() * 10000 - 5000
    const countNoise = Math.random() * 50 - 25
    
    // 添加季节性波动
    const month = date.getMonth() + 1
    let seasonalFactor = 1
    
    // 春季(3-5月)和秋季(9-11月)采购量较高
    if ((month >= 3 && month <= 5) || (month >= 9 && month <= 11)) {
      seasonalFactor = 1.2
    }
    // 冬季(12-2月)采购量较低
    else if (month === 12 || month === 1 || month === 2) {
      seasonalFactor = 0.8
    }
    
    const amount = (basePurchaseAmount + amountNoise) * seasonalFactor
    purchaseAmountData.push(Math.round(amount))
    
    const count = (basePurchaseCount + countNoise) * seasonalFactor
    purchaseCountData.push(Math.round(count))
  }
  
  return { dates, purchaseAmountData, purchaseCountData }
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
  
  const { dates, purchaseAmountData, purchaseCountData } = generateMockData()
  
  const option: EChartsCoreOption = {
    title: {
      text: '历史采购趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      },
      formatter: function(params: any) {
        let result = `${params[0].axisValue}<br/>`
        params.forEach((param: any) => {
          if (param.seriesName === '采购金额') {
            result += `${param.marker} ${param.seriesName}: ¥${param.value.toLocaleString()}<br/>`
          } else {
            result += `${param.marker} ${param.seriesName}: ${param.value}件<br/>`
          }
        })
        return result
      }
    },
    legend: {
      data: ['采购金额', '采购数量'],
      bottom: '0%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: true,
      data: dates
    },
    yAxis: [
      {
        type: 'value',
        name: '采购金额(元)',
        position: 'left',
        axisLabel: {
          formatter: '{value}'
        }
      },
      {
        type: 'value',
        name: '采购数量(件)',
        position: 'right',
        axisLabel: {
          formatter: '{value}'
        }
      }
    ],
    series: [
      {
        name: '采购金额',
        type: 'bar',
        yAxisIndex: 0,
        data: purchaseAmountData,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#83bff6' },
              { offset: 0.5, color: '#188df0' },
              { offset: 1, color: '#188df0' }
            ]
          }
        },
        emphasis: {
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#2378f7' },
                { offset: 0.7, color: '#2378f7' },
                { offset: 1, color: '#83bff6' }
              ]
            }
          }
        }
      },
      {
        name: '采购数量',
        type: 'line',
        yAxisIndex: 1,
        data: purchaseCountData,
        smooth: true,
        symbol: 'emptyCircle',
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: '#F56C6C'
        },
        itemStyle: {
          color: '#F56C6C'
        }
      }
    ],
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      },
      {
        start: 0,
        end: 100
      }
    ]
  }
  
  chart.setOption(option)
}

// 监听属性变化，更新图表
watch(() => props.timeRange, () => {
  updateChart()
})

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