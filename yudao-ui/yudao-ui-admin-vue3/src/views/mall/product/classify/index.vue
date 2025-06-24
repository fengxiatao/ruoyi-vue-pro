<template>
  <div class="app-container">
    <el-card class="box-card" v-if="!showSpuSkuEditor">
      <template #header>
        <div class="card-header">
          <span class="card-title">SKU-SPU关联管理</span>
          <el-button type="primary" @click="handleAssociateSpu" :disabled="!selectedSkuList.length">关联到SPU</el-button>
        </div>
      </template>
      
      <div class="classify-container">
        <!-- 左侧：SKU选择区域 -->
        <div class="sku-selection-area">
          <div class="search-bar">
            <el-form :inline="true" :model="queryParams">
              <el-form-item label="SKU名称">
                <el-input v-model="queryParams.name" placeholder="请输入SKU名称" clearable @keyup.enter="handleQuery" />
              </el-form-item>
              <el-form-item label="条码">
                <el-input v-model="queryParams.barCode" placeholder="请输入条码" clearable @keyup.enter="handleQuery" />
              </el-form-item>
              <el-form-item label="SPU状态">
                <el-select v-model="queryParams.spuStatus" placeholder="请选择SPU状态" clearable>
                  <el-option label="未关联" :value="0" />
                  <el-option label="已关联" :value="1" />
                  <el-option label="全部" :value="null" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleQuery">查询</el-button>
                <el-button @click="resetQuery">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
          
          <el-table
            ref="skuTableRef"
            v-loading="loading"
            :data="skuList"
            @selection-change="handleSelectionChange"
            style="width: 100%"
          >
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column label="SKU图片" width="80" align="center">
              <template #default="{ row }">
                <el-image
                  v-if="row.picUrl"
                  :src="row.picUrl"
                  :preview-src-list="[row.picUrl]"
                  preview-teleported
                  style="width: 60px; height: 60px"
                />
                <span v-else>无图片</span>
              </template>
            </el-table-column>
            <el-table-column label="SKU名称" prop="name" min-width="180" show-overflow-tooltip />
            <el-table-column label="规格" min-width="150" show-overflow-tooltip>
              <template #default="{ row }">
                <el-tag
                  v-for="(prop, index) in row.properties"
                  :key="index"
                  size="small"
                  class="sku-property-tag"
                >
                  {{ prop.propertyName }}: {{ prop.valueName }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="条码" prop="barCode" min-width="120" show-overflow-tooltip />
            <el-table-column label="价格" width="100" align="center">
              <template #default="{ row }">
                {{ formatPrice(row.price) }}
              </template>
            </el-table-column>
            <el-table-column label="库存" width="80" align="center" prop="stock" />
            <el-table-column label="SPU" min-width="120" show-overflow-tooltip>
              <template #default="{ row }">
                <span v-if="row.spuId">{{ getSpuName(row.spuId) }}</span>
                <el-tag v-else type="danger" size="small">未关联</el-tag>
              </template>
            </el-table-column>
          </el-table>
          
          <pagination
            v-show="total > 0"
            :total="total"
            v-model:page="queryParams.pageNo"
            v-model:limit="queryParams.pageSize"
            @pagination="getSkuList"
          />
        </div>
        
        <!-- 右侧：SPU关联区域 -->
        <div class="spu-association-area" v-if="showSpuForm">
          <div class="form-header">
            <span class="form-title">SPU关联</span>
            <el-button type="text" @click="showSpuForm = false">关闭</el-button>
          </div>
          
          <el-tabs v-model="activeTab">
            <el-tab-pane label="选择现有SPU" name="select">
              <el-form :inline="true" class="spu-search-form">
                <el-form-item label="SPU名称">
                  <el-input v-model="spuQueryParams.name" placeholder="请输入SPU名称" clearable @keyup.enter="handleSpuQuery" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleSpuQuery">查询</el-button>
                </el-form-item>
              </el-form>
              
              <el-table
                ref="spuTableRef"
                v-loading="spuLoading"
                :data="spuList"
                highlight-current-row
                @current-change="handleSpuCurrentChange"
                style="width: 100%"
              >
                <el-table-column label="SPU名称" prop="name" min-width="180" show-overflow-tooltip />
                <el-table-column label="分类" prop="categoryName" min-width="120" show-overflow-tooltip />
                <el-table-column label="品牌" prop="brandName" width="100" show-overflow-tooltip />
                <el-table-column label="销量" width="80" align="center" prop="salesCount" />
                <el-table-column label="操作" width="100" align="center">
                  <template #default="{ row }">
                    <el-button type="primary" link @click="selectSpu(row)">选择</el-button>
                  </template>
                </el-table-column>
              </el-table>
              
              <pagination
                v-show="spuTotal > 0"
                :total="spuTotal"
                v-model:page="spuQueryParams.pageNo"
                v-model:limit="spuQueryParams.pageSize"
                @pagination="getSpuList"
              />
            </el-tab-pane>
            
            <el-tab-pane label="创建新SPU" name="create">
              <el-form 
                ref="spuFormRef"
                :model="spuForm"
                :rules="spuRules"
                label-width="100px"
                class="spu-form"
              >
                <el-form-item label="SPU名称" prop="name">
                  <el-input v-model="spuForm.name" placeholder="请输入SPU名称" />
                </el-form-item>
                <el-form-item label="分类" prop="categoryId">
                  <el-cascader
                    v-model="spuForm.categoryId"
                    :options="categoryOptions"
                    :props="{ checkStrictly: true }"
                    placeholder="请选择商品分类"
                    clearable
                  />
                </el-form-item>
                <el-form-item label="商品品牌" prop="brandId">
                  <el-select v-model="spuForm.brandId" placeholder="请选择品牌">
                    <el-option 
                      v-for="brand in brandOptions" 
                      :key="brand.id" 
                      :label="brand.name" 
                      :value="brand.id" 
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="商品简介">
                  <el-input v-model="spuForm.introduction" type="textarea" placeholder="请输入商品简介" />
                </el-form-item>
                <el-form-item label="关键字">
                  <el-input v-model="spuForm.keyword" placeholder="请输入关键字，多个用逗号分隔" />
                </el-form-item>
                <el-form-item label="商品单位">
                  <el-input v-model="spuForm.unit" placeholder="件/个/盒" />
                </el-form-item>
                <el-form-item label="商品图片">
                  <el-upload
                    :action="uploadFileUrl"
                    list-type="picture-card"
                    :headers="headers"
                    :multiple="true"
                    :limit="5"
                    :file-list="spuForm.picUrls"
                    :on-success="handlePicSuccess"
                  >
                    <Icon icon="ep:plus" />
                  </el-upload>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="createSpu">创建SPU</el-button>
                  <el-button @click="resetSpuForm">重置</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
          
          <!-- 关联预览 -->
          <div class="association-preview" v-if="selectedSpu">
            <h4>已选择SPU: {{ selectedSpu.name }}</h4>
            <p>将关联 {{ selectedSkuList.length }} 个SKU到此SPU</p>
            <div class="selected-sku-list">
              <el-tag 
                v-for="sku in selectedSkuList" 
                :key="sku.id" 
                closable 
                @close="removeSelectedSku(sku)"
                class="selected-sku-tag"
              >
                {{ sku.name }}
              </el-tag>
            </div>
            <div class="action-buttons">
              <el-button type="primary" @click="saveAssociation">保存关联</el-button>
              <el-button @click="cancelAssociation">取消</el-button>
            </div>
          </div>
        </div>
      </div>
    </el-card>
    
    <!-- 添加SpuSkuEditor组件 -->
    <SpuSkuEditor
      v-if="showSpuSkuEditor"
      :selected-skus="selectedSkuList"
      :spu-id="selectedSpuId"
      @cancel="handleBackToList"
      @save="handleSaveSuccess"
    />
    
    <!-- 操作结果弹窗 -->
    <el-dialog
      v-model="resultDialogVisible"
      title="操作结果"
      width="500px"
    >
      <div class="result-content">
        <div v-if="operationSuccess" class="success-message">
          <Icon icon="ep:circle-check" class="success-icon" />
          <span>操作成功！已将 {{ associatedSkuCount }} 个SKU关联到SPU"{{ selectedSpu?.name }}"</span>
        </div>
        <div v-else class="error-message">
          <Icon icon="ep:circle-close" class="error-icon" />
          <span>操作失败：{{ errorMessage }}</span>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="resultDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleAfterOperation">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAccessToken } from '@/utils/auth'
import * as ProductSpuApi from '@/api/mall/product/spu'
import * as ProductCategoryApi from '@/api/mall/product/category'
import * as ProductBrandApi from '@/api/mall/product/brand'
import Pagination from '@/components/Pagination/index.vue'
import SpuSkuEditor from './components/SpuSkuEditor.vue'

// 数据加载相关
const loading = ref(false)
const spuLoading = ref(false)
const skuList = ref([])
const spuList = ref([])
const total = ref(0)
const spuTotal = ref(0)
const skuTableRef = ref()
const spuTableRef = ref()
const spuFormRef = ref()

// 查询参数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: '',
  barCode: '',
  spuStatus: null as number | null, // 0表示未关联，1表示已关联
})

const spuQueryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: '',
})

// SPU表单相关
const showSpuForm = ref(false)
const activeTab = ref('select')
const selectedSpu = ref(null)
const selectedSkuList = ref([])
const categoryOptions = ref([])
const brandOptions = ref([])

// 结果弹窗相关
const resultDialogVisible = ref(false)
const operationSuccess = ref(true)
const errorMessage = ref('')
const associatedSkuCount = ref(0)

// SPU表单数据和校验规则
const spuForm = reactive({
  name: '',
  categoryId: null,
  brandId: null,
  introduction: '',
  keyword: '',
  unit: '个',
  picUrls: [],
})

const spuRules = {
  name: [{ required: true, message: '请输入SPU名称', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择商品分类', trigger: 'change' }],
  brandId: [{ required: true, message: '请选择商品品牌', trigger: 'change' }],
}

// 上传相关
const uploadFileUrl = import.meta.env.VITE_UPLOAD_URL
const headers = computed(() => {
  return { Authorization: 'Bearer ' + getAccessToken() }
})

// 获取SKU列表
const getSkuList = async() => {
  try {
    loading.value = true
    const response = await ProductSpuApi.getSkuPage(queryParams)
    skuList.value = response.list || []
    total.value = response.total || 0
    loading.value = false
  } catch (error) {
    console.error('获取SKU列表失败:', error)
    loading.value = false
  }
}

// 获取SPU列表
const getSpuList = async() => {
  try {
    spuLoading.value = true
    const response = await ProductSpuApi.getSpuPage(spuQueryParams)
    spuList.value = response.list || []
    spuTotal.value = response.total || 0
    spuLoading.value = false
  } catch (error) {
    console.error('获取SPU列表失败:', error)
    spuLoading.value = false
  }
}

// 获取分类数据
const getCategoryOptions = async() => {
  try {
    const response = await ProductCategoryApi.getCategoryList({})
    categoryOptions.value = response || []
  } catch (error) {
    console.error('获取分类数据失败:', error)
  }
}

// 获取品牌数据
const getBrandOptions = async() => {
  try {
    const response = await ProductBrandApi.getBrandList({})
    brandOptions.value = response || []
  } catch (error) {
    console.error('获取品牌数据失败:', error)
  }
}

// 格式化价格
const formatPrice = (price) => {
  if (!price && price !== 0) return '--'
  return '¥' + (price / 100).toFixed(2)
}

// 根据SPU ID获取SPU名称
const getSpuName = (spuId) => {
  const spu = spuList.value.find(item => item.id === spuId)
  return spu ? spu.name : `SPU(${spuId})`
}

// 处理查询
const handleQuery = () => {
  queryParams.pageNo = 1
  getSkuList()
}

// 重置查询
const resetQuery = () => {
  queryParams.name = ''
  queryParams.barCode = ''
  queryParams.spuStatus = null
  handleQuery()
}

// 处理SPU查询
const handleSpuQuery = () => {
  spuQueryParams.pageNo = 1
  getSpuList()
}

// 表格选择变更
const handleSelectionChange = (selection) => {
  selectedSkuList.value = selection
}

// SPU表格当前行变更
const handleSpuCurrentChange = (row) => {
  if (row) {
    selectedSpu.value = row
  }
}

// 移除已选择的SKU
const removeSelectedSku = (sku) => {
  // 取消表格中的选择
  skuTableRef.value?.toggleRowSelection(sku, false)
  // 从已选列表中移除
  selectedSkuList.value = selectedSkuList.value.filter(item => item.id !== sku.id)
}

// 选择SPU
const selectSpu = (spu) => {
  selectedSpu.value = spu
  // 自动设置表格当前行
  spuTableRef.value?.setCurrentRow(spu)
}

// 添加页面切换到SpuSkuEditor组件的功能
const showSpuSkuEditor = ref(false)
const selectedSpuId = ref(null)

// 处理SPU关联
const handleAssociateSpu = () => {
  if (!selectedSkuList.value.length) {
    ElMessage.warning('请至少选择一个SKU')
    return
  }
  
  showSpuSkuEditor.value = true
}

// 处理返回列表
const handleBackToList = () => {
  showSpuSkuEditor.value = false
  // 重新加载SKU列表
  getSkuList()
}

// 处理保存成功
const handleSaveSuccess = () => {
  showSpuSkuEditor.value = false
  ElMessage.success('SPU与SKU关联成功')
  // 重新加载SKU列表
  getSkuList()
  // 清空选中状态
  selectedSkuList.value = []
  skuTableRef.value?.clearSelection()
}

// 处理图片上传成功
const handlePicSuccess = (response, file, fileList) => {
  if (response.code === 0) {
    spuForm.picUrls = fileList.map(item => {
      return {
        name: item.name,
        url: item.response ? item.response.data : item.url
      }
    })
  } else {
    ElMessage.error('图片上传失败')
  }
}

// 创建SPU
const createSpu = async () => {
  // 表单验证
  if (!spuFormRef.value) return
  
  try {
    await spuFormRef.value.validate()
    
    // 准备SPU数据
    const spuData = {
      ...spuForm,
      picUrls: spuForm.picUrls.map(item => item.url),
    }
    
    // 调用API创建SPU
    const result = await ProductSpuApi.createSpu(spuData)
    
    // 处理创建成功
    if (result) {
      ElMessage.success('SPU创建成功')
      // 设置为当前选中的SPU
      selectedSpu.value = result
      // 切换到选择标签页
      activeTab.value = 'select'
      // 刷新SPU列表
      getSpuList()
    }
  } catch (error) {
    console.error('创建SPU失败:', error)
    ElMessage.error('创建SPU失败')
  }
}

// 重置SPU表单
const resetSpuForm = () => {
  if (spuFormRef.value) {
    spuFormRef.value.resetFields()
  }
  spuForm.picUrls = []
}

// 保存关联
const saveAssociation = async () => {
  if (!selectedSpu.value) {
    ElMessage.warning('请选择一个SPU')
    return
  }
  
  if (!selectedSkuList.value.length) {
    ElMessage.warning('请至少选择一个SKU')
    return
  }
  
  try {
    // 准备请求数据
    const associationData = {
      spuId: selectedSpu.value.id,
      skuIds: selectedSkuList.value.map(sku => sku.id)
    }
    
    // 调用API保存关联
    await ProductSpuApi.associateSkusToSpu(associationData)
    
    // 显示成功结果
    operationSuccess.value = true
    associatedSkuCount.value = selectedSkuList.value.length
    resultDialogVisible.value = true
  } catch (error) {
    console.error('关联SKU到SPU失败:', error)
    // 显示失败结果
    operationSuccess.value = false
    errorMessage.value = error.message || '关联失败，请重试'
    resultDialogVisible.value = true
  }
}

// 取消关联
const cancelAssociation = () => {
  showSpuForm.value = false
  selectedSpu.value = null
  // 不清除已选SKU，方便用户重新操作
}

// 处理操作后的动作
const handleAfterOperation = () => {
  resultDialogVisible.value = false
  if (operationSuccess.value) {
    // 重新加载SKU列表
    getSkuList()
    // 清空选中状态
    selectedSkuList.value = []
    selectedSpu.value = null
    skuTableRef.value?.clearSelection()
    showSpuForm.value = false
  }
}

// 初始化
onMounted(() => {
  getSkuList()
  getCategoryOptions()
  getBrandOptions()
})
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 18px;
  font-weight: bold;
}

.classify-container {
  display: flex;
  margin-top: 20px;
  gap: 20px;
  min-height: 600px;
}

.sku-selection-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.spu-association-area {
  width: 400px;
  border-left: 1px solid #e6e6e6;
  padding-left: 20px;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e6e6e6;
}

.form-title {
  font-size: 16px;
  font-weight: bold;
}

.spu-search-form {
  margin-bottom: 15px;
}

.spu-form {
  margin-top: 15px;
}

.association-preview {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.selected-sku-list {
  margin: 15px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.selected-sku-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}

.action-buttons {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.result-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.success-message, .error-message {
  display: flex;
  align-items: center;
  gap: 10px;
}

.success-icon {
  font-size: 24px;
  color: #67c23a;
}

.error-icon {
  font-size: 24px;
  color: #f56c6c;
}

.sku-property-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}
</style>
