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
            <el-table-column label="采购价" prop="purchasePrice" width="80" align="right">
              <template #default="{ row }">
                {{ erpPriceInputFormatter(row.purchasePrice) }}
              </template>
            </el-table-column>
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
              <span>已选产品</span>
              <el-button type="primary" link @click="handleAdd" v-if="!disabled">
                <el-icon><Plus /></el-icon>添加空行
              </el-button>
            </div>
          </template>
          
          <!-- 已选产品表格 -->
          <el-table :data="formData" show-summary :summary-method="getSummaries" height="420px">
            <el-table-column label="序号" type="index" width="50" align="center" />
            <el-table-column label="产品名称" min-width="150" show-overflow-tooltip>
              <template #default="{ row, $index }">
                <el-form-item :prop="`${$index}.productId`" :rules="formRules.productId" class="mb-0px!">
                  <el-select
                    v-model="row.productId"
                    clearable
                    filterable
                    @change="onChangeProduct($event, row)"
                    placeholder="请选择产品"
                    class="!w-full"
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
            <el-table-column label="数量" prop="count" width="100">
              <template #default="{ row, $index }">
                <el-form-item :prop="`${$index}.count`" :rules="formRules.count" class="mb-0px!">
                  <el-input-number
                    v-model="row.count"
                    controls-position="right"
                    :min="0.001"
                    :precision="3"
                    class="!w-full"
                  />
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="单价" width="100">
              <template #default="{ row, $index }">
                <el-form-item
                  :prop="`${$index}.productPrice`"
                  :rules="formRules.productPrice"
                  class="mb-0px!"
                >
                  <el-input-number
                    v-model="row.productPrice"
                    controls-position="right"
                    :min="0.01"
                    :precision="2"
                    class="!w-full"
                  />
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="金额" prop="totalProductPrice" width="100" align="right">
              <template #default="{ row }">
                {{ erpPriceInputFormatter(row.totalProductPrice) }}
              </template>
            </el-table-column>
            <el-table-column label="税率%" width="80">
              <template #default="{ row, $index }">
                <el-form-item :prop="`${$index}.taxPercent`" class="mb-0px!">
                  <el-input-number
                    v-model="row.taxPercent"
                    controls-position="right"
                    :min="0"
                    :precision="2"
                    class="!w-full"
                  />
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="税额" prop="taxPrice" width="100" align="right">
              <template #default="{ row }">
                {{ erpPriceInputFormatter(row.taxPrice) }}
              </template>
            </el-table-column>
            <el-table-column label="合计" prop="totalPrice" width="100" align="right">
              <template #default="{ row }">
                {{ erpPriceInputFormatter(row.totalPrice) }}
              </template>
            </el-table-column>
            <el-table-column label="库存" width="80" align="right">
              <template #default="{ row }">
                {{ erpCountInputFormatter(row.stockCount) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="60" align="center" fixed="right">
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
    
    <!-- 只读模式下只显示已选产品 -->
    <el-table v-if="disabled" :data="formData" show-summary :summary-method="getSummaries">
      <el-table-column label="序号" type="index" align="center" width="60" />
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
      <el-table-column label="数量" prop="count" align="right">
        <template #default="{ row }">
          {{ erpCountInputFormatter(row.count) }}
        </template>
      </el-table-column>
      <el-table-column label="产品单价" align="right">
        <template #default="{ row }">
          {{ erpPriceInputFormatter(row.productPrice) }}
        </template>
      </el-table-column>
      <el-table-column label="金额" prop="totalProductPrice" align="right">
        <template #default="{ row }">
          {{ erpPriceInputFormatter(row.totalProductPrice) }}
        </template>
      </el-table-column>
      <el-table-column label="税率（%）" align="right">
        <template #default="{ row }">
          {{ row.taxPercent }}
        </template>
      </el-table-column>
      <el-table-column label="税额" prop="taxPrice" align="right">
        <template #default="{ row }">
          {{ erpPriceInputFormatter(row.taxPrice) }}
        </template>
      </el-table-column>
      <el-table-column label="税额合计" prop="totalPrice" align="right">
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

const props = defineProps<{
  items: undefined
  disabled: false
}>()
const formLoading = ref(false) // 表单的加载中
const formData = ref([])
const formRules = reactive({
  productId: [{ required: true, message: '产品不能为空', trigger: 'blur' }],
  productPrice: [{ required: true, message: '产品单价不能为空', trigger: 'blur' }],
  count: [{ required: true, message: '产品数量不能为空', trigger: 'blur' }]
})
const formRef = ref([]) // 表单 Ref
const productList = ref<ProductVO[]>([]) // 产品列表

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

// 防抖处理的搜索方法
const debouncedSearch = debounce(() => {
  if (queryParams.keyword) {
    handleQuery()
  }
}, 300)

// 监听搜索关键词变化
watch(() => queryParams.keyword, debouncedSearch)

/** 初始化设置入库项 */
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
      item.totalProductPrice = erpPriceMultiply(item.productPrice, item.count)
      item.taxPrice = erpPriceMultiply(item.totalProductPrice, item.taxPercent / 100.0)
      if (item.totalProductPrice != null) {
        item.totalPrice = item.totalProductPrice + (item.taxPrice || 0)
      } else {
        item.totalPrice = undefined
      }
    })
  },
  { deep: true }
)

/** 合计 */
const getSummaries = (param: SummaryMethodProps) => {
  const { columns, data } = param
  const sums: string[] = []
  columns.forEach((column, index: number) => {
    if (index === 0) {
      sums[index] = '合计'
      return
    }
    if (['count', 'totalProductPrice', 'taxPrice', 'totalPrice'].includes(column.property)) {
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

/** 新增按钮操作 */
const handleAdd = () => {
  const row = {
    id: undefined,
    productId: undefined,
    productUnitName: undefined, // 产品单位
    productBarCode: undefined, // 产品条码
    productPrice: undefined,
    stockCount: undefined,
    count: 1,
    totalProductPrice: undefined,
    taxPercent: 0, // 默认税率为0
    taxPrice: undefined,
    totalPrice: undefined,
    remark: undefined
  }
  formData.value.push(row)
}

/** 删除按钮操作 */
const handleDelete = (index: number) => {
  formData.value.splice(index, 1)
}

/** 处理产品变更 */
const onChangeProduct = (productId, row) => {
  const product = productList.value.find((item) => item.id === productId)
  if (product) {
    row.productUnitName = product.unitName
    row.productBarCode = product.barCode
    row.productPrice = product.purchasePrice
  }
  // 加载库存
  setStockCount(row)
}

/** 加载库存 */
const setStockCount = async (row: any) => {
  if (!row.productId) {
    return
  }
  const count = await StockApi.getStockCount(row.productId)
  row.stockCount = count || 0
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
    productId: product.id,
    productName: product.name,
    productUnitName: product.unitName,
    productBarCode: product.barCode,
    productPrice: product.purchasePrice,
    stockCount: product.stockCount || 0,
    count: 1,
    totalProductPrice: product.purchasePrice, // 初始值
    taxPercent: 0,
    taxPrice: 0,
    totalPrice: product.purchasePrice,
    remark: undefined
  }
  
  formData.value.push(row)
  ElMessage.success(`已添加产品：${product.name}`)
}

/** 表单校验 */
const validate = () => {
  return formRef.value.validate()
}
defineExpose({ validate })

/** 初始化 */
onMounted(async () => {
  // 加载产品列表
  productList.value = await ProductApi.getProductSimpleList()
  
  // 加载分类列表
  try {
    categoryList.value = await ProductApi.getCategoryList()
  } catch (error) {
    console.error('加载产品分类失败:', error)
  }
  
  // 默认添加一个空行
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
