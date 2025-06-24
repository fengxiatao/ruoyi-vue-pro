<!-- 低周转商品列表 -->
<template>
  <ContentWrap title="低周转商品管理">
    <!-- 搜索表单 -->
    <el-card class="mb-10px">
      <el-form
        ref="queryFormRef"
        :model="queryParams"
        :inline="true"
        label-width="68px"
      >
        <el-form-item label="商品名称" prop="name">
          <el-input
            v-model="queryParams.name"
            placeholder="请输入商品名称或编号"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="商品分类" prop="categoryId">
          <el-select
            v-model="queryParams.categoryId"
            placeholder="请选择商品分类"
            clearable
            filterable
          >
            <el-option
              v-for="item in categoryOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="供应商" prop="supplierId">
          <el-select
            v-model="queryParams.supplierId"
            placeholder="请选择供应商"
            clearable
            filterable
          >
            <el-option
              v-for="item in supplierOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="周转率" prop="turnoverRateRange">
          <el-select
            v-model="queryParams.turnoverRateRange"
            placeholder="周转率范围"
            clearable
          >
            <el-option label="极低周转 (< 0.05)" value="VERY_LOW" />
            <el-option label="低周转 (0.05-0.1)" value="LOW" />
            <el-option label="所有低周转" value="ALL_LOW" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
          <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据统计卡片 -->
    <div class="flex gap-10px mb-10px">
      <el-card class="flex-1">
        <template #header>
          <div class="card-header">
            <span>极低周转商品</span>
            <el-tag type="danger">{{ statistics.veryLowCount || 0 }}种</el-tag>
          </div>
        </template>
        <div class="text-center">
          <div class="text-2xl font-bold">{{ statistics.veryLowValue || 0 }}</div>
          <div class="text-gray-500">库存金额 (元)</div>
        </div>
      </el-card>
      <el-card class="flex-1">
        <template #header>
          <div class="card-header">
            <span>低周转商品</span>
            <el-tag type="warning">{{ statistics.lowCount || 0 }}种</el-tag>
          </div>
        </template>
        <div class="text-center">
          <div class="text-2xl font-bold">{{ statistics.lowValue || 0 }}</div>
          <div class="text-gray-500">库存金额 (元)</div>
        </div>
      </el-card>
      <el-card class="flex-1">
        <template #header>
          <div class="card-header">
            <span>库存周转率</span>
            <el-tag type="info">平均值</el-tag>
          </div>
        </template>
        <div class="text-center">
          <div class="text-2xl font-bold">{{ formatTurnoverRate(statistics.avgTurnoverRate) }}</div>
          <div class="text-gray-500">整体周转情况</div>
        </div>
      </el-card>
    </div>

    <!-- 商品列表 -->
    <el-card>
      <template #header>
        <div class="flex justify-between">
          <span>低周转商品列表</span>
          <div>
            <el-button type="success" @click="handleExport">
              <Icon icon="ep:download" class="mr-5px" /> 导出清单
            </el-button>
            <el-button type="primary" @click="handleGenerateReturnPlan">
              <Icon icon="ep:document" class="mr-5px" /> 生成退货计划
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="list"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="商品名称" prop="name" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <div>
              <div>{{ row.name }}</div>
              <div class="text-gray-400 text-xs">{{ row.barCode }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="商品分类" prop="categoryName" width="120" />
        <el-table-column label="供应商" prop="supplierName" width="120" show-overflow-tooltip />
        <el-table-column label="规格型号" prop="spec" width="100" show-overflow-tooltip />
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
        <el-table-column label="最后销售" prop="lastSaleTime" width="100">
          <template #default="{ row }">
            {{ formatDate(row.lastSaleTime) }}
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
        <el-table-column label="建议退货" prop="suggestedReturnCount" width="100" align="center">
          <template #default="{ row }">
            <span class="text-red-500 font-bold" v-if="row.suggestedReturnCount > 0">
              {{ row.suggestedReturnCount }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleViewDetail(row)">
              详情
            </el-button>
            <el-button type="success" link @click="handleAddToReturnPlan(row)">
              加入退货
            </el-button>
            <el-button type="warning" link @click="handleViewSuggestions(row)">
              建议
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <Pagination
        v-model:limit="queryParams.pageSize"
        v-model:page="queryParams.pageNo"
        :total="total"
        @pagination="getList"
      />
    </el-card>

    <!-- 库存健康详情弹窗 -->
    <el-dialog
      v-model="healthDetailVisible"
      title="库存健康详情"
      width="700px"
      append-to-body
    >
      <div v-if="currentProduct">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="商品名称" :span="2">{{ currentProduct.name }}</el-descriptions-item>
          <el-descriptions-item label="商品分类">{{ currentProduct.categoryName }}</el-descriptions-item>
          <el-descriptions-item label="供应商">{{ currentProduct.supplierName }}</el-descriptions-item>
          <el-descriptions-item label="库存数量">{{ currentProduct.stockCount }}</el-descriptions-item>
          <el-descriptions-item label="库存金额">{{ formatPrice(currentProduct.stockValue) }}</el-descriptions-item>
          <el-descriptions-item label="周转率">{{ formatTurnoverRate(currentProduct.turnoverRate) }}</el-descriptions-item>
          <el-descriptions-item label="库龄">{{ currentProduct.inventoryAge }}天</el-descriptions-item>
        </el-descriptions>

        <div class="mt-15px">
          <h4>健康评分详情</h4>
          <el-row :gutter="20" class="mt-10px">
            <el-col :span="6">
              <div class="score-item">
                <div class="score-title">总评分</div>
                <el-progress type="dashboard" :percentage="healthDetail.totalScore" :color="getHealthScoreColor(healthDetail.totalScore)" />
              </div>
            </el-col>
            <el-col :span="6">
              <div class="score-item">
                <div class="score-title">周转评分</div>
                <el-progress type="dashboard" :percentage="healthDetail.turnoverScore" :color="getHealthScoreColor(healthDetail.turnoverScore)" />
              </div>
            </el-col>
            <el-col :span="6">
              <div class="score-item">
                <div class="score-title">库龄评分</div>
                <el-progress type="dashboard" :percentage="healthDetail.ageScore" :color="getHealthScoreColor(healthDetail.ageScore)" />
              </div>
            </el-col>
            <el-col :span="6">
              <div class="score-item">
                <div class="score-title">销售趋势</div>
                <el-progress type="dashboard" :percentage="healthDetail.trendScore" :color="getHealthScoreColor(healthDetail.trendScore)" />
              </div>
            </el-col>
          </el-row>
        </div>

        <div class="mt-15px">
          <h4>优化建议</h4>
          <el-timeline>
            <el-timeline-item
              v-for="(suggestion, index) in healthDetail.suggestions"
              :key="index"
              :type="getSuggestionType(suggestion.priority)"
              :color="getSuggestionColor(suggestion.priority)"
            >
              <h5>{{ suggestion.message }}</h5>
              <p class="text-gray-500">建议操作: {{ suggestion.action }}</p>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </el-dialog>
  </ContentWrap>
</template>

<script setup lang="ts">
import { ProductTurnoverApi, InventoryHealthScoreVO } from '@/api/erp/inventory/turnover'
import { ProductCategoryApi } from '@/api/erp/product/category'
import { SupplierApi } from '@/api/erp/purchase/supplier'
import { useMessage } from '@/hooks/web/useMessage'
import { dateFormatter2 } from '@/utils/formatTime'

defineOptions({ name: 'LowTurnoverProducts' })

const message = useMessage() // 消息弹窗
const loading = ref(false)
const list = ref([])
const total = ref(0)
const queryFormRef = ref()
const categoryOptions = ref([])
const supplierOptions = ref([])
const selectionList = ref([])
const healthDetailVisible = ref(false)
const currentProduct = ref(null)
const healthDetail = ref<InventoryHealthScoreVO>({
  productId: 0,
  productName: '',
  totalScore: 0,
  turnoverScore: 0,
  ageScore: 0,
  trendScore: 0,
  profitScore: 0,
  suggestions: []
})

// 统计数据
const statistics = ref({
  veryLowCount: 0,
  veryLowValue: 0,
  lowCount: 0,
  lowValue: 0,
  avgTurnoverRate: 0
})

// 查询参数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: undefined,
  categoryId: undefined,
  supplierId: undefined,
  turnoverRateRange: 'ALL_LOW'
})

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const res = await ProductTurnoverApi.getLowTurnoverProducts(queryParams)
    list.value = res.list
    total.value = res.total
    
    // 更新统计数据
    statistics.value = res.statistics || {
      veryLowCount: 0,
      veryLowValue: 0,
      lowCount: 0,
      lowValue: 0,
      avgTurnoverRate: 0
    }
  } catch (error) {
    console.error('获取低周转商品列表失败:', error)
    message.error('获取低周转商品列表失败')
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 导出清单 */
const handleExport = async () => {
  message.success('导出功能待实现')
}

/** 生成退货计划 */
const handleGenerateReturnPlan = () => {
  if (selectionList.value.length === 0) {
    message.warning('请先选择商品')
    return
  }
  
  message.success(`已选择${selectionList.value.length}种商品，退货计划生成功能待实现`)
}

/** 查看详情 */
const handleViewDetail = async (row) => {
  currentProduct.value = row
  
  try {
    // 获取健康评分详情
    healthDetail.value = await ProductTurnoverApi.getInventoryHealthScore(row.id)
    healthDetailVisible.value = true
  } catch (error) {
    console.error('获取库存健康评分失败:', error)
    message.error('获取库存健康评分失败')
  }
}

/** 加入退货计划 */
const handleAddToReturnPlan = (row) => {
  message.success(`已将商品【${row.name}】加入退货计划，建议退货数量：${row.suggestedReturnCount}`)
}

/** 查看建议 */
const handleViewSuggestions = (row) => {
  handleViewDetail(row)
}

/** 选择商品 */
const handleSelectionChange = (selection) => {
  selectionList.value = selection
}

/** 格式化周转率 */
const formatTurnoverRate = (rate) => {
  if (rate === undefined || rate === null) return '暂无数据'
  return (rate * 100).toFixed(2) + '%'
}

/** 格式化日期 */
const formatDate = (date) => {
  if (!date) return '暂无记录'
  return dateFormatter2(date)
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

/** 获取建议类型 */
const getSuggestionType = (priority) => {
  if (priority >= 4) return 'danger'
  if (priority >= 3) return 'warning'
  return 'info'
}

/** 获取建议颜色 */
const getSuggestionColor = (priority) => {
  if (priority >= 4) return '#F56C6C' // 红色
  if (priority >= 3) return '#E6A23C' // 橙色
  return '#909399' // 灰色
}

/** 初始化 */
onMounted(async () => {
  // 获取商品分类
  try {
    categoryOptions.value = await ProductCategoryApi.getProductCategorySimpleList()
  } catch (error) {
    console.error('获取商品分类失败:', error)
  }
  
  // 获取供应商
  try {
    supplierOptions.value = await SupplierApi.getSupplierSimpleList()
  } catch (error) {
    console.error('获取供应商失败:', error)
  }
  
  // 获取列表
  getList()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.text-red-500 {
  color: #F56C6C;
}

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

.score-item {
  text-align: center;
}

.score-title {
  margin-bottom: 10px;
  font-weight: bold;
}
</style> 