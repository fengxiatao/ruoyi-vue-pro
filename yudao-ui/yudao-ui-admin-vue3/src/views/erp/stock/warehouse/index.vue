<!-- ERP 仓库管理 -->
<template>
  <!-- <doc-alert title="【库存】产品库存、库存明细" url="https://doc.iocoder.cn/erp/stock/" /> -->

  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="仓库名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入仓库名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="仓库编码" prop="code">
        <el-input
          v-model="queryParams.code"
          placeholder="请输入仓库编码"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="仓库状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择仓库状态"
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
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增仓库
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-row :gutter="20">
      <!-- 仓库列表 -->
      <el-col :span="24">
        <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true" @row-click="handleRowClick">
          <el-table-column type="expand">
            <template #default="props">
              <el-tabs v-model="activeTab" @tab-click="handleTabClick(props.row)">
                <el-tab-pane label="货架管理" name="rack">
                  <div class="flex justify-between mb-2">
                    <div>
                      <el-button type="primary" size="small" @click="openRackForm('create', props.row.id)">
                        <Icon icon="ep:plus" /> 新增货架
                      </el-button>
                    </div>
                    <div>
                      <el-input
                        v-model="rackSearchText"
                        placeholder="搜索货架"
                        clearable
                        size="small"
                        class="w-200px"
                        @input="filterRacks"
                      >
                        <template #prefix>
                          <Icon icon="ep:search" />
                        </template>
                      </el-input>
                    </div>
                  </div>
                  <el-table :data="filteredRackList" size="small" border>
                    <el-table-column label="货架编号" prop="id" width="80" />
                    <el-table-column label="货架编码" prop="code" width="120" />
                    <el-table-column label="货架名称" prop="name" width="150" />
                    <el-table-column label="备注" prop="remark" />
                    <el-table-column label="排序" prop="sort" width="80" />
                    <el-table-column label="状态" align="center" prop="status" width="100">
                      <template #default="scope">
                        <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" width="200">
                      <template #default="scope">
                        <el-button link type="primary" @click.stop="openRackForm('update', props.row.id, scope.row.id)">
                          编辑
                        </el-button>
                        <el-button link type="primary" @click.stop="handleViewLocations(props.row.id, scope.row.id, scope.row.name)">
                          查看货位
                        </el-button>
                        <el-button link type="danger" @click.stop="handleDeleteRack(scope.row.id)">
                          删除
                        </el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </el-tab-pane>
                <el-tab-pane label="货位管理" name="location">
                  <div class="flex justify-between mb-2">
                    <div>
                      <el-button type="primary" size="small" @click="openLocationForm('create', props.row.id)">
                        <Icon icon="ep:plus" /> 新增货位
                      </el-button>
                    </div>
                    <div class="flex items-center">
                      <el-select
                        v-model="locationQueryParams.rackId"
                        placeholder="选择货架"
                        clearable
                        size="small"
                        class="w-150px mr-2"
                        @change="handleRackChange"
                      >
                        <el-option
                          v-for="item in rackList"
                          :key="item.id"
                          :label="item.name"
                          :value="item.id"
                        />
                      </el-select>
                      <el-input
                        v-model="locationSearchText"
                        placeholder="搜索货位"
                        clearable
                        size="small"
                        class="w-200px"
                        @input="filterLocations"
                      >
                        <template #prefix>
                          <Icon icon="ep:search" />
                        </template>
                      </el-input>
                    </div>
                  </div>
                  <el-table :data="filteredLocationList" size="small" border>
                    <el-table-column label="货位编号" prop="id" width="80" />
                    <el-table-column label="所属货架" prop="rackName" width="120" />
                    <el-table-column label="货位编码" prop="code" width="120" />
                    <el-table-column label="货位名称" prop="name" width="150" />
                    <el-table-column label="容量" width="120">
                      <template #default="{ row }">
                        {{ row.capacity }} {{ row.capacityUnit }}
                      </template>
                    </el-table-column>
                    <el-table-column label="备注" prop="remark" />
                    <el-table-column label="排序" prop="sort" width="80" />
                    <el-table-column label="状态" align="center" prop="status" width="100">
                      <template #default="scope">
                        <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" width="150">
                      <template #default="scope">
                        <el-button link type="primary" @click.stop="openLocationForm('update', props.row.id, scope.row.rackId, scope.row.id)">
                          编辑
                        </el-button>
                        <el-button link type="danger" @click.stop="handleDeleteLocation(scope.row.id)">
                          删除
                        </el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </el-tab-pane>
              </el-tabs>
            </template>
          </el-table-column>
          <el-table-column label="仓库编号" align="center" prop="id" />
          <el-table-column label="仓库编码" align="center" prop="code" />
          <el-table-column label="仓库名称" align="center" prop="name" />
          <el-table-column label="负责人" align="center" prop="managerName" />
          <el-table-column label="联系电话" align="center" prop="phone" />
          <el-table-column label="地址" align="center" prop="address" />
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
              >
                编辑
              </el-button>
              <el-button
                link
                type="danger"
                @click="handleDelete(scope.row.id)"
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
      </el-col>
    </el-row>
  </ContentWrap>

  <!-- 表单弹窗：添加/修改仓库 -->
  <WarehouseForm ref="formRef" @success="getList" />
  
  <!-- 表单弹窗：添加/修改货架 -->
  <WarehouseRackForm ref="rackFormRef" @success="loadRackList" />
  
  <!-- 表单弹窗：添加/修改货位 -->
  <WarehouseLocationForm ref="locationFormRef" @success="loadLocationList" />
</template>

<script setup lang="ts">
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { WarehouseApi, WarehouseVO } from '@/api/erp/stock/warehouse'
import { WarehouseRackApi, WarehouseRackVO } from '@/api/erp/stock/warehouse/rack'
import { WarehouseLocationApi, WarehouseLocationVO } from '@/api/erp/stock/warehouse/location'
import WarehouseForm from './WarehouseForm.vue'
import WarehouseRackForm from '../rack/WarehouseRackForm.vue'
import WarehouseLocationForm from '../location/WarehouseLocationForm.vue'

/** ERP 仓库列表 */
defineOptions({ name: 'ErpWarehouse' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<WarehouseVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: undefined,
  code: undefined,
  status: undefined
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

// 货架和货位相关
const activeTab = ref('rack')
const currentWarehouseId = ref(0)
const rackList = ref<WarehouseRackVO[]>([])
const filteredRackList = ref<WarehouseRackVO[]>([])
const rackSearchText = ref('')
const locationList = ref<WarehouseLocationVO[]>([])
const filteredLocationList = ref<WarehouseLocationVO[]>([])
const locationSearchText = ref('')
const locationQueryParams = reactive({
  warehouseId: undefined,
  rackId: undefined
})

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await WarehouseApi.getWarehousePage(queryParams)
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
    await WarehouseApi.deleteWarehouse(id)
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
    const data = await WarehouseApi.exportWarehouse(queryParams)
    download.excel(data, '仓库.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 处理行点击 */
const handleRowClick = (row) => {
  currentWarehouseId.value = row.id
  locationQueryParams.warehouseId = row.id
  loadRackList()
  loadLocationList()
}

/** 处理标签页点击 */
const handleTabClick = (row) => {
  currentWarehouseId.value = row.id
  locationQueryParams.warehouseId = row.id
  if (activeTab.value === 'rack') {
    loadRackList()
  } else if (activeTab.value === 'location') {
    loadLocationList()
  }
}

/** 加载货架列表 */
const loadRackList = async () => {
  if (!currentWarehouseId.value) return
  try {
    rackList.value = await WarehouseRackApi.getWarehouseRackSimpleList(currentWarehouseId.value)
    filteredRackList.value = [...rackList.value]
  } catch (error) {
    console.error('加载货架列表失败:', error)
    rackList.value = []
    filteredRackList.value = []
  }
}

/** 过滤货架列表 */
const filterRacks = () => {
  if (!rackSearchText.value) {
    filteredRackList.value = [...rackList.value]
    return
  }
  
  filteredRackList.value = rackList.value.filter(rack => 
    rack.name.includes(rackSearchText.value) || 
    rack.code.includes(rackSearchText.value)
  )
}

/** 加载货位列表 */
const loadLocationList = async () => {
  if (!currentWarehouseId.value) return
  try {
    const params = {
      warehouseId: currentWarehouseId.value,
      rackId: locationQueryParams.rackId
    }
    const data = await WarehouseLocationApi.getWarehouseLocationPage(params)
    locationList.value = data.list
    filteredLocationList.value = [...locationList.value]
  } catch (error) {
    console.error('加载货位列表失败:', error)
    locationList.value = []
    filteredLocationList.value = []
  }
}

/** 过滤货位列表 */
const filterLocations = () => {
  if (!locationSearchText.value) {
    filteredLocationList.value = [...locationList.value]
    return
  }
  
  filteredLocationList.value = locationList.value.filter(location => 
    location.name.includes(locationSearchText.value) || 
    location.code.includes(locationSearchText.value)
  )
}

/** 处理货架变更 */
const handleRackChange = () => {
  loadLocationList()
}

/** 查看货位 */
const handleViewLocations = (warehouseId, rackId, rackName) => {
  activeTab.value = 'location'
  locationQueryParams.warehouseId = warehouseId
  locationQueryParams.rackId = rackId
  message.success(`正在查看 ${rackName} 的货位`)
  loadLocationList()
}

/** 添加/修改货架操作 */
const rackFormRef = ref()
const openRackForm = (type: string, warehouseId: number, rackId?: number) => {
  rackFormRef.value.open(type, rackId, warehouseId)
}

/** 删除货架按钮操作 */
const handleDeleteRack = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await WarehouseRackApi.deleteWarehouseRack(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await loadRackList()
  } catch {}
}

/** 添加/修改货位操作 */
const locationFormRef = ref()
const openLocationForm = (type: string, warehouseId: number, rackId?: number, locationId?: number) => {
  locationFormRef.value.open(type, locationId, warehouseId, rackId)
}

/** 删除货位按钮操作 */
const handleDeleteLocation = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await WarehouseLocationApi.deleteWarehouseLocation(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await loadLocationList()
  } catch {}
}

/** 初始化 **/
onMounted(() => {
  getList()
})
</script>
