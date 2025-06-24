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
            :prop="`${$index}.inLocations`"
            :rules="formRules.inLocations"
            class="mb-0px!"
          >
            <!-- 已完成库位分配的情况下直接显示库位信息，不显示选择器 -->
            <template v-if="row.inLocations && row.inLocations.length > 0">
              <div class="flex flex-col">
                <div v-for="(loc, idx) in row.inLocations" :key="idx" class="mb-5px">
                  <el-tag size="small" class="mr-5px">{{ loc.warehouseName }}</el-tag>
                  <el-tag size="small" type="info" v-if="loc.rackName" class="mr-5px">{{ loc.rackName }}</el-tag>
                  <el-tag size="small" type="success" v-if="loc.locationName" class="mr-5px">{{ loc.locationName }}</el-tag>
                  <span class="text-sm ml-5px">{{ loc.count }}</span>
                  <el-tag size="small" type="warning" v-if="loc.batchNumber" class="ml-5px">批次: {{ loc.batchNumber }}</el-tag>
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
        label="原数量"
        fixed="right"
        min-width="80"
        v-if="formData && formData.length > 0 && formData[0].totalCount != null"
      >
        <template #default="{ row }">
          <el-form-item class="mb-0px!">
            <el-input disabled v-model="row.totalCount" :formatter="erpCountInputFormatter" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column
        label="已入库"
        fixed="right"
        min-width="80"
        v-if="formData && formData.length > 0 && formData[0].inCount != null"
      >
        <template #default="{ row }">
          <el-form-item class="mb-0px!">
            <el-input disabled v-model="row.inCount" :formatter="erpCountInputFormatter" />
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
              @change="handleLocationCountChange($event, row)"
              @blur="handleLocationBlur(row)"
              @keyup.enter="handleEnterKey(row)"
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
      <el-table-column label="批次管理" min-width="150">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="openBatchDialog(row)">
            {{ hasBatchInfo(row) ? '查看批次信息' : '添加批次信息' }}
          </el-button>
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
          <template v-if="row.inLocations && row.inLocations.length > 0">
            <div v-for="(loc, idx) in row.inLocations" :key="idx" class="mb-5px">
              <el-tag size="small" class="mr-5px">{{ loc.warehouseName }}</el-tag>
              <el-tag size="small" type="info" v-if="loc.rackName" class="mr-5px">{{ loc.rackName }}</el-tag>
              <el-tag size="small" type="success" v-if="loc.locationName" class="mr-5px">{{ loc.locationName }}</el-tag>
              <span class="text-sm ml-5px">{{ loc.count }}</span>
              <el-tag size="small" type="warning" v-if="loc.batchNumber" class="ml-5px">批次: {{ loc.batchNumber }}</el-tag>
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
        label="原数量"
        fixed="right"
        min-width="80"
        v-if="formData && formData.length > 0 && formData[0].totalCount != null"
      >
        <template #default="{ row }">
          {{ erpCountInputFormatter(row.totalCount) }}
        </template>
      </el-table-column>
      <el-table-column
        label="已入库"
        fixed="right"
        min-width="80"
        v-if="formData && formData.length > 0 && formData[0].inCount != null"
      >
        <template #default="{ row }">
          {{ erpCountInputFormatter(row.inCount) }}
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
      <el-table-column label="批次信息" min-width="180">
        <template #default="{ row }">
          <div v-if="hasBatchInfo(row)">
            <div><strong>批次号:</strong> {{ row.batchNumber }}</div>
            <div v-if="row.productionDate"><strong>生产日期:</strong> {{ formatDate(row.productionDate) }}</div>
            <div v-if="row.expiryDate"><strong>过期日期:</strong> {{ formatDate(row.expiryDate) }}</div>
          </div>
          <div v-else>无批次信息</div>
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
      title="库位分配"
      width="800px"
      append-to-body
    >
      <div v-if="currentItem">
        <div class="mb-10px flex justify-between items-center">
          <div>
            <span class="font-bold">{{ currentItem.productName }}</span>
            <span class="ml-10px">总入库数量: {{ currentItem.count }}</span>
            <span class="ml-10px">已分配: {{ getTotalDistributedCount(currentItem) }}</span>
            <span class="ml-10px">未分配: {{ getUndistributedCount(currentItem) }}</span>
          </div>
          <el-button type="primary" @click="addNewLocation" :disabled="getUndistributedCount(currentItem) <= 0">
            添加库位
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
        
        <!-- 入库分配 -->
        <div class="text-lg font-bold mb-5px">入库分配</div>
        <el-table :data="currentItem.inLocations || []" border>
          <el-table-column label="仓库" min-width="120">
            <template #default="{ row }">
              <el-select 
                v-model="row.warehouseId" 
                filterable 
                placeholder="选择仓库"
                @change="handleWarehouseChange($event, row)"
              >
                <el-option 
                  v-for="item in warehouseList" 
                  :key="item.id" 
                  :label="item.name" 
                  :value="item.id"
                />
              </el-select>
            </template>
          </el-table-column>
          
          <el-table-column label="货架" min-width="120">
            <template #default="{ row }">
              <el-select 
                v-model="row.rackId" 
                filterable 
                placeholder="选择货架" 
                :disabled="!row.warehouseId"
                @change="handleRackChange($event, row)"
              >
                <el-option 
                  v-for="item in getRackOptions(row.warehouseId)" 
                  :key="item.id" 
                  :label="item.name" 
                  :value="item.id"
                />
              </el-select>
            </template>
          </el-table-column>
          
          <el-table-column label="货位" min-width="120">
            <template #default="{ row }">
              <el-select 
                v-model="row.locationId" 
                filterable 
                placeholder="选择货位" 
                :disabled="!row.rackId"
                @change="handleLocationChange($event, row)"
              >
                <el-option 
                  v-for="item in getLocationOptions(row.rackId)" 
                  :key="item.id" 
                  :label="item.name" 
                  :value="item.id"
                />
              </el-select>
            </template>
          </el-table-column>
          
          <el-table-column label="批次号" min-width="120">
            <template #default="{ row }">
              <el-select 
                v-model="row.batchNumber" 
                filterable 
                allow-create
                default-first-option
                placeholder="选择或创建批次号"
              >
                <el-option 
                  v-for="item in batchOptions" 
                  :key="item"
                  :label="item" 
                  :value="item"
                />
              </el-select>
            </template>
          </el-table-column>
          
          <el-table-column label="当前库存" min-width="100">
            <template #default="{ row }">
              <span>{{ getLocationCurrentStock(row) }}</span>
            </template>
          </el-table-column>
          
          <el-table-column label="上限" min-width="100">
            <template #default="{ row }">
              <span>{{ getLocationMaxStock(row.locationId) || '无限制' }}</span>
            </template>
          </el-table-column>
          
          <el-table-column label="入库数量" min-width="120">
            <template #default="{ row }">
              <el-input-number 
                v-model="row.count" 
                :min="0.001" 
                :max="getMaxAllowedCount(row, currentItem)" 
                :precision="3"
                controls-position="right"
                @change="handleLocationCountChange($event, row)"
              />
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="80" fixed="right">
            <template #default="{ $index }">
              <el-button link type="danger" @click="removeLocation($index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <div v-if="locationConflicts.length > 0" class="mt-10px text-red-500">
          <div v-for="(conflict, index) in locationConflicts" :key="index">
            警告: {{ conflict }}
          </div>
        </div>
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
    
    <!-- 批次信息对话框 -->
    <el-dialog
      v-model="batchDialogVisible"
      :title="hasBatchInfo(currentBatchItem) ? '编辑批次信息' : '添加批次信息'"
      width="600px"
      append-to-body
    >
      <template v-if="currentBatchItem">
        <BatchInfoForm :formData="currentBatchItem" :disabled="disabled" ref="batchFormRef" />
      </template>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="batchDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="confirmBatchInfo"
            :disabled="disabled"
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
import { WarehouseRackApi } from '@/api/erp/stock/warehouse/rack'
import { WarehouseLocationApi } from '@/api/erp/stock/warehouse/location'
import { useMessage } from '@/hooks/web/useMessage'
import { ProductSkuStockApi } from '@/api/mall/product/sku-stock'
import { formatDate } from '@/utils/formatTime'
import BatchInfoForm from './BatchInfoForm.vue'

interface FormDataItem {
  id?: number
  productId?: number
  productName?: string
  productUnitName?: string
  productBarCode?: string
  productPrice?: number
  stockCount?: number
  count: number
  totalCount?: number
  inCount?: number
  totalProductPrice?: number
  taxPercent?: number
  taxPrice?: number
  totalPrice?: number
  remark?: string
  warehouseId?: number
  rackId?: number
  locationId?: number
  inLocations: LocationItem[]
  stockDistribution?: StockDistributionItem[]
  // 批次相关
  batchNumber?: string
  productionDate?: number
  expiryDate?: number
  qualityStatus?: number
  batchRemark?: string
}

interface LocationItem {
  warehouseId?: number
  warehouseName?: string
  rackId?: number
  rackName?: string
  locationId?: number
  locationName?: string
  count: number
  batchNumber?: string
}

interface StockDistributionItem {
  warehouseId: number
  warehouseName: string
  rackId?: number
  rackName?: string
  locationId?: number
  locationName?: string
  count: number
}

const props = defineProps<{
  items: FormDataItem[]
  disabled: boolean
}>()

const formLoading = ref(false)
const formData = ref<FormDataItem[]>([])
const formRules = reactive({
  inLocations: [{ 
    validator: (_rule: any, value: LocationItem[], callback: Function) => {
      if (!value || value.length === 0) {
        callback(new Error('请完成库位分配'))
      } else {
        callback()
      }
    }, 
    trigger: 'blur' 
  }],
  productId: [{ required: true, message: '产品不能为空', trigger: 'blur' }],
  count: [{ required: true, message: '产品数量不能为空', trigger: 'blur' }]
})

const formRef = ref()
const warehouseList = ref<WarehouseVO[]>([])
const defaultWarehouse = ref<WarehouseVO | null>(null)
const rackList = ref<any[]>([])
const locationList = ref<any[]>([])
const message = useMessage()

// 库位分配相关
const distributionDialogVisible = ref(false)
const currentItem = ref<FormDataItem | null>(null)
const rackOptionsMap = ref<Record<number, any[]>>({})
const locationOptionsMap = ref<Record<number, any[]>>({})
const locationMaxStockMap = ref(new Map<number, number>())
const locationConflicts = ref<string[]>([])
const isDistributionValid = ref(true)
const batchOptions = ref<string[]>([])

// 批次管理相关
const batchDialogVisible = ref(false)
const currentBatchItem = ref<FormDataItem | null>(null)
const batchFormRef = ref()

// 验证定时器
const validateTimer = ref<number | null>(null)

/** 初始化设置入库项 */
watch(
  () => props.items,
  async (val) => {
    if (!val) return
    
    const items = val.map(item => {
      // 深拷贝防止引用问题
      const newItem = { ...item }
      
      // 初始化入库位置数组
      if (!newItem.inLocations) {
        newItem.inLocations = []
      }
      
      if (newItem.warehouseId == null && defaultWarehouse.value) {
        newItem.warehouseId = defaultWarehouse.value.id
      }
      
      if (newItem.stockCount === null && newItem.warehouseId != null) {
        setStockCount(newItem)
      }
      
      return newItem
    })
    
    formData.value = items
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
      if (item) {
        item.totalProductPrice = erpPriceMultiply(item.productPrice || 0, item.count)
        item.taxPrice = erpPriceMultiply(item.totalProductPrice || 0, (item.taxPercent || 0) / 100.0)
        if (item.totalProductPrice != null) {
          item.totalPrice = item.totalProductPrice + (item.taxPrice || 0)
        } else {
          item.totalPrice = undefined
        }
      }
    })
  },
  { deep: true }
)

/** 合计 */
const getSummaries = (param: any) => {
  const { columns, data } = param
  const sums: string[] = []
  columns.forEach((column: any, index: number) => {
    if (index === 0) {
      sums[index] = '合计'
      return
    }
    if (['count', 'totalProductPrice', 'taxPrice', 'totalPrice'].includes(column.property)) {
      const sum = getSumValue(data.map((item: any) => Number(item[column.property])))
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
  const row: FormDataItem = {
    id: undefined,
    productId: undefined,
    productUnitName: undefined,
    productBarCode: undefined,
    productPrice: undefined,
    stockCount: undefined,
    count: 1,
    totalProductPrice: undefined,
    taxPercent: undefined,
    taxPrice: undefined,
    totalPrice: undefined,
    remark: undefined,
    inLocations: []
  }
  formData.value.push(row)
}

/** 删除按钮操作 */
const handleDelete = (index: number) => {
  formData.value.splice(index, 1)
}

/** 加载库存 */
const setStockCount = async (row: FormDataItem) => {
  if (!row.productId) {
    return
  }
  try {
    const count = await StockApi.getStockCount(row.productId)
    row.stockCount = count || 0
  } catch (error) {
    console.error('获取库存数量失败:', error)
    row.stockCount = 0
  }
}

/** 打开库位分配对话框 */
const openDistributionDialog = (row: FormDataItem) => {
  currentItem.value = row
  // 确保有入库位置数组
  if (!row.inLocations) {
    row.inLocations = []
    
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
      
      // 添加初始分配记录
      row.inLocations.push({
        warehouseId: row.warehouseId,
        warehouseName,
        rackId: row.rackId,
        rackName,
        locationId: row.locationId,
        locationName,
        count: row.count, // 初始全部分配到这一个库位
        batchNumber: row.batchNumber // 传递批次号
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
  
  // 检查是否分配完全 - 使用更宽松的精度比较，避免浮点数误差
  // 增加容错度到0.005，允许更大的误差范围
  isDistributionValid.value = Math.abs(totalDistributed - totalCount) < 0.005
  
  // 在控制台输出调试信息
  console.log('验证分配:', {
    totalDistributed,
    totalCount,
    isValid: isDistributionValid.value,
    diff: Math.abs(totalDistributed - totalCount),
    inLocations: currentItem.value.inLocations
  })
  
  // 检查每个库位是否有冲突
  checkAllLocationConflicts()
}

/** 获取已分配总数 */
const getTotalDistributedCount = (row: FormDataItem): number => {
  if (!row || !row.inLocations || row.inLocations.length === 0) return 0
  
  // 使用字符串累加后转换为数字，避免浮点数精度问题
  let totalStr = '0'
  row.inLocations.forEach(loc => {
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
    inLocations: currentItem.value.inLocations
  })
  
  // 自动修正微小差异
  const totalDistributed = getTotalDistributedCount(currentItem.value)
  const totalCount = Number(currentItem.value.count || 0)
  const diff = Math.abs(totalDistributed - totalCount)
  
  // 如果差异很小(小于0.05)，尝试自动修正最后一个库位的数量
  if (diff > 0 && diff < 0.05 && currentItem.value.inLocations && currentItem.value.inLocations.length > 0) {
    const lastLocation = currentItem.value.inLocations[currentItem.value.inLocations.length - 1]
    if (lastLocation.count) {
      // 计算调整后的值
      const adjustedValue = Number(lastLocation.count) + (totalCount - totalDistributed)
      // 仅当调整值为正数时才应用
      if (adjustedValue > 0) {
        lastLocation.count = Number(adjustedValue.toFixed(3))
        // 重新验证
        validateDistribution()
        console.log('自动调整后:', {
          adjustedLocation: lastLocation,
          totalNow: getTotalDistributedCount(currentItem.value)
        })
      }
    }
  }
  
  if (!isDistributionValid.value) {
    message.warning(`分配数量(${totalDistributed})与入库数量(${totalCount})不一致，差额: ${diff.toFixed(3)}`)
    return
  }
  
  if (locationConflicts.value.length > 0) {
    message.warning('存在库位冲突，请修正后再确认')
    return
  }
  
  distributionDialogVisible.value = false
}

/** 处理库位数量变更 */
const handleLocationCountChange = (_value: number, _row: LocationItem) => {
  // 延迟验证以减少频繁计算
  if (validateTimer.value) {
    clearTimeout(validateTimer.value)
  }
  validateTimer.value = window.setTimeout(() => {
    validateDistribution()
  }, 300)
}

/** 处理库位输入框失去焦点 */
const handleLocationBlur = (_row: LocationItem) => {
  // 立即验证，确保用户完成输入后立即得到反馈
  if (validateTimer.value) {
    clearTimeout(validateTimer.value)
  }
  validateDistribution()
}

/** 处理回车键按下事件 */
const handleEnterKey = (_row: LocationItem) => {
  // 立即验证，并尝试自动聚焦到下一个输入框或确认按钮
  if (validateTimer.value) {
    clearTimeout(validateTimer.value)
  }
  validateDistribution()
  
  // 如果是最后一个输入框且验证通过，可以尝试自动点击确认按钮
  if (isDistributionValid.value && !locationConflicts.value.length) {
    // 可选：如果是最后一个库位，自动聚焦到确认按钮
    const confirmButton = document.querySelector('.dialog-footer .el-button--primary')
    if (confirmButton && 'focus' in confirmButton) {
      setTimeout(() => {
        (confirmButton as HTMLElement).focus()
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
  
  currentItem.value.inLocations.push({
    warehouseId: defaultWarehouse.value?.id,
    warehouseName: defaultWarehouse.value?.name,
    rackId: undefined,
    rackName: '',
    locationId: undefined,
    locationName: '',
    count: countToAdd, // 使用精确计算的未分配数量
    batchNumber: currentItem.value.batchNumber // 使用当前选择的批次号
  })
  
  // 验证更新后的分配情况
  validateDistribution()
}

/** 选择已有库位 */
const selectExistingLocation = (stockRow: StockDistributionItem) => {
  if (!currentItem.value) return
  
  const undistributedCount = getUndistributedCount(currentItem.value)
  if (undistributedCount <= 0) {
    message.warning('已无可分配数量')
    return
  }
  
  // 检查是否已添加该库位
  const existingIndex = currentItem.value.inLocations.findIndex(loc => 
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
  currentItem.value.inLocations.push({
    warehouseId: stockRow.warehouseId,
    warehouseName: stockRow.warehouseName,
    rackId: stockRow.rackId,
    rackName: stockRow.rackName,
    locationId: stockRow.locationId,
    locationName: stockRow.locationName,
    count: undistributedCount,
    batchNumber: currentItem.value.batchNumber // 使用当前选择的批次号
  })
  
  // 检查库位上限，如果需要则调整数量
  const newLocation = currentItem.value.inLocations[currentItem.value.inLocations.length - 1]
  validateLocationMaxStock(newLocation)
  
  // 检查库位冲突
  checkLocationConflict(newLocation)
}

/** 移除库位 */
const removeLocation = (index: number) => {
  if (!currentItem.value || !currentItem.value.inLocations) return
  currentItem.value.inLocations.splice(index, 1)
  validateDistribution()
}

/** 获取未分配数量 */
const getUndistributedCount = (row: FormDataItem): number => {
  if (!row || !row.count) return 0
  
  const totalDistributed = getTotalDistributedCount(row)
  return Math.max(0, Number(row.count) - totalDistributed)
}

/** 处理仓库变更 */
const handleWarehouseChange = async (warehouseId: number, row: LocationItem) => {
  row.rackId = undefined
  row.rackName = ''
  row.locationId = undefined
  row.locationName = ''
  
  // 设置仓库名称
  const warehouse = warehouseList.value.find(item => item.id === warehouseId)
  if (warehouse) {
    row.warehouseName = warehouse.name
  }
  
  // 获取该仓库下的货架
  if (warehouseId && !rackOptionsMap.value[warehouseId]) {
    try {
      const racks = await WarehouseRackApi.getWarehouseRackSimpleList(warehouseId)
      rackOptionsMap.value[warehouseId] = racks || []
    } catch (error) {
      console.error('获取货架列表失败:', error)
      rackOptionsMap.value[warehouseId] = []
    }
  }
}

/** 处理货架变更 */
const handleRackChange = async (rackId: number, row: LocationItem) => {
  row.locationId = undefined
  row.locationName = ''
  
  // 设置货架名称
  const rack = getRackOptions(row.warehouseId || 0).find(item => item.id === rackId)
  if (rack) {
    row.rackName = rack.name
  }
  
  // 获取该货架下的货位
  if (rackId && !locationOptionsMap.value[rackId]) {
    try {
      const locations = await WarehouseLocationApi.getWarehouseLocationSimpleList(rackId)
      locationOptionsMap.value[rackId] = locations || []
      
      // 保存货位上限库存信息
      locations.forEach(location => {
        if (location.id && location.maxStock) {
          locationMaxStockMap.value.set(location.id, location.maxStock)
        }
      })
    } catch (error) {
      console.error('获取货位列表失败:', error)
      locationOptionsMap.value[rackId] = []
    }
  }
}

/** 处理货位变更 */
const handleLocationChange = async (locationId: number, row: LocationItem) => {
  // 设置货位名称
  const location = getLocationOptions(row.rackId || 0).find(item => item.id === locationId)
  if (location) {
    row.locationName = location.name
  }
  
  // 检查库位冲突
  await checkLocationConflict(row)
  
  // 验证库位上限
  validateLocationMaxStock(row)
}

/** 检查库位冲突 */
const checkLocationConflict = async (row: LocationItem) => {
  if (!row.warehouseId || !row.rackId || !row.locationId || !currentItem.value) return
  
  try {
    // 首先检查是否是当前SKU已占用的库位
    const isCurrentSkuLocation = currentItem.value.stockDistribution && 
      currentItem.value.stockDistribution.some(stockItem => 
        stockItem.warehouseId === row.warehouseId && 
        stockItem.rackId === row.rackId && 
        stockItem.locationId === row.locationId
      )
    
    // 如果是当前SKU已占用的库位，则不视为冲突，只检查上限
    if (isCurrentSkuLocation) {
      // 清除可能存在的冲突信息
      const conflictMessage = `库位 ${row.warehouseName} > ${row.rackName} > ${row.locationName} 已被其他SKU占用`
      const conflictIndex = locationConflicts.value.findIndex(msg => msg === conflictMessage)
      if (conflictIndex !== -1) {
        locationConflicts.value.splice(conflictIndex, 1)
      }
      
      // 检查库位上限
      validateLocationMaxStock(row)
      return
    }
    
    // 如果不是当前SKU占用的库位，则调用API检查是否被其他SKU占用
    const result = await ProductSkuStockApi.checkDuplicateLocation({
      skuId: currentItem.value.productId,
      warehouseId: row.warehouseId,
      rackId: row.rackId,
      locationId: row.locationId
    })
    
    // 处理返回结果
    const isConflict = typeof result === 'boolean' ? result : false
    
    // 更新冲突列表
    const conflictMessage = `库位 ${row.warehouseName} > ${row.rackName} > ${row.locationName} 已被其他SKU占用`
    const conflictIndex = locationConflicts.value.findIndex(msg => msg === conflictMessage)
    
    if (isConflict) {
      if (conflictIndex === -1) {
        locationConflicts.value.push(conflictMessage)
      }
    } else if (conflictIndex !== -1) {
      locationConflicts.value.splice(conflictIndex, 1)
    }
  } catch (error) {
    console.error('检查库位冲突失败:', error)
  }
}

/** 检查所有库位冲突 */
const checkAllLocationConflicts = async () => {
  if (!currentItem.value || !currentItem.value.inLocations) return
  
  locationConflicts.value = []
  
  for (const location of currentItem.value.inLocations) {
    await checkLocationConflict(location)
  }
}

/** 验证库位上限 */
const validateLocationMaxStock = (row: LocationItem): boolean => {
  if (!row.locationId || !row.count) return true
  
  const maxStock = getLocationMaxStock(row.locationId)
  if (!maxStock) return true
  
  const currentStock = getLocationCurrentStock(row)
  const totalAfterIn = currentStock + Number(row.count)
  
  // 如果超过上限，自动调整数量到最大允许值
  if (totalAfterIn > maxStock) {
    const maxAllowed = Math.max(0, maxStock - currentStock)
    
    // 只在UI提示，不自动调整数量
    message.warning(`入库后库存(${totalAfterIn})将超过库位上限(${maxStock})，最多可入库${maxAllowed}`)
    
    return false
  }
  
  return true
}

/** 获取库位当前库存 */
const getLocationCurrentStock = (row: LocationItem): number => {
  if (!currentItem.value || !currentItem.value.stockDistribution || 
      !row.warehouseId || !row.locationId) return 0
  
  const stock = currentItem.value.stockDistribution.find(item => 
    item.warehouseId === row.warehouseId && 
    item.rackId === row.rackId && 
    item.locationId === row.locationId
  )
  
  return stock ? Number(stock.count) : 0
}

/** 获取库位上限库存 */
const getLocationMaxStock = (locationId: number): number | null => {
  if (!locationId) return null
  return locationMaxStockMap.value.get(locationId) || null
}

/** 获取最大允许入库数量 */
const getMaxAllowedCount = (row: LocationItem, item: FormDataItem): number => {
  // 未分配数量 + 当前行数量
  const baseMax = getUndistributedCount(item) + Number(row.count || 0)
  
  // 考虑库位上限
  const maxStock = getLocationMaxStock(row.locationId || 0)
  if (maxStock) {
    const currentStock = getLocationCurrentStock(row)
    const maxAllowed = Math.max(0, maxStock - currentStock)
    return Math.min(baseMax, maxAllowed)
  }
  
  return baseMax
}

/** 获取指定仓库ID的货架选项 */
const getRackOptions = (warehouseId: number): any[] => {
  return rackOptionsMap.value[warehouseId] || []
}

/** 获取指定货架ID的货位选项 */
const getLocationOptions = (rackId: number): any[] => {
  return locationOptionsMap.value[rackId] || []
}

/** 表单校验 */
const validate = () => {
  // 检查每个商品是否都已完成库位分配
  const notDistributed = formData.value.some(item => {
    return !item.inLocations || item.inLocations.length === 0 || 
           Math.abs(getTotalDistributedCount(item) - Number(item.count || 0)) >= 0.005
  })
  
  if (notDistributed) {
    message.warning('存在未完成库位分配的商品，请先完成库位分配')
    return Promise.reject('存在未完成库位分配的商品')
  }
  
  // 检查是否有库位冲突
  const hasConflict = formData.value.some(item => {
    if (!item.inLocations) return false
    
    // 仅检查是否有冲突
    return false
  })
  
  if (hasConflict) {
    message.warning('存在库位冲突，请修正后再提交')
    return Promise.reject('存在库位冲突')
  }
  
  return formRef.value.validate()
}

/** 初始化 */
onMounted(async () => {
  warehouseList.value = await WarehouseApi.getWarehouseSimpleList()
  defaultWarehouse.value = warehouseList.value.find((item) => item.defaultStatus) || null
  
  // 加载货架和货位列表
  try {
    // 预加载一些常用数据
    const allLocations = await WarehouseLocationApi.getWarehouseLocationSimpleList()
    locationList.value = allLocations || []
    
    // 保存货位上限库存信息
    locationList.value.forEach(location => {
      if (location.id && location.maxStock) {
        locationMaxStockMap.value.set(location.id, location.maxStock)
      }
    })
  } catch (error) {
    console.error('加载货架或货位列表失败:', error)
  }
})

/** 获取仓库名称 */
const getWarehouseName = (warehouseId?: number): string => {
  if (!warehouseId) return ''
  const warehouse = warehouseList.value.find(item => item.id === warehouseId)
  return warehouse ? warehouse.name : ''
}

/** 获取货架名称 */
const getRackName = (rackId?: number): string => {
  if (!rackId) return ''
  const rack = rackList.value.find(item => item.id === rackId)
  return rack ? rack.name : ''
}

/** 获取货位名称 */
const getLocationName = (locationId?: number): string => {
  if (!locationId) return ''
  const location = locationList.value.find(item => item.id === locationId)
  return location ? location.name : ''
}

/** 批次管理相关函数 */
const hasBatchInfo = (row: FormDataItem | null): boolean => {
  if (!row) return false
  return !!row.batchNumber
}

/** 打开批次信息对话框 */
const openBatchDialog = (row: FormDataItem) => {
  currentBatchItem.value = row
  batchDialogVisible.value = true
  
  // 加载现有批次号作为选项
  loadBatchOptions(row.productId)
}

/** 加载批次选项 */
const loadBatchOptions = async (productId?: number) => {
  if (!productId) return
  
  try {
    // 获取产品已有批次
    const batchList = await StockApi.getProductBatchList(productId)
    if (batchList && Array.isArray(batchList)) {
      batchOptions.value = batchList.map(item => item.batchNumber)
    }
  } catch (error) {
    console.error('获取批次列表失败:', error)
    batchOptions.value = []
  }
}

/** 确认批次信息 */
const confirmBatchInfo = async () => {
  if (!currentBatchItem.value) return
  
  try {
    // 验证批次表单
    await batchFormRef.value.validate()
    
    // 将批次信息应用到所有入库位置
    if (currentBatchItem.value.inLocations && currentBatchItem.value.inLocations.length > 0) {
      currentBatchItem.value.inLocations.forEach(loc => {
        loc.batchNumber = currentBatchItem.value?.batchNumber
      })
    }
    
    batchDialogVisible.value = false
  } catch (error) {
    console.error('批次信息验证失败:', error)
  }
}

defineExpose({ validate })
</script>
