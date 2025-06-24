<template>
  <div class="left-info-footer">
    <div class="toolbar-buttons">
      <span class="form-label" style="padding-top: 5px; margin-right: 5px">回款</span>
      <el-input
        v-model="amount"
        size="small"
        class="compact-input"
        style="width: 150px"
      />
      <el-select v-model="returnTypeValue" size="small" class="form-select">
        <el-option label="预交" value="prepay" />
        <el-option label="还款" value="refund" />
      </el-select>
      <el-select v-model="payTypeValue" size="small" class="form-select">
        <el-option label="现金" value="cash" />
        <el-option label="转账" value="transfer" />
      </el-select>
      <el-button type="danger" size="small">优惠</el-button>
      <el-button type="danger" size="small">回款</el-button>
      <el-button type="danger" size="small">过账</el-button>
    </div>
    <div class="toolbar-buttons">
      <div class="collector-group">
        <el-input
          v-model="amount"
          size="small"
          class="compact-input"
          style="width: 110px"
        />
        <el-select v-model="collectorValue" size="small" style="width: 80px; margin-left: 2px">
          <el-option label="张三" value="zhangsan" />
          <el-option label="李四" value="lisi" />
        </el-select>
      </div>
      <el-button type="primary" size="small" class="action-btn" @click="handleRefresh">刷新</el-button>
    </div>
    <div class="toolbar-buttons">
      <el-date-picker
        v-model="dateValue"
        type="date"
        size="small"
        format="YYYY-MM-DD"
        placeholder="2025-03-22"
        class="date-picker"
      />
      <el-button type="danger" size="small" @click="handlePrint">打印预览</el-button>
      <el-select v-model="printTypeValue" size="small" class="print-select">
        <el-option label="打印" value="print" />
        <el-option label="选中" value="selected" />
      </el-select>
      <el-button type="default" size="small" class="function-btn">F6,F8</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits } from 'vue'

const emit = defineEmits(['refresh', 'print'])

// 订单操作相关数据
const amount = ref('')
const returnTypeValue = ref('prepay')
const payTypeValue = ref('cash')
const collectorValue = ref('')
const printTypeValue = ref('print')
const dateValue = ref(new Date())

// 刷新订单数据
const handleRefresh = () => {
  emit('refresh')
}

// 打印预览
const handlePrint = () => {
  emit('print', printTypeValue.value)
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