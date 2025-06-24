<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="formRules"
    v-loading="formLoading"
    label-width="0px"
    :inline-message="true"
    :disabled="disabled"
  >
    <el-row :gutter="16" v-if="!disabled">
      <!-- 左侧：产品搜索与列表 -->
      <el-col :span="10">
        <el-card class="box-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>产品选择</span>
            </div>
          </template>
          
          <!-- 搜索条件 -->
          <div class="mb-10px">
            <el-row :gutter="8" class="mb-8px">
              <el-col :span="16">
                <el-input
                  v-model="queryParams.keyword"
                  placeholder="产品名称/编码/条码"
                  clearable
                  @keyup.enter="handleQuery"
                >
                  <template #prefix>
                    <el-icon class="el-input__icon"><Search /></el-icon>
                  </template>
                </el-input>
              </el-col>
              <el-col :span="8">
                <el-button type="primary" @click="handleQuery">
                  <el-icon><Search /></el-icon>搜索
                </el-button>
                <el-button @click="resetQuery">
                  <el-icon><Refresh /></el-icon>
                </el-button>
              </el-col>
            </el-row>
            
            <el-row :gutter="8">
              <el-col :span="12">
                <el-select
                  v-model="queryParams.categoryId"
                  placeholder="产品分类"
                  clearable
                  class="!w-full"
                  @change="handleQuery"
                >
                  <el-option
                    v-for="category in categoryList"
                    :key="category.id"
                    :label="category.name"
                    :value="category.id"
                  />
                </el-select>
              </el-col>
              <el-col :span="12">
                <el-input
                  v-model="barcodeInput"
                  placeholder="扫描条形码"
                  clearable
                  @keyup.enter="handleBarcodeScan"
                >
                  <template #prefix>
                    <el-icon class="el-input__icon"><DocumentCopy /></el-icon>
                  </template>
                </el-input>
              </el-col>
            </el-row>
          </div>
          
          <!-- 产品列表 -->
          <el-table
            v-loading="searchLoading"
            :data="searchProductList"
            @row-dblclick="handleSelectProduct"
            height="360px"
            border
            stripe
            style="width: 100%"
          >
            <el-table-column label="产品名称" prop="name" min-width="150" show-overflow-tooltip />
            <el-table-column label="产品编码" prop="code" width="100" show-overflow-tooltip />
            <el-table-column label="条形码" prop="barCode" width="100" show-overflow-tooltip />
            <el-table-column label="分类" prop="categoryName" width="80" show-overflow-tooltip />
            <el-table-column label="单位" prop="unitName" width="60" align="center" />
            <el-table-column label="库存" prop="stockCount" width="70" align="right">
              <template #default="{ row }">
                {{ row.stockCount !== undefined ? erpCountInputFormatter(row.stockCount) : '-' }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="60" fixed="right" align="center">
              <template #default="{ row }">
                <el-button type="primary" link @click="handleSelectProduct(row)">选择</el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <!-- 分页 -->
          <Pagination
            v-model:page="queryParams.pageNo"
            v-model:limit="queryParams.pageSize"
            :total="total"
            @pagination="handleQuery"
          />
        </el-card>
      </el-col>
      
      <!-- 右侧：已选产品列表 -->
      <el-col :span="14">
        <el-card class="box-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>调度产品清单</span>
              <el-button type="primary" link @click="handleAdd">
                <el-icon><Plus /></el-icon>添加空行
              </el-button>
            </div>
          </template>
          
          <el-table :data="formData" show-summary :summary-method="getSummaries">
            <el-table-column label="序号" type="index" align="center" width="60" />
            <el-table-column label="调出仓库" min-width="125">
              <template #default="{ row, $index }">
                <el-form-item
                  :prop="`${$index}.fromWarehouseId`"
                  :rules="formRules.fromWarehouseId"
                  class="mb-0px!"
                >
                  <WarehouseLocationSelector
                    v-model:warehouseId="row.fromWarehouseId"
                    v-model:rackId="row.fromRackId"
                    v-model:locationId="row.fromLocationId"
                    label=""
                    :showRack="true"
                    :showLocation="true"
                    warehousePlaceholder="请选择调出仓库"
                    rackPlaceholder="请选择调出货架"
                    locationPlaceholder="请选择调出货位"
                    @change="onChangeFromWarehouseLocation($event, row)"
                  />
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="调入仓库" min-width="125">
              <template #default="{ row, $index }">
                <el-form-item
                  :prop="`${$index}.toWarehouseId`"
                  :rules="formRules.toWarehouseId"
                  class="mb-0px!"
                >
                  <WarehouseLocationSelector
                    v-model:warehouseId="row.toWarehouseId"
                    v-model:rackId="row.toRackId"
                    v-model:locationId="row.toLocationId"
                    label=""
                    :showRack="true"
                    :showLocation="true"
                    warehousePlaceholder="请选择调入仓库"
                    rackPlaceholder="请选择调入货架"
                    locationPlaceholder="请选择调入货位"
                  />
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="产品名称" min-width="180">
              <template #default="{ row, $index }">
                <el-form-item :prop="`${$index}.productId`" :rules="formRules.productId" class="mb-0px!">
                  <el-select
                    v-model="row.productId"
                    clearable
                    filterable
                    @change="onChangeProduct($event, row)"
                    placeholder="请选择产品"
                  >
                    <el-option
                      v-for="item in productList"
                      :key="item.id"
                      :label="item.name"
                      :value="item.id"
                    />
                  </el-select>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="库存" min-width="100">
              <template #default="{ row }">
                <el-form-item class="mb-0px!">
                  <el-input disabled v-model="row.stockCount" :formatter="erpCountInputFormatter" />
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="条码" min-width="150">
              <template #default="{ row }">
                <el-form-item class="mb-0px!">
                  <el-input disabled v-model="row.productBarCode" />
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="单位" min-width="80">
              <template #default="{ row }">
                <el-form-item class="mb-0px!">
                  <el-input disabled v-model="row.productUnitName" />
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="数量" prop="count" fixed="right" min-width="140">
              <template #default="{ row, $index }">
                <el-form-item :prop="`${$index}.count`" :rules="formRules.count" class="mb-0px!">
                  <el-input-number
                    v-model="row.count"
                    controls-position="right"
                    :min="0.001"
                    :precision="3"
                    class="!w-100%"
                  />
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="产品单价" fixed="right" min-width="120">
              <template #default="{ row, $index }">
                <el-form-item :prop="`${$index}.productPrice`" class="mb-0px!">
                  <el-input-number
                    v-model="row.productPrice"
                    controls-position="right"
                    :min="0.01"
                    :precision="2"
                    class="!w-100%"
                  />
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="合计金额" prop="totalPrice" fixed="right" min-width="100">
              <template #default="{ row, $index }">
                <el-form-item :prop="`${$index}.totalPrice`" class="mb-0px!">
                  <el-input disabled v-model="row.totalPrice" :formatter="erpPriceInputFormatter" />
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="备注" min-width="150">
              <template #default="{ row, $index }">
                <el-form-item :prop="`${$index}.remark`" class="mb-0px!">
                  <el-input v-model="row.remark" placeholder="请输入备注" />
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column align="center" fixed="right" label="操作" width="60">
              <template #default="{ $index }">
                <el-button @click="handleDelete($index)" type="danger" link>
                  <el-icon><Delete /></el-icon>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 只读模式下显示简单表格 -->
    <el-table v-if="disabled" :data="formData" show-summary :summary-method="getSummaries" class="-mt-10px">
      <el-table-column label="序号" type="index" align="center" width="60" />
      <el-table-column label="调出仓库" min-width="125">
        <template #default="{ row }">
          {{ getWarehouseName(row.fromWarehouseId) }}
          <template v-if="row.fromRackId || row.fromLocationId">
            <br />
            <small v-if="row.fromRackId" class="text-gray-500">货架: {{ getRackName(row.fromRackId) }}</small>
            <small v-if="row.fromLocationId" class="text-gray-500">
              <template v-if="row.fromRackId"> / </template>
              货位: {{ getLocationName(row.fromLocationId) }}
            </small>
          </template>
        </template>
      </el-table-column>
      <el-table-column label="调入仓库" min-width="125">
        <template #default="{ row }">
          {{ getWarehouseName(row.toWarehouseId) }}
          <template v-if="row.toRackId || row.toLocationId">
            <br />
            <small v-if="row.toRackId" class="text-gray-500">货架: {{ getRackName(row.toRackId) }}</small>
            <small v-if="row.toLocationId" class="text-gray-500">
              <template v-if="row.toRackId"> / </template>
              货位: {{ getLocationName(row.toLocationId) }}
            </small>
          </template>
        </template>
      </el-table-column>
      <el-table-column label="产品名称" min-width="180">
        <template #default="{ row }">
          {{ getProductName(row.productId) }}
        </template>
      </el-table-column>
      <el-table-column label="库存" min-width="100">
        <template #default="{ row }">
          {{ erpCountInputFormatter(row.stockCount) }}
        </template>
      </el-table-column>
      <el-table-column label="条码" min-width="150">
        <template #default="{ row }">
          {{ row.productBarCode }}
        </template>
      </el-table-column>
      <el-table-column label="单位" min-width="80">
        <template #default="{ row }">
          {{ row.productUnitName }}
        </template>
      </el-table-column>
      <el-table-column label="数量" prop="count" fixed="right" min-width="140">
        <template #default="{ row }">
          {{ erpCountInputFormatter(row.count) }}
        </template>
      </el-table-column>
      <el-table-column label="产品单价" fixed="right" min-width="120">
        <template #default="{ row }">
          {{ erpPriceInputFormatter(row.productPrice) }}
        </template>
      </el-table-column>
      <el-table-column label="合计金额" prop="totalPrice" fixed="right" min-width="100">
        <template #default="{ row }">
          {{ erpPriceInputFormatter(row.totalPrice) }}
        </template>
      </el-table-column>
      <el-table-column label="备注" min-width="150">
        <template #default="{ row }">
          {{ row.remark }}
        </template>
      </el-table-column>
    </el-table>
  </el-form>
</template>
<script setup lang="ts">
import { ProductApi, ProductVO } from '@/api/erp/product/product'
import { WarehouseApi, WarehouseVO } from '@/api/erp/stock/warehouse'
import { StockApi } from '@/api/erp/stock/stock'
import {
  erpCountInputFormatter,
  erpPriceInputFormatter,
  erpPriceMultiply,
  getSumValue
} from '@/utils'
import { Search, Refresh, DocumentCopy, Plus, Delete } from '@element-plus/icons-vue'
import { debounce } from 'lodash-es'
import Pagination from '@/components/Pagination/index.vue'
import WarehouseLocationSelector from '@/components/WarehouseLocationSelector/index.vue'
import { WarehouseRackApi } from '@/api/erp/stock/warehouse/rack'
import { WarehouseLocationApi } from '@/api/erp/stock/warehouse/location'

const props = defineProps<{
  items: undefined
  disabled: false
}>()
const formLoading = ref(false) // 表单的加载中
const formData = ref([])
const formRules = reactive({
  inId: [{ required: true, message: '调度编号不能为空', trigger: 'blur' }],
  fromWarehouseId: [{ required: true, message: '调出仓库不能为空', trigger: 'blur' }],
  toWarehouseId: [{ required: true, message: '调入仓库不能为空', trigger: 'blur' }],
  productId: [{ required: true, message: '产品不能为空', trigger: 'blur' }],
  count: [{ required: true, message: '产品数量不能为空', trigger: 'blur' }]
})
const formRef = ref([]) // 表单 Ref
const productList = ref<ProductVO[]>([]) // 产品列表
const warehouseList = ref<WarehouseVO[]>([]) // 仓库列表
const defaultWarehouse = ref<WarehouseVO>(undefined) // 默认仓库

// 产品搜索相关
const searchProductList = ref<ProductVO[]>([]) // 搜索结果列表
const searchLoading = ref(false) // 搜索加载状态
const categoryList = ref<any[]>([]) // 产品分类列表
const barcodeInput = ref('') // 条形码输入
const total = ref(0) // 搜索结果总数

// 查询参数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  keyword: '',
  categoryId: undefined
})

// 货架和货位列表
const rackList = ref<any[]>([])
const locationList = ref<any[]>([])

// 防抖处理的搜索方法
const debouncedSearch = debounce(() => {
  if (queryParams.keyword) {
    handleQuery()
  }
}, 300)

// 监听搜索关键词变化
watch(() => queryParams.keyword, debouncedSearch)

/** 初始化设置调度项 */
watch(
  () => props.items,
  async (val) => {
    formData.value = val
  },
  { immediate: true }
)

/** 监听合同产品变化，计算合同产品总价 */
watch(
  () => formData.value,
  (val) => {
    if (!val || val.length === 0) {
      return
    }
    // 循环处理
    val.forEach((item) => {
      item.totalPrice = erpPriceMultiply(item.productPrice, item.count)
    })
  },
  { deep: true }
)

/** 合计 */
const getSummaries = (param: SummaryMethodProps) => {
  const { columns, data } = param
  const sums: string[] = []
  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = '合计'
      return
    }
    if (['count', 'totalPrice'].includes(column.property)) {
      const sum = getSumValue(data.map((item) => Number(item[column.property])))
      sums[index] =
        column.property === 'count' ? erpCountInputFormatter(sum) : erpPriceInputFormatter(sum)
    } else {
      sums[index] = ''
    }
  })

  return sums
}

/** 获取产品名称 */
const getProductName = (productId) => {
  const product = productList.value.find(item => item.id === productId)
  return product ? product.name : ''
}

/** 获取仓库名称 */
const getWarehouseName = (warehouseId) => {
  const warehouse = warehouseList.value.find(item => item.id === warehouseId)
  return warehouse ? warehouse.name : ''
}

/** 获取货架名称 */
const getRackName = (rackId) => {
  const rack = rackList.value.find(item => item.id === rackId)
  return rack ? rack.name : ''
}

/** 获取货位名称 */
const getLocationName = (locationId) => {
  const location = locationList.value.find(item => item.id === locationId)
  return location ? location.name : ''
}

/** 新增按钮操作 */
const handleAdd = () => {
  const row = {
    id: undefined,
    fromWarehouseId: defaultWarehouse.value?.id,
    fromRackId: undefined,
    fromLocationId: undefined,
    toWarehouseId: undefined,
    toRackId: undefined,
    toLocationId: undefined,
    productId: undefined,
    productUnitName: undefined, // 产品单位
    productBarCode: undefined, // 产品条码
    productPrice: undefined,
    stockCount: undefined,
    count: 1,
    totalPrice: undefined,
    remark: undefined
  }
  formData.value.push(row)
}

/** 删除按钮操作 */
const handleDelete = (index) => {
  formData.value.splice(index, 1)
}

/** 处理仓库变更 */
const onChangeWarehouse = (warehouseId, row) => {
  // 加载库存
  setStockCount(row)
}

/** 处理产品变更 */
const onChangeProduct = (productId, row) => {
  const product = productList.value.find((item) => item.id === productId)
  if (product) {
    row.productUnitName = product.unitName
    row.productBarCode = product.barCode
    row.productPrice = product.minPrice
  }
  // 加载库存
  setStockCount(row)
}

/** 处理调出仓库位置变更 */
const onChangeFromWarehouseLocation = (location, row) => {
  // 加载库存
  if (location.warehouseId && row.productId) {
    setStockCount(row)
  }
}

/** 加载库存 */
const setStockCount = async (row) => {
  if (!row.productId || !row.fromWarehouseId) {
    return
  }
  // 这里需要后端支持，目前先使用现有API
  const stock = await StockApi.getStock2(row.productId, row.fromWarehouseId)
  row.stockCount = stock ? stock.count : 0
}

/** 处理产品查询 */
const handleQuery = async () => {
  searchLoading.value = true
  
  try {
    const res = await ProductApi.getProductPage(queryParams)
    searchProductList.value = res.list || []
    total.value = res.total
    
    // 加载库存信息
    loadProductsStockInfo()
  } catch (error) {
    console.error('产品搜索失败:', error)
    ElMessage.error('产品搜索失败')
  } finally {
    searchLoading.value = false
  }
}

/** 加载产品库存信息 */
const loadProductsStockInfo = async () => {
  for (const product of searchProductList.value) {
    if (product.id) {
      product.stockCount = await StockApi.getStockCount(product.id)
    }
  }
}

/** 重置查询 */
const resetQuery = () => {
  queryParams.keyword = ''
  queryParams.categoryId = undefined
  queryParams.pageNo = 1
  handleQuery()
}

/** 处理条码扫描 */
const handleBarcodeScan = async () => {
  if (!barcodeInput.value) return
  
  searchLoading.value = true
  
  try {
    // 通过条码查询产品
    const params = {
      pageNo: 1,
      pageSize: 10,
      barCode: barcodeInput.value
    }
    
    const res = await ProductApi.getProductPage(params)
    if (res.list && res.list.length > 0) {
      searchProductList.value = res.list
      total.value = res.total
      
      // 加载库存信息
      loadProductsStockInfo()
      
      // 如果只有一个结果，直接选择
      if (res.list.length === 1) {
        handleSelectProduct(res.list[0])
      }
    } else {
      ElMessage.warning('未找到对应条码的产品')
      searchProductList.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('条码扫描查询失败:', error)
    ElMessage.error('条码查询失败')
  } finally {
    searchLoading.value = false
    barcodeInput.value = '' // 清空条码输入
  }
}

/** 选择产品 */
const handleSelectProduct = (product: ProductVO) => {
  // 创建新行并添加到表格
  const row = {
    id: undefined,
    fromWarehouseId: defaultWarehouse.value?.id,
    fromRackId: undefined,
    fromLocationId: undefined,
    toWarehouseId: undefined,
    toRackId: undefined,
    toLocationId: undefined,
    productId: product.id,
    productName: product.name,
    productUnitName: product.unitName,
    productBarCode: product.barCode,
    productPrice: product.minPrice,
    stockCount: product.stockCount || 0,
    count: 1,
    totalPrice: product.minPrice, // 初始值
    remark: undefined
  }
  
  formData.value.push(row)
  ElMessage.success(`已添加产品：${product.name}`)
  
  // 加载库存
  if (row.fromWarehouseId) {
    setStockCount(row)
  }
}

/** 表单校验 */
const validate = () => {
  return formRef.value.validate()
}
defineExpose({ validate })

/** 初始化 */
onMounted(async () => {
  productList.value = await ProductApi.getProductSimpleList()
  warehouseList.value = await WarehouseApi.getWarehouseSimpleList()
  defaultWarehouse.value = warehouseList.value.find((item) => item.defaultStatus)
  
  // 加载货架和货位列表
  try {
    rackList.value = await WarehouseRackApi.getWarehouseRackSimpleList()
    locationList.value = await WarehouseLocationApi.getWarehouseLocationSimpleList()
  } catch (error) {
    console.error('加载货架或货位列表失败:', error)
  }
  
  // 加载分类列表
  try {
    categoryList.value = await ProductApi.getCategoryList()
  } catch (error) {
    console.error('加载产品分类失败:', error)
  }
  
  // 默认添加一个
  if (formData.value.length === 0) {
    handleAdd()
  }
  
  // 初始加载产品列表
  handleQuery()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
