<template>
  <div class="batch-history-panel">
    <div class="batch-history-header">
      <h3>批次历史</h3>
      <el-input
        v-model="searchQuery"
        placeholder="搜索批次号、客户"
        prefix-icon="Search"
        clearable
        size="small"
        style="width: 220px"
        @clear="loadBatchHistory"
        @keyup.enter="loadBatchHistory"
      />
      <div class="batch-header-actions">
        <el-button type="primary" size="small" @click="loadBatchHistory">刷新</el-button>
      </div>
    </div>
    
    <div class="batch-list">
      <el-table
        :data="batchList"
        style="width: 100%"
        v-loading="loading"
        @row-click="handleBatchSelect"
        highlight-current-row
      >
        <el-table-column prop="batchVersion" label="批次号" width="80" />
        <el-table-column prop="customerName" label="客户" min-width="120" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" width="160">
          <template #default="scope">
            {{ formatDateTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="itemCount" label="商品数" width="80" />
        <el-table-column prop="totalPrice" label="总金额" width="100">
          <template #default="scope">
            <span class="price-text">¥{{ formatPrice(scope.row.totalPrice) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag type="success" v-if="scope.row.status === '已传出'">{{ scope.row.status }}</el-tag>
            <el-tag type="warning" v-else-if="scope.row.status === '处理中'">{{ scope.row.status }}</el-tag>
            <el-tag type="info" v-else>{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button size="small" type="primary" @click.stop="viewBatchDetails(scope.row)">详情</el-button>
            <el-button size="small" type="success" @click.stop="handlePrintBatch(scope.row)">打印</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="batch-pagination">
        <el-pagination
          background
          layout="prev, pager, next, sizes"
          :total="total"
          :page-size="pageSize"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { formatDate } from '@/utils/formatTime'
import * as TradeOrderApi from '@/api/mall/trade/order'

defineOptions({ name: 'BatchHistory' })

const emit = defineEmits(['view-batch'])

// 分页参数
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const loading = ref(false)

// 批次列表
const batchList = ref<any[]>([])

// 加载批次历史
const loadBatchHistory = async () => {
  loading.value = true
  try {
    // 在实际应用中，这里应该调用后端API获取批次历史
    // const result = await TradeOrderApi.getBatchHistory({
    //   page: currentPage.value,
    //   pageSize: pageSize.value,
    //   query: searchQuery.value
    // })
    
    // 模拟数据，实际项目中应从后端获取
    const mockData = generateMockBatchData()
    
    batchList.value = mockData.list
    total.value = mockData.total
  } catch (error) {
    console.error('加载批次历史失败:', error)
    ElMessage.error('加载批次历史失败，请重试')
  } finally {
    loading.value = false
  }
}

// 生成模拟数据
function generateMockBatchData() {
  const list = []
  const total = 56
  
  for (let i = 1; i <= Math.min(pageSize.value, total - (currentPage.value - 1) * pageSize.value); i++) {
    const batchNumber = total - ((currentPage.value - 1) * pageSize.value + i - 1)
    const date = new Date()
    date.setHours(date.getHours() - batchNumber)
    
    list.push({
      batchId: `BD${String(batchNumber).padStart(6, '0')}`,
      batchVersion: batchNumber,
      customerId: batchNumber % 5 + 1,
      customerName: `客户${batchNumber % 5 + 1}`,
      createTime: date.toISOString(),
      itemCount: Math.floor(Math.random() * 10) + 1,
      totalPrice: Math.floor(Math.random() * 100000) + 5000,
      status: batchNumber % 10 === 0 ? '处理中' : '已传出',
      items: []
    })
  }
  
  return {
    list,
    total
  }
}

// 处理分页大小改变
const handleSizeChange = (size: number) => {
  pageSize.value = size
  loadBatchHistory()
}

// 处理页码改变
const handleCurrentChange = (page: number) => {
  currentPage.value = page
  loadBatchHistory()
}

// 查看批次详情
const viewBatchDetails = (batch: any) => {
  emit('view-batch', batch)
}

// 处理批次选择
const handleBatchSelect = (batch: any) => {
  viewBatchDetails(batch)
}

// 打印批次单
const handlePrintBatch = (batch: any) => {
  ElMessage.info(`打印批次 #${batch.batchVersion} 功能待实现`)
}

// 格式化日期时间
const formatDateTime = (dateTime: string) => {
  if (!dateTime) return ''
  return formatDate(new Date(dateTime), 'YYYY-MM-DD HH:mm:ss')
}

// 格式化价格
const formatPrice = (price: number) => {
  if (price == null) return '0.00'
  return (price / 100).toFixed(2)
}

onMounted(() => {
  loadBatchHistory()
})
</script>

<style scoped>
.batch-history-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.batch-history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}

.batch-history-header h3 {
  margin: 0;
  font-size: 16px;
}

.batch-header-actions {
  display: flex;
  gap: 10px;
}

.batch-list {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
}

.batch-pagination {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}

.price-text {
  color: #f56c6c;
  font-weight: bold;
}
</style> 