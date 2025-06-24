<template>
  <div class="order-table-footer-fixed">
    <div class="order-table-summary">
      <span>已选择: {{ selectedCount }} 项</span>
      <el-button type="danger" size="small" class="footer-button" @click="handleLock">锁定</el-button>
      <el-button type="danger" size="small" class="footer-button" @click="handleAudit">审核</el-button>
      <el-button type="danger" size="small" class="footer-button" @click="handleCancel">取消</el-button>
      <el-button type="danger" size="small" class="footer-button" @click="handleDeleteItems">删除选中</el-button>
    </div>
    <div class="order-table-actions">
      <el-button 
        type="danger" 
        size="small" 
        class="footer-button" 
        :loading="submitting" 
        @click="handleSubmit"
      >
        <span v-if="batchVersion > 0">批次 ({{ batchVersion }}) 传出</span>
        <span v-else>传出</span>
      </el-button>
      <el-popover
        v-if="batchVersion > 0"
        placement="top"
        trigger="hover"
        :width="200"
      >
        <template #reference>
          <el-badge :value="batchVersion" class="batch-badge">
            <el-button type="success" circle size="small" class="batch-icon">
              <el-icon><Check /></el-icon>
            </el-button>
          </el-badge>
        </template>
        <div class="batch-popover-content">
          <p><b>批次信息</b></p>
          <p>当前批次: {{ batchVersion }}</p>
          <p>最近传出: {{ lastSubmitTime || '无' }}</p>
          <div class="batch-actions">
            <el-button type="primary" size="small" @click="handleViewBatchDetails">查看明细</el-button>
          </div>
        </div>
      </el-popover>
      <el-button type="primary" size="small" class="footer-button" @click="handleViewDrafts">草稿单</el-button>
      <el-button type="info" size="small" class="footer-button" @click="handleViewHistory">历史单</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { OrderItemRespVO } from '@/types/localOrder'
import { Check } from '@element-plus/icons-vue'

defineOptions({ name: 'OrderSummary' })

const props = defineProps<{
  items: OrderItemRespVO[]
  batchVersion?: number
  submitting?: boolean
  lastSubmitTime?: string
}>()

const emit = defineEmits([
  'lock', 
  'audit', 
  'cancel', 
  'delete-items', 
  'submit', 
  'view-drafts', 
  'view-history',
  'view-batch-details'
])

// 内部状态
const submitting = ref(props.submitting || false)
const batchVersion = ref(props.batchVersion || 0)
const lastSubmitTime = ref(props.lastSubmitTime || '')

// 监听props变化
watch(() => props.submitting, (newVal) => {
  if (newVal !== undefined) submitting.value = newVal
})

watch(() => props.batchVersion, (newVal) => {
  if (newVal !== undefined) batchVersion.value = newVal
})

watch(() => props.lastSubmitTime, (newVal) => {
  if (newVal !== undefined) lastSubmitTime.value = newVal
})

// 计算已选择的项目数量
const selectedCount = computed(() => {
  return props.items?.filter(i => i.selected).length || 0
})

// 事件处理方法
const handleLock = () => {
  emit('lock')
}

const handleAudit = () => {
  emit('audit')
}

const handleCancel = () => {
  emit('cancel')
}

const handleDeleteItems = () => {
  emit('delete-items')
}

const handleSubmit = () => {
  emit('submit')
}

const handleViewDrafts = () => {
  emit('view-drafts')
}

const handleViewHistory = () => {
  emit('view-history')
}

const handleViewBatchDetails = () => {
  emit('view-batch-details')
}
</script>

<style scoped>
.order-table-footer-fixed {
  z-index: 2;
  display: flex;
  height: 40px;
  padding: 0 10px;
  background: #f5f7fa;
  border-top: 1px solid #dcdfe6;
  border-radius: 0 0 4px 4px;
  flex: none;
  justify-content: space-between;
  align-items: center;
}

.order-table-summary {
  display: flex;
  height: 26px;
  font-size: 13px;
  line-height: 26px;
  color: #606266;
  align-items: center;
  gap: 5px;
}

.order-table-actions {
  display: flex;
  align-items: center;
  gap: 5px;
}

.footer-button {
  height: 28px;
  padding: 0 10px;
  margin: 0 2px;
  font-size: 12px;
}

.batch-badge {
  margin: 0 5px;
}

.batch-icon {
  height: 24px;
  width: 24px;
  padding: 0;
}

.batch-popover-content {
  font-size: 12px;
}

.batch-popover-content p {
  margin: 5px 0;
}

.batch-actions {
  margin-top: 8px;
  text-align: center;
}
</style> 