<template>
  <div class="left-info-header">
    <div class="left-group">
      <el-input
        v-model="searchName"
        placeholder="客户名称"
        ref="searchInput"
        type="text"
        size="small"
        @keydown="handleKeydown"
      />
      <el-select
        v-model="searchLine"
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
      <el-button type="primary" size="small" @click="handleToggleMode">
        {{ isOrderMode ? '显示' : '关闭' }}</el-button
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'

defineOptions({ name: 'CustomerSearchHeader' })

const props = defineProps<{
  isOrderMode: boolean
  queryParams: {
    name: string
    line: number | undefined
  }
}>()

const emit = defineEmits(['search', 'keydown', 'toggle-mode', 'focus'])

// 内部状态，和父组件同步
const searchName = ref(props.queryParams.name)
const searchLine = ref(props.queryParams.line)
const searchInput = ref<any>(null)

// 监听props变化，更新内部状态
watch(() => props.queryParams, (newVal) => {
  searchName.value = newVal.name
  searchLine.value = newVal.line
}, { deep: true })

// 同步内部状态变化到父组件
watch(searchName, (newVal) => {
  emit('search', { name: newVal, line: searchLine.value })
})

// 搜索方法
const handleSearch = () => {
  emit('search', { name: searchName.value, line: searchLine.value })
}

// 键盘事件处理
const handleKeydown = (event: KeyboardEvent) => {
  emit('keydown', event)
}

// 切换模式
const handleToggleMode = () => {
  emit('toggle-mode')
}

// 聚焦方法，供父组件调用
const focus = () => {
  if (searchInput.value) {
    searchInput.value.focus()
  }
}

defineExpose({ focus })
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
  gap: 5px;
}
</style> 