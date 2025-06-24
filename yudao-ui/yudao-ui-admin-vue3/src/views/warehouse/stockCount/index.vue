<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      ref="queryFormRef"
      :inline="true"
      :model="queryParams"
      class="-mb-15px"
    >
      <el-form-item label="盘点单号" prop="countNo">
        <el-input
          v-model="queryParams.countNo"
          placeholder="请输入盘点单号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="盘点类型" prop="countType">
        <el-select v-model="queryParams.countType" placeholder="请选择盘点类型" clearable>
          <el-option label="全面盘点" value="FULL" />
          <el-option label="动态盘点" value="DYNAMIC" />
          <el-option label="抽样盘点" value="SAMPLE" />
        </el-select>
      </el-form-item>
      <el-form-item label="盘点状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择盘点状态" clearable>
          <el-option label="待执行" value="PENDING" />
          <el-option label="进行中" value="IN_PROGRESS" />
          <el-option label="已完成" value="COMPLETED" />
          <el-option label="已取消" value="CANCELLED" />
        </el-select>
      </el-form-item>
      <el-form-item label="盘点日期" prop="countDate">
        <el-date-picker
          v-model="queryParams.countDate"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
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
          <Icon icon="ep:plus" class="mr-5px" /> 新增盘点
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list">
      <el-table-column label="盘点单号" align="center" prop="countNo" />
      <el-table-column label="盘点类型" align="center" prop="countType">
        <template #default="scope">
          {{ getTypeLabel(scope.row.countType) }}
        </template>
      </el-table-column>
      <el-table-column label="盘点状态" align="center" prop="status">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusLabel(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="盘点范围" align="center" prop="countScope" show-overflow-tooltip />
      <el-table-column label="盘点人员" align="center" prop="countUser" />
      <el-table-column label="开始日期" align="center" prop="startDate" />
      <el-table-column label="结束日期" align="center" prop="endDate" />
      <el-table-column label="差异数量" align="center" prop="diffCount">
        <template #default="scope">
          <el-tag :type="scope.row.diffCount > 0 ? 'danger' : 'success'">
            {{ scope.row.diffCount }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="160" />
      <el-table-column label="操作" align="center" width="200">
        <template #default="scope">
          <el-button link type="primary" @click="openForm('update', scope.row.id)" v-if="scope.row.status === 'PENDING'">
            编辑
          </el-button>
          <el-button link type="success" @click="handleStart(scope.row.id)" v-if="scope.row.status === 'PENDING'">
            开始盘点
          </el-button>
          <el-button link type="warning" @click="handleComplete(scope.row.id)" v-if="scope.row.status === 'IN_PROGRESS'">
            完成盘点
          </el-button>
          <el-button link type="danger" @click="handleCancel(scope.row.id)" v-if="['PENDING', 'IN_PROGRESS'].includes(scope.row.status)">
            取消
          </el-button>
          <el-button link type="primary" @click="handleDetail(scope.row.id)" v-if="scope.row.status === 'COMPLETED'">
            差异明细
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

  <!-- 盘点统计卡片 -->
  <ContentWrap>
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>待盘点</span>
            </div>
          </template>
          <div class="card-body">
            <h2>{{ statistics.pendingCount || 0 }}</h2>
            <p>待执行盘点任务</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="warning-card">
          <template #header>
            <div class="card-header">
              <span>进行中</span>
            </div>
          </template>
          <div class="card-body">
            <h2>{{ statistics.inProgressCount || 0 }}</h2>
            <p>正在执行的盘点</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="success-card">
          <template #header>
            <div class="card-header">
              <span>已完成</span>
            </div>
          </template>
          <div class="card-body">
            <h2>{{ statistics.completedCount || 0 }}</h2>
            <p>本月完成盘点</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="danger-card">
          <template #header>
            <div class="card-header">
              <span>差异数</span>
            </div>
          </template>
          <div class="card-body">
            <h2>{{ statistics.diffCount || 0 }}</h2>
            <p>本月盘点差异</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </ContentWrap>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import type { TagProps } from 'element-plus'

defineOptions({ name: 'StockCount' })

const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数据

const statistics = reactive({
  pendingCount: 0,
  inProgressCount: 0,
  completedCount: 0,
  diffCount: 0
})

const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  countNo: '',
  countType: undefined,
  status: undefined,
  countDate: []
})

/** 获取盘点类型标签文本 */
const getTypeLabel = (type: string) => {
  switch (type) {
    case 'FULL': return '全面盘点'
    case 'DYNAMIC': return '动态盘点'
    case 'SAMPLE': return '抽样盘点'
    default: return ''
  }
}

/** 获取状态标签类型 */
const getStatusType = (status: string): TagProps['type'] => {
  switch (status) {
    case 'PENDING': return 'info'
    case 'IN_PROGRESS': return 'warning'
    case 'COMPLETED': return 'success'
    case 'CANCELLED': return 'danger'
    default: return 'info'
  }
}

/** 获取状态标签文本 */
const getStatusLabel = (status: string) => {
  switch (status) {
    case 'PENDING': return '待执行'
    case 'IN_PROGRESS': return '进行中'
    case 'COMPLETED': return '已完成'
    case 'CANCELLED': return '已取消'
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
  queryParams.countNo = ''
  queryParams.countType = undefined
  queryParams.status = undefined
  queryParams.countDate = []
  handleQuery()
}

/** 打开表单 */
const openForm = async (type: 'create' | 'update', id?: number) => {
  console.log('Opening form:', type, id)
  // TODO: 实现表单打开逻辑
}

/** 开始盘点 */
const handleStart = async (id: number) => {
  console.log('Starting stock count:', id)
  // TODO: 实现开始盘点逻辑
}

/** 完成盘点 */
const handleComplete = async (id: number) => {
  console.log('Completing stock count:', id)
  // TODO: 实现完成盘点逻辑
}

/** 取消盘点 */
const handleCancel = async (id: number) => {
  console.log('Cancelling stock count:', id)
  // TODO: 实现取消盘点逻辑
}

/** 查看差异明细 */
const handleDetail = async (id: number) => {
  console.log('Viewing difference details:', id)
  // TODO: 实现查看差异明细逻辑
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