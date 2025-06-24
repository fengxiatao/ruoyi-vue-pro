<template>
  <el-input
    ref="inputRef"
    :model-value="displayValue"
    @update:model-value="handleInput"
    :precision="precision"
    class="money-input"
    placeholder="0.00"
  >
    <!-- <template #suffix>¥</template> -->
  </el-input>
</template>

<script setup lang="ts">
import { computed, ref, defineExpose } from 'vue'

interface Props {
  modelValue: number  
  precision?: number         // 可选，默认2
}

const props = withDefaults(defineProps<Props>(), {
  precision: 2
})

const emit = defineEmits(['update:modelValue'])

const inputRef = ref()

// 显示值转换（分→元）
const displayValue = computed(() => {
  return ((props.modelValue ?? 0) / 100).toFixed(props.precision)
})

// 处理输入（元→分）
const handleInput = (value: string) => {
  const yuan = parseFloat(value) || 0
  emit('update:modelValue', Math.round(yuan * 100) || 0)  // 确保传出的值是 number
}

defineExpose({
  focus: () => {
    inputRef.value?.focus?.()
  }
})

</script>

<style scoped>
.money-input {
  :deep(.el-input__inner) {
    padding-right: 25px;
    text-align: right;
  }
  
  :deep(.el-input__suffix) {
    right: 8px;
    color: var(--el-color-primary);
  }
}
</style>