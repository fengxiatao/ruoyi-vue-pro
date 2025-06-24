<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      ref="queryFormRef"
      :inline="true"
      :model="queryParams"
      class="-mb-15px"
    >
      <el-form-item label="库位编码" prop="locationCode">
        <el-input
          v-model="queryParams.locationCode"
          placeholder="请输入库位编码"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="库位类型" prop="locationType">
        <el-select v-model="queryParams.locationType" placeholder="请选择库位类型" clearable>
          <el-option label="普通货架" value="NORMAL" />
          <el-option label="重型货架" value="HEAVY" />
          <el-option label="冷藏区" value="COLD" />
          <el-option label="危险品区" value="DANGEROUS" />
        </el-select>
      </el-form-item>
      <el-form-item label="使用状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择使用状态" clearable>
          <el-option label="空闲" value="FREE" />
          <el-option label="占用" value="OCCUPIED" />
          <el-option label="锁定" value="LOCKED" />
          <el-option label="禁用" value="DISABLED" />
        </el-select>
      </el-form-item>
      <el-form-item label="区域" prop="area">
        <el-input
          v-model="queryParams.area"
          placeholder="请输入区域"
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
        <el-button type="primary" @click="openForm('create')">
          <Icon icon="ep:plus" class="mr-5px" /> 新增库位
        </el-button>
        <el-button type="success" @click="handleBatchImport">
          <Icon icon="ep:upload" class="mr-5px" /> 批量导入
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="库位编码" align="center" prop="locationCode" />
      <el-table-column label="库位类型" align="center" prop="locationType">
        <template #default="scope">
          {{ getTypeLabel(scope.row.locationType) }}
        </template>
      </el-table-column>
      <el-table-column label="使用状态" align="center" prop="status">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusLabel(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="区域" align="center" prop="area" />
      <el-table-column label="货架号" align="center" prop="shelfNo" />
      <el-table-column label="层数" align="center" prop="level" />
      <el-table-column label="位置" align="center" prop="position" />
      <el-table-column label="最大承重(kg)" align="center" prop="maxWeight" />
      <el-table-column label="当前物料" align="center" prop="currentMaterial" show-overflow-tooltip />
      <el-table-column label="操作" align="center" width="200">
        <template #default="scope">
          <el-button link type="primary" @click="openForm('update', scope.row.id)">
            编辑
          </el-button>
          <el-button link type="success" @click="handleLock(scope.row.id)" v-if="scope.row.status === 'FREE'">
            锁定
          </el-button>
          <el-button link type="warning" @click="handleUnlock(scope.row.id)" v-if="scope.row.status === 'LOCKED'">
            解锁
          </el-button>
          <el-button link type="danger" @click="handleDisable(scope.row.id)" v-if="!['DISABLED'].includes(scope.row.status)">
            禁用
          </el-button>
          <el-button link type="success" @click="handleEnable(scope.row.id)" v-if="scope.row.status === 'DISABLED'">
            启用
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

  <!-- 库位统计卡片 -->
  <ContentWrap>
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>总库位数</span>
            </div>
          </template>
          <div class="card-body">
            <h2>{{ statistics.totalCount || 0 }}</h2>
            <p>所有库位数量</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="success-card">
          <template #header>
            <div class="card-header">
              <span>空闲库位</span>
            </div>
          </template>
          <div class="card-body">
            <h2>{{ statistics.freeCount || 0 }}</h2>
            <p>可用库位数量</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="warning-card">
          <template #header>
            <div class="card-header">
              <span>占用库位</span>
            </div>
          </template>
          <div class="card-body">
            <h2>{{ statistics.occupiedCount || 0 }}</h2>
            <p>已使用库位数量</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="danger-card">
          <template #header>
            <div class="card-header">
              <span>异常库位</span>
            </div>
          </template>
          <div class="card-body">
            <h2>{{ statistics.abnormalCount || 0 }}</h2>
            <p>锁定或禁用库位</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </ContentWrap>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import type { TagProps } from 'element-plus'

defineOptions({ name: 'LocationPlan' })

const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数据

const statistics = reactive({
  totalCount: 0,
  freeCount: 0,
  occupiedCount: 0,
  abnormalCount: 0
})

const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  locationCode: '',
  locationType: undefined,
  status: undefined,
  area: ''
})

/** 获取库位类型标签文本 */
const getTypeLabel = (type: string) => {
  switch (type) {
    case 'NORMAL': return '普通货架'
    case 'HEAVY': return '重型货架'
    case 'COLD': return '冷藏区'
    case 'DANGEROUS': return '危险品区'
    default: return ''
  }
}

/** 获取状态标签类型 */
const getStatusType = (status: string): TagProps['type'] => {
  switch (status) {
    case 'FREE': return 'success'
    case 'OCCUPIED': return 'warning'
    case 'LOCKED': return 'info'
    case 'DISABLED': return 'danger'
    default: return 'info'
  }
}

/** 获取状态标签文本 */
const getStatusLabel = (status: string) => {
  switch (status) {
    case 'FREE': return '空闲'
    case 'OCCUPIED': return '占用'
    case 'LOCKED': return '锁定'
    case 'DISABLED': return '禁用'
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
  queryParams.locationCode = ''
  queryParams.locationType = undefined
  queryParams.status = undefined
  queryParams.area = ''
  handleQuery()
}

/** 打开表单 */
const openForm = async (type: 'create' | 'update', id?: number) => {
  console.log('Opening form:', type, id)
  // TODO: 实现表单打开逻辑
}

/** 批量导入 */
const handleBatchImport = async () => {
  console.log('Importing locations')
  // TODO: 实现批量导入逻辑
}

/** 锁定库位 */
const handleLock = async (id: number) => {
  console.log('Locking location:', id)
  // TODO: 实现锁定逻辑
}

/** 解锁库位 */
const handleUnlock = async (id: number) => {
  console.log('Unlocking location:', id)
  // TODO: 实现解锁逻辑
}

/** 禁用库位 */
const handleDisable = async (id: number) => {
  console.log('Disabling location:', id)
  // TODO: 实现禁用逻辑
}

/** 启用库位 */
const handleEnable = async (id: number) => {
  console.log('Enabling location:', id)
  // TODO: 实现启用逻辑
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
</style> 