<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      ref="queryFormRef"
      :inline="true"
      :model="queryParams"
      class="-mb-15px"
    >
      <el-form-item label="计划编号" prop="planNo">
        <el-input
          v-model="queryParams.planNo"
          placeholder="请输入计划编号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="计划状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择计划状态" clearable>
          <el-option label="草稿" value="DRAFT" />
          <el-option label="待审核" value="PENDING" />
          <el-option label="已审核" value="APPROVED" />
          <el-option label="已驳回" value="REJECTED" />
        </el-select>
      </el-form-item>
      <el-form-item label="计划日期" prop="planDate">
        <el-date-picker
          v-model="queryParams.planDate"
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
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list">
      <el-table-column label="计划编号" align="center" prop="planNo" />
      <el-table-column label="计划名称" align="center" prop="planName" />
      <el-table-column label="计划状态" align="center" prop="status">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusLabel(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="计划开始日期" align="center" prop="startDate" />
      <el-table-column label="计划结束日期" align="center" prop="endDate" />
      <el-table-column label="预算金额" align="center" prop="budget">
        <template #default="scope">
          ¥{{ scope.row.budget }}
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" />
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button link type="primary" @click="openForm('update', scope.row.id)">
            编辑
          </el-button>
          <el-button link type="success" @click="handleApprove(scope.row.id)" v-if="scope.row.status === 'PENDING'">
            审核
          </el-button>
          <el-button link type="danger" @click="handleDelete(scope.row.id)" v-if="scope.row.status === 'DRAFT'">
            删除
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
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import type { TagProps } from 'element-plus'

defineOptions({ name: 'PurchasePlan' })

const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数据
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  planNo: '',
  status: undefined,
  planDate: []
})

/** 获取状态标签类型 */
const getStatusType = (status: string): TagProps['type'] => {
  switch (status) {
    case 'DRAFT': return 'info'
    case 'PENDING': return 'warning'
    case 'APPROVED': return 'success'
    case 'REJECTED': return 'danger'
    default: return 'info'
  }
}

/** 获取状态标签文本 */
const getStatusLabel = (status: string) => {
  switch (status) {
    case 'DRAFT': return '草稿'
    case 'PENDING': return '待审核'
    case 'APPROVED': return '已审核'
    case 'REJECTED': return '已驳回'
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

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryParams.planNo = ''
  queryParams.status = undefined
  queryParams.planDate = []
  handleQuery()
}

/** 打开表单 */
const openForm = async (type: 'create' | 'update', id?: number) => {
  console.log('Opening form:', type, id)
  // TODO: 实现表单打开逻辑
}

/** 审核操作 */
const handleApprove = async (id: number) => {
  console.log('Approving plan:', id)
  // TODO: 实现审核逻辑
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  console.log('Deleting plan:', id)
  // TODO: 实现删除逻辑
}

/** 初始化 */
onMounted(() => {
  getList()
})
</script> 