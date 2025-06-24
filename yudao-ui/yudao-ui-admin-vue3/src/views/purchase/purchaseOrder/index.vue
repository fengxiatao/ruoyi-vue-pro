<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      ref="queryFormRef"
      :inline="true"
      :model="queryParams"
      class="-mb-15px"
    >
      <el-form-item label="订单编号" prop="orderNo">
        <el-input
          v-model="queryParams.orderNo"
          placeholder="请输入订单编号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="供应商" prop="supplierId">
        <el-select v-model="queryParams.supplierId" placeholder="请选择供应商" clearable>
          <el-option
            v-for="item in supplierOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="订单状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择订单状态" clearable>
          <el-option label="待审核" value="PENDING" />
          <el-option label="已审核" value="APPROVED" />
          <el-option label="已驳回" value="REJECTED" />
          <el-option label="已完成" value="COMPLETED" />
          <el-option label="已取消" value="CANCELLED" />
        </el-select>
      </el-form-item>
      <el-form-item label="订单日期" prop="orderDate">
        <el-date-picker
          v-model="queryParams.orderDate"
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
      <el-table-column label="订单编号" align="center" prop="orderNo" />
      <el-table-column label="供应商" align="center" prop="supplierName" />
      <el-table-column label="订单状态" align="center" prop="status">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusLabel(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="订单金额" align="center" prop="totalAmount">
        <template #default="scope">
          ¥{{ scope.row.totalAmount }}
        </template>
      </el-table-column>
      <el-table-column label="订单日期" align="center" prop="orderDate" />
      <el-table-column label="预计到货日期" align="center" prop="expectedDate" />
      <el-table-column label="创建时间" align="center" prop="createTime" />
      <el-table-column label="操作" align="center" width="200">
        <template #default="scope">
          <el-button link type="primary" @click="openForm('update', scope.row.id)">
            编辑
          </el-button>
          <el-button link type="success" @click="handleApprove(scope.row.id)" v-if="scope.row.status === 'PENDING'">
            审核
          </el-button>
          <el-button link type="danger" @click="handleDelete(scope.row.id)" v-if="scope.row.status === 'PENDING'">
            删除
          </el-button>
          <el-button link type="warning" @click="handleCancel(scope.row.id)" v-if="['PENDING', 'APPROVED'].includes(scope.row.status)">
            取消
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

defineOptions({ name: 'PurchaseOrder' })

const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数据
const supplierOptions = ref([]) // 供应商选项列表

const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  orderNo: '',
  supplierId: undefined,
  status: undefined,
  orderDate: []
})

/** 获取状态标签类型 */
const getStatusType = (status: string): TagProps['type'] => {
  switch (status) {
    case 'PENDING': return 'warning'
    case 'APPROVED': return 'success'
    case 'REJECTED': return 'danger'
    case 'COMPLETED': return 'success'
    case 'CANCELLED': return 'info'
    default: return 'info'
  }
}

/** 获取状态标签文本 */
const getStatusLabel = (status: string) => {
  switch (status) {
    case 'PENDING': return '待审核'
    case 'APPROVED': return '已审核'
    case 'REJECTED': return '已驳回'
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

/** 获取供应商列表 */
const getSupplierList = async () => {
  try {
    // TODO: 调用接口获取供应商列表数据
  } catch (error) {
    console.error('获取供应商列表失败:', error)
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryParams.orderNo = ''
  queryParams.supplierId = undefined
  queryParams.status = undefined
  queryParams.orderDate = []
  handleQuery()
}

/** 打开表单 */
const openForm = async (type: 'create' | 'update', id?: number) => {
  console.log('Opening form:', type, id)
  // TODO: 实现表单打开逻辑
}

/** 审核操作 */
const handleApprove = async (id: number) => {
  console.log('Approving order:', id)
  // TODO: 实现审核逻辑
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  console.log('Deleting order:', id)
  // TODO: 实现删除逻辑
}

/** 取消订单操作 */
const handleCancel = async (id: number) => {
  console.log('Cancelling order:', id)
  // TODO: 实现取消订单逻辑
}

/** 初始化 */
onMounted(() => {
  getSupplierList()
  getList()
})
</script> 