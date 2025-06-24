<template>
  <div ref="chartRef" :style="{ height: height, width: width }" class="chart-container"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  MarkLineComponent,
  MarkPointComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsCoreOption } from 'echarts/core'

// 注册必要的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  LineChart,
  MarkLineComponent,
  MarkPointComponent,
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
  product: {
    type: String,
    default: 'battery48v'
  },
  suppliers: {
    type: Array,
    default: () => []
  }
})

const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

// 生成模拟数据
const generateMockData = (product, suppliers) => {
  const months = ['1月', '2月', '3月', '4月', '5月', '6月']
  // 每个供应商一条报价曲线
  const supplierSeries = (suppliers.length ? suppliers : [
    { supplierName: '广州电池厂', priceBase: 120, trend: [0, -5, -8, -3, 2, 5], score: 92 },
    { supplierName: '杭州轮胎厂', priceBase: 125, trend: [0, -3, -6, -2, 3, 6], score: 88 },
    { supplierName: '深圳配件厂', priceBase: 118, trend: [0, -6, -10, -5, 1, 4], score: 85 }
  ]).map(sup => {
    const prices = sup.trend.map(change => (sup.priceBase * (1 + change / 100)))
    return {
      name: sup.supplierName,
      data: prices,
      score: sup.score
    }
  })
  // 市场均价
  const marketPrice = supplierSeries[0].data.map((_, i) => {
    return supplierSeries.reduce((sum, s) => sum + s.data[i], 0) / supplierSeries.length * 1.08
  })
  // 预测价
  const forecastPrices = supplierSeries[0].data.map((v, i) => i < 4 ? null : v * 1.05)
  return { months, supplierSeries, marketPrice, forecastPrices }
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
  const { months, supplierSeries, marketPrice, forecastPrices } = generateMockData(props.product, props.suppliers)
  const option = {
    title: {
      text: '供应商报价趋势对比',
      left: 'center',
      textStyle: { fontSize: 14 }
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        let result = params[0].name + '<br/>'
        params.forEach(item => {
          let marker = item.marker
          let seriesName = item.seriesName
          let value = item.value
          let score = (item.data && item.data.score) ? `（评分：${item.data.score}）` : ''
          result += marker + seriesName + ': ' + value.toFixed(2) + '元' + score + '<br/>'
        })
        return result
      }
    },
    legend: {
      data: [...supplierSeries.map(s => s.name), '市场均价', '预测价'],
      bottom: '0%'
    },
    grid: {
      left: '3%', right: '4%', bottom: '15%', top: '15%', containLabel: true
    },
    xAxis: { type: 'category', data: months, boundaryGap: false },
    yAxis: { type: 'value', name: '价格 (元)', axisLabel: { formatter: '{value}' } },
    series: [
      ...supplierSeries.map(s => ({
        name: s.name,
        type: 'line',
        data: s.data.map((v, i) => ({ value: v, score: s.score })),
        smooth: true,
        symbol: 'circle',
        symbolSize: 6
      })),
      {
        name: '市场均价',
        type: 'line',
        data: marketPrice,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: '#909399' },
        lineStyle: { type: 'dotted' }
      },
      {
        name: '预测价',
        type: 'line',
        data: forecastPrices,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: '#E6A23C' },
        lineStyle: { type: 'dashed' }
      }
    ]
  }
  chart.setOption(option)
}

// 监听属性变化，更新图表
watch(() => props.product, () => {
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
  min-height: 200px;
}
</style> 