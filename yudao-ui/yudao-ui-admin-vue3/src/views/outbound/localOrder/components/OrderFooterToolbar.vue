<template>
  <div class="left-info-footer">
    <div class="toolbar-buttons">
      <span class="form-label" style="padding-top: 5px; margin-right: 5px">回款</span>
      <el-input
        v-model="orderAmount"
        size="small"
        class="compact-input"
        style="width: 150px"
      />
      <el-select v-model="returnType" size="small" class="form-select">
        <el-option label="预交" value="prepay" />
        <el-option label="还款" value="refund" />
      </el-select>
      <el-select v-model="payType" size="small" class="form-select">
        <el-option label="现金" value="cash" />
        <el-option label="转账" value="transfer" />
      </el-select>
      <el-button type="danger" size="small" @click="handleDiscount">优惠</el-button>
      <el-button type="danger" size="small" @click="handlePayment">回款</el-button>
      <el-button type="danger" size="small" @click="handlePosting">过账</el-button>
    </div>
    <div class="toolbar-buttons">
      <div class="collector-group">
        <el-input
          v-model="orderAmount"
          size="small"
          class="compact-input"
          style="width: 110px"
        />
        <el-select v-model="collector" size="small" style="width: 80px; margin-left: 2px">
          <el-option label="张三" value="zhangsan" />
          <el-option label="李四" value="lisi" />
        </el-select>
      </div>
      <el-button type="primary" size="small" class="action-btn" @click="handleRefresh">刷新</el-button>
    </div>
    <div class="toolbar-buttons">
      <el-date-picker
        v-model="orderDate"
        type="date"
        size="small"
        format="YYYY-MM-DD"
        placeholder="2025-03-22"
        class="date-picker"
      />
      <el-button type="danger" size="small" @click="handlePrintPreview">打印预览</el-button>
      <el-select v-model="printType" size="small" class="print-select">
        <el-option label="打印" value="print" />
        <el-option label="选中" value="selected" />
      </el-select>
      <el-button type="default" size="small" class="function-btn">F6,F8</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

defineOptions({ name: 'OrderFooterToolbar' })

const emit = defineEmits(['refresh', 'print-preview'])

// 订单操作相关数据
const orderAmount = ref('')
const returnType = ref('prepay')
const payType = ref('cash')
const collector = ref('')
const orderDate = ref(new Date())
const printType = ref('print')

// 处理回调函数
const handleDiscount = () => {
  ElMessage.info('优惠功能待实现')
}

const handlePayment = () => {
  ElMessage.info('回款功能待实现')
}

const handlePosting = () => {
  ElMessage.info('过账功能待实现')
}

const handleRefresh = () => {
  emit('refresh')
}

const handlePrintPreview = () => {
  emit('print-preview')
}
</script>

<style scoped>
.left-info-footer {
  padding: 8px;
  flex: none;
  flex-direction: column;
  border-top: 1px solid #dcdfe6;
}

.toolbar-buttons {
  display: flex;
  width: 100%;
  padding-top: 5px;
  justify-content: space-between;
  gap: 5px;
}

.form-label {
  margin-right: 2px;
  margin-left: -5px;
  font-size: 13px;
  color: #606266;
  white-space: nowrap;
}

.compact-input {
  height: 28px;
}

.form-select,
.print-select {
  width: 80px;
  height: 26px;
}

.action-btn,
.function-btn {
  padding: 0 15px;
}

.collector-group {
  display: flex;
  align-items: center;
}
</style> 