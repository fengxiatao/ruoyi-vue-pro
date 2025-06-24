<template>
  <div class="status-panel">
    <h3>订单状态</h3>
    <div class="status-item">
      <span class="status-label">草稿状态:</span>
      <span class="status-value">{{ getDraftStatusText(order?.draftStatus) }}</span>
    </div>
    <div class="status-item">
      <span class="status-label">处理状态:</span>
      <span class="status-value">{{ getProcessStatusText(order?.processStatus) }}</span>
    </div>
    <div class="status-item">
      <span class="status-label">批次版本:</span>
      <span class="status-value">{{ order?.batchVersion || 0 }}</span>
    </div>
    <div class="status-item">
      <span class="status-label">订单总额:</span>
      <span class="status-value price">¥{{ formatPrice(order?.totalPrice) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import { OrderVO } from '@/types/localOrder'

const props = defineProps({
  order: {
    type: Object as () => OrderVO | null,
    default: null
  }
})

// 格式化价格显示
function formatPrice(price) {
  if (price == null) return '0.00'
  return (price / 100).toFixed(2)
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
.status-panel {
  color: #fff;
  padding: 10px;
}

.status-panel h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 5px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.status-label {
  color: #ccc;
}

.status-value {
  font-weight: bold;
}

.status-value.price {
  color: #f56c6c;
}
</style> 