<template>
  <ContentWrap v-loading="formLoading">
    <el-tabs v-model="activeName">
      <el-tab-pane label="基础设置" name="info">
        <InfoForm
          ref="infoRef"
          v-model:activeName="activeName"
          :is-detail="isDetail"
          :propFormData="formData"
        />
      </el-tab-pane>
      <el-tab-pane label="价格库存" name="sku">
        <SkuForm
          ref="skuRef"
          v-model:activeName="activeName"
          :is-detail="isDetail"
          :propFormData="formData"
        />
      </el-tab-pane>
      <el-tab-pane label="物流设置" name="delivery">
        <DeliveryForm
          ref="deliveryRef"
          v-model:activeName="activeName"
          :is-detail="isDetail"
          :propFormData="formData"
        />
      </el-tab-pane>
      <el-tab-pane label="商品详情" name="description">
        <DescriptionForm
          ref="descriptionRef"
          v-model:activeName="activeName"
          :is-detail="isDetail"
          :propFormData="formData"
        />
      </el-tab-pane>
      <el-tab-pane label="其它设置" name="other">
        <OtherForm
          ref="otherRef"
          v-model:activeName="activeName"
          :is-detail="isDetail"
          :propFormData="formData"
        />
      </el-tab-pane>
    </el-tabs>
    <el-form>
      <el-form-item style="float: right">
        <el-button v-if="!isDetail" :loading="formLoading" type="primary" @click="submitForm">
          保存
        </el-button>
        <el-button @click="close">返回</el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>
</template>
<script lang="ts" setup>
import { cloneDeep } from 'lodash-es'
import { useTagsViewStore } from '@/store/modules/tagsView'
import * as ProductSpuApi from '@/api/mall/product/spu'
import InfoForm from './InfoForm.vue'
import DescriptionForm from './DescriptionForm.vue'
import OtherForm from './OtherForm.vue'
import SkuForm from './SkuForm.vue'
import DeliveryForm from './DeliveryForm.vue'
import { convertToInteger, floatToFixed2, formatToFraction } from '@/utils'

defineOptions({ name: 'ProductSpuAdd' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗
const { push, currentRoute } = useRouter() // 路由
const { params, name } = useRoute() // 查询参数
const { delView } = useTagsViewStore() // 视图操作

const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const activeName = ref('info') // Tag 激活的窗口
const isDetail = ref(false) // 是否查看详情
const infoRef = ref() // 商品信息 Ref
const skuRef = ref() // 商品规格 Ref
const deliveryRef = ref() // 物流设置 Ref
const descriptionRef = ref() // 商品详情 Ref
const otherRef = ref() // 其他设置 Ref
// SPU 表单数据
const formData = ref<ProductSpuApi.Spu>({
  name: '', // 商品名称
  categoryId: undefined, // 商品分类
  keyword: '', // 关键字
  picUrl: '', // 商品封面图
  sliderPicUrls: [], // 商品轮播图
  introduction: '', // 商品简介
  deliveryTypes: [], // 配送方式数组
  deliveryTemplateId: undefined, // 运费模版
  brandId: undefined, // 商品品牌
  specType: false, // 商品规格
  subCommissionType: false, // 分销类型
  skus: [
    {
      price: 0, // 商品价格
      marketPrice: 0, // 市场价
      costPrice: 0, // 成本价
      barCode: '', // 商品条码
      picUrl: '', // 图片地址
      stock: 0, // 库存
      weight: 0, // 商品重量
      volume: 0, // 商品体积
      firstBrokeragePrice: 0, // 一级分销的佣金
      secondBrokeragePrice: 0 // 二级分销的佣金
    }
  ],
  description: '', // 商品详情
  sort: 0, // 商品排序
  giveIntegral: 0, // 赠送积分
  virtualSalesCount: 0 // 虚拟销量
})

/** 获得详情 */
const getDetail = async () => {
  if ('ProductSpuDetail' === name) {
    isDetail.value = true
  }
  const id = params.id as unknown as number
  if (id) {
    formLoading.value = true
    try {
      const res = (await ProductSpuApi.getSpu(id)) as ProductSpuApi.Spu
      
      // 修复可能为NULL的字段
      res.name = res.name || '';
      res.keyword = res.keyword || '';
      res.picUrl = res.picUrl || '';
      res.sliderPicUrls = res.sliderPicUrls || [];
      res.introduction = res.introduction || '';
      res.deliveryTypes = res.deliveryTypes || [];
      res.specType = res.specType ?? true;
      res.subCommissionType = res.subCommissionType ?? false;
      res.description = res.description || '';
      res.sort = res.sort ?? 0;
      res.giveIntegral = res.giveIntegral ?? 0;
      res.virtualSalesCount = res.virtualSalesCount ?? 0;
      
      // 确保SKUs数组存在
      if (!res.skus || !Array.isArray(res.skus)) {
        res.skus = [{
          price: 0,
          marketPrice: 0,
          costPrice: 0,
          barCode: '',
          picUrl: '',
          stock: 0,
          weight: 0,
          volume: 0,
          firstBrokeragePrice: 0,
          secondBrokeragePrice: 0,
          properties: []
        }];
      }
      
      // 确保specType正确设置 - 如果有SKUs则应该是多规格
      if (res.skus?.length > 0 && res.skus.some(sku => sku.properties?.length > 0)) {
        res.specType = true;
      }
      
      res.skus?.forEach((item) => {
        // 确保SKU的所有必要属性存在
        item.barCode = item.barCode || '';
        item.picUrl = item.picUrl || '';
        item.stock = item.stock ?? 0;
        item.weight = item.weight ?? 0;
        item.volume = item.volume ?? 0;
        item.properties = item.properties || [];
        
        if (isDetail.value) {
          item.price = floatToFixed2(item.price ?? 0);
          item.marketPrice = floatToFixed2(item.marketPrice ?? 0);
          item.costPrice = floatToFixed2(item.costPrice ?? 0);
          item.firstBrokeragePrice = floatToFixed2(item.firstBrokeragePrice ?? 0);
          item.secondBrokeragePrice = floatToFixed2(item.secondBrokeragePrice ?? 0);
        } else {
          // 回显价格分转元
          item.price = formatToFraction(item.price ?? 0);
          item.marketPrice = formatToFraction(item.marketPrice ?? 0);
          item.costPrice = formatToFraction(item.costPrice ?? 0);
          item.firstBrokeragePrice = formatToFraction(item.firstBrokeragePrice ?? 0);
          item.secondBrokeragePrice = formatToFraction(item.secondBrokeragePrice ?? 0);
        }
      });
      
      formData.value = res;
    } catch (error) {
      console.error('获取商品详情失败:', error);
      message.error('获取商品信息失败: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      formLoading.value = false;
    }
  }
}

/** 提交按钮 */
const submitForm = async () => {
  console.log('点击保存按钮，开始提交表单');
  
  // 防止重复提交
  if (formLoading.value) {
    message.warning('正在处理中，请勿重复提交');
    return;
  }
  
  // 提交请求
  formLoading.value = true;
  
  // 添加15秒超时保护，确保按钮不会无限等待
  const timeoutId = setTimeout(() => {
    if (formLoading.value) {
      formLoading.value = false;
      message.error('表单提交超时，请刷新页面重试');
    }
  }, 15000);
  
  try {
    console.log('开始校验各表单');
    
    // 校验各表单 - 使用try-catch分别处理每个表单的验证
    try {
      console.log('校验基础信息表单');
      if (infoRef.value && typeof infoRef.value.validate === 'function') {
        await infoRef.value.validate();
      } else {
        console.warn('基础信息表单组件未正确初始化');
      }
    } catch (e) {
      console.error('基础信息表单校验失败:', e);
      clearTimeout(timeoutId);
      formLoading.value = false;
      activeName.value = 'info';
      return;
    }
    
    try {
      console.log('校验价格库存表单');
      if (skuRef.value && typeof skuRef.value.validate === 'function') {
        await skuRef.value.validate();
      } else {
        console.warn('价格库存表单组件未正确初始化');
      }
    } catch (e) {
      console.error('价格库存表单校验失败:', e);
      clearTimeout(timeoutId);
      formLoading.value = false;
      activeName.value = 'sku';
      return;
    }
    
    try {
      console.log('校验物流设置表单');
      if (deliveryRef.value && typeof deliveryRef.value.validate === 'function') {
        await deliveryRef.value.validate();
      } else {
        console.warn('物流设置表单组件未正确初始化');
      }
    } catch (e) {
      console.error('物流设置表单校验失败:', e);
      clearTimeout(timeoutId);
      formLoading.value = false;
      activeName.value = 'delivery';
      return;
    }
    
    try {
      console.log('校验商品详情表单');
      if (descriptionRef.value && typeof descriptionRef.value.validate === 'function') {
        await descriptionRef.value.validate();
      } else {
        console.warn('商品详情表单组件未正确初始化');
      }
    } catch (e) {
      console.error('商品详情表单校验失败:', e);
      clearTimeout(timeoutId);
      formLoading.value = false;
      activeName.value = 'description';
      return;
    }
    
    try {
      console.log('校验其它设置表单');
      if (otherRef.value && typeof otherRef.value.validate === 'function') {
        await otherRef.value.validate();
      } else {
        console.warn('其它设置表单组件未正确初始化');
      }
    } catch (e) {
      console.error('其它设置表单校验失败:', e);
      clearTimeout(timeoutId);
      formLoading.value = false;
      activeName.value = 'other';
      return;
    }
    
    console.log('所有表单校验通过，开始准备提交数据');
    
    // 深拷贝一份, 这样最终 server 端不满足，不需要影响原始数据
    const deepCopyFormData = cloneDeep(unref(formData.value)) as ProductSpuApi.Spu
    console.log('复制表单数据:', deepCopyFormData);
    
    // 检查和修复基本属性
    deepCopyFormData.name = deepCopyFormData.name || '';
    deepCopyFormData.keyword = deepCopyFormData.keyword || '';
    deepCopyFormData.picUrl = deepCopyFormData.picUrl || '';
    deepCopyFormData.sliderPicUrls = deepCopyFormData.sliderPicUrls || [];
    deepCopyFormData.introduction = deepCopyFormData.introduction || '';
    deepCopyFormData.deliveryTypes = deepCopyFormData.deliveryTypes || [];
    deepCopyFormData.description = deepCopyFormData.description || '';
    
    // 检查SKUs是否存在
    if (!deepCopyFormData.skus || deepCopyFormData.skus.length === 0) {
      console.error('商品SKU列表为空');
      message.error('商品规格列表不能为空，请添加至少一个规格值');
      clearTimeout(timeoutId);
      formLoading.value = false;
      activeName.value = 'sku';
      return;
    }
    
    deepCopyFormData.skus.forEach((item) => {
      // 给sku name赋值
      item.name = deepCopyFormData.name
      
      // 检查和修复必要的属性
      item.price = item.price ?? 0;
      item.marketPrice = item.marketPrice ?? 0;
      item.costPrice = item.costPrice ?? 0;
      item.barCode = item.barCode || '';
      item.picUrl = item.picUrl || '';
      item.stock = item.stock ?? 0;
      item.weight = item.weight ?? 0;
      item.volume = item.volume ?? 0;
      item.firstBrokeragePrice = item.firstBrokeragePrice ?? 0;
      item.secondBrokeragePrice = item.secondBrokeragePrice ?? 0;
      
      // sku相关价格元转分
      item.price = convertToInteger(item.price)
      item.marketPrice = convertToInteger(item.marketPrice)
      item.costPrice = convertToInteger(item.costPrice)
      item.firstBrokeragePrice = convertToInteger(item.firstBrokeragePrice)
      item.secondBrokeragePrice = convertToInteger(item.secondBrokeragePrice)
    })
    
    // 处理轮播图列表
    const newSliderPicUrls: any[] = []
    if (deepCopyFormData.sliderPicUrls) {
      deepCopyFormData.sliderPicUrls.forEach((item: any) => {
        // 如果是前端选的图
        typeof item === 'object' ? newSliderPicUrls.push(item.url) : newSliderPicUrls.push(item)
      })
      deepCopyFormData.sliderPicUrls = newSliderPicUrls
    }
    
    // 校验都通过后提交表单
    const data = deepCopyFormData as ProductSpuApi.Spu
    const id = params.id as unknown as number
    
    console.log('准备发送请求，数据:', data);
    
    try {
      if (!id) {
        console.log('创建商品');
        await ProductSpuApi.createSpu(data)
        message.success(t('common.createSuccess'))
      } else {
        console.log('更新商品');
        await ProductSpuApi.updateSpu(data)
        message.success(t('common.updateSuccess'))
      }
      close()
    } catch (error) {
      console.error('提交请求失败:', error);
      message.error('保存失败: ' + (error instanceof Error ? error.message : String(error)));
      clearTimeout(timeoutId);
      formLoading.value = false;
    }
  } catch (error) {
    console.error('表单处理过程中出错:', error);
    message.error('表单验证失败: ' + (error instanceof Error ? error.message : String(error)));
    clearTimeout(timeoutId);
    formLoading.value = false;
  } finally {
    clearTimeout(timeoutId);
    console.log('重置formLoading状态');
    formLoading.value = false;
  }
}

/** 关闭按钮 */
const close = () => {
  try {
    const route = unref(currentRoute)
    if (route) {
      delView(route)
    }
    push({ name: 'ProductSpu' })
  } catch (error) {
    console.warn('关闭时发生错误:', error)
    // 确保即使发生错误也能返回列表页
    push({ name: 'ProductSpu' })
  }
}

/** 路由离开前钩子 - 确保在导航离开时删除当前视图 */
onBeforeUnmount(() => {
  try {
    const route = unref(currentRoute)
    if (route) {
      delView(route)
    }
  } catch (error) {
    console.warn('组件卸载时发生错误:', error)
  }
})

/** 初始化 */
onMounted(async () => {
  await getDetail()
})
</script>
