<!-- ERP 货位列表 -->
<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="所属仓库" prop="warehouseId">
        <el-select
          v-model="queryParams.warehouseId"
          placeholder="请选择所属仓库"
          clearable
          class="!w-240px"
          @change="handleWarehouseChange"
        >
          <el-option
            v-for="item in warehouseList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="所属货架" prop="rackId">
        <el-select
          v-model="queryParams.rackId"
          placeholder="请选择所属货架"
          clearable
          class="!w-240px"
          :disabled="!queryParams.warehouseId"
        >
          <el-option
            v-for="item in rackList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="货位编码" prop="code">
        <el-input
          v-model="queryParams.code"
          placeholder="请输入货位编码"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="货位名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入货位名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="货位状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择货位状态"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['erp:location:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['erp:location:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="货位编号" align="center" prop="id" />
      <el-table-column label="所属仓库" align="center" prop="warehouseName" />
      <el-table-column label="所属货架" align="center" prop="rackName" />
      <el-table-column label="货位编码" align="center" prop="code" />
      <el-table-column label="货位名称" align="center" prop="name" />
      <el-table-column label="容量" align="center">
        <template #default="{ row }">
          {{ row.capacity }} {{ row.unitName }}
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="排序" align="center" prop="sort" />
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['erp:location:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['erp:location:delete']"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <WarehouseLocationForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { WarehouseApi } from '@/api/erp/stock/warehouse'
import { WarehouseRackApi } from '@/api/erp/stock/warehouse/rack'
import { WarehouseLocationApi, WarehouseLocationVO } from '@/api/erp/stock/warehouse/location'
import WarehouseLocationForm from './WarehouseLocationForm.vue'

/** ERP 货位列表 */
defineOptions({ name: 'ErpWarehouseLocation' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<WarehouseLocationVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  warehouseId: undefined,
  rackId: undefined,
  code: undefined,
  name: undefined,
  status: undefined
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中
const warehouseList = ref([]) // 仓库列表
const rackList = ref([]) // 货架列表

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await WarehouseLocationApi.getWarehouseLocationPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
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
  queryFormRef.value.resetFields()
  rackList.value = [] // 清空货架列表
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await WarehouseLocationApi.deleteWarehouseLocation(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await WarehouseLocationApi.exportWarehouseLocation(queryParams)
    download.excel(data, '货位.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 处理仓库变更 */
const handleWarehouseChange = async (warehouseId) => {
  queryParams.rackId = undefined
  if (warehouseId) {
    await loadRackList(warehouseId)
  } else {
    rackList.value = []
  }
}

/** 加载仓库列表 */
const loadWarehouseList = async () => {
  try {
    warehouseList.value = await WarehouseApi.getWarehouseSimpleList()
  } catch (error) {
    console.error('加载仓库列表失败:', error)
  }
}

/** 加载货架列表 */
const loadRackList = async (warehouseId) => {
  try {
    rackList.value = await WarehouseRackApi.getWarehouseRackSimpleList(warehouseId)
  } catch (error) {
    console.error('加载货架列表失败:', error)
    rackList.value = []
  }
}

/** 初始化 **/
onMounted(async () => {
  await loadWarehouseList()
  getList()
})
</script> 