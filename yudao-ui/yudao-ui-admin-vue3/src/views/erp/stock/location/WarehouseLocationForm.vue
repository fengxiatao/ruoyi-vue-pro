<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="所属仓库" prop="warehouseId">
        <el-select
          v-model="formData.warehouseId"
          placeholder="请选择所属仓库"
          clearable
          class="!w-240px"
          @change="handleWarehouseChange"
          :disabled="!!presetWarehouseId"
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
          v-model="formData.rackId"
          placeholder="请选择所属货架"
          clearable
          class="!w-240px"
          :disabled="!formData.warehouseId || !!presetRackId"
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
        <el-input v-model="formData.code" placeholder="请输入货位编码" />
        <div class="text-gray-400 text-xs mt-1">
          保存后将自动添加货架编码前缀，例如：仓库编码-货架编码-货位编码
        </div>
      </el-form-item>
      <el-form-item label="货位名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入货位名称" />
      </el-form-item>
      <el-form-item label="容量" prop="capacity">
        <el-input-number v-model="formData.capacity" :min="0" controls-position="right" class="!w-150px" />
        <el-select
          v-model="formData.unitId"
          placeholder="请选择单位"
          clearable
          class="ml-10px !w-80px"
        >
          <el-option
            v-for="item in unitList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="formData.sort" :min="0" :max="9999" controls-position="right" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" type="textarea" placeholder="请输入备注" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { WarehouseApi } from '@/api/erp/stock/warehouse'
import { WarehouseRackApi } from '@/api/erp/stock/warehouse/rack'
import { WarehouseLocationApi, WarehouseLocationVO } from '@/api/erp/stock/warehouse/location'
import { ProductUnitApi } from '@/api/erp/product/unit'

/** ERP 货位表单 */
defineOptions({ name: 'WarehouseLocationForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const presetWarehouseId = ref<number | undefined>(undefined) // 预设的仓库ID
const presetRackId = ref<number | undefined>(undefined) // 预设的货架ID
const formData = ref<WarehouseLocationVO>({
  id: undefined,
  warehouseId: undefined,
  rackId: undefined,
  code: '',
  name: '',
  capacity: 0,
  unitId: undefined,
  sort: 0,
  status: 0,
  remark: ''
})
const formRules = reactive({
  warehouseId: [{ required: true, message: '所属仓库不能为空', trigger: 'blur' }],
  rackId: [{ required: true, message: '所属货架不能为空', trigger: 'blur' }],
  code: [{ required: true, message: '货位编码不能为空', trigger: 'blur' }],
  name: [{ required: true, message: '货位名称不能为空', trigger: 'blur' }],
  capacity: [{ required: true, message: '容量不能为空', trigger: 'blur' }],
  unitId: [{ required: true, message: '容量单位不能为空', trigger: 'blur' }],
  sort: [{ required: true, message: '排序不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref
const warehouseList = ref([]) // 仓库列表
const rackList = ref([]) // 货架列表
const unitList = ref([]) // 单位列表

/** 打开弹窗 */
const open = async (type: string, id?: number, warehouseId?: number, rackId?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  
  // 设置预设仓库ID和货架ID
  presetWarehouseId.value = warehouseId
  presetRackId.value = rackId
  
  if (warehouseId) {
    formData.value.warehouseId = warehouseId
    await loadRackList(warehouseId)
  }
  
  if (rackId) {
    formData.value.rackId = rackId
  }
  
  // 加载仓库列表
  await loadWarehouseList()
  
  // 加载单位列表
  await loadUnitList()
  
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await WarehouseLocationApi.getWarehouseLocation(id)
      // 加载货架列表
      if (formData.value.warehouseId) {
        await loadRackList(formData.value.warehouseId)
      }
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as WarehouseLocationVO
    if (formType.value === 'create') {
      await WarehouseLocationApi.createWarehouseLocation(data)
      message.success(t('common.createSuccess'))
    } else {
      await WarehouseLocationApi.updateWarehouseLocation(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 处理仓库变更 */
const handleWarehouseChange = async (warehouseId) => {
  formData.value.rackId = undefined
  if (warehouseId) {
    await loadRackList(warehouseId)
  } else {
    rackList.value = []
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    warehouseId: presetWarehouseId.value,
    rackId: presetRackId.value,
    code: '',
    name: '',
    capacity: 0,
    unitId: undefined,
    sort: 0,
    status: 0,
    remark: ''
  }
  formRef.value?.resetFields()
  if (!presetWarehouseId.value) {
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

/** 加载单位列表 */
const loadUnitList = async () => {
  try {
    unitList.value = await ProductUnitApi.getProductUnitSimpleList()
  } catch (error) {
    console.error('加载单位列表失败:', error)
    unitList.value = []
  }
}
</script> 