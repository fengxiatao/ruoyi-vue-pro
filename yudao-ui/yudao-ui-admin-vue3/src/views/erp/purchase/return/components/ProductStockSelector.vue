<!-- 从库存中选择商品 -->
<template>
  <Dialog
    title="从库存中选择商品"
    v-model="dialogVisible"
    :appendToBody="true"
    :scroll="true"
    width="1080"
  >
    <ContentWrap>
      <!-- 分类Tabs -->
      <el-tabs v-model="activeTab" @tab-click="handleTabChange">
        <el-tab-pane label="全部商品" name="all"/>
        <el-tab-pane label="低周转商品" name="lowTurnover"/>
        <el-tab-pane label="坏品" name="defective"/>
        <el-tab-pane label="即将过期" name="expiringSoon"/>
        <el-tab-pane label="客户退回商品" name="customerReturned"/>
      </el-tabs>
      
      <!-- 搜索工作栏 -->
      <el-form
        class="-mb-15px"
        :model="queryParams"
        ref="queryFormRef"
        :inline="true"
        label-width="68px"
      >
        <el-form-item label="商品名称" prop="name">
          <el-input
            v-model="queryParams.name"
            placeholder="请输入商品名称或编号"
            clearable
            @keyup.enter="handleQuery"
            class="!w-240px"
          />
        </el-form-item>
        <el-form-item label="供应商" prop="supplierId">
          <el-select
            v-model="queryParams.supplierId"
            clearable
            filterable
            placeholder="请选择供应商"
            class="!w-160px"
          >
            <el-option
              v-for="item in supplierList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="仓库" prop="warehouseId">
          <el-select
            v-model="queryParams.warehouseId"
            clearable
            filterable
            placeholder="请选择仓库"
            class="!w-160px"
          >
            <el-option
              v-for="item in warehouseList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
          <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        </el-form-item>
      </el-form>
    </ContentWrap>

    <ContentWrap>
      <el-table
        v-loading="loading"
        :data="list"
        :show-overflow-tooltip="true"
        :stripe="true"
        @selection-change="handleSelectionChange"
      >
        <el-table-column width="30" label="选择" type="selection" />
        <el-table-column min-width="80" label="SKU编号" align="center" prop="skuId" />
        <el-table-column min-width="180" label="商品名称" align="center" prop="name">
          <template #default="{ row }">
            {{ row.name }}
            <div class="mt-5px">
              <el-tag size="small" type="danger" v-if="row.isDefective">坏品</el-tag>
              <el-tag size="small" type="warning" v-if="row.isExpiringSoon">即将过期</el-tag>
              <el-tag size="small" type="info" v-if="row.isCustomerReturned">客户退回</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="商品条码" align="center" prop="barCode" />
        <el-table-column label="规格型号" align="center" prop="spec" />
        <el-table-column label="单位" align="center" prop="unitName" />
        <el-table-column label="供应商" align="center" prop="supplierName" min-width="120" />
        <el-table-column label="仓库" align="center" prop="warehouseName" />
        <el-table-column label="库存数量" align="center" prop="stockCount" />
        <el-table-column label="周转率" align="center" prop="turnoverRate" min-width="100">
          <template #default="{ row }">
            <span :class="getTurnoverRateClass(row.turnoverRate)">
              {{ formatTurnoverRate(row.turnoverRate) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="最后销售" align="center" prop="lastSaleTime" min-width="100">
          <template #default="{ row }">
            {{ formatDate(row.lastSaleTime) }}
          </template>
        </el-table-column>
        <el-table-column label="采购价" align="center" prop="purchasePrice" :formatter="erpPriceTableColumnFormatter" />
        <el-table-column label="退货数量" align="center" width="150">
          <template #default="{ row }">
            <el-input-number
              v-model="row.returnCount"
              :min="0"
              :max="row.stockCount"
              :precision="3"
              controls-position="right"
              size="small"
              @change="validateReturnCount(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="100" fixed="right">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              link 
              size="small" 
              @click="toggleSelection(row)"
              :disabled="!row.returnCount || row.returnCount <= 0"
            >
              {{ isSelected(row) ? '取消选择' : '选择' }}
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
      
      <!-- 已选商品统计 -->
      <div class="flex justify-between items-center mt-10px">
        <div>
          <span class="font-bold">已选商品：</span>
          <span>{{ selectedItems.length }}种</span>
          <span class="ml-10px">总数量：{{ getTotalSelectedCount() }}</span>
          <span class="ml-10px">总金额：{{ formatPrice(getTotalSelectedAmount()) }}</span>
        </div>
        <el-button type="danger" size="small" @click="clearSelection" :disabled="selectedItems.length === 0">
          清空选择
        </el-button>
      </div>
    </ContentWrap>
    <template #footer>
      <el-button :disabled="selectedItems.length === 0" type="primary" @click="submitForm">
        提交退货申请
      </el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { dateFormatter2 } from '@/utils/formatTime'
import { erpPriceInputFormatter, erpPriceTableColumnFormatter } from '@/utils'
import { ProductApi } from '@/api/erp/product/product'
import { StockApi } from '@/api/erp/stock/stock'
import { WarehouseApi, WarehouseVO } from '@/api/erp/stock/warehouse'
import { SupplierApi, SupplierVO } from '@/api/erp/purchase/supplier'
import { useMessage } from '@/hooks/web/useMessage'

defineOptions({ name: 'ProductStockSelector' })

const message = useMessage() // 消息弹窗
const list = ref([]) // 列表的数据
const total = ref(0) // 列表的总页数
const loading = ref(false) // 列表的加载中
const dialogVisible = ref(false) // 弹窗的是否展示
const activeTab = ref('all') // 当前选中的Tab
const selectedItems = ref([]) // 已选中的商品

const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: undefined,
  supplierId: undefined,
  warehouseId: undefined,
  type: 'all' // 商品类型筛选
})
const queryFormRef = ref() // 搜索的表单
const warehouseList = ref<WarehouseVO[]>([]) // 仓库列表
const supplierList = ref<SupplierVO[]>([]) // 供应商列表

// 周转率阈值
const TURNOVER_RATE_THRESHOLD = 0.1 // 低于此值视为低周转

/** 选中操作 */
const selectionList = ref([])
const handleSelectionChange = (rows) => {
  selectionList.value = rows
}

/** 切换选择状态 */
const toggleSelection = (row) => {
  if (!row.returnCount || row.returnCount <= 0) {
    message.warning('请先设置退货数量')
    return
  }
  
  const index = selectedItems.value.findIndex(item => item.productId === row.productId && item.warehouseId === row.warehouseId)
  if (index >= 0) {
    // 如果已选中，则取消选择
    selectedItems.value.splice(index, 1)
  } else {
    // 否则添加到已选列表
    selectedItems.value.push({
      ...row,
      returnCount: row.returnCount
    })
  }
}

/** 判断是否已选中 */
const isSelected = (row) => {
  return selectedItems.value.some(item => item.productId === row.productId && item.warehouseId === row.warehouseId)
}

/** 清空选择 */
const clearSelection = () => {
  selectedItems.value = []
}

/** 获取已选商品总数量 */
const getTotalSelectedCount = () => {
  return selectedItems.value.reduce((sum, item) => sum + Number(item.returnCount || 0), 0).toFixed(3)
}

/** 获取已选商品总金额 */
const getTotalSelectedAmount = () => {
  return selectedItems.value.reduce((sum, item) => sum + Number(item.returnCount || 0) * Number(item.purchasePrice || 0), 0)
}

/** 格式化价格 */
const formatPrice = (price) => {
  return erpPriceInputFormatter(price)
}

/** 格式化日期 */
const formatDate = (date) => {
  if (!date) return '暂无记录'
  return dateFormatter2(date)
}

/** 格式化周转率 */
const formatTurnoverRate = (rate) => {
  if (rate === undefined || rate === null) return '暂无数据'
  return (rate * 100).toFixed(2) + '%'
}

/** 获取周转率样式 */
const getTurnoverRateClass = (rate) => {
  if (rate === undefined || rate === null) return ''
  if (rate < TURNOVER_RATE_THRESHOLD) return 'text-red-500 font-bold'
  return 'text-green-500'
}

/** 处理Tab切换 */
const handleTabChange = (tab) => {
  queryParams.type = tab.props.name
  queryParams.pageNo = 1
  getList()
}

/** 打开弹窗 */
const open = async () => {
  dialogVisible.value = true
  await nextTick() // 等待，避免 queryFormRef 为空
  // 加载列表
  await resetQuery()
  // 加载仓库列表
  warehouseList.value = await WarehouseApi.getWarehouseSimpleList()
  // 加载供应商列表
  supplierList.value = await SupplierApi.getSupplierSimpleList()
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交选择 */
const emits = defineEmits<{
  (e: 'success', value: any[]): void
}>()
const submitForm = () => {
  // 使用已选择的商品列表
  const validSelections = selectedItems.value
  
  if (validSelections.length === 0) {
    message.warning('请至少选择一个商品并设置退货数量')
    return
  }
  
  try {
    // 转换为退货项格式
    const returnItems = validSelections.map(item => ({
      productId: item.productId,
      productName: item.name,
      productBarCode: item.barCode,
      productUnitName: item.unitName,
      productSpec: item.spec,
      productPrice: item.purchasePrice,
      stockCount: item.stockCount,
      count: item.returnCount,
      batchNumber: item.batchNumber || '', // 批次号可以为空
      warehouseId: item.warehouseId,
      warehouseName: item.warehouseName,
      supplierId: item.supplierId,
      supplierName: item.supplierName,
      returnLocations: [],
      taxPercent: 0, // 默认税率为0，可以在表单中修改
      availableBatches: item.batchNumber ? [{ batchNumber: item.batchNumber, stockCount: item.stockCount, purchasePrice: item.purchasePrice }] : []
    }))
    
    emits('success', returnItems)
  } finally {
    // 关闭弹窗
    dialogVisible.value = false
  }
}

/** 验证退货数量 */
const validateReturnCount = (row) => {
  if (row.returnCount > row.stockCount) {
    message.warning('退货数量不能大于库存数量')
    row.returnCount = row.stockCount
  }
  
  // 如果设置了退货数量，自动更新已选列表
  if (row.returnCount > 0) {
    const index = selectedItems.value.findIndex(item => item.productId === row.productId && item.warehouseId === row.warehouseId)
    if (index >= 0) {
      // 更新已选中项的退货数量
      selectedItems.value[index].returnCount = row.returnCount
    }
  }
}

/** 加载列表  */
const getList = async () => {
  loading.value = true
  try {
    // 根据当前Tab设置查询参数
    switch (queryParams.type) {
      case 'lowTurnover':
        // 使用专门的低周转商品API
        const lowTurnoverData = await StockApi.getLowTurnoverProducts({
          pageNo: queryParams.pageNo,
          pageSize: queryParams.pageSize,
          productName: queryParams.name,
          supplierId: queryParams.supplierId,
          warehouseId: queryParams.warehouseId,
          turnoverRateThreshold: TURNOVER_RATE_THRESHOLD
        })
        list.value = lowTurnoverData.list.map(item => {
          // 查找是否在已选列表中
          const selectedItem = selectedItems.value.find(selected => 
            selected.productId === item.productId && selected.warehouseId === item.warehouseId
          )
          
          return {
            ...item,
            turnoverRate: item.turnoverRate || TURNOVER_RATE_THRESHOLD, // 使用返回的周转率或阈值作为默认值
            returnCount: selectedItem ? selectedItem.returnCount : 0 // 如果已选中，使用已选数量，否则为0
          }
        })
        total.value = lowTurnoverData.total
        break
      case 'defective':
        // 调用获取坏品库存商品列表的API
        const defectiveData = await StockApi.getProductStockGetDefective({
          pageNo: queryParams.pageNo,
          pageSize: queryParams.pageSize,
          name: queryParams.name,
          supplierId: queryParams.supplierId,
          warehouseId: queryParams.warehouseId
        })
        // 为每条记录添加returnCount字段
        list.value = defectiveData.list.map(item => {
          // 查找是否在已选列表中
          const selectedItem = selectedItems.value.find(selected => 
            selected.productId === item.productId && selected.warehouseId === item.warehouseId
          )
          
          return {
            ...item,
            isDefective: true, // 标记为坏品
            returnCount: selectedItem ? selectedItem.returnCount : 0 // 如果已选中，使用已选数量，否则为0
          }
        })
        total.value = defectiveData.total
        break
      case 'expiringSoon':
        // 调用获取即将过期库存商品列表的API
        const expiringData = await StockApi.getProductStockGetExpiring({
          pageNo: queryParams.pageNo,
          pageSize: queryParams.pageSize,
          name: queryParams.name,
          supplierId: queryParams.supplierId,
          warehouseId: queryParams.warehouseId
        })
        // 为每条记录添加returnCount字段
        list.value = expiringData.list.map(item => {
          // 查找是否在已选列表中
          const selectedItem = selectedItems.value.find(selected => 
            selected.productId === item.productId && selected.warehouseId === item.warehouseId
          )
          
          return {
            ...item,
            isExpiringSoon: true, // 标记为即将过期
            returnCount: selectedItem ? selectedItem.returnCount : 0 // 如果已选中，使用已选数量，否则为0
          }
        })
        total.value = expiringData.total
        break
      case 'customerReturned':
        // 调用获取客户退回库存商品列表的API
        const returnedData = await StockApi.getProductStockCustomerReturned({
          pageNo: queryParams.pageNo,
          pageSize: queryParams.pageSize,
          name: queryParams.name,
          supplierId: queryParams.supplierId,
          warehouseId: queryParams.warehouseId
        })
        // 为每条记录添加returnCount字段
        list.value = returnedData.list.map(item => {
          // 查找是否在已选列表中
          const selectedItem = selectedItems.value.find(selected => 
            selected.productId === item.productId && selected.warehouseId === item.warehouseId
          )
          
          return {
            ...item,
            isCustomerReturned: true, // 标记为客户退回
            returnCount: selectedItem ? selectedItem.returnCount : 0 // 如果已选中，使用已选数量，否则为0
          }
        })
        total.value = returnedData.total
        break
      default:
        // 调用获取库存商品列表的API
        const data = await StockApi.getProductStockBatchList({
          pageNo: queryParams.pageNo,
          pageSize: queryParams.pageSize,
          name: queryParams.name,
          supplierId: queryParams.supplierId,
          warehouseId: queryParams.warehouseId
        })
        // 为每条记录添加returnCount字段
        list.value = data.list.map(item => {
          // 查找是否在已选列表中
          const selectedItem = selectedItems.value.find(selected => 
            selected.productId === item.productId && selected.warehouseId === item.warehouseId
          )
          
          return {
            ...item,
            returnCount: selectedItem ? selectedItem.returnCount : 0 // 如果已选中，使用已选数量，否则为0
          }
        })
        total.value = data.total
    }
  } catch (error) {
    console.error('获取库存商品列表失败:', error)
    message.error('获取库存商品列表失败')
  } finally {
    loading.value = false
  }
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  activeTab.value = 'all'
  queryParams.type = 'all'
  handleQuery()
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}
</script>

<style scoped>
.text-red-500 {
  color: #f56c6c;
}

.text-green-500 {
  color: #67c23a;
}

.font-bold {
  font-weight: bold;
}
</style> 
