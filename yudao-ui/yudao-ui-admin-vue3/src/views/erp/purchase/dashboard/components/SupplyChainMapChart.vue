<template>
  <div ref="chartRef" :style="{ height: height, width: width }" class="chart-container"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts/core'
import { ScatterChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  VisualMapComponent,
  GridComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsCoreOption } from 'echarts/core'

// 注册必要的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  VisualMapComponent,
  GridComponent,
  ScatterChart,
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
  viewType: {
    type: String,
    default: 'inventory' // inventory, supplier, risk
  },
  category: {
    type: String,
    default: 'all'
  }
})

const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

// 生成模拟数据
const generateMockData = (viewType: string, category: string) => {
  // 主要城市及其大致坐标（简化版，不使用实际地图）
  const cities = [
    { name: '北京', value: 0, x: 80, y: 30 },
    { name: '上海', value: 0, x: 85, y: 50 },
    { name: '广州', value: 0, x: 75, y: 75 },
    { name: '深圳', value: 0, x: 76, y: 78 },
    { name: '杭州', value: 0, x: 82, y: 55 },
    { name: '南京', value: 0, x: 80, y: 53 },
    { name: '武汉', value: 0, x: 72, y: 58 },
    { name: '西安', value: 0, x: 60, y: 50 },
    { name: '成都', value: 0, x: 55, y: 60 },
    { name: '重庆', value: 0, x: 58, y: 62 }
  ]
  
  // 根据视图类型和类别生成不同的数据
  switch (viewType) {
    case 'inventory':
      // 库存分布
      if (category === 'battery' || category === 'all') {
        cities[0].value = 85 // 北京
        cities[1].value = 95 // 上海
        cities[2].value = 30 // 广州
        cities[3].value = 45 // 深圳
        cities[4].value = 75 // 杭州
      } else if (category === 'tire') {
        cities[0].value = 65
        cities[1].value = 40
        cities[2].value = 90
        cities[3].value = 85
        cities[4].value = 50
      } else {
        cities[0].value = 55
        cities[1].value = 65
        cities[2].value = 70
        cities[3].value = 35
        cities[4].value = 60
      }
      break
    case 'supplier':
      // 供应商分布
      if (category === 'battery' || category === 'all') {
        cities[0].value = 3 // 北京
        cities[1].value = 5 // 上海
        cities[2].value = 8 // 广州
        cities[3].value = 12 // 深圳
        cities[4].value = 4 // 杭州
      } else if (category === 'tire') {
        cities[0].value = 2
        cities[1].value = 3
        cities[2].value = 7
        cities[3].value = 5
        cities[4].value = 9
      } else {
        cities[0].value = 4
        cities[1].value = 7
        cities[2].value = 3
        cities[3].value = 6
        cities[4].value = 2
      }
      break
    case 'risk':
      // 风险热图
      if (category === 'battery' || category === 'all') {
        cities[0].value = 35 // 北京
        cities[1].value = 45 // 上海
        cities[2].value = 75 // 广州
        cities[3].value = 85 // 深圳
        cities[4].value = 55 // 杭州
      } else if (category === 'tire') {
        cities[0].value = 40
        cities[1].value = 60
        cities[2].value = 30
        cities[3].value = 50
        cities[4].value = 70
      } else {
        cities[0].value = 65
        cities[1].value = 45
        cities[2].value = 55
        cities[3].value = 75
        cities[4].value = 35
      }
      break
  }
  
  // 过滤掉值为0的城市
  return cities.filter(city => city.value > 0)
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
  
  const data = generateMockData(props.viewType, props.category)
  
  // 根据视图类型设置不同的标题和视觉映射
  let title = ''
  let visualMapConfig: any = {}
  
  switch (props.viewType) {
    case 'inventory':
      title = '库存分布图'
      visualMapConfig = {
        min: 0,
        max: 100,
        text: ['高库存', '低库存'],
        inRange: {
          color: ['#C6E0B4', '#548235']
        }
      }
      break
    case 'supplier':
      title = '供应商分布图'
      visualMapConfig = {
        min: 0,
        max: 15,
        text: ['供应商数量多', '供应商数量少'],
        inRange: {
          color: ['#C6E0B4', '#548235']
        }
      }
      break
    case 'risk':
      title = '供应链风险图'
      visualMapConfig = {
        min: 0,
        max: 100,
        text: ['高风险', '低风险'],
        inRange: {
          color: ['#67C23A', '#E6A23C', '#F56C6C']
        }
      }
      break
  }
  
  const option: EChartsCoreOption = {
    title: {
      text: title,
      left: 'center',
      textStyle: {
        fontSize: 14
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const { name, value } = params
        if (props.viewType === 'inventory') {
          return `${name}: 库存水平 ${value[2]}%`
        } else if (props.viewType === 'supplier') {
          return `${name}: ${value[2]}个供应商`
        } else {
          return `${name}: 风险指数 ${value[2]}`
        }
      }
    },
    visualMap: {
      type: 'continuous',
      left: 'right',
      bottom: '5%',
      dimension: 2,
      ...visualMapConfig
    },
    grid: {
      left: '5%',
      right: '10%',
      top: '15%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      min: 50,
      max: 90,
      show: false
    },
    yAxis: {
      type: 'value',
      min: 20,
      max: 85,
      show: false
    },
    series: [
      {
        name: props.viewType === 'inventory' ? '库存水平' : 
               props.viewType === 'supplier' ? '供应商数量' : '风险指数',
        type: 'scatter',
        data: data.map(item => [item.x, item.y, item.value, item.name]),
        symbolSize: (val: any) => {
          // 根据值调整散点大小
          const value = val[2]
          if (props.viewType === 'supplier') {
            return Math.sqrt(value) * 5 + 10
          } else {
            return Math.sqrt(value / 10) * 5 + 8
          }
        },
        label: {
          formatter: '{@[3]}',
          position: 'right',
          show: true
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          },
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  
  chart.setOption(option)
}

// 监听属性变化，更新图表
watch(() => [props.viewType, props.category], () => {
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