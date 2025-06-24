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
    <el-table :data="formData" show-summary :summary-method="getSummaries" class="-mt-10px">
      <el-table-column label="序号" type="index" align="center" width="60" />
      <el-table-column label="仓库位置" min-width="280">
        <template #default="{ row, $index }">
          <el-form-item
            :prop="`${$index}.returnLocations`"
            :rules="formRules.returnLocations"
            class="mb-0px!"
          >
            <!-- 已完成库位分配的情况下直接显示库位信息，不显示选择器 -->
            <template v-if="row.returnLocations && row.returnLocations.length > 0">
              <div class="flex flex-col">
                <div v-for="(loc, idx) in row.returnLocations" :key="idx" class="mb-5px">
                  <el-tag size="small" class="mr-5px">{{ loc.warehouseName }}</el-tag>
                  <el-tag size="small" type="info" v-if="loc.rackName" class="mr-5px">{{ loc.rackName }}</el-tag>
                  <el-tag size="small" type="success" v-if="loc.locationName" class="mr-5px">{{ loc.locationName }}</el-tag>
                  <span class="text-sm ml-5px">{{ loc.count }}</span>
                </div>
                <el-button type="primary" link size="small" @click="openDistributionDialog(row)" class="mt-5px">
                  修改库位分配
                </el-button>
              </div>
            </template>
            
            <!-- 未完成库位分配时显示警告和管理按钮 -->
            <template v-else>
              <el-alert
                type="warning"
                :closable="false"
                show-icon
                title="未完成库位分配"
                class="mb-10px"
              />
              <el-button type="primary" @click="openDistributionDialog(row)">
                管理库位分配
              </el-button>
            </template>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="产品名称" min-width="180">
        <template #default="{ row }">
          <el-form-item class="mb-0px!">
            <el-input disabled v-model="row.productName" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="批次" min-width="120">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.batchNumber`" :rules="formRules.batchNumber" class="mb-0px!">
            <el-select 
              v-model="row.batchNumber" 
              filterable 
              placeholder="选择批次"
              @change="handleBatchChange($event, row)"
            >
              <el-option 
                v-for="item in row.availableBatches || []" 
                :key="item.batchNumber" 
                :label="item.batchNumber" 
                :value="item.batchNumber"
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
      <el-table-column
        label="已出库"
        fixed="right"
        min-width="80"
        v-if="formData[0]?.inCount != null"
      >
        <template #default="{ row }">
          <el-form-item class="mb-0px!">
            <el-input disabled v-model="row.inCount" :formatter="erpCountInputFormatter" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column
        label="已退货"
        fixed="right"
        min-width="80"
        v-if="formData[0]?.returnCount != null"
      >
        <template #default="{ row }">
          <el-form-item class="mb-0px!">
            <el-input disabled v-model="row.returnCount" :formatter="erpCountInputFormatter" />
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
      <el-table-column label="金额" prop="totalProductPrice" fixed="right" min-width="100">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.totalProductPrice`" class="mb-0px!">
            <el-input
              disabled
              v-model="row.totalProductPrice"
              :formatter="erpPriceInputFormatter"
            />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="税率（%）" fixed="right" min-width="115">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.taxPercent`" class="mb-0px!">
            <el-input-number
              v-model="row.taxPercent"
              controls-position="right"
              :min="0"
              :precision="2"
              class="!w-100%"
            />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="税额" prop="taxPrice" fixed="right" min-width="120">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.taxPrice`" class="mb-0px!">
            <el-form-item :prop="`${$index}.taxPrice`" class="mb-0px!">
              <el-input disabled v-model="row.taxPrice" :formatter="erpPriceInputFormatter" />
            </el-form-item>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="税额合计" prop="totalPrice" fixed="right" min-width="100">
        <template #default="{ row, $index }">
          <el-form-item :prop="`${$index}.totalPrice`" class="mb-0px!">
            <el-input disabled v-model="row.totalPrice" :formatter="erpPriceInputFormatter" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column label="库存分布" min-width="200">
        <template #default="{ row }">
          <template v-if="!row.returnLocations || row.returnLocations.length === 0">
            <el-button type="primary" size="small" @click="openDistributionDialog(row)">
              管理库位分配
            </el-button>
          </template>
          <template v-else>
            <el-button type="success" size="small" @click="openDistributionDialog(row)">
              已分配 {{ getTotalDistributedCount(row) }}/{{ row.count }}
            </el-button>
            <div class="mt-5px text-sm text-gray-500">
              共{{ row.returnLocations.length }}个库位
            </div>
          </template>
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
          <el-button :disabled="formData.length === 1" @click="handleDelete($index)" link>
            —
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 只读模式下显示简单表格 -->
    <el-table v-if="disabled" :data="formData" show-summary :summary-method="getSummaries" class="-mt-10px">
      <el-table-column label="序号" type="index" align="center" width="60" />
      <el-table-column label="仓库位置" min-width="280">
        <template #default="{ row }">
          <template v-if="row.returnLocations && row.returnLocations.length > 0">
            <div v-for="(loc, idx) in row.returnLocations" :key="idx" class="mb-5px">
              {{ loc.warehouseName }}
              <template v-if="loc.rackName || loc.locationName">
                <br />
                <small v-if="loc.rackName" class="text-gray-500">货架: {{ loc.rackName }}</small>
                <small v-if="loc.locationName" class="text-gray-500">
                  <template v-if="loc.rackName"> / </template>
                  货位: {{ loc.locationName }}
                </small>
                <small class="ml-5px">{{ erpCountInputFormatter(loc.count) }}</small>
              </template>
            </div>
          </template>
          <template v-else>
            {{ getWarehouseName(row.warehouseId) }}
            <template v-if="row.rackId || row.locationId">
              <br />
              <small v-if="row.rackId" class="text-gray-500">货架: {{ getRackName(row.rackId) }}</small>
              <small v-if="row.locationId" class="text-gray-500">
                <template v-if="row.rackId"> / </template>
                货位: {{ getLocationName(row.locationId) }}
              </small>
            </template>
          </template>
        </template>
      </el-table-column>
      <el-table-column label="产品名称" min-width="180">
        <template #default="{ row }">
          {{ row.productName }}
        </template>
      </el-table-column>
      <el-table-column label="批次" min-width="120">
        <template #default="{ row }">
          {{ row.batchNumber || '未指定' }}
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
      <el-table-column
        label="已出库"
        fixed="right"
        min-width="80"
        v-if="formData[0]?.inCount != null"
      >
        <template #default="{ row }">
          {{ erpCountInputFormatter(row.inCount) }}
        </template>
      </el-table-column>
      <el-table-column
        label="已退货"
        fixed="right"
        min-width="80"
        v-if="formData[0]?.returnCount != null"
      >
        <template #default="{ row }">
          {{ erpCountInputFormatter(row.returnCount) }}
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
      <el-table-column label="金额" prop="totalProductPrice" fixed="right" min-width="100">
        <template #default="{ row }">
          {{ erpPriceInputFormatter(row.totalProductPrice) }}
        </template>
      </el-table-column>
      <el-table-column label="税率（%）" fixed="right" min-width="115">
        <template #default="{ row }">
          {{ row.taxPercent }}
        </template>
      </el-table-column>
      <el-table-column label="税额" prop="taxPrice" fixed="right" min-width="120">
        <template #default="{ row }">
          {{ erpPriceInputFormatter(row.taxPrice) }}
        </template>
      </el-table-column>
      <el-table-column label="税额合计" prop="totalPrice" fixed="right" min-width="100">
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
    
    <!-- 库位分配对话框 -->
    <el-dialog
      v-model="distributionDialogVisible"
      title="出库位置记录"
      width="800px"
      append-to-body
    >
      <div v-if="currentItem">
        <div class="mb-10px flex justify-between items-center">
          <div>
            <span class="font-bold">{{ currentItem.productName }}</span>
            <span class="ml-10px">总退货数量: {{ currentItem.count }}</span>
            <span class="ml-10px">已记录: {{ getTotalDistributedCount(currentItem) }}</span>
            <span class="ml-10px">未记录: {{ getUndistributedCount(currentItem) }}</span>
          </div>
          <el-button type="primary" @click="addNewLocation" :disabled="getUndistributedCount(currentItem) <= 0">
            添加出库位置
          </el-button>
        </div>
        
        <!-- 当前库存分布 -->
        <div v-if="currentItem.stockDistribution && currentItem.stockDistribution.length > 0" class="mb-10px">
          <div class="text-lg font-bold mb-5px">当前库存分布</div>
          <el-table :data="currentItem.stockDistribution" border size="small">
            <el-table-column label="仓库" prop="warehouseName" />
            <el-table-column label="货架" prop="rackName" />
            <el-table-column label="货位" prop="locationName" />
            <el-table-column label="当前库存" prop="count" />
            <el-table-column label="操作" width="120">
              <template #default="{ row: stockRow }">
                <el-button 
                  type="primary" 
                  link 
                  size="small" 
                  @click="selectExistingLocation(stockRow)"
                  :disabled="getUndistributedCount(currentItem) <= 0"
                >
                  选择此库位
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        
        <!-- 退货分配 -->
        <div class="text-lg font-bold mb-5px">出库位置记录</div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="distributionDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="confirmDistribution"
            :disabled="!isDistributionValid || locationConflicts.length > 0"
          >
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
  </el-form>
</template>
<script setup lang="ts">
import { StockApi } from '@/api/erp/stock/stock'
import {
  erpCountInputFormatter,
  erpPriceInputFormatter,
  erpPriceMultiply,
  getSumValue
} from '@/utils'
import { WarehouseApi, WarehouseVO } from '@/api/erp/stock/warehouse'
import WarehouseLocationSelector from '@/components/WarehouseLocationSelector/index.vue'
import { WarehouseRackApi } from '@/api/erp/stock/warehouse/rack'
import { WarehouseLocationApi } from '@/api/erp/stock/warehouse/location'
import { useMessage } from '@/hooks/web/useMessage'
import { ProductApi } from '@/api/erp/product/product'
import { ProductSkuStockApi } from '@/api/mall/product/sku-stock'

const props = defineProps<{
  items: undefined
  disabled: false
}>()
const formLoading = ref(false) // 表单的加载中
const formData = ref([])
const formRules = reactive({
  returnLocations: [{ 
    validator: (rule, value, callback) => {
      // 不再强制要求完成库位分配
      callback()
    }, 
    trigger: 'blur' 
  }],
  productId: [{ required: true, message: '产品不能为空', trigger: 'blur' }],
  count: [{ 
    required: true, 
    message: '产品数量不能为空', 
    trigger: 'blur' 
  }, {
    validator: (rule, value, callback) => {
      const row = formData.value.find(item => item.count === value)
      if (row && row.stockCount !== undefined && Number(value) > Number(row.stockCount)) {
        callback(new Error('退货数量不能大于库存数量'))
      } else {
        callback()
      }
    },
    trigger: 'blur'
  }],
  batchNumber: []
})
const formRef = ref([]) // 表单 Ref
const warehouseList = ref<WarehouseVO[]>([]) // 仓库列表
const defaultWarehouse = ref<WarehouseVO>(undefined) // 默认仓库
const rackList = ref<any[]>([])
const locationList = ref<any[]>([])
const message = useMessage() // 消息提示

// 库位分配相关
const distributionDialogVisible = ref(false)
const currentItem = ref(null)
const rackOptionsMap = ref({}) // 按仓库ID分组的货架选项
const locationOptionsMap = ref({}) // 按货架ID分组的货位选项
const locationMaxStockMap = ref(new Map())
const locationConflicts = ref([])
const isDistributionValid = ref(true)

// 在script setup外层添加验证定时器
const validateTimer = ref(null)

/** 初始化设置退货项 */
watch(
  () => props.items,
  async (val) => {
    if (!val) return
    
    val.forEach((item) => {
      // 初始化退货位置数组
      if (!item.returnLocations) {
        item.returnLocations = []
      }
      
      if (item.warehouseId == null) {
        item.warehouseId = defaultWarehouse.value?.id
      }
      if (item.stockCount === null && item.warehouseId != null) {
        setStockCount(item)
      }
    })
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
    taxPercent: undefined,
    taxPrice: undefined,
    totalPrice: undefined,
    remark: undefined,
    returnLocations: [], // 初始化退货位置数组
    batchNumber: undefined, // 批次号
    availableBatches: [] // 可用批次列表
  }
  formData.value.push(row)
}

/** 删除按钮操作 */
const handleDelete = (index: number) => {
  formData.value.splice(index, 1)
}

/** 加载库存 */
const setStockCount = async (row: any) => {
  if (!row.productId) {
    return
  }
  
  try {
    // 获取产品总库存
    const count = await StockApi.getStockCount(row.productId)
    row.stockCount = count || 0
    
    // 获取产品的批次库存信息
    const batchList = await StockApi.getProductBatchList(row.productId)
    row.availableBatches = batchList || []
    
    // 如果只有一个批次，自动选择
    if (row.availableBatches.length === 1) {
      row.batchNumber = row.availableBatches[0].batchNumber
      handleBatchChange(row.batchNumber, row)
    }
    
    // 尝试加载产品的库存分布
    const distribution = await StockApi.getProductStockDistribution(row.productId)
    if (distribution && distribution.length > 0) {
      row.stockDistribution = distribution
    }
  } catch (error) {
    console.error('加载产品库存信息失败:', error)
  }
}

/** 打开库位分配对话框 */
const openDistributionDialog = (row) => {
  currentItem.value = row
  // 确保有退货位置数组
  if (!row.returnLocations) {
    row.returnLocations = []
    
    // 如果已有仓库位置信息，自动添加一个初始记录
    if (row.warehouseId) {
      const warehouse = warehouseList.value.find(w => w.id === row.warehouseId)
      const warehouseName = warehouse?.name || ''
      
      // 查找货架和货位名称
      let rackName = ''
      let locationName = ''
      
      if (row.rackId) {
        const rack = getRackOptions(row.warehouseId).find(r => r.id === row.rackId)
        if (rack) rackName = rack.name
      }
      
      if (row.locationId) {
        const location = getLocationOptions(row.rackId).find(l => l.id === row.locationId)
        if (location) locationName = location.name
      }
      
      // 添加初始分配记录，包含批次信息
      row.returnLocations.push({
        warehouseId: row.warehouseId,
        warehouseName,
        rackId: row.rackId,
        rackName,
        locationId: row.locationId,
        locationName,
        count: row.count, // 初始全部分配到这一个库位
        batchNumber: row.batchNumber // 添加批次信息
      })
    }
  }
  distributionDialogVisible.value = true
  locationConflicts.value = []
  validateDistribution()
}

/** 验证分配是否有效 */
const validateDistribution = () => {
  if (!currentItem.value) return
  
  const totalDistributed = getTotalDistributedCount(currentItem.value)
  const totalCount = Number(currentItem.value.count || 0)
  
  // 检查是否超出库存数量
  if (totalCount > Number(currentItem.value.stockCount || 0)) {
    isDistributionValid.value = false
    locationConflicts.value = ['退货数量不能大于库存数量']
    return
  }
  
  // 不再要求分配完全，只要不超出总数即可
  isDistributionValid.value = totalDistributed <= totalCount
  
  // 在控制台输出调试信息
  console.log('验证分配:', {
    totalDistributed,
    totalCount,
    isValid: isDistributionValid.value,
    diff: Math.abs(totalDistributed - totalCount),
    returnLocations: currentItem.value.returnLocations
  })
  
  // 检查每个库位是否有冲突
  checkAllLocationConflicts()
}

/** 检查所有库位冲突 */
const checkAllLocationConflicts = () => {
  locationConflicts.value = []
  
  if (!currentItem.value || !currentItem.value.returnLocations) return
  
  // 清空旧的冲突信息
  currentItem.value.returnLocations.forEach(location => {
    delete location.conflict
  })
  
  // 检查每个库位
  currentItem.value.returnLocations.forEach(location => {
    checkLocationConflict(location)
  })
}

/** 检查单个库位冲突 */
const checkLocationConflict = (location) => {
  if (!location) return
  
  // 检查库位上限
  validateLocationMaxStock(location)
}

/** 验证库位上限 */
const validateLocationMaxStock = (location) => {
  if (!location || !location.locationId) return
  
  const maxStock = getLocationMaxStock(location.locationId)
  if (!maxStock) return // 没有上限限制
  
  const currentStock = getLocationCurrentStock(location)
  const newStock = currentStock + Number(location.count || 0)
  
  if (newStock > maxStock) {
    const conflict = `库位 ${location.warehouseName} ${location.rackName || ''} ${location.locationName || ''} 的库存将超过上限 (${newStock} > ${maxStock})`
    
    // 添加到冲突列表
    if (!locationConflicts.value.includes(conflict)) {
      locationConflicts.value.push(conflict)
    }
    
    // 标记该位置有冲突
    location.conflict = true
  } else {
    location.conflict = false
  }
}

/** 获取已分配总数 */
const getTotalDistributedCount = (row) => {
  if (!row || !row.returnLocations || row.returnLocations.length === 0) return 0
  
  // 使用字符串累加后转换为数字，避免浮点数精度问题
  let totalStr = '0'
  row.returnLocations.forEach(loc => {
    if (loc.count) {
      // 将每个数值转为字符串，保留3位小数
      const countStr = Number(loc.count).toFixed(3)
      // 转回数字做加法
      totalStr = (Number(totalStr) + Number(countStr)).toFixed(3)
    }
  })
  
  // 最终返回数字类型
  return Number(totalStr)
}

/** 确认分配 */
const confirmDistribution = () => {
  if (!currentItem.value) return
  
  // 最终验证 - 强制更新验证状态
  validateDistribution()
  
  // 在确认前输出详细信息，用于调试
  console.log('确认分配:', {
    isValid: isDistributionValid.value,
    conflicts: locationConflicts.value,
    totalDistributed: getTotalDistributedCount(currentItem.value),
    totalCount: currentItem.value.count,
    returnLocations: currentItem.value.returnLocations
  })
  
  if (!isDistributionValid.value) {
    if (locationConflicts.value.length > 0) {
      message.warning(locationConflicts.value[0])
    } else {
      message.warning('分配数量超出退货数量，请修正')
    }
    return
  }
  
  distributionDialogVisible.value = false
}

/** 处理库位数量变更 */
const handleLocationCountChange = (value, row) => {
  // 延迟验证以减少频繁计算
  clearTimeout(validateTimer.value)
  validateTimer.value = setTimeout(() => {
    validateDistribution()
  }, 300)
}

/** 处理库位输入框失去焦点 */
const handleLocationBlur = (row) => {
  // 立即验证，确保用户完成输入后立即得到反馈
  clearTimeout(validateTimer.value)
  validateDistribution()
}

/** 处理回车键按下事件 */
const handleEnterKey = (row) => {
  // 立即验证，并尝试自动聚焦到下一个输入框或确认按钮
  clearTimeout(validateTimer.value)
  validateDistribution()
  
  // 如果是最后一个输入框且验证通过，可以尝试自动点击确认按钮
  if (isDistributionValid.value && !locationConflicts.value.length) {
    // 可选：如果是最后一个库位，自动聚焦到确认按钮
    const confirmButton = document.querySelector('.dialog-footer .el-button--primary')
    if (confirmButton) {
      setTimeout(() => {
        confirmButton.focus()
      }, 100)
    }
  }
}

/** 添加新的库位 */
const addNewLocation = () => {
  if (!currentItem.value) return
  
  const undistributedCount = getUndistributedCount(currentItem.value)
  if (undistributedCount <= 0) {
    message.warning('已无可分配数量')
    return
  }
  
  // 转换为保留3位小数的数值，避免浮点数精度问题
  const countToAdd = parseFloat(undistributedCount.toFixed(3))
  
  currentItem.value.returnLocations.push({
    warehouseId: defaultWarehouse.value?.id,
    warehouseName: defaultWarehouse.value?.name,
    rackId: undefined,
    rackName: '',
    locationId: undefined,
    locationName: '',
    count: countToAdd, // 使用精确计算的未分配数量
    batchNumber: currentItem.value.batchNumber // 使用当前批次的批次号
  })
  
  // 验证更新后的分配情况
  validateDistribution()
}

/** 选择已有库位 */
const selectExistingLocation = (stockRow) => {
  if (!currentItem.value) return
  
  const undistributedCount = getUndistributedCount(currentItem.value)
  if (undistributedCount <= 0) {
    message.warning('已无可分配数量')
    return
  }
  
  // 检查是否已添加该库位
  const existingIndex = currentItem.value.returnLocations.findIndex(loc => 
    loc.warehouseId === stockRow.warehouseId && 
    loc.rackId === stockRow.rackId && 
    loc.locationId === stockRow.locationId
  )
  
  if (existingIndex >= 0) {
    // 如果已经添加过该库位，询问是否增加数量
    message.warning('该库位已添加，已自动选择下一个可用库位')
    
    // 尝试添加一个新库位
    addNewLocation()
    return
  }
  
  // 添加新库位
  currentItem.value.returnLocations.push({
    warehouseId: stockRow.warehouseId,
    warehouseName: stockRow.warehouseName,
    rackId: stockRow.rackId,
    rackName: stockRow.rackName,
    locationId: stockRow.locationId,
    locationName: stockRow.locationName,
    count: undistributedCount,
    batchNumber: currentItem.value.batchNumber // 使用当前批次的批次号
  })
  
  // 检查库位上限，如果需要则调整数量
  const newLocation = currentItem.value.returnLocations[currentItem.value.returnLocations.length - 1]
  validateLocationMaxStock(newLocation)
  
  // 检查库位冲突
  checkLocationConflict(newLocation)
}

/** 移除库位 */
const removeLocation = (index) => {
  if (!currentItem.value || !currentItem.value.returnLocations) return
  currentItem.value.returnLocations.splice(index, 1)
  validateDistribution()
}

/** 获取未分配数量 */
const getUndistributedCount = (row) => {
  if (!row || !row.count) return 0
  
  const totalDistributed = getTotalDistributedCount(row)
  return Math.max(0, Number(row.count) - totalDistributed)
}

/** 处理仓库变更 */
const handleWarehouseChange = async (warehouseId, row) => {
  if (!warehouseId) return
  
  // 更新仓库名称
  const warehouse = warehouseList.value.find(w => w.id === warehouseId)
  if (warehouse) {
    row.warehouseName = warehouse.name
  }
  
  // 清空货架和货位
  row.rackId = undefined
  row.rackName = ''
  row.locationId = undefined
  row.locationName = ''
  
  // 加载该仓库的货架
  if (!rackOptionsMap.value[warehouseId]) {
    try {
      // 确保传递warehouseId参数
      const racks = await WarehouseRackApi.getWarehouseRackListByWarehouseId(warehouseId)
      rackOptionsMap.value[warehouseId] = racks || []
    } catch (error) {
      console.error(`加载仓库(${warehouseId})的货架失败:`, error)
      rackOptionsMap.value[warehouseId] = []
    }
  }
  
  // 检查冲突
  validateDistribution()
}

/** 处理货架变更 */
const handleRackChange = async (rackId, row) => {
  if (!rackId) return
  
  // 更新货架名称
  const rack = getRackOptions(row.warehouseId).find(r => r.id === rackId)
  if (rack) {
    row.rackName = rack.name
  }
  
  // 清空货位
  row.locationId = undefined
  row.locationName = ''
  
  // 加载该货架的货位
  if (!locationOptionsMap.value[rackId]) {
    try {
      const locations = await WarehouseLocationApi.getWarehouseLocationListByRackId(rackId)
      locationOptionsMap.value[rackId] = locations || []
      
      // 保存货位上限信息
      locations.forEach(location => {
        if (location.id && location.maxStock) {
          locationMaxStockMap.value.set(location.id, location.maxStock)
        }
      })
    } catch (error) {
      console.error(`加载货架(${rackId})的货位失败:`, error)
      locationOptionsMap.value[rackId] = []
    }
  }
  
  // 检查冲突
  validateDistribution()
}

/** 处理货位变更 */
const handleLocationChange = (locationId, row) => {
  if (!locationId) return
  
  // 更新货位名称
  const location = getLocationOptions(row.rackId).find(l => l.id === locationId)
  if (location) {
    row.locationName = location.name
  }
  
  // 检查库位上限
  validateLocationMaxStock(row)
  
  // 检查冲突
  validateDistribution()
}

/** 获取库位当前库存 */
const getLocationCurrentStock = (location) => {
  if (!location || !location.warehouseId) return 0
  
  // 如果是退货，不需要考虑当前库存
  return 0
}

/** 获取库位最大允许库存 */
const getLocationMaxStock = (locationId) => {
  if (!locationId) return 0
  return locationMaxStockMap.value.get(locationId) || 0
}

/** 获取最大允许数量 */
const getMaxAllowedCount = (row, item) => {
  // 未分配数量 + 当前行数量
  return getUndistributedCount(item) + Number(row.count || 0)
}

/** 获取指定仓库ID的货架选项 */
const getRackOptions = (warehouseId) => {
  return rackOptionsMap.value[warehouseId] || []
}

/** 获取指定货架ID的货位选项 */
const getLocationOptions = (rackId) => {
  return locationOptionsMap.value[rackId] || []
}

/** 表单校验 */
const validate = () => {
  // 检查每个商品的退货数量是否小于等于库存数量
  const invalidCount = formData.value.some(item => {
    return item.stockCount !== undefined && Number(item.count) > Number(item.stockCount)
  })
  
  if (invalidCount) {
    message.warning('存在退货数量大于库存数量的商品，请修正后再提交')
    return Promise.reject('存在退货数量大于库存数量的商品')
  }
  
  // 移除批次必填检查
  // 不再检查批次信息
  
  return formRef.value.validate()
}

/** 初始化 */
onMounted(async () => {
  warehouseList.value = await WarehouseApi.getWarehouseSimpleList()
  defaultWarehouse.value = warehouseList.value.find((item) => item.defaultStatus)
  
  // 加载货架和货位列表
  try {
    // 不要直接加载所有货架，而是在选择仓库后按需加载
    // rackList.value = await WarehouseRackApi.getWarehouseRackSimpleList()
    
    // 预加载所有货位
    const allLocations = await WarehouseLocationApi.getWarehouseLocationSimpleList()
    locationList.value = allLocations || []
    
    // 按货架ID组织货位
    locationList.value.forEach(location => {
      if (location.rackId) {
        if (!locationOptionsMap.value[location.rackId]) {
          locationOptionsMap.value[location.rackId] = []
        }
        locationOptionsMap.value[location.rackId].push(location)
      }
      
      // 保存货位上限库存信息
      if (location.id && location.maxStock) {
        locationMaxStockMap.value.set(location.id, location.maxStock)
      }
    })
  } catch (error) {
    console.error('加载货架或货位列表失败:', error)
  }
})

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

/** 处理仓库位置变更 */
const onChangeWarehouseLocation = (location, row) => {
  // 加载库存
  if (location.warehouseId && row.productId) {
    setStockCount(row)
  }
}

/** 添加批次变更处理函数 */
const handleBatchChange = async (batchNumber, row) => {
  if (!batchNumber) return
  
  // 根据批次号获取该批次的库存信息
  try {
    const batchInfo = row.availableBatches.find(b => b.batchNumber === batchNumber)
    if (batchInfo) {
      // 更新相关信息
      row.stockCount = batchInfo.stockCount || 0
      row.productPrice = batchInfo.purchasePrice || row.productPrice // 使用该批次的采购价
      
      // 如果已经有库位分配，更新批次信息
      if (row.returnLocations && row.returnLocations.length > 0) {
        row.returnLocations.forEach(loc => {
          loc.batchNumber = batchNumber
        })
      }
    }
  } catch (error) {
    console.error('获取批次库存信息失败:', error)
  }
}

defineExpose({ validate })
</script>
