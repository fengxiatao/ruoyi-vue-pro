<template>
  <div class="draft-list-panel">
    <h3>草稿单列表</h3>
    <div class="draft-list-filters">
      <el-form :inline="true" class="filter-form">
        <el-form-item label="客户:">
          <el-select 
            v-model="filterParams.customerId" 
            placeholder="全部客户" 
            clearable
            size="small"
            @change="handleFilterChange"
          >
            <el-option label="全部客户" :value="null" />
            <el-option 
              v-if="currentCustomer" 
              :label="currentCustomer.name" 
              :value="currentCustomer.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态:">
          <el-select 
            v-model="filterParams.draftStatus" 
            placeholder="全部状态" 
            clearable
            size="small"
            @change="handleFilterChange"
          >
            <el-option label="全部状态" :value="null" />
            <el-option label="未保存" :value="0" />
            <el-option label="编辑中" :value="1" />
            <el-option label="已提交" :value="2" />
            <el-option label="已取消" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" @click="handleRefresh">刷新</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table
      :data="draftsList" 
      style="width: 100%" 
      row-key="draftId"
      highlight-current-row
      @row-click="handleRowClick"
      :expand-row-keys="expandedDraftIds"
    >
      <el-table-column type="expand">
        <template #default="props">
          <div class="draft-detail-section">
            <div class="draft-detail-header">
              <h4>草稿单明细</h4>
              <div class="draft-detail-summary">
                <span class="detail-label">创建时间:</span>
                <span class="detail-value">{{ formatDateTime(props.row.createTime) }}</span>
                <span class="detail-label">总金额:</span>
                <span class="detail-value price">¥{{ formatPrice(props.row.totalPrice) }}</span>
              </div>
            </div>
            
            <div class="item-cards-container">
              <el-empty v-if="!props.row.items || props.row.items.length === 0" description="暂无商品" />
              <DraftItemCard 
                v-else
                v-for="(item, index) in props.row.items || props.row.orderItems || []" 
                :key="index"
                :item="item"
              />
            </div>
            
            <div class="draft-detail-actions">
              <el-button size="small" type="danger" @click.stop="handleDelete(props.row)">删除草稿单</el-button>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="draftId" label="草稿单号" width="180" />
      <el-table-column prop="createTime" label="创建时间" width="180">
        <template #default="scope">
          {{ formatDateTime(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="draftStatus" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getDraftStatusType(scope.row.draftStatus)">
            {{ getDraftStatusText(scope.row.draftStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="productCount" label="商品数" width="80" />
      <el-table-column prop="totalPrice" label="总金额" width="100">
        <template #default="scope">
          <span class="price-text">¥{{ formatPrice(scope.row.totalPrice) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="客户" min-width="120">
        <template #default="scope">
          {{ getCustomerName(scope.row.customerId) || '无客户' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-button size="small" type="primary" @click.stop="handleLoad(scope.row)">加载</el-button>
          <el-button size="small" type="danger" @click.stop="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, computed } from 'vue'
import { formatDate } from '@/utils/formatTime'
import { CustomerVO } from '@/api/crm/customer'
import { OrderVO } from '@/types/localOrder'
import DraftItemCard from './DraftItemCard.vue'

const props = defineProps({
  draftsList: {
    type: Array as () => OrderVO[],
    required: true
  },
  currentCustomer: {
    type: Object as () => CustomerVO,
    default: null
  },
  selectedDraftId: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['load', 'delete', 'refresh', 'filter', 'toggle-expand'])

const filterParams = ref({
  customerId: props.currentCustomer?.id || null,
  draftStatus: null as number | null
})

// 展开的行ID
const expandedDraftIds = computed(() => {
  return props.selectedDraftId ? [props.selectedDraftId] : []
})

// 处理过滤条件变更
const handleFilterChange = () => {
  emit('filter', filterParams.value)
}

// 刷新列表
const handleRefresh = () => {
  emit('refresh')
}

// 加载草稿单
const handleLoad = (draft: OrderVO) => {
  emit('load', draft)
}

// 删除草稿单
const handleDelete = (draft: OrderVO) => {
  emit('delete', draft)
}

// 点击行展开/收起详情
const handleRowClick = (row) => {
  emit('toggle-expand', row)
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

// 获取草稿状态标签类型
function getDraftStatusType(status) {
  const typeMap = {
    0: 'info',
    1: 'primary',
    2: 'success',
    3: 'danger'
  }
  return typeMap[status] || 'info'
}

// 根据客户ID获取客户名称
const getCustomerName = (customerId) => {
  if (!customerId) return null
  
  // 如果当前选择的客户ID与参数相同，直接返回名称
  if (props.currentCustomer?.id === customerId) {
    return props.currentCustomer.name
  }
  
  // 如果没有匹配，返回ID
  return `客户#${customerId}`
}
</script>

<style scoped>
.draft-list-panel {
  padding: 10px;
}

.draft-list-panel h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 5px;
}

.draft-list-filters {
  margin-bottom: 15px;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 5px;
}

.filter-form {
  display: flex;
  align-items: center;
}

.filter-form :deep(.el-form-item) {
  margin-bottom: 0;
  margin-right: 15px;
}

.filter-form :deep(.el-form-item__label) {
  color: #e6e6e6;
}

/* 嵌套表格样式 */
.draft-detail-section {
  padding: 15px;
  margin: 0 20px;
  background-color: #f5f7fa;
  border-radius: 5px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.draft-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10px;
}

.draft-detail-header h4 {
  margin: 0;
  font-size: 16px;
  color: #303133;
  font-weight: bold;
}

.draft-detail-summary {
  display: flex;
  gap: 15px;
  align-items: center;
}

.detail-label {
  color: #606266;
}

.detail-value {
  font-weight: bold;
  color: #303133;
}

.detail-value.price {
  color: #f56c6c;
  font-weight: bold;
}

.price-text {
  color: #f56c6c;
  font-weight: bold;
}

.draft-detail-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
}

.item-cards-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
}
</style> 