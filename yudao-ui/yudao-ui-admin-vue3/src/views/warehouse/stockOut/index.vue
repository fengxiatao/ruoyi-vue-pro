<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      ref="queryFormRef"
      :inline="true"
      :model="queryParams"
      class="-mb-15px"
    >
      <el-form-item label="出库单号" prop="stockInNo">
        <el-input
          v-model="queryParams.stockInNo"
          placeholder="请输入出库单号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="出库类型" prop="stockInType">
        <el-select v-model="queryParams.stockInType" placeholder="请选择出库类型" clearable>
          <el-option label="采购出库" value="PURCHASE" />
          <el-option label="生产出库" value="PRODUCTION" />
          <el-option label="退货出库" value="RETURN" />
          <el-option label="其他出库" value="OTHER" />
        </el-select>
      </el-form-item>
      <el-form-item label="出库状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择出库状态" clearable>
          <el-option label="待审核" value="PENDING" />
          <el-option label="已审核" value="APPROVED" />
          <el-option label="已驳回" value="REJECTED" />
          <el-option label="已完成" value="COMPLETED" />
        </el-select>
      </el-form-item>
      <el-form-item label="出库日期" prop="stockInDate">
        <el-date-picker
          v-model="queryParams.stockInDate"
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
          <Icon icon="ep:plus" class="mr-5px" /> 新增出库
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list">
      <el-table-column label="出库单号" align="center" prop="stockInNo" />
      <el-table-column label="出库类型" align="center" prop="stockInType">
        <template #default="scope">
          {{ getTypeLabel(scope.row.stockInType) }}
        </template>
      </el-table-column>
      <el-table-column label="出库状态" align="center" prop="status">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusLabel(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="关联单号" align="center" prop="relatedNo" />
      <el-table-column label="出库日期" align="center" prop="stockInDate" />
      <el-table-column label="出库金额" align="center" prop="totalAmount">
        <template #default="scope">
          ¥{{ scope.row.totalAmount }}
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" show-overflow-tooltip />
      <el-table-column label="创建时间" align="center" prop="createTime" width="160" />
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
          <el-button link type="primary" @click="handlePrint(scope.row.id)" v-if="scope.row.status === 'COMPLETED'">
            打印
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

defineOptions({ name: 'StockIn' })

const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数据

const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  stockInNo: '',
  stockInType: undefined,
  status: undefined,
  stockInDate: []
})

/** 获取出库类型标签文本 */
const getTypeLabel = (type: string) => {
  switch (type) {
    case 'PURCHASE': return '采购出库'
    case 'PRODUCTION': return '生产出库'
    case 'RETURN': return '退货出库'
    case 'OTHER': return '其他出库'
    default: return ''
  }
}

/** 获取状态标签类型 */
const getStatusType = (status: string): TagProps['type'] => {
  switch (status) {
    case 'PENDING': return 'warning'
    case 'APPROVED': return 'success'
    case 'REJECTED': return 'danger'
    case 'COMPLETED': return 'success'
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
  queryParams.stockInNo = ''
  queryParams.stockInType = undefined
  queryParams.status = undefined
  queryParams.stockInDate = []
  handleQuery()
}

/** 打开表单 */
const openForm = async (type: 'create' | 'update', id?: number) => {
  console.log('Opening form:', type, id)
  // TODO: 实现表单打开逻辑
}

/** 审核操作 */
const handleApprove = async (id: number) => {
  console.log('Approving stock in:', id)
  // TODO: 实现审核逻辑
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  console.log('Deleting stock in:', id)
  // TODO: 实现删除逻辑
}

/** 打印操作 */
const handlePrint = async (id: number) => {
  console.log('Printing stock in:', id)
  // TODO: 实现打印逻辑
}

/** 初始化 */
onMounted(() => {
  getList()
})
</script> 