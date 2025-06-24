<template>
  <div class="history-list-panel">
    <h3>历史订单列表</h3>
    <div v-if="selectedHistory" class="order-detail-panel">
      <div class="order-detail-header">
        <h4>历史订单详情 <span class="order-id">#{{ selectedHistory.draftId }}</span></h4>
        <el-button size="small" @click="handleBackToList">返回列表</el-button>
      </div>
      <div class="order-detail-info">
        <div class="info-row">
          <span class="info-label">订单号:</span>
          <span class="info-value">{{ selectedHistory.no || '未生成' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">创建时间:</span>
          <span class="info-value">{{ formatDateTime(selectedHistory.createTime) }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">草稿状态:</span>
          <span class="info-value">{{ getDraftStatusText(selectedHistory.draftStatus) }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">处理状态:</span>
          <span class="info-value">{{ getProcessStatusText(selectedHistory.processStatus) }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">总金额:</span>
          <span class="info-value price">¥{{ formatPrice(selectedHistory.totalPrice) }}</span>
        </div>
      </div>
      <h4>商品明细</h4>
      <el-table :data="selectedHistory.items || selectedHistory.orderItems || []" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="商品名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="count" label="数量" width="80" />
        <el-table-column prop="price" label="单价" width="100">
          <template #default="scope">
            ¥{{ formatPrice(scope.row.price) }}
          </template>
        </el-table-column>
        <el-table-column label="小计" width="100">
          <template #default="scope">
            ¥{{ formatPrice(scope.row.price * scope.row.count) }}
          </template>
        </el-table-column>
      </el-table>
      <div class="order-detail-actions">
        <el-button size="small" type="primary" @click="handleLoadOrder(selectedHistory)">加载此订单</el-button>
      </div>
    </div>
    <el-table v-else :data="historyOrders" style="width: 100%" highlight-current-row @row-click="handleHistorySelect">
      <el-table-column prop="draftId" label="草稿单号" width="180" />
      <el-table-column prop="no" label="订单号" width="180" />
      <el-table-column prop="createTime" label="创建时间" width="180">
        <template #default="scope">
          {{ formatDateTime(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="draftStatus" label="草稿状态" width="100">
        <template #default="scope">
          {{ getDraftStatusText(scope.row.draftStatus) }}
        </template>
      </el-table-column>
      <el-table-column prop="processStatus" label="处理状态" width="100">
        <template #default="scope">
          {{ getProcessStatusText(scope.row.processStatus) }}
        </template>
      </el-table-column>
      <el-table-column prop="totalPrice" label="总金额" width="100">
        <template #default="scope">
          ¥{{ formatPrice(scope.row.totalPrice) }}
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="small" type="primary" @click.stop="handleLoadOrder(scope.row)">加载</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import { formatDate } from '@/utils/formatTime'
import { OrderVO } from '@/types/localOrder'

const props = defineProps({
  historyOrders: {
    type: Array as () => OrderVO[],
    required: true
  },
  selectedHistory: {
    type: Object as () => OrderVO | null,
    default: null
  }
})

const emit = defineEmits(['select', 'load', 'back'])

// 选择历史订单
const handleHistorySelect = (row) => {
  emit('select', row)
}

// 返回列表
const handleBackToList = () => {
  emit('back')
}

// 加载历史订单
const handleLoadOrder = (order) => {
  emit('load', order)
}

// 格式化价格显示
function formatPrice(price) {
  if (price == null) return '0.00'
  return (price / 100).toFixed(2)
}

// 格式化日期时间
function formatDateTime(dateTime) {
  if (!dateTime) return ''
  return formatDate(new Date(dateTime), 'YYYY-MM-DD HH:mm:ss')
}

// 获取草稿状态文本
function getDraftStatusText(status) {
  const statusMap = {
    0: '未保存',
    1: '编辑中',
    2: '已提交',
    3: '已取消'
  }
  return statusMap[status] || '未知'
}

// 获取处理状态文本
function getProcessStatusText(status) {
  const statusMap = {
    0: '未处理',
    1: '派发中',
    2: '已派发',
    3: '拣货中',
    4: '已拣货',
    5: '打包中',
    6: '已打包',
    7: '已发货'
  }
  return statusMap[status] || '未知'
}
</script>

<style scoped>
.history-list-panel {
  padding: 10px;
}

.history-list-panel h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 5px;
}

.order-detail-panel {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 5px;
  padding: 15px;
}

.order-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.order-detail-header h4 {
  margin: 0;
  font-size: 16px;
}

.order-id {
  color: #67c23a;
  margin-left: 5px;
}

.order-detail-info {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 15px;
}

.info-row {
  display: flex;
  margin-bottom: 8px;
}

.info-label {
  width: 80px;
  color: #909399;
}

.info-value {
  font-weight: bold;
}

.info-value.price {
  color: #f56c6c;
}

.order-detail-actions {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 