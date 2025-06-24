<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      ref="queryFormRef"
      :inline="true"
      :model="queryParams"
      class="-mb-15px"
    >
      <el-form-item label="物料编码" prop="materialCode">
        <el-input
          v-model="queryParams.materialCode"
          placeholder="请输入物料编码"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="物料名称" prop="materialName">
        <el-input
          v-model="queryParams.materialName"
          placeholder="请输入物料名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="预警类型" prop="warningType">
        <el-select v-model="queryParams.warningType" placeholder="请选择预警类型" clearable>
          <el-option label="库存不足" value="UNDER_STOCK" />
          <el-option label="库存超储" value="OVER_STOCK" />
          <el-option label="库存积压" value="OVERDUE" />
          <el-option label="临期预警" value="EXPIRING" />
        </el-select>
      </el-form-item>
      <el-form-item label="处理状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择处理状态" clearable>
          <el-option label="未处理" value="PENDING" />
          <el-option label="处理中" value="PROCESSING" />
          <el-option label="已处理" value="PROCESSED" />
          <el-option label="已忽略" value="IGNORED" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery">
          <Icon icon="ep:search" class="mr-5px" /> 搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon icon="ep:refresh" class="mr-5px" /> 重置
        </el-button>
        <el-button type="warning" @click="handleBatchProcess">
          <Icon icon="ep:check" class="mr-5px" /> 批量处理
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="物料编码" align="center" prop="materialCode" />
      <el-table-column label="物料名称" align="center" prop="materialName" />
      <el-table-column label="预警类型" align="center" prop="warningType">
        <template #default="scope">
          <el-tag :type="getWarningType(scope.row.warningType)">
            {{ getWarningLabel(scope.row.warningType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="当前库存" align="center" prop="currentStock" />
      <el-table-column label="安全库存" align="center" prop="safetyStock" />
      <el-table-column label="最大库存" align="center" prop="maxStock" />
      <el-table-column label="预警阈值" align="center" prop="warningThreshold" />
      <el-table-column label="处理状态" align="center" prop="status">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusLabel(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="预警时间" align="center" prop="warningTime" width="160" />
      <el-table-column label="操作" align="center" width="200">
        <template #default="scope">
          <el-button link type="primary" @click="handleDetail(scope.row.id)">
            详情
          </el-button>
          <el-button link type="success" @click="handleProcess(scope.row.id)" v-if="scope.row.status === 'PENDING'">
            处理
          </el-button>
          <el-button link type="warning" @click="handleIgnore(scope.row.id)" v-if="scope.row.status === 'PENDING'">
            忽略
          </el-button>
          <el-button link type="info" @click="handleHistory(scope.row.id)" v-if="['PROCESSED', 'IGNORED'].includes(scope.row.status)">
            处理记录
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      v-model:limit="queryParams.pageSize"
      v-model:page="queryParams.pageNo"
      :total="total"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 预警统计卡片 -->
  <ContentWrap>
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover" class="danger-card">
          <template #header>
            <div class="card-header">
              <span>库存不足</span>
            </div>
          </template>
          <div class="card-body">
            <h2>{{ statistics.underStockCount || 0 }}</h2>
            <p>低于安全库存</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="warning-card">
          <template #header>
            <div class="card-header">
              <span>库存超储</span>
            </div>
          </template>
          <div class="card-body">
            <h2>{{ statistics.overStockCount || 0 }}</h2>
            <p>超过最大库存</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="info-card">
          <template #header>
            <div class="card-header">
              <span>库存积压</span>
            </div>
          </template>
          <div class="card-body">
            <h2>{{ statistics.overdueCount || 0 }}</h2>
            <p>超过积压时间</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="success-card">
          <template #header>
            <div class="card-header">
              <span>临期预警</span>
            </div>
          </template>
          <div class="card-body">
            <h2>{{ statistics.expiringCount || 0 }}</h2>
            <p>即将过期物料</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </ContentWrap>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import type { TagProps } from 'element-plus'

defineOptions({ name: 'InventoryWarning' })

const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数据

const statistics = reactive({
  underStockCount: 0,
  overStockCount: 0,
  overdueCount: 0,
  expiringCount: 0
})

const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  materialCode: '',
  materialName: '',
  warningType: undefined,
  status: undefined
})

/** 获取预警类型标签类型 */
const getWarningType = (type: string): TagProps['type'] => {
  switch (type) {
    case 'UNDER_STOCK': return 'danger'
    case 'OVER_STOCK': return 'warning'
    case 'OVERDUE': return 'info'
    case 'EXPIRING': return 'success'
    default: return 'info'
  }
}

/** 获取预警类型标签文本 */
const getWarningLabel = (type: string) => {
  switch (type) {
    case 'UNDER_STOCK': return '库存不足'
    case 'OVER_STOCK': return '库存超储'
    case 'OVERDUE': return '库存积压'
    case 'EXPIRING': return '临期预警'
    default: return ''
  }
}

/** 获取状态标签类型 */
const getStatusType = (status: string): TagProps['type'] => {
  switch (status) {
    case 'PENDING': return 'danger'
    case 'PROCESSING': return 'warning'
    case 'PROCESSED': return 'success'
    case 'IGNORED': return 'info'
    default: return 'info'
  }
}

/** 获取状态标签文本 */
const getStatusLabel = (status: string) => {
  switch (status) {
    case 'PENDING': return '未处理'
    case 'PROCESSING': return '处理中'
    case 'PROCESSED': return '已处理'
    case 'IGNORED': return '已忽略'
    default: return ''
  }
}

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    // TODO: 调用接口获取数据
    loading.value = false
  } catch (error) {
    loading.value = false
  }
}

/** 获取统计数据 */
const getStatistics = async () => {
  try {
    // TODO: 调用接口获取统计数据
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryParams.materialCode = ''
  queryParams.materialName = ''
  queryParams.warningType = undefined
  queryParams.status = undefined
  handleQuery()
}

/** 查看详情 */
const handleDetail = async (id: number) => {
  console.log('Viewing warning detail:', id)
  // TODO: 实现查看详情逻辑
}

/** 处理预警 */
const handleProcess = async (id: number) => {
  console.log('Processing warning:', id)
  // TODO: 实现处理预警逻辑
}

/** 忽略预警 */
const handleIgnore = async (id: number) => {
  console.log('Ignoring warning:', id)
  // TODO: 实现忽略预警逻辑
}

/** 查看处理记录 */
const handleHistory = async (id: number) => {
  console.log('Viewing process history:', id)
  // TODO: 实现查看处理记录逻辑
}

/** 批量处理 */
const handleBatchProcess = async () => {
  console.log('Batch processing warnings')
  // TODO: 实现批量处理逻辑
}

/** 初始化 */
onMounted(() => {
  getStatistics()
  getList()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-body {
  text-align: center;
}

.card-body h2 {
  margin: 10px 0;
  font-size: 24px;
}

.card-body p {
  margin: 0;
  color: #666;
}

.warning-card :deep(.el-card__header) {
  background-color: #fdf6ec;
}

.success-card :deep(.el-card__header) {
  background-color: #f0f9eb;
}

.danger-card :deep(.el-card__header) {
  background-color: #fef0f0;
}

.info-card :deep(.el-card__header) {
  background-color: #f4f4f5;
}
</style> 