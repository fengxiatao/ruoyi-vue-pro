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
      <el-form-item label="货架编码" prop="code">
        <el-input v-model="formData.code" placeholder="请输入货架编码" />
        <div class="text-gray-400 text-xs mt-1">
          保存后将自动添加仓库编码前缀，例如：仓库编码-货架编码
        </div>
      </el-form-item>
      <el-form-item label="货架名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入货架名称" />
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
import { WarehouseRackApi, WarehouseRackVO } from '@/api/erp/stock/warehouse/rack'

/** ERP 货架表单 */
defineOptions({ name: 'WarehouseRackForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const presetWarehouseId = ref<number | undefined>(undefined) // 预设的仓库ID
const formData = ref<WarehouseRackVO>({
  id: undefined,
  warehouseId: undefined,
  code: '',
  name: '',
  sort: 0,
  status: 0,
  remark: ''
})
const formRules = reactive({
  warehouseId: [{ required: true, message: '所属仓库不能为空', trigger: 'blur' }],
  code: [{ required: true, message: '货架编码不能为空', trigger: 'blur' }],
  name: [{ required: true, message: '货架名称不能为空', trigger: 'blur' }],
  sort: [{ required: true, message: '排序不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref
const warehouseList = ref([]) // 仓库列表

/** 打开弹窗 */
const open = async (type: string, id?: number, warehouseId?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  
  // 设置预设仓库ID
  presetWarehouseId.value = warehouseId
  if (warehouseId) {
    formData.value.warehouseId = warehouseId
  }
  
  // 加载仓库列表
  await loadWarehouseList()
  
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await WarehouseRackApi.getWarehouseRack(id)
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
    const data = formData.value as unknown as WarehouseRackVO
    if (formType.value === 'create') {
      await WarehouseRackApi.createWarehouseRack(data)
      message.success(t('common.createSuccess'))
    } else {
      await WarehouseRackApi.updateWarehouseRack(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    warehouseId: presetWarehouseId.value,
    code: '',
    name: '',
    sort: 0,
    status: 0,
    remark: ''
  }
  formRef.value?.resetFields()
}

/** 加载仓库列表 */
const loadWarehouseList = async () => {
  try {
    warehouseList.value = await WarehouseApi.getWarehouseSimpleList()
  } catch (error) {
    console.error('加载仓库列表失败:', error)
  }
}
</script> 