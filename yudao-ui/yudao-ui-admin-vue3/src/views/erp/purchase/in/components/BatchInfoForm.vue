<template>
  <el-form ref="formRef" :model="localFormData" :rules="formRules" label-width="120px" :disabled="disabled">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="批次号" prop="batchNumber">
          <el-input v-model="localFormData.batchNumber" placeholder="请输入批次号" @input="updateForm('batchNumber', $event)" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="生产日期" prop="productionDate">
          <el-date-picker
            v-model="localFormData.productionDate"
            type="date"
            value-format="x"
            placeholder="选择生产日期"
            class="!w-1/1"
            @change="updateForm('productionDate', $event)"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="过期日期" prop="expiryDate">
          <el-date-picker
            v-model="localFormData.expiryDate"
            type="date"
            value-format="x"
            placeholder="选择过期日期"
            class="!w-1/1"
            @change="updateForm('expiryDate', $event)"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="质检状态" prop="qualityStatus">
          <el-select v-model="localFormData.qualityStatus" placeholder="请选择质检状态" class="!w-1/1" @change="updateForm('qualityStatus', $event)">
            <el-option label="待检" :value="0" />
            <el-option label="合格" :value="1" />
            <el-option label="不合格" :value="2" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="批次备注" prop="batchRemark">
          <el-input
            type="textarea"
            v-model="localFormData.batchRemark"
            :rows="2"
            placeholder="请输入批次备注信息"
            @input="updateForm('batchRemark', $event)"
          />
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script lang="ts" setup>
defineOptions({ name: 'BatchInfoForm' });

const props = defineProps<{
  formData: any
  disabled?: boolean
}>();

const emit = defineEmits<{
  (e: 'update:formData', value: any): void
}>();

// 创建本地表单数据的副本
const localFormData = ref({ ...props.formData });

// 监听 props 变化，更新本地数据
watch(() => props.formData, (newVal) => {
  localFormData.value = { ...newVal };
}, { deep: true });

// 更新表单数据的方法
const updateForm = (field: string, value: any) => {
  const updatedData = {
    ...localFormData.value,
    [field]: value
  };
  emit('update:formData', updatedData);
};

const formRules = reactive({
  batchNumber: [
    { required: true, message: '批次号不能为空', trigger: 'blur' }
  ],
  productionDate: [
    { required: true, message: '生产日期不能为空', trigger: 'blur' }
  ]
});

// 计算过期日期
watch(
  () => [localFormData.value.productionDate, localFormData.value.productId],
  async ([productionDate, productId]) => {
    if (!productionDate || !productId || localFormData.value.expiryDate) return;
    
    try {
      // 获取产品的保质期天数
      // const product = await ProductApi.getProduct(productId);
      const expiryDays = 365; // 默认一年有效期，实际应从product.expiryDay获取
      
      // 计算过期日期
      if (expiryDays > 0) {
        const prodDate = new Date(productionDate);
        prodDate.setDate(prodDate.getDate() + expiryDays);
        const newExpiryDate = prodDate.getTime();
        
        // 更新过期日期
        updateForm('expiryDate', newExpiryDate);
      }
    } catch (error) {
      console.error('计算过期日期失败:', error);
    }
  }
);

// 表单校验
const formRef = ref();
const validate = () => {
  return formRef.value.validate();
};

defineExpose({ validate });
</script> 