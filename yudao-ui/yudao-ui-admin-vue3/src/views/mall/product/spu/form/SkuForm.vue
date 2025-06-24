<!-- 商品发布 - 库存价格 -->
<template>
  <el-form
    ref="formRef"
    v-loading="formLoading"
    :disabled="isDetail"
    :model="formData"
    :rules="rules"
    label-width="120px"
  >
    <el-form-item label="分销类型" prop="subCommissionType">
      <el-radio-group
        v-model="formData.subCommissionType"
        class="w-80"
        @change="changeSubCommissionType"
      >
        <el-radio :value="false">默认设置</el-radio>
        <el-radio :value="true" class="radio">单独设置</el-radio>
      </el-radio-group>
    </el-form-item>
    <!-- 隐藏商品规格选择，默认使用多规格 -->
    <!-- <el-form-item label="商品规格" prop="specType">
      <el-radio-group v-model="formData.specType" class="w-80" @change="onChangeSpec">
        <el-radio :value="false" class="radio">单规格</el-radio>
        <el-radio :value="true">多规格</el-radio>
      </el-radio-group>
    </el-form-item> -->
    <el-form-item label="规格值列表">
      <div class="mb-10px">
        <!-- 隐藏规格标签 -->
        <!-- <el-tag class="mx-1" type="success">规格</el-tag> -->
        <!-- 每个规格值占一行 -->
        <div v-for="(value, valueIndex) in propertyList[0]?.values" :key="value.id" class="mb-2">
          <el-tag
            :closable="!isDetail"
            class="mx-1"
            @close="handleCloseValue(valueIndex)"
          >
            {{ value.name }}
          </el-tag>
        </div>
        <div class="mt-2">
          <el-select
            v-show="inputVisible"
            ref="inputRef"
            v-model="inputValue"
            :reserve-keyword="false"
            allow-create
            class="ml-1 !w-30"
            default-first-option
            filterable
            size="small"
            @keyup.enter="handleInputConfirm"
            @change="handleSelectChange"
          >
            <el-option
              v-for="item in attributeOptions"
              :key="item.id"
              :label="item.name"
              :value="item.name"
            />
          </el-select>
          <el-button
            v-show="!inputVisible"
            class="button-new-tag ml-1"
            size="small"
            @click="showInput"
          >
            + 添加规格值
          </el-button>
        </div>
      </div>
    </el-form-item>
    <template v-if="propertyList.length > 0">
      <el-form-item v-if="!isDetail" label="批量设置">
        <SkuList :is-batch="true" :prop-form-data="formData" :property-list="propertyList" />
      </el-form-item>
      <el-form-item label="规格列表">
        <SkuList
          ref="skuListRef"
          :is-detail="isDetail"
          :prop-form-data="formData"
          :property-list="propertyList"
          :rule-config="ruleConfig"
        />
      </el-form-item>
    </template>
  </el-form>

  <!-- 商品属性添加 Form 表单 -->
  <ProductPropertyAddForm ref="attributesAddFormRef" :propertyList="propertyList" />
</template>
<script lang="ts" setup>
import { PropType } from 'vue'
import { copyValueToTarget } from '@/utils'
import { propTypes } from '@/utils/propTypes'
import {
  getPropertyList,
  PropertyAndValues,
  RuleConfig,
  SkuList
} from '@/views/mall/product/spu/components/index'
import ProductAttributes from './ProductAttributes.vue'
import ProductPropertyAddForm from './ProductPropertyAddForm.vue'
import type { Spu } from '@/api/mall/product/spu'
import * as PropertyApi from '@/api/mall/product/property'
import { debounce } from 'lodash-es'

defineOptions({ name: 'ProductSpuSkuForm' })

// sku 相关属性校验规则
const ruleConfig: RuleConfig[] = [
  {
    name: 'stock',
    rule: (arg) => arg >= 0,
    message: '商品库存必须大于等于 1 ！！！'
  },
  {
    name: 'price',
    rule: (arg) => arg >= 0.01,
    message: '商品销售价格必须大于等于 0.01 元！！！'
  },
  {
    name: 'marketPrice',
    rule: (arg) => arg >= 0.01,
    message: '商品市场价格必须大于等于 0.01 元！！！'
  },
  {
    name: 'costPrice',
    rule: (arg) => arg >= 0.01,
    message: '商品成本价格必须大于等于 0.00 元！！！'
  }
]

const message = useMessage() // 消息弹窗
const formLoading = ref(false)
const props = defineProps({
  propFormData: {
    type: Object as PropType<Spu>,
    default: () => {}
  },
  isDetail: propTypes.bool.def(false) // 是否作为详情组件
})
const attributesAddFormRef = ref() // 添加商品属性表单
const formRef = ref() // 表单 Ref
const propertyList = ref<PropertyAndValues[]>([]) // 商品属性列表
const skuListRef = ref() // 商品属性列表 Ref
const formData = reactive<Spu>({
  specType: true, // 默认设置为多规格
  subCommissionType: false, // 分销类型
  skus: []
})
const rules = reactive({
  specType: [required],
  subCommissionType: [required]
})

// 属性值输入相关
const inputValue = ref('') // 输入框值
const inputVisible = ref(false) // 输入框显示控制
const inputRef = ref() // 输入框引用
const attributeOptions = ref([] as PropertyApi.PropertyValueVO[]) // 商品属性名称下拉框
const specPropertyId = ref<number | null>(null) // 规格属性ID

// 添加处理中状态标记
const isProcessingInput = ref(false);

// 创建防抖处理函数
const debouncedHandleInput = debounce((value: string) => {
  if (value && value.trim() !== '') {
    handleInputConfirm();
  }
}, 300);

/** 将传进来的值赋值给 formData */
watch(
  () => props.propFormData,
  (data) => {
    if (!data) {
      return
    }
    
    // 处理可能为NULL的属性，设置默认值
    if (!data.skus) {
      data.skus = []
    }
    
    // 确保specType有值
    if (data.specType === null || data.specType === undefined) {
      data.specType = true
    }
    
    // 确保subCommissionType有值
    if (data.subCommissionType === null || data.subCommissionType === undefined) {
      data.subCommissionType = false
    }
    
    // 确保每个SKU的必要属性都存在
    if (data.skus && data.skus.length > 0) {
      data.skus.forEach(sku => {
        // 设置默认值，避免NULL值导致的错误
        sku.price = sku.price ?? 0
        sku.marketPrice = sku.marketPrice ?? 0
        sku.costPrice = sku.costPrice ?? 0
        sku.barCode = sku.barCode ?? ''
        sku.picUrl = sku.picUrl ?? ''
        sku.stock = sku.stock ?? 0
        sku.weight = sku.weight ?? 0
        sku.volume = sku.volume ?? 0
        sku.firstBrokeragePrice = sku.firstBrokeragePrice ?? 0
        sku.secondBrokeragePrice = sku.secondBrokeragePrice ?? 0
        
        // 确保properties数组存在
        sku.properties = sku.properties || []
      })
    }
    
    copyValueToTarget(formData, data)
    
    // 将 SKU 的属性，整理成 PropertyAndValues 数组
    try {
      propertyList.value = getPropertyList(data)
    } catch (error) {
      console.error('获取属性列表失败:', error)
      // 如果获取失败，初始化一个空的属性列表
      propertyList.value = []
    }
    
    // 确保使用多规格模式 - 如果有SKUs则强制设置为多规格
    if (data.skus?.length > 0 && data.skus.some(sku => sku.properties?.length > 0)) {
      formData.specType = true
    }
    
    // 如果specType为false，但需要修改
    if (!formData.specType) {
      formData.specType = true
      // 不直接修改props，使用emit事件通知父组件
      if (data.specType === false && !props.isDetail) {
        nextTick(() => onChangeSpec())
      }
    }
  },
  {
    immediate: true
  }
)

/** 初始化时自动设置规格属性 */
onMounted(async () => {
  // 确保使用多规格模式
  formData.specType = true
  
  // 在详情模式下不需要获取和创建规格属性
  if (!props.isDetail) {
    // 不直接修改props
    await addDefaultProperty()
  }
})

/** 组件卸载时清理资源 */
onBeforeUnmount(() => {
  // 清除防抖函数
  debouncedHandleInput.cancel();
})

/** 表单校验 */
const emit = defineEmits(['update:activeName'])
const validate = async () => {
  console.log('SkuForm validate 被调用');
  
  // 检查formRef是否已初始化
  if (!formRef || !formRef.value) {
    console.error('formRef 未初始化');
    message.error('库存价格组件未完全加载，请稍后再试');
    emit('update:activeName', 'sku');
    throw new Error('formRef 未初始化');
  }
  
  try {
    console.log('开始校验 sku');
    
    // 检查propertyList是否有数据
    if (propertyList.value.length === 0) {
      console.warn('规格列表为空，可能导致问题');
    }
    
    // 确保skuListRef已初始化
    if (!skuListRef.value) {
      console.error('skuListRef 未初始化');
      message.error('SKU列表未初始化，请刷新页面重试');
      emit('update:activeName', 'sku');
      throw new Error('SKU列表未初始化');
    }
    
    // 检查validateSku方法是否存在
    if (typeof skuListRef.value.validateSku !== 'function') {
      console.error('validateSku方法不存在');
      message.error('SKU验证方法不可用，请刷新页面重试');
      emit('update:activeName', 'sku');
      throw new Error('validateSku方法不存在');
    }
    
    // 校验 sku
    console.log('调用 skuListRef.validateSku()');
    skuListRef.value.validateSku();
    
    console.log('调用 formRef.validate()');
    await unref(formRef).validate();
    
    // 确保propFormData存在
    if (!props.propFormData) {
      console.error('propFormData不存在，无法更新数据');
      throw new Error('propFormData不存在');
    }
    
    // 校验通过更新数据
    console.log('校验通过，更新数据');
    Object.assign(props.propFormData, formData);
    console.log('数据更新完成');
  } catch (e) {
    console.error('表单校验失败:', e);
    message.error('【库存价格】不完善，请填写相关信息');
    emit('update:activeName', 'sku');
    
    // 确保错误被向上传递
    throw e;
  }
}
defineExpose({ validate })

/** 分销类型 */
const changeSubCommissionType = () => {
  // 默认为零，类型切换后也要重置为零
  for (const item of formData.skus!) {
    item.firstBrokeragePrice = 0
    item.secondBrokeragePrice = 0
  }
}

/** 选择规格 */
const onChangeSpec = async () => {
  // 重置商品属性列表
  propertyList.value = []
  // 重置sku列表
  formData.skus = [
    {
      price: 0,
      marketPrice: 0,
      costPrice: 0,
      barCode: '',
      picUrl: '',
      stock: 0,
      weight: 0,
      volume: 0,
      firstBrokeragePrice: 0,
      secondBrokeragePrice: 0
    }
  ]
  
  // 如果选择了多规格，添加一个名为"规格"的默认属性
  if (formData.specType) {
    await addDefaultProperty()
  }
}

/** 添加默认规格属性 */
const addDefaultProperty = async () => {
  formLoading.value = true
  try {
    // 获取所有属性
    const properties = await PropertyApi.getPropertySimpleList()
    console.log('获取到的所有属性列表:', properties)
    
    // 查找是否已有名为"规格"的属性
    let property = properties.find(item => item.name === '规格')
    console.log('找到的规格属性:', property)
    
    // 如果没有，创建一个名为"规格"的属性
    if (!property) {
      const propertyId = await PropertyApi.createProperty({ name: '规格' })
      console.log('创建规格属性成功，ID:', propertyId)
      property = { id: propertyId, name: '规格' }
    }
    
    if (!property || !property.id) {
      throw new Error('无法获取或创建规格属性')
    }
    
    // 保存规格属性ID
    specPropertyId.value = property.id
    console.log('设置规格属性ID:', specPropertyId.value)
    
    // 添加到属性列表
    // 如果已有规格值，则不重新创建属性列表
    if (propertyList.value.length === 0) {
      propertyList.value = [{
        id: property.id,
        name: property.name,
        values: []
      }]
    }
    
    // 编辑模式下，只获取当前商品使用的规格值，不加载全部规格值
    // 只在没有规格值的情况下调用getAttributeOptions
    if (propertyList.value[0]?.values?.length === 0) {
      await getAttributeOptions()
    }
  } catch (error) {
    console.error('设置默认规格属性失败:', error)
    message.error('设置默认规格属性失败:' + (error instanceof Error ? error.message : String(error)))
  } finally {
    formLoading.value = false
  }
}

/** 调用 SkuList generateTableData 方法*/
const generateSkus = (propertyList: any[]) => {
  console.log('调用generateSkus方法，属性列表：', propertyList);
  console.log('skuListRef状态：', skuListRef.value);
  
  // 确保skuListRef已初始化
  if (skuListRef.value && typeof skuListRef.value.generateTableData === 'function') {
    skuListRef.value.generateTableData(propertyList);
    console.log('生成SKU表格数据成功');
  } else {
    console.error('skuListRef未初始化或generateTableData方法不存在');
    // 延迟到下一个tick尝试再次调用
    nextTick(() => {
      if (skuListRef.value && typeof skuListRef.value.generateTableData === 'function') {
        skuListRef.value.generateTableData(propertyList);
        console.log('nextTick后生成SKU表格数据成功');
      } else {
        console.error('nextTick后skuListRef仍未初始化');
      }
    });
  }
}

/** 删除属性值 */
const handleCloseValue = (valueIndex: number) => {
  // 获取要删除的规格值信息
  const valueToDelete = propertyList.value[0].values?.[valueIndex];
  if (!valueToDelete) {
    console.error('找不到要删除的规格值');
    return;
  }
  
  console.log('删除规格值:', valueToDelete);
  
  // 从属性列表中删除该规格值
  propertyList.value[0].values?.splice(valueIndex, 1);
  
  // 手动过滤formData.skus中的项，移除包含已删除规格值的SKU
  if (formData.skus && formData.skus.length > 0) {
    // 保留不包含已删除规格值的SKU
    formData.skus = formData.skus.filter(sku => {
      // 检查该SKU的properties是否包含已删除的规格值
      const hasDeletedValue = sku.properties?.some(
        prop => prop.propertyId === propertyList.value[0].id && prop.valueId === valueToDelete.id
      );
      
      // 如果包含已删除的规格值，则过滤掉该SKU
      return !hasDeletedValue;
    });
    
    console.log('过滤后的SKU列表数量:', formData.skus.length);
  }
  
  // 重新生成SKU列表，添加可能缺少的组合
  generateSkus(propertyList.value);
}

/** 显示输入框并获取焦点 */
const showInput = async () => {
  inputVisible.value = true
  
  // 修改模式下，只在第一次获取规格值选项
  if (!props.isDetail && (!attributeOptions.value || attributeOptions.value.length === 0)) {
    // 获取属性值下拉选项
    await getAttributeOptions()
  }
  
  // 下一个UI循环后获取焦点
  nextTick(() => {
    inputRef.value.focus()
  })
}

/** 输入框失去焦点或点击回车时触发 */
const handleInputConfirm = async () => {
  // 在详情模式下不应该可以添加规格值
  if (props.isDetail) {
    inputValue.value = '';
    inputVisible.value = false;
    return;
  }
  
  // 取消防抖功能中可能正在等待的调用
  debouncedHandleInput.cancel();
  
  // 检查是否为空值或已经在处理中
  if (!inputValue.value || inputValue.value.trim() === '' || isProcessingInput.value) {
    inputValue.value = '';
    inputVisible.value = false;
    return;
  }
  
  // 标记为处理中，防止重复提交
  isProcessingInput.value = true;
  
  const trimmedValue = inputValue.value.trim();
  
  try {
    // 检查属性列表是否存在
    if (!propertyList.value || propertyList.value.length === 0) {
      console.error('属性列表为空，尝试重新初始化');
      await addDefaultProperty();
      if (!propertyList.value || propertyList.value.length === 0) {
        throw new Error('无法初始化属性列表');
      }
    }
    
    // 检查规格属性ID是否存在
    if (!specPropertyId.value) {
      console.error('规格属性ID不存在，尝试从属性列表中获取');
      if (propertyList.value[0] && propertyList.value[0].id) {
        specPropertyId.value = propertyList.value[0].id;
        console.log('从属性列表重新获取规格ID:', specPropertyId.value);
      } else {
        throw new Error('无法获取规格属性ID');
      }
    }
    
    // 检查属性值是否已存在于当前列表
    if (propertyList.value[0].values?.find((item) => item.name === trimmedValue)) {
      message.warning('已存在相同规格值，请重试');
      inputValue.value = '';
      inputVisible.value = false;
      isProcessingInput.value = false; // 重置处理状态
      return;
    }

    console.log('尝试添加规格值:', trimmedValue, '规格ID:', specPropertyId.value);
    
    // 检查属性值是否存在于选项中
    const existValue = attributeOptions.value.find((item) => item.name === trimmedValue);
    if (existValue) {
      console.log('使用已有规格值:', existValue);
      // 确保不会添加重复值
      if (!propertyList.value[0].values.some(v => v.id === existValue.id)) {
        propertyList.value[0].values.push({ id: existValue.id, name: existValue.name });
        console.log('规格值添加后的属性列表:', propertyList.value);
        // 确保值更新后再生成SKU
        await nextTick();
        generateSkus(propertyList.value);
      } else {
        console.log('规格值已存在，跳过添加:', existValue);
      }
    } else {
      // 创建新的属性值
      console.log('创建新规格值, 参数:', { propertyId: specPropertyId.value, name: trimmedValue });
      const id = await PropertyApi.createPropertyValue({ 
        propertyId: specPropertyId.value, 
        name: trimmedValue 
      });
      console.log('创建规格值成功，ID:', id);
      
      // 确保不会添加重复值
      if (!propertyList.value[0].values.some(v => v.id === id)) {
        propertyList.value[0].values.push({ id, name: trimmedValue });
        console.log('新建规格值后的属性列表:', propertyList.value);
        // 确保值更新后再生成SKU
        await nextTick();
        generateSkus(propertyList.value);
      } else {
        console.log('规格值已存在，跳过添加，ID:', id);
      }
      
      // 刷新属性值列表
      await getAttributeOptions();
    }
  } catch (error) {
    console.error('添加规格值失败:', error);
    message.error('添加规格值失败:' + (error instanceof Error ? error.message : String(error)));
  } finally {
    inputValue.value = '';
    inputVisible.value = false;
    isProcessingInput.value = false; // 重置处理状态
  }
}

/** 获取商品属性值下拉选项 */
const getAttributeOptions = async () => {
  // 详情模式下不获取规格值
  if (props.isDetail) return;
  
  if (!specPropertyId.value && propertyList.value && propertyList.value[0]) {
    specPropertyId.value = propertyList.value[0].id
  }
  
  if (specPropertyId.value) {
    try {
      console.log('获取规格值列表, 规格ID:', specPropertyId.value)
      
      // 只获取当前编辑需要的规格值，而不是全部规格值
      // 如果是现有商品且有规格值，只获取这些规格值的详细信息
      if (formData.skus?.length > 0 && formData.skus.some(sku => sku.properties?.length > 0)) {
        // 获取当前已使用的规格值ID列表
        const valueIds = new Set<number>();
        formData.skus.forEach(sku => {
          sku.properties?.forEach(prop => {
            if (prop.propertyId === specPropertyId.value && prop.valueId) {
              valueIds.add(prop.valueId);
            }
          });
        });
        
        console.log('仅获取已使用的规格值:', Array.from(valueIds));
        
        // 如果已有规格值，可以考虑通过单个ID查询或批量ID查询接口获取详情
        // 这里可能需要添加一个新的API方法，根据ID列表获取规格值
        // 如果没有这样的API，则可以将现有值直接添加到attributeOptions
        attributeOptions.value = Array.from(valueIds).map(id => {
          // 查找现有SKU中的规格值信息
          const prop = formData.skus?.flatMap(sku => sku.properties || [])
            .find(p => p.propertyId === specPropertyId.value && p.valueId === id);
            
          return {
            id: id,
            name: prop?.valueName || `值${id}` // 使用已知的名称或默认名
          };
        });
      } else {
        // 只有创建新商品时才获取常用/热门规格值，而不是全部
        // 这里可以修改为获取热门规格值的API，或者限制返回数量
        // PropertyApi.getPropertyValueSimpleList 可以考虑添加参数来限制返回的数量
        attributeOptions.value = await PropertyApi.getPropertyValueSimpleList(specPropertyId.value);
        // 如果API不支持限制，可以在前端限制显示数量
        if (attributeOptions.value.length > 100) {
          console.log(`获取的规格值过多(${attributeOptions.value.length})，限制显示前100个`);
          attributeOptions.value = attributeOptions.value.slice(0, 100);
        }
      }
      
      console.log('获取到规格值列表:', attributeOptions.value)
    } catch (error) {
      console.error('获取规格值列表失败:', error)
    }
  } else {
    console.warn('无法获取规格值列表：规格ID不存在')
  }
}

/** 处理下拉框的change事件 */
const handleSelectChange = (value: string) => {
  // 如果值为空，不处理
  if (!value || value.trim() === '') {
    return;
  }
  
  // 使用防抖函数处理，防止快速连续操作
  debouncedHandleInput(value);
}
</script>
