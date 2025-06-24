<!-- 库存周转率管理 -->
<template>
  <ContentWrap title="库存周转率管理">
    <!-- 统计卡片 -->
    <div class="grid grid-cols-4 gap-15px mb-15px">
      <el-card shadow="hover" class="cursor-pointer" @click="handleCardClick('all')">
        <div class="flex items-center">
          <div class="mr-15px">
            <el-icon :size="48" color="#409EFF"><DataLine /></el-icon>
          </div>
          <div>
            <div class="text-2xl font-bold">{{ statistics.totalProducts || 0 }}</div>
            <div class="text-gray-500">总商品数</div>
          </div>
        </div>
      </el-card>
      
      <el-card shadow="hover" class="cursor-pointer" @click="handleCardClick('normal')">
        <div class="flex items-center">
          <div class="mr-15px">
            <el-icon :size="48" color="#67C23A"><TrendCharts /></el-icon>
          </div>
          <div>
            <div class="text-2xl font-bold">{{ statistics.normalProducts || 0 }}</div>
            <div class="text-gray-500">正常周转商品</div>
          </div>
        </div>
      </el-card>
      
      <el-card shadow="hover" class="cursor-pointer" @click="handleCardClick('low')">
        <div class="flex items-center">
          <div class="mr-15px">
            <el-icon :size="48" color="#E6A23C"><Histogram /></el-icon>
          </div>
          <div>
            <div class="text-2xl font-bold">{{ statistics.lowProducts || 0 }}</div>
            <div class="text-gray-500">低周转商品</div>
          </div>
        </div>
      </el-card>
      
      <el-card shadow="hover" class="cursor-pointer" @click="handleCardClick('very-low')">
        <div class="flex items-center">
          <div class="mr-15px">
            <el-icon :size="48" color="#F56C6C"><WarningFilled /></el-icon>
          </div>
          <div>
            <div class="text-2xl font-bold">{{ statistics.veryLowProducts || 0 }}</div>
            <div class="text-gray-500">极低周转商品</div>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 功能卡片 -->
    <div class="grid grid-cols-3 gap-15px mb-15px">
      <el-card shadow="hover" class="cursor-pointer" @click="handleNavigate('/erp/inventory/turnover/config')">
        <template #header>
          <div class="flex items-center">
            <el-icon class="mr-5px"><Setting /></el-icon>
            <span>周转率配置</span>
          </div>
        </template>
        <div class="text-gray-500">
          <p>根据商品分类设置不同的周转率计算周期和阈值，适应摩托车配件行业特性</p>
          <div class="mt-10px flex justify-end">
            <el-button type="primary" size="small">配置管理</el-button>
          </div>
        </div>
      </el-card>
      
      <el-card shadow="hover" class="cursor-pointer" @click="handleNavigate('/erp/inventory/turnover/low-products')">
        <template #header>
          <div class="flex items-center">
            <el-icon class="mr-5px"><Warning /></el-icon>
            <span>低周转商品</span>
          </div>
        </template>
        <div class="text-gray-500">
          <p>查看和管理低周转商品，生成退货计划，优化库存结构</p>
          <div class="mt-10px flex justify-end">
            <el-button type="primary" size="small">查看列表</el-button>
          </div>
        </div>
      </el-card>
      
      <el-card shadow="hover" class="cursor-pointer" @click="handleNavigate('/erp/purchase/return/create')">
        <template #header>
          <div class="flex items-center">
            <el-icon class="mr-5px"><Sell /></el-icon>
            <span>退货管理</span>
          </div>
        </template>
        <div class="text-gray-500">
          <p>基于周转率分析，生成退货单，处理滞销商品</p>
          <div class="mt-10px flex justify-end">
            <el-button type="primary" size="small">创建退货单</el-button>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 周转率分布图表 -->
    <el-card>
      <template #header>
        <div class="flex justify-between items-center">
          <span>商品周转率分布</span>
          <el-radio-group v-model="chartPeriod" size="small">
            <el-radio-button label="month">月度</el-radio-button>
            <el-radio-button label="quarter">季度</el-radio-button>
            <el-radio-button label="year">年度</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      <div class="h-400px" ref="chartRef"></div>
    </el-card>
    
    <!-- 低周转商品TOP10 -->
    <el-card class="mt-15px">
      <template #header>
        <div class="flex justify-between items-center">
          <span>低周转商品TOP10</span>
          <el-button type="primary" link @click="handleNavigate('/erp/inventory/turnover/low-products')">
            查看全部
          </el-button>
        </div>
      </template>
      <el-table :data="lowTurnoverTop" border stripe>
        <el-table-column label="商品名称" prop="name" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <div>
              <div>{{ row.name }}</div>
              <div class="text-gray-400 text-xs">{{ row.barCode }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="商品分类" prop="categoryName" width="120" />
        <el-table-column label="库存数量" prop="stockCount" width="100" align="right" />
        <el-table-column label="库存金额" prop="stockValue" width="100" align="right">
          <template #default="{ row }">
            {{ formatPrice(row.stockValue) }}
          </template>
        </el-table-column>
        <el-table-column label="周转率" prop="turnoverRate" width="100" align="center">
          <template #default="{ row }">
            <span :class="getTurnoverRateClass(row.turnoverRate)">
              {{ formatTurnoverRate(row.turnoverRate) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="库龄(天)" prop="inventoryAge" width="100" align="center" />
        <el-table-column label="健康评分" prop="healthScore" width="100" align="center">
          <template #default="{ row }">
            <el-progress
              :percentage="row.healthScore"
              :color="getHealthScoreColor(row.healthScore)"
              :format="formatHealthScore"
              :stroke-width="15"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleViewDetail(row)">
              详情
            </el-button>
            <el-button type="success" link @click="handleAddToReturnPlan(row)">
              加入退货
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </ContentWrap>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ProductTurnoverApi } from '@/api/erp/inventory/turnover'
import { useMessage } from '@/hooks/web/useMessage'
import * as echarts from 'echarts/core'
import { BarChart, PieChart } from 'echarts/charts'
import { 
  TitleComponent, 
  TooltipComponent, 
  GridComponent, 
  LegendComponent,
  DatasetComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { 
  DataLine, 
  TrendCharts, 
  Histogram, 
  WarningFilled,
  Setting,
  Warning,
  Sell
} from '@element-plus/icons-vue'

// 注册ECharts组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DatasetComponent,
  BarChart,
  PieChart,
  CanvasRenderer
])

defineOptions({ name: 'TurnoverIndex' })

const router = useRouter()
const message = useMessage()
const chartRef = ref()
const chartInstance = ref(null)
const chartPeriod = ref('month')
const lowTurnoverTop = ref([])

// 统计数据
const statistics = reactive({
  totalProducts: 0,
  normalProducts: 0,
  lowProducts: 0,
  veryLowProducts: 0,
  avgTurnoverRate: 0
})

/** 初始化 */
onMounted(async () => {
  await getStatistics()
  await getLowTurnoverTop()
  initChart()
})

/** 获取统计数据 */
const getStatistics = async () => {
  try {
    const res = await ProductTurnoverApi.getLowTurnoverProducts({
      pageNo: 1,
      pageSize: 1,
      turnoverRateRange: 'ALL_LOW'
    })
    
    if (res.statistics) {
      statistics.totalProducts = res.statistics.totalProducts || 0
      statistics.normalProducts = res.statistics.normalProducts || 0
      statistics.lowProducts = res.statistics.lowCount || 0
      statistics.veryLowProducts = res.statistics.veryLowCount || 0
      statistics.avgTurnoverRate = res.statistics.avgTurnoverRate || 0
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

/** 获取低周转商品TOP10 */
const getLowTurnoverTop = async () => {
  try {
    const res = await ProductTurnoverApi.getLowTurnoverProducts({
      pageNo: 1,
      pageSize: 10,
      turnoverRateRange: 'ALL_LOW',
      orderBy: 'turnoverRate',
      sortOrder: 'asc'
    })
    
    lowTurnoverTop.value = res.list || []
  } catch (error) {
    console.error('获取低周转商品TOP10失败:', error)
  }
}

/** 初始化图表 */
const initChart = () => {
  if (!chartRef.value) return
  
  chartInstance.value = echarts.init(chartRef.value)
  updateChart()
}

/** 更新图表数据 */
const updateChart = () => {
  if (!chartInstance.value) return
  
  // 模拟数据，实际应该从API获取
  const option = {
    title: {
      text: '商品周转率分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: ['极低周转', '低周转', '正常周转', '高周转']
    },
    series: [
      {
        name: '周转率分布',
        type: 'pie',
        radius: ['40%', '70%'],
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
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: statistics.veryLowProducts, name: '极低周转', itemStyle: { color: '#F56C6C' } },
          { value: statistics.lowProducts - statistics.veryLowProducts, name: '低周转', itemStyle: { color: '#E6A23C' } },
          { value: statistics.normalProducts * 0.7, name: '正常周转', itemStyle: { color: '#409EFF' } },
          { value: statistics.normalProducts * 0.3, name: '高周转', itemStyle: { color: '#67C23A' } }
        ]
      }
    ]
  }
  
  chartInstance.value.setOption(option)
}

/** 监听图表周期变化 */
watch(chartPeriod, () => {
  updateChart()
})

/** 处理卡片点击 */
const handleCardClick = (type) => {
  switch (type) {
    case 'all':
      router.push('/erp/inventory/product')
      break
    case 'normal':
      router.push('/erp/inventory/product?turnoverStatus=normal')
      break
    case 'low':
      router.push('/erp/inventory/turnover/low-products?turnoverRateRange=LOW')
      break
    case 'very-low':
      router.push('/erp/inventory/turnover/low-products?turnoverRateRange=VERY_LOW')
      break
  }
}

/** 导航到指定页面 */
const handleNavigate = (path) => {
  router.push(path)
}

/** 查看详情 */
const handleViewDetail = (row) => {
  router.push(`/erp/inventory/product/detail?id=${row.id}`)
}

/** 加入退货计划 */
const handleAddToReturnPlan = (row) => {
  message.success(`已将商品【${row.name}】加入退货计划，建议退货数量：${row.suggestedReturnCount || 1}`)
  // 实际应该调用API将商品加入退货计划
}

/** 格式化周转率 */
const formatTurnoverRate = (rate) => {
  if (rate === undefined || rate === null) return '暂无数据'
  return (rate * 100).toFixed(2) + '%'
}

/** 格式化价格 */
const formatPrice = (price) => {
  if (price === undefined || price === null) return '¥0.00'
  return '¥' + price.toFixed(2)
}

/** 获取周转率样式 */
const getTurnoverRateClass = (rate) => {
  if (rate === undefined || rate === null) return ''
  if (rate < 0.05) return 'text-red-600 font-bold'
  if (rate < 0.1) return 'text-orange-500 font-bold'
  return 'text-green-500'
}

/** 获取健康评分颜色 */
const getHealthScoreColor = (score) => {
  if (score < 30) return '#F56C6C' // 红色
  if (score < 60) return '#E6A23C' // 橙色
  if (score < 80) return '#409EFF' // 蓝色
  return '#67C23A' // 绿色
}

/** 格式化健康评分 */
const formatHealthScore = (percentage) => {
  return percentage.toFixed(0)
}

/** 窗口大小变化时重绘图表 */
window.addEventListener('resize', () => {
  if (chartInstance.value) {
    chartInstance.value.resize()
  }
})
</script>

<style scoped>
.text-red-600 {
  color: #E53E3E;
}

.text-orange-500 {
  color: #E6A23C;
}

.text-green-500 {
  color: #67C23A;
}

.text-gray-400 {
  color: #909399;
}

.text-gray-500 {
  color: #606266;
}

.font-bold {
  font-weight: bold;
}

.cursor-pointer {
  cursor: pointer;
}

.h-400px {
  height: 400px;
}
</style> 