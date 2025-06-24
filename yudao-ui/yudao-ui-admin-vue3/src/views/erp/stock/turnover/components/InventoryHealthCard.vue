<!-- 库存健康评分卡片 -->
<template>
  <el-card class="inventory-health-card" :body-style="{ padding: '10px' }">
    <template #header>
      <div class="flex justify-between items-center">
        <span>库存健康评分</span>
        <el-tag :type="getScoreTagType(totalScore)">{{ getScoreLevel(totalScore) }}</el-tag>
      </div>
    </template>
    
    <div class="score-container">
      <div class="total-score">
        <el-progress 
          type="dashboard" 
          :percentage="totalScore" 
          :color="getScoreColor(totalScore)"
          :width="80"
          :stroke-width="10"
        />
        <div class="score-label">总评分</div>
      </div>
      
      <div class="score-details">
        <div class="score-item">
          <div class="score-value" :style="{ color: getScoreColor(turnoverScore) }">
            {{ turnoverScore }}
          </div>
          <div class="score-name">周转率</div>
        </div>
        <div class="score-item">
          <div class="score-value" :style="{ color: getScoreColor(ageScore) }">
            {{ ageScore }}
          </div>
          <div class="score-name">库龄</div>
        </div>
        <div class="score-item">
          <div class="score-value" :style="{ color: getScoreColor(trendScore) }">
            {{ trendScore }}
          </div>
          <div class="score-name">销售趋势</div>
        </div>
        <div class="score-item">
          <div class="score-value" :style="{ color: getScoreColor(profitScore) }">
            {{ profitScore }}
          </div>
          <div class="score-name">利润率</div>
        </div>
      </div>
    </div>
    
    <div class="suggestions" v-if="suggestions && suggestions.length > 0">
      <div class="suggestion-title">优化建议</div>
      <div 
        v-for="(suggestion, index) in suggestions.slice(0, maxSuggestions)" 
        :key="index"
        class="suggestion-item"
        :class="{ 'high-priority': suggestion.priority >= 4 }"
      >
        <el-icon :color="getSuggestionColor(suggestion.priority)" class="mr-5px">
          <Warning v-if="suggestion.priority >= 4" />
          <InfoFilled v-else />
        </el-icon>
        <span>{{ suggestion.message }}</span>
      </div>
      
      <div v-if="suggestions.length > maxSuggestions" class="more-suggestions">
        <el-button type="text" @click="$emit('view-more')">
          查看更多建议 ({{ suggestions.length - maxSuggestions }})
        </el-button>
      </div>
    </div>
    
    <div class="actions">
      <el-button type="primary" size="small" @click="$emit('view-detail')">
        查看详情
      </el-button>
      <el-button type="success" size="small" @click="$emit('optimize')" :disabled="totalScore >= 80">
        优化库存
      </el-button>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Warning, InfoFilled } from '@element-plus/icons-vue'
import { InventorySuggestionVO } from '@/api/erp/inventory/turnover'

defineOptions({ name: 'InventoryHealthCard' })

const props = defineProps({
  totalScore: {
    type: Number,
    default: 0
  },
  turnoverScore: {
    type: Number,
    default: 0
  },
  ageScore: {
    type: Number,
    default: 0
  },
  trendScore: {
    type: Number,
    default: 0
  },
  profitScore: {
    type: Number,
    default: 0
  },
  suggestions: {
    type: Array as PropType<InventorySuggestionVO[]>,
    default: () => []
  },
  maxSuggestions: {
    type: Number,
    default: 2
  }
})

const emits = defineEmits(['view-detail', 'optimize', 'view-more'])

// 获取评分等级
const getScoreLevel = (score: number) => {
  if (score < 30) return '高风险'
  if (score < 60) return '中风险'
  if (score < 80) return '低风险'
  return '健康'
}

// 获取评分标签类型
const getScoreTagType = (score: number) => {
  if (score < 30) return 'danger'
  if (score < 60) return 'warning'
  if (score < 80) return 'info'
  return 'success'
}

// 获取评分颜色
const getScoreColor = (score: number) => {
  if (score < 30) return '#F56C6C' // 红色
  if (score < 60) return '#E6A23C' // 橙色
  if (score < 80) return '#409EFF' // 蓝色
  return '#67C23A' // 绿色
}

// 获取建议颜色
const getSuggestionColor = (priority: number) => {
  if (priority >= 4) return '#F56C6C' // 红色
  if (priority >= 3) return '#E6A23C' // 橙色
  return '#909399' // 灰色
}
</script>

<style scoped>
.inventory-health-card {
  height: 100%;
}

.score-container {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.total-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 20px;
}

.score-label {
  margin-top: 5px;
  font-size: 14px;
  color: #606266;
}

.score-details {
  flex: 1;
  display: flex;
  justify-content: space-around;
}

.score-item {
  text-align: center;
}

.score-value {
  font-size: 20px;
  font-weight: bold;
}

.score-name {
  font-size: 12px;
  color: #909399;
}

.suggestions {
  padding-top: 10px;
  margin-top: 15px;
  border-top: 1px solid #EBEEF5;
}

.suggestion-title {
  margin-bottom: 8px;
  font-weight: bold;
}

.suggestion-item {
  display: flex;
  padding: 5px;
  margin-bottom: 5px;
  font-size: 13px;
  border-radius: 4px;
  align-items: center;
}

.high-priority {
  background-color: rgb(245 108 108 / 10%);
}

.more-suggestions {
  margin-top: 5px;
  text-align: center;
}

.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
}
</style> 