<template>
  <div class="spu-sku-editor">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">商品(SPU)编辑</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleSave">保存</el-button>
            <el-button @click="handleCancel">返回</el-button>
          </div>
        </div>
      </template>

      <!-- SPU基本信息表单 -->
      <el-form ref="spuFormRef" :model="spuForm" :rules="spuRules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品名称" prop="name">
              <el-input
                v-model="spuForm.name"
                placeholder="请输入商品名称"
                :maxlength="64"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商品分类" prop="categoryId">
              <div class="category-container">
                <div v-if="selectedCategories.length > 0" class="selected-categories">
                  <el-tag
                    v-for="(category, index) in selectedCategories"
                    :key="category.id"
                    closable
                    @close="removeCategory(index)"
                    class="category-tag"
                    :class="{ 'primary-category': index === 0 }"
                  >
                    {{ category.name }}
                    <span v-if="index === 0" class="primary-label">(主分类)</span>
                  </el-tag>
                </div>
                <div class="category-actions">
              <el-select
                    v-model="tempCategoryId"
                placeholder="请选择商品分类"
                filterable
                allow-create
                default-first-option
                :reserve-keyword="false"
                @change="handleCategoryChange"
                    style="width: 240px"
              >
                <el-option
                  v-for="category in categoryOptions"
                  :key="category.id"
                  :label="category.name"
                  :value="category.id"
                />
              </el-select>
                </div>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品品牌" prop="brandId">
              <el-select
                v-model="spuForm.brandId"
                placeholder="请选择商品品牌"
                filterable
                allow-create
                default-first-option
                :reserve-keyword="false"
                @change="handleBrandChange"
                style="width: 100%"
              >
                <el-option
                  v-for="brand in brandOptions"
                  :key="brand.id"
                  :label="brand.name"
                  :value="brand.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商品关键字">
              <el-input v-model="spuForm.keyword" placeholder="请输入商品关键字" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="商品简介">
          <el-input
            v-model="spuForm.introduction"
            type="textarea"
            rows="3"
            placeholder="请输入商品简介"
            :maxlength="128"
            show-word-limit
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品状态">
              <el-radio-group v-model="spuForm.status">
                <el-radio :label="1">上架</el-radio>
                <el-radio :label="0">下架</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>          
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="排序">
              <el-input-number v-model="spuForm.sort" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="虚拟销量">
              <el-input-number v-model="spuForm.virtualSalesCount" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="赠送积分">
              <el-input-number v-model="spuForm.giveIntegral" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="配送方式">
          <el-select v-model="spuForm.deliveryTypes" multiple placeholder="请选择配送方式" style="width: 100%">
            <el-option label="快递发货" value="1" />
            <el-option label="到店自提" value="2" />
          </el-select>
        </el-form-item>

        <el-form-item label="详细描述">
          <el-input
            v-model="spuForm.description"
            type="textarea"
            rows="5"
            placeholder="请输入商品详细描述"
            :maxlength="2000"
            show-word-limit
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品封面图">
              <el-upload
                :action="uploadFileUrl"
                list-type="picture-card"
                :headers="headers"
                :limit="1"
                :file-list="spuForm.coverImages"
                :on-success="(res) => handlePicSuccess(res, 'coverImages')"
                :on-remove="(file) => handlePicRemove(file, 'coverImages')"
              >
                <Icon icon="ep:plus" />
              </el-upload>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商品轮播图">
              <el-upload
                :action="uploadFileUrl"
                list-type="picture-card"
                :headers="headers"
                :limit="5"
                :file-list="spuForm.sliderImages"
                :on-success="(res) => handlePicSuccess(res, 'sliderImages')"
                :on-remove="(file) => handlePicRemove(file, 'sliderImages')"
              >
                <Icon icon="ep:plus" />
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- SKU规格列表 -->
    <el-card class="box-card sku-table-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">规格列表</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleAddSku" v-if="false"
              >添加规格</el-button
            >
          </div>
        </div>
      </template>

      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="规格列表" name="skuList">
          <el-table
            ref="skuTableRef"
            :data="skuList"
            style="width: 100%"
            border
            row-key="id"
          >
            <el-table-column label="图片" width="100" align="center">
              <template #default="{ row }">
                <el-image
                  v-if="row.picUrl"
                  :src="row.picUrl"
                  style="width: 60px; height: 60px"
                  :preview-src-list="[row.picUrl]"
                  preview-teleported
                />
                <div v-else class="empty-image">无图片</div>
              </template>
            </el-table-column>
            <el-table-column label="规格" min-width="180">
              <template #default="{ row }">
                <div class="sku-properties">
                  <el-tag
                    v-for="(prop, index) in row.properties"
                    :key="index"
                    size="small"
                    class="sku-property-tag"
                  >
                    {{ prop.propertyName }}: {{ prop.valueName }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="商品编码" prop="barCode" min-width="120">
              <template #default="{ row }">
                <el-input
                  v-model="row.barCode"
                  size="small"
                  placeholder="请输入商品编码"
                />
              </template>
            </el-table-column>
            <el-table-column label="销售价" width="120" align="center">
              <template #default="{ row }">
                <el-input-number
                  v-model="row.price"
                  :precision="2"
                  :step="0.01"
                  :min="0"
                  controls-position="right"
                  size="small"
                  style="width: 100px"
                />
              </template>
            </el-table-column>
            <el-table-column label="市场价" width="120" align="center">
              <template #default="{ row }">
                <el-input-number
                  v-model="row.marketPrice"
                  :precision="2"
                  :step="0.01"
                  :min="0"
                  controls-position="right"
                  size="small"
                  style="width: 100px"
                />
              </template>
            </el-table-column>
            <el-table-column label="成本价" width="120" align="center">
              <template #default="{ row }">
                <el-input-number
                  v-model="row.costPrice"
                  :precision="2"
                  :step="0.01"
                  :min="0"
                  controls-position="right"
                  size="small"
                  style="width: 100px"
                />
              </template>
            </el-table-column>
            <el-table-column label="库存" width="100" align="center">
              <template #default="{ row }">
                <el-input-number
                  v-model="row.stock"
                  :min="0"
                  :precision="0"
                  controls-position="right"
                  size="small"
                  style="width: 90px"
                />
              </template>
            </el-table-column>
            <el-table-column label="重量(kg)" width="100" align="center">
              <template #default="{ row }">
                <el-input-number
                  v-model="row.weight"
                  :precision="2"
                  :step="0.01"
                  :min="0"
                  controls-position="right"
                  size="small"
                  style="width: 90px"
                />
              </template>
            </el-table-column>
            <el-table-column label="体积(m³)" width="100" align="center">
              <template #default="{ row }">
                <el-input-number
                  v-model="row.volume"
                  :precision="2"
                  :step="0.01"
                  :min="0"
                  controls-position="right"
                  size="small"
                  style="width: 90px"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" align="center">
              <template #default="{ $index }">
                <el-button
                  type="danger"
                  link
                  size="small"
                  @click="handleDeleteSku($index)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <div class="form-footer">
      <el-button type="primary" @click="handleSave">保存</el-button>
      <el-button @click="handleCancel">返回</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, defineProps, defineEmits } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getAccessToken } from "@/utils/auth";
import * as ProductSpuApi from "@/api/mall/product/spu";
import * as ProductCategoryApi from "@/api/mall/product/category";
import * as ProductBrandApi from "@/api/mall/product/brand";
import request from "@/config/axios";
import { saveSpuWithSkus } from "@/api/mall/product/spu";

// 定义接口类型
interface CategoryOption {
  id: number;
  name: string;
  parentId?: number;
  picUrl?: string;
  sort?: number;
  status?: number;
}

interface BrandOption {
  id: number;
  name: string;
  picUrl?: string;
  sort?: number;
  description?: string;
  status?: number;
}

interface SkuProperty {
  propertyName: string;
  valueName: string;
  propertyId?: number;
  valueId?: number;
}

interface SkuItem {
  id: number | null;
  spuId: number | null;
  properties: SkuProperty[];
  picUrl: string;
  barCode: string;
  price: number;
  marketPrice: number;
  costPrice: number;
  stock: number;
  weight: number;
  volume: number;
}

interface SelectedSku {
  id: number | null;
  spuId?: number | null;
  properties?: SkuProperty[];
  picUrl: string;
  barCode?: string;
  price: number;
  marketPrice?: number;
  costPrice?: number;
  stock?: number;
  weight?: number;
  volume?: number;
}

const props = defineProps({
  selectedSkus: {
    type: Array as () => SelectedSku[],
    default: () => [],
  },
  spuId: {
    type: [Number, String],
    default: null,
  },
});

const emit = defineEmits(["cancel", "save"]);

// 表单与表格引用
const spuFormRef = ref();
const skuTableRef = ref();

// 基础数据
const activeTab = ref("skuList");
const categoryOptions = ref<CategoryOption[]>([]);
const brandOptions = ref<BrandOption[]>([]);
const skuList = ref<SkuItem[]>([]);

// 多分类相关
const selectedCategories = ref<CategoryOption[]>([]);
const tempCategoryId = ref();

// SPU表单数据
const spuForm = reactive({
  id: null as number | null,
  name: "",
  categoryId: undefined as number | undefined, // 保留主分类ID
  categoryIds: [] as number[], // 新增：存储所有分类ID
  brandId: undefined as number | undefined,
  introduction: "",
  keyword: "",
  coverImages: [] as Array<{ name: string; url: string }>,
  sliderImages: [] as Array<{ name: string; url: string }>,
  status: 1,
  specType: true,
  sort: 0,
  virtualSalesCount: 0,
  giveIntegral: 0,
  deliveryTypes: [] as number[],
  description: "",
});

// 表单验证规则
const spuRules = {
  name: [{ required: true, message: "请输入商品名称", trigger: "blur" }],
  categoryId: [{ required: true, message: "请至少选择一个商品分类", trigger: "change" }],
  brandId: [{ required: true, message: "请选择商品品牌", trigger: "change" }],
};

// 上传相关
const uploadFileUrl = import.meta.env.VITE_UPLOAD_URL;
const headers = computed(() => {
  return { Authorization: "Bearer " + getAccessToken() };
});

// 初始化数据
onMounted(async () => {
  await Promise.all([getCategoryOptions(), getBrandOptions()]);

  // 如果有spuId，加载SPU数据
  if (props.spuId) {
    await loadSpuData(Number(props.spuId));
  }

  // 初始化SKU列表
  if (props.selectedSkus && props.selectedSkus.length > 0) {
    initSkuList();
  }
});

// 获取分类选项
const getCategoryOptions = async () => {
  try {
    const data = await ProductCategoryApi.getCategoryList({});
    categoryOptions.value = data || [];
  } catch (error) {
    console.error("获取商品分类失败:", error);
  }
};

// 获取品牌选项
const getBrandOptions = async () => {
  try {
    const data = await ProductBrandApi.getSimpleBrandList();
    brandOptions.value = data || [];
  } catch (error) {
    console.error("获取商品品牌失败:", error);
  }
};

// 处理分类变更
const handleCategoryChange = (val: string | number) => {
  console.log("分类change事件:", val);

  // 如果没有选择，则直接返回
  if (!val) {
    return;
  }

  // 检查是否已添加该分类
  if (typeof val === 'number') {
    const exists = selectedCategories.value.some(item => item.id === val);
    if (exists) {
      ElMessage.warning('该分类已添加');
      tempCategoryId.value = undefined; // 清空选择
      return;
    }
    
    // 从已有分类中添加
    const selectedCategory = categoryOptions.value.find(item => item.id === val);
    if (selectedCategory) {
      selectedCategories.value.push(selectedCategory);
      updateCategoryFormData();
      ElMessage.success(`已添加分类: ${selectedCategory.name}`);
    }
  } 
  // 如果是字符串，说明是新创建的分类
  else if (typeof val === 'string') {
    handleCreateCategory(val).then((newCategoryId) => {
      if (newCategoryId) {
        const newCategory = categoryOptions.value.find(item => item.id === newCategoryId);
        if (newCategory) {
          selectedCategories.value.push(newCategory);
          updateCategoryFormData();
          ElMessage.success(`已创建并添加分类: ${newCategory.name}`);
        }
      }
    });
  }
  
  // 清空选择，方便下次选择
  tempCategoryId.value = undefined;
};

// 处理品牌变更
const handleBrandChange = (val: string | number) => {
  console.log("品牌change事件:", val);

  // 如果是字符串，说明是新创建的品牌
  if (typeof val === "string") {
    handleCreateBrand(val);
  }
};

// 创建新分类
const handleCreateCategory = async (categoryName: string) => {
  try {
    console.log("开始创建新分类:", categoryName);

    // 检查是否已存在同名分类
    const existingCategory = categoryOptions.value.find(
      (item) => item.name === categoryName
    );
    if (existingCategory) {
      console.log(`分类 "${categoryName}" 已存在, 直接选中`);
      spuForm.categoryId = existingCategory.id;
      return existingCategory.id;
    }

    // 检查是否是多级分类（包含"/"分隔符）
    if (categoryName.includes("/")) {
      console.log("检测到多级分类格式:", categoryName);
      // 分割多级分类名称
      const categoryParts = categoryName.split("/");
      let parentId = 0; // 从顶级分类开始
      let lastCreatedCategoryId = 0;

      // 逐级创建分类
      for (let i = 0; i < categoryParts.length; i++) {
        const currentName = categoryParts[i].trim();
        if (!currentName) continue; // 跳过空名称

        console.log(`处理第${i + 1}级分类: "${currentName}", 父级ID: ${parentId}`);

        // 检查该级分类是否已存在
        const existingCategory = categoryOptions.value.find(
          (item) => item.name === currentName && item.parentId === parentId
        );

        if (existingCategory) {
          // 如果分类已存在，使用现有分类作为父级
          console.log(`分类 "${currentName}" 已存在, ID: ${existingCategory.id}`);
          parentId = existingCategory.id;
          lastCreatedCategoryId = existingCategory.id;
        } else {
          // 创建新分类
          const categoryData = {
            name: currentName,
            parentId: parentId,
            picUrl: "", // 默认空图片
            sort: 0, // 默认排序
            status: 0, // 默认启用
          } as ProductCategoryApi.CategoryVO;

          console.log(`发送创建分类请求, 数据:`, categoryData);
          const result = await ProductCategoryApi.createCategory(categoryData);
          console.log(`创建分类 "${currentName}" API返回结果:`, result);

          if (result) {
            // 刷新分类列表
            console.log("开始刷新分类列表");
            await getCategoryOptions();
            console.log("分类列表刷新完成");
            // 查找新创建的分类
            const newCategory = categoryOptions.value.find(
              (item) => item.name === currentName && item.parentId === parentId
            );

            if (newCategory) {
              console.log(`找到新创建的分类: "${currentName}", ID: ${newCategory.id}`);
              parentId = newCategory.id; // 更新父级ID为新创建的分类ID
              lastCreatedCategoryId = newCategory.id;
            } else {
              console.warn(`未找到新创建的分类: "${currentName}"`);
            }
          }
        }
      }

      // 设置最后创建的分类为当前选中的分类
      if (lastCreatedCategoryId) {
        spuForm.categoryId = lastCreatedCategoryId;
        console.log(`将最后创建的分类ID ${lastCreatedCategoryId} 设置为当前选中值`);
        ElMessage.success(`创建多级分类 "${categoryName}" 成功`);
        return lastCreatedCategoryId;
      }
    } else {
      // 单级分类的处理（原有逻辑）
      const categoryData = {
        name: categoryName,
        parentId: 0, // 默认为顶级分类
        picUrl: "", // 默认空图片
        sort: 0, // 默认排序
        status: 0, // 默认启用
      } as ProductCategoryApi.CategoryVO;

      console.log("发送创建单级分类请求, 数据:", categoryData);
      const result = await ProductCategoryApi.createCategory(categoryData);
      console.log(`创建单级分类 "${categoryName}" API返回结果:`, result);

      // 创建成功后，刷新分类列表并选中新创建的分类
      if (result) {
        ElMessage.success(`创建分类 "${categoryName}" 成功`);
        console.log("开始刷新分类列表");
        await getCategoryOptions();
        console.log("分类列表刷新完成, 当前列表:", categoryOptions.value);
        // 查找并设置新创建的分类ID
        const newCategory = categoryOptions.value.find(
          (item) => item.name === categoryName
        );
        if (newCategory) {
          console.log(`找到新创建的分类: "${categoryName}", ID: ${newCategory.id}`);
          spuForm.categoryId = newCategory.id;
          console.log(`已将新分类ID ${newCategory.id} 设置为当前选中值`);
          return newCategory.id;
        } else {
          console.warn(`未找到新创建的分类: "${categoryName}"`);
        }
      }
    }
  } catch (error: any) {
    console.error("创建分类API调用失败:", error);
    ElMessage.error(`创建分类 "${categoryName}" 失败: ${error.message || "未知错误"}`);
  }
};

// 创建新品牌
const handleCreateBrand = async (brandName: string) => {
  try {
    console.log("开始创建新品牌:", brandName);

    // 检查是否已存在同名品牌
    const existingBrand = brandOptions.value.find((item) => item.name === brandName);
    if (existingBrand) {
      console.log(`品牌 "${brandName}" 已存在, 直接选中`);
      spuForm.brandId = existingBrand.id;
      return;
    }

    // 调用创建品牌接口
    const brandData: ProductBrandApi.BrandVO = {
      name: brandName,
      picUrl: "", // 默认空图片
      sort: 0, // 默认排序
      description: "", // 默认空描述
      status: 0, // 默认启用
    };
    console.log("发送创建品牌请求, 数据:", brandData);
    const result = await ProductBrandApi.createBrand(brandData);
    console.log("创建品牌API返回结果:", result);

    // 创建成功后，刷新品牌列表并选中新创建的品牌
    if (result) {
      ElMessage.success(`创建品牌 "${brandName}" 成功`);
      console.log("开始刷新品牌列表");
      await getBrandOptions();
      console.log("品牌列表刷新完成, 当前列表:", brandOptions.value);
      // 查找并设置新创建的品牌ID
      const newBrand = brandOptions.value.find((item) => item.name === brandName);
      if (newBrand) {
        console.log("找到新创建的品牌:", newBrand);
        spuForm.brandId = newBrand.id;
        console.log("已将新品牌ID设置为当前选中值:", newBrand.id);
      } else {
        console.warn("未找到新创建的品牌:", brandName);
      }
    }
  } catch (error: any) {
    console.error("创建品牌API调用失败:", error);
    ElMessage.error(`创建品牌 "${brandName}" 失败: ${error.message || "未知错误"}`);
  }
};

// 加载SPU数据
const loadSpuData = async (spuId: number) => {
  try {
    const data = await ProductSpuApi.getSpu(spuId);
    if (data) {
      // 填充SPU表单数据
      spuForm.id = data.id;
      spuForm.name = data.name;
      spuForm.categoryId = data.categoryId;
      spuForm.brandId = data.brandId;
      spuForm.introduction = data.introduction;
      spuForm.keyword = data.keyword;
      
      // 加载更多字段
      spuForm.status = data.status;
      spuForm.specType = data.specType;
      spuForm.sort = data.sort || 0;
      spuForm.virtualSalesCount = data.virtualSalesCount || 0;
      spuForm.giveIntegral = data.giveIntegral || 0;
      spuForm.description = data.description || "";
      
      // 处理配送方式
      if (data.deliveryTypes) {
        // 检查deliveryTypes是否是字符串格式（可能是逗号分隔的字符串）
        if (typeof data.deliveryTypes === 'string') {
          spuForm.deliveryTypes = data.deliveryTypes.split(',').map(item => item.trim());
        } else {
          spuForm.deliveryTypes = data.deliveryTypes;
        }
      } else {
        spuForm.deliveryTypes = [];
      }

      // 处理图片
      if (data.picUrl) {
        spuForm.coverImages = [
          {
            name: "封面图",
            url: data.picUrl,
          },
        ];
      }

      if (data.sliderPicUrls && data.sliderPicUrls.length > 0) {
        // 处理sliderPicUrls可能是字符串的情况
        if (typeof data.sliderPicUrls === 'string') {
          try {
            const urls = JSON.parse(data.sliderPicUrls);
            spuForm.sliderImages = urls.map((url: string, index: number) => ({
              name: `轮播图${index + 1}`,
              url,
            }));
          } catch {
            // 可能是单个URL或者普通字符串
            spuForm.sliderImages = [{ name: "轮播图1", url: data.sliderPicUrls }];
          }
        } else {
          // 数组情况
        spuForm.sliderImages = data.sliderPicUrls.map((url: string, index: number) => ({
          name: `轮播图${index + 1}`,
          url,
        }));
        }
      }

      // 初始化多分类
      await initSelectedCategories(data);

      // 如果已有SKU数据，加载SKU列表
      if (data.skus && data.skus.length > 0) {
        skuList.value = data.skus.map((sku: any) => {
          // 转换SKU数据格式
          return {
            id: sku.id,
            spuId: sku.spuId,
            properties: sku.properties || [],
            picUrl: sku.picUrl || "",
            barCode: sku.barCode || "",
            price: sku.price / 100, // 转换为元
            marketPrice: (sku.marketPrice || 0) / 100,
            costPrice: (sku.costPrice || 0) / 100,
            stock: sku.stock || 0,
            weight: sku.weight || 0,
            volume: sku.volume || 0,
          };
        });
      }
    }
  } catch (error) {
    console.error("加载SPU数据失败:", error);
    ElMessage.error("加载商品数据失败");
  }
};

// 初始化已选分类
const initSelectedCategories = async (data: any) => {
  // 优先从关联表数据获取多分类
  if (data.categoryIds && data.categoryIds.length > 0) {
    spuForm.categoryIds = data.categoryIds;
    
    // 确保主分类排在第一位
    if (data.categoryId && data.categoryIds.includes(data.categoryId)) {
      spuForm.categoryIds = [
        data.categoryId,
        ...data.categoryIds.filter(id => id !== data.categoryId)
      ];
    }
    
    // 从分类列表查找分类信息
    for (const categoryId of spuForm.categoryIds) {
      const category = categoryOptions.value.find(item => item.id === categoryId);
      if (category) {
        selectedCategories.value.push(category);
      }
    }
  } 
  // 兼容旧数据，只有主分类的情况
  else if (data.categoryId) {
    const category = categoryOptions.value.find(item => item.id === data.categoryId);
    if (category) {
      selectedCategories.value = [category];
      spuForm.categoryIds = [data.categoryId];
    }
  }
};

// 初始化SKU列表
const initSkuList = () => {
  skuList.value = props.selectedSkus.map((sku) => {
    // 确保SKU数据格式统一
    return {
      id: sku.id,
      spuId: props.spuId ? Number(props.spuId) : null,
      properties: sku.properties || [],
      picUrl: sku.picUrl,
      barCode: sku.barCode || "",
      price: sku.price ? sku.price / 100 : 0, // 转换为元
      marketPrice: sku.marketPrice ? sku.marketPrice / 100 : 0,
      costPrice: sku.costPrice ? sku.costPrice / 100 : 0,
      stock: sku.stock || 0,
      weight: sku.weight || 0,
      volume: sku.volume || 0,
    };
  });
};

// 处理图片上传成功
const handlePicSuccess = (response, type) => {
  if (response.code === 0) {
    const fileUrl = response.data;
    if (type === "coverImages") {
      spuForm.coverImages = [
        {
          name: "封面图",
          url: fileUrl,
        },
      ];
    } else if (type === "sliderImages") {
      spuForm.sliderImages.push({
        name: `轮播图${spuForm.sliderImages.length + 1}`,
        url: fileUrl,
      });
    }
  } else {
    ElMessage.error("图片上传失败");
  }
};

// 处理图片移除
const handlePicRemove = (file, type) => {
  if (type === "coverImages") {
    spuForm.coverImages = [];
  } else if (type === "sliderImages") {
    const fileUrl = file.url || (file.response && file.response.data);
    spuForm.sliderImages = spuForm.sliderImages.filter((item) => item.url !== fileUrl);
  }
};

// 添加规格
const handleAddSku = () => {
  skuList.value.push({
    id: null,
    spuId: props.spuId ? Number(props.spuId) : null,
    properties: [],
    picUrl: "",
    barCode: "",
    price: 0,
    marketPrice: 0,
    costPrice: 0,
    stock: 0,
    weight: 0,
    volume: 0,
  });
};

// 删除规格
const handleDeleteSku = (index) => {
  ElMessageBox.confirm("确定要删除该规格吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      skuList.value.splice(index, 1);
      ElMessage.success("删除成功");
    })
    .catch(() => {});
};

// 更新表单数据中的分类信息
const updateCategoryFormData = () => {
  spuForm.categoryIds = selectedCategories.value.map(item => item.id);
  
  // 设置主分类ID（第一个分类为主分类）
  if (selectedCategories.value.length > 0) {
    spuForm.categoryId = selectedCategories.value[0].id;
  } else {
    spuForm.categoryId = undefined;
  }
};

// 移除分类
const removeCategory = (index: number) => {
  selectedCategories.value.splice(index, 1);
  
  // 更新表单数据
  updateCategoryFormData();
};

// 保存数据
const handleSave = async () => {
  if (!spuFormRef.value) return;

  try {
    // 表单验证
    await spuFormRef.value.validate();

    // 检查是否有SKU
    if (skuList.value.length === 0) {
      ElMessage.warning("请至少添加一个规格");
      return;
    }

    // 检查是否有分类
    if (selectedCategories.value.length === 0) {
      ElMessage.warning("请至少选择一个商品分类");
      return;
    }

    // 准备SPU数据
    const spuData = {
      id: spuForm.id,
      name: spuForm.name,
      categoryId: spuForm.categoryId,
      categoryIds: spuForm.categoryIds, // 添加多分类ID数组
      brandId: spuForm.brandId,
      introduction: spuForm.introduction,
      keyword: spuForm.keyword,
      picUrl: spuForm.coverImages.length > 0 ? spuForm.coverImages[0].url : "",
      sliderPicUrls: spuForm.sliderImages.map((item) => item.url),
      status: spuForm.status,
      specType: spuForm.specType,
      sort: spuForm.sort,
      virtualSalesCount: spuForm.virtualSalesCount,
      giveIntegral: spuForm.giveIntegral,
      deliveryTypes: spuForm.deliveryTypes,
      description: spuForm.description,
    };

    // 准备SKU数据 - 价格需要转换回分
    const skuData = skuList.value.map((sku) => ({
      id: sku.id,
      spuId: spuForm.id,
      properties: sku.properties,
      picUrl: sku.picUrl,
      barCode: sku.barCode,
      price: Math.round(sku.price * 100), // 转换为分
      marketPrice: Math.round(sku.marketPrice * 100),
      costPrice: Math.round(sku.costPrice * 100),
      stock: sku.stock,
      weight: sku.weight,
      volume: sku.volume,
    }));

    // 使用新的接口保存数据
    await saveSpuWithSkus({
      // SPU数据
      id: spuData.id,
      name: spuData.name,
      categoryId: spuData.categoryId,
      categoryIds: spuData.categoryIds,
      brandId: spuData.brandId,
      introduction: spuData.introduction,
      keyword: spuData.keyword,
      picUrl: spuData.picUrl,
      sliderPicUrls: spuData.sliderPicUrls,
      status: spuData.status,
      specType: spuData.specType,
      sort: spuData.sort,
      virtualSalesCount: spuData.virtualSalesCount,
      giveIntegral: spuData.giveIntegral,
      deliveryTypes: spuData.deliveryTypes,
      description: spuData.description,
      // SKU数据
      skus: skuData
    });

    ElMessage.success("保存成功");
    emit("save");
  } catch (error: any) {
    console.error("保存数据失败:", error);
    ElMessage.error("保存失败：" + (error.message || "未知错误"));
  }
};

// 取消编辑
const handleCancel = () => {
  emit("cancel");
};
</script>

<style lang="scss" scoped>
.spu-sku-editor {
  padding: 20px 0;
}

.box-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: bold;
}

.sku-table-card {
  margin-top: 20px;
}

.empty-image {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 12px;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
}

.sku-properties {
  display: flex;
  flex-wrap: wrap;
}

.sku-property-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}

.form-footer {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.category-container {
  display: flex;
  align-items: center;
}

.selected-categories {
  margin-right: 10px;
}

.category-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}

.primary-category {
  background-color: #409eff;
  color: #fff;
}

.primary-label {
  margin-left: 5px;
  font-size: 0.8em;
  color: #fff;
}

.category-actions {
  margin-left: 10px;
}

.category-select-container {
  display: flex;
  flex-direction: column;
}

.category-popover-actions {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
}
</style>
