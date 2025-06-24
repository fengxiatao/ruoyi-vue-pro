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
      <el-form-item label="库存状态" prop="stockStatus">
        <el-select v-model="queryParams.stockStatus" placeholder="请选择库存状态" clearable>
          <el-option label="正常" value="NORMAL" />
          <el-option label="超储" value="OVER_STOCK" />
          <el-option label="不足" value="UNDER_STOCK" />
          <el-option label="积压" value="OVERDUE" />
        </el-select>
      </el-form-item>
      <el-form-item label="库位" prop="locationCode">
        <el-input
          v-model="queryParams.locationCode"
          placeholder="请输入库位编码"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery">
          <Icon icon="ep:search" class="mr-5px" /> 搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon icon="ep:refresh" class="mr-5px" /> 重置
        </el-button>
        <el-button type="primary" @click="handleExport">
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list">
      <el-table-column label="物料编码" align="center" prop="materialCode" />
      <el-table-column label="物料名称" align="center" prop="materialName" />
      <el-table-column label="规格型号" align="center" prop="specification" />
      <el-table-column label="单位" align="center" prop="unit" width="80" />
      <el-table-column label="当前库存" align="center" prop="currentStock" />
      <el-table-column label="安全库存" align="center" prop="safetyStock" />
      <el-table-column label="最大库存" align="center" prop="maxStock" />
      <el-table-column label="库存状态" align="center" prop="stockStatus">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.stockStatus)">
            {{ getStatusLabel(scope.row.stockStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="库位" align="center" prop="locationCode" />
      <el-table-column label="最后更新时间" align="center" prop="updateTime" width="160" />
      <el-table-column label="操作" align="center" width="120">
        <template #default="scope">
          <el-button link type="primary" @click="handleDetail(scope.row.id)">
            库存明细
          </el-button>
          <el-button link type="warning" @click="handleAdjust(scope.row.id)">
            调整
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

  <!-- 库存统计卡片 -->
  <ContentWrap>
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>总库存数</span>
            </div>
          </template>
          <div class="card-body">
            <h2>{{ statistics.totalCount || 0 }}</h2>
            <p>物料种类数量</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="warning-card">
          <template #header>
            <div class="card-header">
              <span>超储预警</span>
            </div>
          </template>
          <div class="card-body">
            <h2>{{ statistics.overStockCount || 0 }}</h2>
            <p>超过最大库存数量</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="danger-card">
          <template #header>
            <div class="card-header">
              <span>库存不足</span>
            </div>
          </template>
          <div class="card-body">
            <h2>{{ statistics.underStockCount || 0 }}</h2>
            <p>低于安全库存数量</p>
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
            <p>超过积压时间阈值</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </ContentWrap>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import type { TagProps } from 'element-plus'

defineOptions({ name: 'InventoryMonitor' })

const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数据

const statistics = reactive({
  totalCount: 0,
  overStockCount: 0,
  underStockCount: 0,
  overdueCount: 0
})

const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  materialCode: '',
  materialName: '',
  stockStatus: undefined,
  locationCode: ''
})

/** 获取状态标签类型 */
const getStatusType = (status: string): TagProps['type'] => {
  switch (status) {
    case 'NORMAL': return 'success'
    case 'OVER_STOCK': return 'warning'
    case 'UNDER_STOCK': return 'danger'
    case 'OVERDUE': return 'info'
    default: return 'info'
  }
}

/** 获取状态标签文本 */
const getStatusLabel = (status: string) => {
  switch (status) {
    case 'NORMAL': return '正常'
    case 'OVER_STOCK': return '超储'
    case 'UNDER_STOCK': return '不足'
    case 'OVERDUE': return '积压'
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
  queryParams.stockStatus = undefined
  queryParams.locationCode = ''
  handleQuery()
}

/** 导出操作 */
const handleExport = async () => {
  console.log('Exporting inventory data')
  // TODO: 实现导出逻辑
}

/** 查看库存明细 */
const handleDetail = async (id: number) => {
  console.log('Viewing inventory detail:', id)
  // TODO: 实现查看明细逻辑
}

/** 库存调整 */
const handleAdjust = async (id: number) => {
  console.log('Adjusting inventory:', id)
  // TODO: 实现库存调整逻辑
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

.danger-card :deep(.el-card__header) {
  background-color: #fef0f0;
}

.info-card :deep(.el-card__header) {
  background-color: #f4f4f5;
}
</style> 