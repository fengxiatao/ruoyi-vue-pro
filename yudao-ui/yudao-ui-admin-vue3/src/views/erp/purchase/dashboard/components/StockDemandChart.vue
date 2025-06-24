<template>
  <div ref="chartRef" :style="{ height: height, width: width }" class="chart-container"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts/core'
import { LineChart, BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  MarkLineComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsCoreOption } from 'echarts/core'

// 注册必要的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  LineChart,
  BarChart,
  MarkLineComponent,
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
  timeRange: {
    type: String,
    default: '30d' // 7d, 30d, 90d
  },
  category: {
    type: String,
    default: 'all'
  }
})

const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

// 生成模拟数据
const generateMockData = (timeRange: string, category: string) => {
  let days = 30
  if (timeRange === '7d') days = 7
  else if (timeRange === '90d') days = 90
  
  const dates = []
  const stockData = []
  const demandData = []
  const incomingData = []
  const safetyStock = []
  
  // 基础库存和需求值
  let baseStock = 0
  let baseDemand = 0
  let stockDecreaseRate = 0
  let demandIncreaseRate = 0
  
  // 根据类别设置不同的基础值和变化率
  switch (category) {
    case 'battery':
      baseStock = 200
      baseDemand = 15
      stockDecreaseRate = 0.05
      demandIncreaseRate = 0.02
      break
    case 'tire':
      baseStock = 150
      baseDemand = 10
      stockDecreaseRate = 0.03
      demandIncreaseRate = 0.04
      break
    case 'brake':
      baseStock = 100
      baseDemand = 5
      stockDecreaseRate = 0.02
      demandIncreaseRate = 0.01
      break
    default: // all
      baseStock = 500
      baseDemand = 30
      stockDecreaseRate = 0.04
      demandIncreaseRate = 0.03
  }
  
  // 安全库存线
  const safetyLevel = category === 'battery' ? 50 : 
                      category === 'tire' ? 30 : 
                      category === 'brake' ? 20 : 100
  
  // 生成每天的数据
  let currentStock = baseStock
  let currentDemand = baseDemand
  
  for (let i = 0; i < days; i++) {
    // 日期
    const date = new Date()
    date.setDate(date.getDate() + i)
    dates.push(`${date.getMonth() + 1}/${date.getDate()}`)
    
    // 库存随时间减少（考虑每日销售）
    currentStock = Math.max(0, Math.round(currentStock * (1 - stockDecreaseRate)))
    stockData.push(currentStock)
    
    // 需求随时间增加
    currentDemand = Math.round(currentDemand * (1 + demandIncreaseRate))
    demandData.push(currentDemand)
    
    // 安全库存线
    safetyStock.push(safetyLevel)
    
    // 模拟进货数据（每10天一次）
    if (i > 0 && i % 10 === 0) {
      incomingData.push({
        name: dates[i],
        value: [i, 100, '计划进货: 100个']
      })
    } else {
      incomingData.push({
        name: dates[i],
        value: [i, '-', '']
      })
    }
  }
  
  return {
    dates,
    stockData,
    demandData,
    safetyStock,
    incomingData
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
  
  const { dates, stockData, demandData, safetyStock, incomingData } = generateMockData(props.timeRange, props.category)
  
  // 计算预计缺货日期
  let outOfStockDay = -1
  for (let i = 0; i < stockData.length; i++) {
    if (stockData[i] < demandData[i]) {
      outOfStockDay = i
      break
    }
  }
  
  const markLines = []
  if (outOfStockDay >= 0) {
    markLines.push({
      symbol: 'none',
      lineStyle: {
        color: '#F56C6C',
        type: 'dashed'
      },
      label: {
        formatter: '预计缺货日',
        position: 'start'
      },
      xAxis: outOfStockDay
    })
  }
  
  const option: EChartsCoreOption = {
    title: {
      text: '库存-需求分析',
      left: 'center',
      textStyle: {
        fontSize: 14
      }
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
        let result = params[0].name + '<br/>'
        params.forEach((item: any) => {
          if (item.seriesName !== '进货' || item.value[1] !== '-') {
            let marker = item.marker
            let seriesName = item.seriesName
            let value = item.value
            if (typeof value !== 'object') {
              result += marker + seriesName + ': ' + value + '<br/>'
            } else if (value[2]) {
              result += marker + value[2] + '<br/>'
            }
          }
        })
        return result
      }
    },
    legend: {
      data: ['当前库存', '预计需求', '安全库存', '进货'],
      bottom: '0%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLabel: {
        interval: Math.floor(dates.length / 10) // 控制显示的标签数量
      }
    },
    yAxis: {
      type: 'value',
      name: '数量',
      axisLabel: {
        formatter: '{value}'
      }
    },
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
    ],
    series: [
      {
        name: '当前库存',
        type: 'line',
        data: stockData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: {
          color: '#409EFF'
        },
        markLine: {
          silent: true,
          data: markLines
        }
      },
      {
        name: '预计需求',
        type: 'line',
        data: demandData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: {
          color: '#E6A23C'
        }
      },
      {
        name: '安全库存',
        type: 'line',
        data: safetyStock,
        smooth: false,
        symbol: 'none',
        lineStyle: {
          type: 'dashed',
          color: '#F56C6C'
        }
      },
      {
        name: '进货',
        type: 'scatter',
        symbolSize: function (data: any) {
          return data[1] === '-' ? 0 : 20
        },
        itemStyle: {
          color: '#67C23A'
        },
        data: incomingData
      }
    ]
  }
  
  chart.setOption(option)
}

// 监听属性变化，更新图表
watch(() => [props.timeRange, props.category], () => {
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
  min-height: 300px;
}
</style> 