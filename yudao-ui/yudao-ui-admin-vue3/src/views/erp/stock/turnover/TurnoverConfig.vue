<!-- 商品周转率配置 -->
<template>
  <ContentWrap title="商品周转率配置">
    <el-card>
      <template #header>
        <div class="flex justify-between">
          <span>周转率配置管理</span>
          <el-button type="primary" @click="handleCalculate">
            <Icon icon="ep:refresh" class="mr-5px" /> 重新计算周转率
          </el-button>
        </div>
      </template>

      <!-- 配置说明 -->
      <el-alert
        title="周转率配置说明"
        type="info"
        :closable="false"
        class="mb-15px"
      >
        <div class="mt-5px">
          <p>1. 周转率计算周期：根据不同商品类型选择合适的计算周期（月度/季度/年度）</p>
          <p>2. 低周转阈值：低于此值的商品将被标记为低周转商品，建议关注</p>
          <p>3. 正常周转阈值：高于此值的商品周转正常，无需特别关注</p>
          <p>4. 周转率 = 一段时间内的销售数量 / 平均库存量</p>
        </div>
      </el-alert>

      <!-- 配置表格 -->
      <el-table :data="configList" v-loading="loading" border>
        <el-table-column label="商品分类" prop="categoryName" min-width="180" />
        <el-table-column label="计算周期" prop="calculationPeriod" width="120">
          <template #default="{ row }">
            <el-select v-model="row.calculationPeriod" class="w-full">
              <el-option label="月度" value="MONTHLY" />
              <el-option label="季度" value="QUARTERLY" />
              <el-option label="年度" value="YEARLY" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="低周转阈值" prop="lowTurnoverThreshold" width="150">
          <template #default="{ row }">
            <el-input-number
              v-model="row.lowTurnoverThreshold"
              :min="0"
              :max="1"
              :precision="2"
              :step="0.01"
              class="w-full"
            />
          </template>
        </el-table-column>
        <el-table-column label="正常周转阈值" prop="normalTurnoverThreshold" width="150">
          <template #default="{ row }">
            <el-input-number
              v-model="row.normalTurnoverThreshold"
              :min="0"
              :max="1"
              :precision="2"
              :step="0.01"
              class="w-full"
            />
          </template>
        </el-table-column>
        <el-table-column label="启用状态" prop="enabled" width="100">
          <template #default="{ row }">
            <el-switch v-model="row.enabled" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleSave(row)">保存</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分类说明 -->
      <div class="mt-15px">
        <h3>行业特性配置建议</h3>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="易耗品">
            <div>
              <p>如机油、刹车片等更换频率高的配件</p>
              <p>建议配置：月度计算，低周转阈值0.3，正常周转阈值0.5</p>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="常规维修件">
            <div>
              <p>如轮胎、链条等定期更换的配件</p>
              <p>建议配置：季度计算，低周转阈值0.1，正常周转阈值0.2</p>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="结构件/长周期件">
            <div>
              <p>如车架、车身等更换频率极低的配件</p>
              <p>建议配置：年度计算，低周转阈值0.02，正常周转阈值0.05</p>
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>
  </ContentWrap>
</template>

<script setup lang="ts">
import { ProductTurnoverApi, ProductTurnoverConfigVO } from '@/api/erp/inventory/turnover'
import { useMessage } from '@/hooks/web/useMessage'
import { ProductCategoryApi } from '@/api/erp/product/category'

defineOptions({ name: 'TurnoverConfig' })

const message = useMessage() // 消息弹窗
const loading = ref(false)
const configList = ref<ProductTurnoverConfigVO[]>([])

/** 获取配置列表 */
const getConfigList = async () => {
  loading.value = true
  try {
    // 获取周转率配置列表
    const configs = await ProductTurnoverApi.getTurnoverConfigList()
    
    // 如果配置为空，则初始化默认配置
    if (!configs || configs.length === 0) {
      // 获取商品分类列表
      const categories = await ProductCategoryApi.getProductCategorySimpleList()
      
      // 为每个分类创建默认配置
      configList.value = categories.map(category => ({
        id: 0,
        categoryId: category.id,
        categoryName: category.name,
        calculationPeriod: 'MONTHLY',
        lowTurnoverThreshold: 0.1,
        normalTurnoverThreshold: 0.2,
        enabled: true
      }))
    } else {
      configList.value = configs
    }
  } catch (error) {
    console.error('获取周转率配置失败:', error)
    message.error('获取周转率配置失败')
  } finally {
    loading.value = false
  }
}

/** 保存配置 */
const handleSave = async (row: ProductTurnoverConfigVO) => {
  try {
    // 验证配置
    if (row.lowTurnoverThreshold >= row.normalTurnoverThreshold) {
      message.warning('低周转阈值必须小于正常周转阈值')
      return
    }
    
    // 保存配置
    await ProductTurnoverApi.saveTurnoverConfig(row)
    message.success('保存成功')
  } catch (error) {
    console.error('保存周转率配置失败:', error)
    message.error('保存周转率配置失败')
  }
}

/** 手动触发周转率计算 */
const handleCalculate = async () => {
  try {
    await ProductTurnoverApi.calculateTurnoverRates()
    message.success('周转率计算任务已提交，请稍后查看结果')
  } catch (error) {
    console.error('触发周转率计算失败:', error)
    message.error('触发周转率计算失败')
  }
}

/** 初始化 */
onMounted(() => {
  getConfigList()
})
</script> 