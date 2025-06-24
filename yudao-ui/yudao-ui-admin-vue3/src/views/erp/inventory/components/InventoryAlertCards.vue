<!-- 库存预警卡片组件 -->
<template>
  <div class="inventory-alert-cards">
    <el-row :gutter="20">
      <el-col :span="6" v-for="(card, index) in cards" :key="index">
        <el-card shadow="hover" class="alert-card" :class="getCardClass(index)" @click="handleCardClick(card)">
          <div class="card-content">
            <div class="card-title">{{ card.title }}</div>
            <div class="card-count">{{ card.count }}</div>
            <div class="card-desc">{{ card.desc }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { StockApi, StockAlertStatVO } from '@/api/erp/stock/stock'
import { useMessage } from '@/hooks/web/useMessage'

defineOptions({ name: 'InventoryAlertCards' })

const { notification } = useMessage()
const cards = ref<StockAlertStatVO[]>([
  { title: '低于安全库存', count: 0, desc: '需及时补货' },
  { title: '客户常购断货', count: 0, desc: '影响销售的热销品' },
  { title: '低库存高周转', count: 0, desc: '应优先采购' },
  { title: '即将断货', count: 0, desc: '预测未来7日售空' }
])

// 获取卡片样式类
const getCardClass = (index: number) => {
  const classes = ['warning', 'danger', 'primary', 'info']
  return classes[index % classes.length]
}

// 处理卡片点击事件
const emit = defineEmits<{
  (e: 'cardClick', cardData: StockAlertStatVO): void
}>()

const handleCardClick = (card: StockAlertStatVO) => {
  emit('cardClick', card)
}

// 获取库存预警统计数据
const fetchAlertStats = async () => {
  try {
    const response = await StockApi.getStockAlertStats()
    if (response && response.length > 0) {
      cards.value = response
    }
  } catch (error) {
    console.error('获取库存预警统计失败:', error)
  }
}

onMounted(() => {
  fetchAlertStats()
})
</script>

<style lang="scss" scoped>
.inventory-alert-cards {
  margin-bottom: 20px;
  
  .alert-card {
    height: 120px;
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
      transform: translateY(-5px);
    }
    
    &.warning {
      border-left: 4px solid #e6a23c;

      .card-count { color: #e6a23c; }
    }
    
    &.danger {
      border-left: 4px solid #f56c6c;

      .card-count { color: #f56c6c; }
    }
    
    &.primary {
      border-left: 4px solid #409eff;

      .card-count { color: #409eff; }
    }
    
    &.info {
      border-left: 4px solid #909399;

      .card-count { color: #909399; }
    }
    
    .card-content {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
      
      .card-title {
        font-size: 16px;
        font-weight: 500;
      }
      
      .card-count {
        margin: 10px 0;
        font-size: 28px;
        font-weight: bold;
      }
      
      .card-desc {
        font-size: 13px;
        color: #909399;
      }
    }
  }
}
</style> 