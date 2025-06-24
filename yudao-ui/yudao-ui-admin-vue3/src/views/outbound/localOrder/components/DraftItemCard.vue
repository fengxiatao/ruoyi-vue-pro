<template>
  <div class="item-card">
    <div class="item-card-header">
      <div class="item-image">
        <el-image
          v-if="item.picUrl"
          :src="item.picUrl"
          :preview-src-list="[item.picUrl]"
          fit="contain"
          style="width: 60px; height: 60px"
        />
        <div v-else class="no-image">暂无图片</div>
      </div>
      <div class="item-info">
        <div class="item-name">{{ item.spuName || item.name }}</div>
        <div class="item-specs">
          <el-tag 
            v-for="(prop, idx) in item.properties" 
            :key="idx" 
            size="small" 
            effect="plain"
            type="info"
          >
            {{ prop.propertyName }}: {{ prop.valueName }}
          </el-tag>
        </div>
      </div>
      <div class="item-price-info">
        <div class="item-price">
          <span class="price-label">单价:</span>
          <span class="price-value">¥{{ formatPrice(item.price) }}</span>
        </div>
        <div class="item-count">
          <span class="count-label">数量:</span>
          <span class="count-value">{{ item.count }}</span>
        </div>
        <div class="item-subtotal">
          <span class="subtotal-label">小计:</span>
          <span class="subtotal-value">¥{{ formatPrice(item.price * item.count) }}</span>
        </div>
      </div>
    </div>
    <div class="item-card-footer">
      <span class="item-id">ID: {{ item.id }}</span>
      <span class="item-sku">SKU: {{ item.skuId }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import { OrderItemRespVO } from '@/types/localOrder'

const props = defineProps({
  item: {
    type: Object as () => OrderItemRespVO,
    required: true
  }
})

// 格式化价格显示
function formatPrice(price) {
  if (price == null) return '0.00'
  return (price / 100).toFixed(2)
}
</script>

<style scoped>
.item-card {
  display: flex;
  flex-direction: column;
  width: calc(50% - 8px);
  background-color: #fff;
  border-radius: 5px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.item-card-header {
  display: flex;
  padding: 10px;
  background-color: #f5f7fa;
}

.item-image {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: #f5f7fa;
  border-radius: 3px;
  border: 1px solid #ebeef5;
}

.no-image {
  font-size: 12px;
  color: #909399;
}

.item-info {
  flex: 1;
  min-width: 0;
  padding: 0 10px;
}

.item-name {
  font-weight: bold;
  margin-bottom: 5px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-specs {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.item-price-info {
  width: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex-shrink: 0;
}

.item-price, .item-count, .item-subtotal {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 13px;
}

.price-label, .count-label, .subtotal-label {
  color: #909399;
}

.price-value, .subtotal-value {
  color: #f56c6c;
  font-weight: bold;
}

.count-value {
  font-weight: bold;
  color: #303133;
}

.item-card-footer {
  display: flex;
  justify-content: space-between;
  padding: 5px 10px;
  background-color: #f5f7fa;
  border-top: 1px solid #ebeef5;
  font-size: 12px;
  color: #909399;
}
</style> 