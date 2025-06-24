<template>
  <el-form-item :label="label" :prop="prop" :rules="rules" class="mb-0px!">
    <div class="warehouse-location-selector">
      <!-- 仓库选择 -->
      <el-select
        v-model="selectedWarehouseId"
        :placeholder="warehousePlaceholder"
        clearable
        filterable
        :disabled="disabled || warehouseDisabled"
        class="selector-item"
        @change="handleWarehouseChange"
      >
        <el-option
          v-for="item in warehouseList"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>

      <!-- 货架选择 -->
      <el-select
        v-if="showRack"
        v-model="selectedRackId"
        :placeholder="rackPlaceholder"
        clearable
        filterable
        :disabled="disabled || rackDisabled || !selectedWarehouseId"
        class="selector-item"
        @change="handleRackChange"
      >
        <el-option
          v-for="item in rackList"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>

      <!-- 货位选择 -->
      <el-select
        v-if="showLocation"
        v-model="selectedLocationId"
        :placeholder="locationPlaceholder"
        clearable
        filterable
        :disabled="disabled || locationDisabled || !selectedRackId"
        class="selector-item"
        @change="handleLocationChange"
      >
        <el-option
          v-for="item in locationList"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
    </div>
  </el-form-item>
</template>

<script setup lang="ts">
import { WarehouseApi, WarehouseVO } from '@/api/erp/stock/warehouse'
import { WarehouseRackApi, WarehouseRackVO } from '@/api/erp/stock/warehouse/rack'
import { WarehouseLocationApi, WarehouseLocationVO } from '@/api/erp/stock/warehouse/location'

const props = defineProps({
  // 表单属性
  label: {
    type: String,
    default: '仓库位置'
  },
  prop: {
    type: String,
    default: ''
  },
  rules: {
    type: Array,
    default: () => []
  },
  // 组件配置
  showRack: {
    type: Boolean,
    default: true
  },
  showLocation: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  warehouseDisabled: {
    type: Boolean,
    default: false
  },
  rackDisabled: {
    type: Boolean,
    default: false
  },
  locationDisabled: {
    type: Boolean,
    default: false
  },
  // 占位符
  warehousePlaceholder: {
    type: String,
    default: '请选择仓库'
  },
  rackPlaceholder: {
    type: String,
    default: '请选择货架'
  },
  locationPlaceholder: {
    type: String,
    default: '请选择货位'
  },
  // 默认值
  warehouseId: {
    type: Number,
    default: undefined
  },
  rackId: {
    type: Number,
    default: undefined
  },
  locationId: {
    type: Number,
    default: undefined
  }
})

const emit = defineEmits([
  'update:warehouseId',
  'update:rackId',
  'update:locationId',
  'change',
  'warehouse-change',
  'rack-change',
  'location-change'
])

// 数据列表
const warehouseList = ref<WarehouseVO[]>([])
const rackList = ref<WarehouseRackVO[]>([])
const locationList = ref<WarehouseLocationVO[]>([])

// 选中的值
const selectedWarehouseId = ref<number | undefined>(props.warehouseId)
const selectedRackId = ref<number | undefined>(props.rackId)
const selectedLocationId = ref<number | undefined>(props.locationId)

// 监听外部传入的值变化
watch(() => props.warehouseId, (val) => {
  selectedWarehouseId.value = val
  if (val) {
    loadRacks(val)
  } else {
    rackList.value = []
    selectedRackId.value = undefined
    locationList.value = []
    selectedLocationId.value = undefined
  }
})

watch(() => props.rackId, (val) => {
  selectedRackId.value = val
  if (val) {
    loadLocations(val)
  } else {
    locationList.value = []
    selectedLocationId.value = undefined
  }
})

watch(() => props.locationId, (val) => {
  selectedLocationId.value = val
})

// 处理仓库变化
const handleWarehouseChange = (warehouseId: number | undefined) => {
  emit('update:warehouseId', warehouseId)
  emit('warehouse-change', warehouseId)
  
  // 重置货架和货位
  selectedRackId.value = undefined
  emit('update:rackId', undefined)
  selectedLocationId.value = undefined
  emit('update:locationId', undefined)
  
  // 加载货架列表
  if (warehouseId) {
    loadRacks(warehouseId)
  } else {
    rackList.value = []
    locationList.value = []
  }
  
  emitChange()
}

// 处理货架变化
const handleRackChange = (rackId: number | undefined) => {
  emit('update:rackId', rackId)
  emit('rack-change', rackId)
  
  // 重置货位
  selectedLocationId.value = undefined
  emit('update:locationId', undefined)
  
  // 加载货位列表
  if (rackId) {
    loadLocations(rackId)
  } else {
    locationList.value = []
  }
  
  emitChange()
}

// 处理货位变化
const handleLocationChange = (locationId: number | undefined) => {
  emit('update:locationId', locationId)
  emit('location-change', locationId)
  
  emitChange()
}

// 发送整体变更事件
const emitChange = () => {
  emit('change', {
    warehouseId: selectedWarehouseId.value,
    rackId: selectedRackId.value,
    locationId: selectedLocationId.value
  })
}

// 加载仓库列表
const loadWarehouses = async () => {
  try {
    warehouseList.value = await WarehouseApi.getWarehouseSimpleList()
  } catch (error) {
    console.error('加载仓库列表失败:', error)
  }
}

// 加载货架列表
const loadRacks = async (warehouseId: number) => {
  try {
    rackList.value = await WarehouseRackApi.getWarehouseRackSimpleList(warehouseId)
  } catch (error) {
    console.error('加载货架列表失败:', error)
    rackList.value = []
  }
}

// 加载货位列表
const loadLocations = async (rackId: number) => {
  try {
    locationList.value = await WarehouseLocationApi.getWarehouseLocationSimpleList(rackId)
  } catch (error) {
    console.error('加载货位列表失败:', error)
    locationList.value = []
  }
}

// 初始化
onMounted(async () => {
  await loadWarehouses()
  
  // 如果有默认值，加载对应的级联数据
  if (props.warehouseId) {
    await loadRacks(props.warehouseId)
    if (props.rackId) {
      await loadLocations(props.rackId)
    }
  }
})

// 对外暴露方法
defineExpose({
  reset: () => {
    selectedWarehouseId.value = undefined
    selectedRackId.value = undefined
    selectedLocationId.value = undefined
    rackList.value = []
    locationList.value = []
    emit('update:warehouseId', undefined)
    emit('update:rackId', undefined)
    emit('update:locationId', undefined)
    emitChange()
  },
  setWarehouse: async (warehouseId: number) => {
    selectedWarehouseId.value = warehouseId
    emit('update:warehouseId', warehouseId)
    if (warehouseId) {
      await loadRacks(warehouseId)
    }
    emitChange()
  },
  setRack: async (rackId: number) => {
    selectedRackId.value = rackId
    emit('update:rackId', rackId)
    if (rackId) {
      await loadLocations(rackId)
    }
    emitChange()
  },
  setLocation: (locationId: number) => {
    selectedLocationId.value = locationId
    emit('update:locationId', locationId)
    emitChange()
  }
})
</script>

<style scoped>
.warehouse-location-selector {
  display: flex;
  gap: 5px;
  width: 100%;
}

.selector-item {
  min-width: 80px;
  flex: 1;
}
</style> 