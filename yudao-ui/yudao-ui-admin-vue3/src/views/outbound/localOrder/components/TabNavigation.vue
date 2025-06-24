<template>
  <div class="tab-switch-buttons">
    <el-button 
      :type="activeTab === 'products' ? 'primary' : 'default'" 
      size="small" 
      @click="changeTab('products')"
      class="tab-button"
    >
      商品列表 (Alt+P)
    </el-button>
    <el-button 
      :type="activeTab === 'drafts' ? 'primary' : 'default'" 
      size="small" 
      @click="changeTab('drafts')"
      class="tab-button"
    >
      草稿单列表 (Alt+D)
    </el-button>
    <el-button 
      :type="activeTab === 'history' ? 'primary' : 'default'" 
      size="small" 
      @click="changeTab('history')"
      class="tab-button"
    >
      历史订单 (Alt+H)
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  activeTab: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:activeTab'])

const changeTab = (tab: string) => {
  emit('update:activeTab', tab)
}
</script>

<style scoped>
.tab-switch-buttons {
  margin-bottom: 10px;
}

.tab-button {
  margin-right: 5px;
}
</style> 