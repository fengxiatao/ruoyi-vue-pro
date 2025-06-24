<template>
  <div class="left-info-header">
    <div class="left-group">
      <el-input
        v-model="searchParams.name"
        placeholder="客户名称"
        ref="customerSearchInput"
        type="text"
        size="small"
        @keydown="handleCustomerSearchKeydown"
      />
      <el-select
        v-model="searchParams.line"
        class="m-2"
        placeholder="线路"
        size="small"
        style="width: 100px"
        @change="handleSearch"
      >
        <el-option label="全部线路" :value="0" />
        <el-option
          v-for="dict in getIntDictOptions(DICT_TYPE.CRM_CUSTOMER_LINE)"
          :key="dict.value"
          :label="dict.label"
          :value="dict.value"
        />
      </el-select>
      <el-button type="primary" size="small" @click="handleSearch">查询</el-button>
    </div>
    <div class="right-group">
      <el-button type="primary" size="small" @click="toggleViewMode">
        {{ isOrderMode ? '显示' : '关闭' }}</el-button
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { ElInput } from 'element-plus'

const props = defineProps({
  isOrderMode: {
    type: Boolean,
    required: true
  },
  queryParams: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['search', 'toggle-view', 'customer-keydown'])

const customerSearchInput = ref<InstanceType<typeof ElInput>>()
const searchParams = ref({ ...props.queryParams })

// 客户查询方法
const handleSearch = () => {
  emit('search', searchParams.value)
}

// 切换视图模式
const toggleViewMode = () => {
  emit('toggle-view')
}

// 客户搜索输入框的键盘事件处理
const handleCustomerSearchKeydown = (event: KeyboardEvent) => {
  emit('customer-keydown', event)
}

// 暴露方法给父组件
defineExpose({
  customerSearchInput,
  focus: () => {
    customerSearchInput.value?.focus()
  }
})
</script>

<style scoped>
.left-info-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 2px;
  background-color: rgb(0 0 0 / 20%);
  flex: none;
  justify-content: space-between;
  border-radius: 5px;
}

.left-group,
.right-group {
  display: flex;
  align-items: center;
  gap: -5px;
}
</style> 