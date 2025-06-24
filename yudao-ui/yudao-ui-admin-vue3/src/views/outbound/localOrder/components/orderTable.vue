<template>
  <div class="customer-table-card">
    <div class="order-table-header">
      <div class="order-table-header-left">
        <span class="total-label">总计(¥):</span>
        <el-input
          :model-value="(totalAmount / 100).toFixed(2)"
          class="compact-input nowrap-cell"
          size="small"
          style="width: 90px"
          disabled
        />
        <span class="total-label">整单优惠(¥):</span>
        <el-input
          v-model="orderDiscount"
          class="compact-input nowrap-cell"
          size="small"
          style="width: 90px"
          type="number"
        />
        <span class="total-label">应付(¥):</span>
        <el-input
          :model-value="(totalPay / 100).toFixed(2)"
          class="compact-input nowrap-cell"
          size="small"
          style="width: 90px"
          disabled
        />
      </div>
      <div class="order-table-header-right">
        <span class="order-number-label">单号:</span>
        <el-input
          v-model="currentOrder.no"
          class="order-number-input"
          placeholder="订单编号"
          size="small"
          style="width: 120px"
          padding-right="20px"
          disabled
        />
        <span class="order-number-label">草稿号:</span>
        <el-input
          v-model="currentOrder.draftId"
          class="order-number-input"
          placeholder="草稿单号"
          size="small"
          style="width: 180px"
          padding-right="20px"
          disabled
        />
        <el-popover placement="top" width="150" trigger="click">
          <template #reference>
            <el-button
              type="info"
              size="small"
              style="width: 50px"
              class="footer-button"
              icon="Setting"
              >列设置</el-button
            >
          </template>
          <div class="column-checkbox-group">
            <el-checkbox
              v-for="column in allColumns"
              :key="column.prop"
              v-model="column.visible"
              @change="updateVisibleColumns"
            >
              {{ column.label }}
            </el-checkbox>
          </div>
        </el-popover>
      </div>
    </div>
    <el-table
      class="order-table"
      :data="tableItems"
      empty-text="暂无数据"
      :stripe="false"
      :show-overflow-tooltip="false"
      @selection-change="handleSelectionChange"
    >
      <!-- 选择列 -->
      <el-table-column type="selection" width="40" fixed="left" />

      <!-- 基本信息列 - 始终显示 -->
      <el-table-column prop="spuName" label="名称" width="320" show-overflow-tooltip>
        <template #default="{ row }">
          <el-tooltip :content="row.spuName" placement="top" :show-after="500">
            <span class="text-ellipsis nowrap-cell">{{ row.spuName }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="count" label="数量" width="70" align="center">
        <template #default="{ row }">
          <el-input v-model="row.count" size="small" class="table-input nowrap-cell" />
        </template>
      </el-table-column>
      <el-table-column width="80" label="售价(¥)" align="right">
        <template #default="{ row }">
          <span class="nowrap-cell">{{ (row.price / 100).toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column width="100" label="金额(¥)" align="right">
        <template #default="{ row }">
          <span class="nowrap-cell">{{ ((row.price * row.count) / 100).toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column width="80" label="优惠(¥)" align="center">
        <template #default="{ row }">
          <el-input v-model="row.discountPrice" size="small" class="table-input nowrap-cell" />
        </template>
      </el-table-column>
      <el-table-column width="100" label="应付(¥)" align="right">
        <template #default="{ row }">
          <span class="nowrap-cell">{{ ((row.price * row.count - (row.discountPrice || 0)) / 100).toFixed(2) }}</span>
        </template>
      </el-table-column>

      <!-- 次要信息列 - 可通过列设置控制显示 -->
      <el-table-column
        v-for="column in visibleColumns"
        :key="column.prop"
        :prop="column.prop"
        :label="column.label"
        :width="column.width"
        :align="column.align"
      >
        <template #default="{ row }">
          <template v-if="column.type === 'text'">
            <el-tooltip :content="row[column.prop]" placement="top" :show-after="500">
              <span class="text-ellipsis">{{ row[column.prop] }}</span>
            </el-tooltip>
          </template>
          <template v-else-if="column.type === 'price'">
            {{ (row[column.prop] / 100).toFixed(2) }}
          </template>
          <template v-else>
            {{ row[column.prop] }}
          </template>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import { OrderVO, OrderItemRespVO } from '@/types/localOrder'
import { ElMessage, ElMessageBox } from 'element-plus';

// 修改currentOrder的类型定义
const props = defineProps<{
  selectedOrder?: OrderVO | null;
}>();

const currentOrder = ref({ ...props.selectedOrder }); 
const selectedRows = ref<OrderItemRespVO[]>([]);

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection;
  // 更新当前订单中的选中状态
  if (currentOrder.value?.orderItems) {
    currentOrder.value.orderItems.forEach(item => {
      item.selected = selection.some(selected => selected.id === item.id);
    });
  }
};

// 计算表格数据源，确保始终有数据可用
const tableItems = computed(() => {
  if (!currentOrder.value) return [];
  
  // 使用orderItems作为主要数据源
  if (currentOrder.value.orderItems && currentOrder.value.orderItems.length > 0) {
    return currentOrder.value.orderItems;
  }
  
  // 如果orderItems不存在或为空，尝试使用items
  if (currentOrder.value.items && currentOrder.value.items.length > 0) {
    return currentOrder.value.items;
  }
  
  // 都不存在，返回空数组
  return [];
});

// 订单表格列配置
const allColumns = ref([
  { prop: 'bak', label: '备注', width: '120', visible: true, type: 'text', align: 'left' },
  {
    prop: 'permount',
    label: '数量/件',
    width: '70',
    visible: false,
    type: 'number',
    align: 'center'
  },
  { prop: 'discode', label: '折扣', width: '60', visible: true, type: 'number', align: 'center' },
  {
    prop: 'perprice',
    label: '单价/个',
    width: '70',
    visible: false,
    type: 'price',
    align: 'right'
  },
  { prop: 'operator', label: '操作员', width: '80', visible: false, type: 'text', align: 'center' },
  { prop: 'client', label: '客户', width: '120', visible: false, type: 'text', align: 'left' }
])

// 当前可见的列
const visibleColumns = computed(() => {
  return allColumns.value.filter((column) => column.visible)
})

// 更新可见列
const updateVisibleColumns = () => {
  // 可以在这里保存用户的列设置到本地存储
  localStorage.setItem('orderTableColumns', JSON.stringify(allColumns.value))
}

// 初始化时从本地存储加载列设置
const initColumnSettings = () => {
  const savedColumns = localStorage.getItem('orderTableColumns')
  if (savedColumns) {
    try {
      const parsedColumns = JSON.parse(savedColumns)
      allColumns.value = parsedColumns
    } catch (e) {
      console.error('Failed to parse saved column settings', e)
    }
  }
}

// 监听selectedOrder变化
watch(
  () => props.selectedOrder,
  (newOrder) => {
    console.log('订单表格接收到新订单:', newOrder);
    if (newOrder) {
      currentOrder.value = { ...newOrder };
    }
  },
  { immediate: true }
);

onMounted(() => {
  initColumnSettings();
  console.log('订单表格组件已挂载，当前订单:', currentOrder.value);
})

// 计算总计
const totalAmount = computed(() => {
  const items = tableItems.value;
  return items.reduce((sum, item) => {
    const itemTotal = item.price * item.count;
    return sum + (itemTotal || 0);
  }, 0);
});

// 整单优惠（可编辑）
const orderDiscount = ref(currentOrder.value?.discountPrice || 0);
watch(
  () => currentOrder.value?.discountPrice,
  (val) => {
    orderDiscount.value = val || 0;
  },
  { immediate: true }
);

// 应付
const totalPay = computed(() => totalAmount.value - (Number(orderDiscount.value) || 0));

// 当整单优惠输入变化时，自动同步到 currentOrder
watch(orderDiscount, (val) => {
  if (currentOrder.value) {
    currentOrder.value.discountPrice = val;
  }
});

// 导出方法给父组件使用
defineExpose({
  selectedRows
});
</script>

<style lang="scss" scoped>
.customer-table-card {
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-top: 5px;
  overflow: hidden;
  background-color: #f5f7fa;
  border-radius: 5px;
}

.order-table-header {
  display: flex;
  height: 32px;
  padding: 0 10px;
  margin-bottom: 8px;
  background-color: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  justify-content: space-between;
  align-items: center;
}

.order-table-header-left,
.order-table-header-right {
  display: flex;
  align-items: center;
  height: 100%;
}

.total-label,
.order-number-label {
  display: inline-block;
  margin-right: 5px;
  overflow: hidden;
  font-size: 13px;
  font-weight: bold;
  color: #606266;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
}

.total-value {
  font-size: 14px;
  font-weight: bold;
  color: #f56c6c;
}

.order-number-input {
  width: 150px;
}

.order-number-input :deep(.el-input__inner) {
  height: 24px;
  line-height: 24px;
}

.order-table {
  flex: 1;
  width: 100%;
  height: calc(100% - 40px); /* 减去底部操作区高度 */
  overflow: auto;
}

/* 修改表格样式 */
:deep(.el-table) {
  width: 100%;
  height: 100%;
}

:deep(.el-table__inner-wrapper) {
  height: 100%;
}

.el-table {
  overflow: hidden; /* 隐藏外部滚动条 */
}

.el-table__body-wrapper {
  overflow-y: auto; /* 内容区域显示垂直滚动条 */
}

.nowrap-cell {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.el-table__cell) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
