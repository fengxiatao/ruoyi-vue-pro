<template>
  <div class="order-detail-panel">
    <div class="order-detail-header">
      <h4>历史订单详情 <span class="order-id">#{{ orderDetail.draftId }}</span></h4>
      <el-button size="small" @click="handleBack">返回列表</el-button>
    </div>
    <div class="order-detail-info">
      <div class="info-row">
        <span class="info-label">订单号:</span>
        <span class="info-value">{{ orderDetail.no || '未生成' }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">创建时间:</span>
        <span class="info-value">{{ formatDateTime(orderDetail.createTime) }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">草稿状态:</span>
        <span class="info-value">{{ getDraftStatusText(orderDetail.draftStatus) }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">处理状态:</span>
        <span class="info-value">{{ getProcessStatusText(orderDetail.processStatus) }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">总金额:</span>
        <span class="info-value price">¥{{ formatPrice(orderDetail.totalPrice) }}</span>
      </div>
    </div>
    <h4>商品明细</h4>
    <el-table :data="orderItems" style="width: 100%">
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
      <el-button size="small" type="primary" @click="handleLoadOrder">加载此订单</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatDate } from '@/utils/formatTime'
import { OrderVO } from '@/types/localOrder'

defineOptions({ name: 'HistoryOrderDetail' })

const props = defineProps<{
  orderDetail: OrderVO
}>()

const emit = defineEmits(['back', 'load-order'])

// 获取订单项数据
const orderItems = computed(() => {
  return props.orderDetail.items || props.orderDetail.orderItems || []
})

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

// 处理返回
function handleBack() {
  emit('back')
}

// 加载订单
function handleLoadOrder() {
  emit('load-order', props.orderDetail)
}
</script>

<style scoped>
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