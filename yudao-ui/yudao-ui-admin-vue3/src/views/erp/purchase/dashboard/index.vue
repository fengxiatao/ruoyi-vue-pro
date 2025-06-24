<template>
  <div class="erp-purchase-dashboard">
    <ContentWrap>
      <!-- 顶部操作区 -->
      <el-card class="header-card">
        <div class="dashboard-header">
          <el-input
            v-model="globalSearch"
            placeholder="搜索产品/供应商/单号"
            class="global-search"
            :prefix-icon="Search"
            size="small"
          />
          <div class="quick-actions">
            <el-button type="primary" size="small" @click="openForm('create')">新建采购单</el-button>
            <el-button size="small" @click="handleStockWarningClick">
              库存预警 <el-badge :value="10" />
            </el-button>
            <el-button size="small">待处理 <el-badge :value="5" /></el-button>
          </div>
        </div>
      </el-card>

      <!-- 主体内容区 -->
      <div class="dashboard-main-layout">
        <!-- 左侧高亮分组卡片区 -->
        <div class="main-left">
          <el-card class="main-card urgent-card">
            <div class="card-header">紧急补货 <el-badge :value="urgentList.length" /></div>
            <el-table :data="urgentList" size="small" border>
              <el-table-column prop="productName" label="产品" min-width="80" />
              <el-table-column prop="gap" label="缺口" width="50" align="right" />
              <el-table-column prop="action" label="操作" width="60" align="center">
                <template #default="scope">
                  <el-button size="small" type="danger" @click="handleQuickReplenish(scope.row)">补货</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
          <el-card class="main-card transit-card">
            <div class="card-header">在途监控</div>
            <el-table :data="transitList" size="small" border>
              <el-table-column prop="productName" label="产品" min-width="80" />
              <el-table-column prop="inTransit" label="在途数" width="60" align="right" />
              <el-table-column prop="eta" label="预计到货" width="80" align="center" />
            </el-table>
          </el-card>
          <el-card class="main-card todo-card">
            <div class="card-header">待处理</div>
            <el-table :data="todoList" size="small" border>
              <el-table-column prop="task" label="任务" min-width="100" />
              <el-table-column prop="status" label="状态" width="60" align="center">
                <template #default="scope">
                  <el-tag :type="scope.row.status === 'urgent' ? 'danger' : 'warning'" size="small">
                    {{ scope.row.status === 'urgent' ? '紧急' : '一般' }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>

        <!-- 中部智能采购清单区 -->
        <div class="main-center">
          <el-card class="main-card smart-list-card">
            <div class="card-header">智能采购清单</div>
            <el-table :data="smartPurchaseList || []" @row-click="handleProductSelect" highlight-current-row :row-class-name="row => row.id === selectedProduct.id ? 'selected-row' : ''">
              <el-table-column prop="name" label="产品" width="140" />
              <el-table-column prop="suppliers[0].supplierName" label="推荐供应商" width="120" :formatter="row => (row.suppliers && row.suppliers[0]?.supplierName) || '-'" />
              <el-table-column label="建议数量" width="80" />
              <el-table-column label="参考价" width="80" />
              <el-table-column label="操作" width="90" />
            </el-table>
          </el-card>
          <div class="main-bottom-row">
            <el-card class="main-card price-trend-card">
              <div class="card-header">价格趋势</div>
              <PriceTrendChart :product="priceTrendProduct" :suppliers="priceTrendSuppliers || []" height="120px" />
            </el-card>
            <el-card class="main-card supplier-compare-card">
              <div class="card-header">供应商对比
                <el-button size="small" text @click="showSupplierCompare = !showSupplierCompare">[展开]</el-button>
              </div>
              <SupplierRatingChart :suppliers="topSuppliers || []" v-if="showSupplierCompare" />
            </el-card>
          </div>
        </div>

        <!-- 右侧折叠面板区 -->
        <div class="main-right">
          <el-collapse v-model="rightPanelActive" accordion>
            <el-collapse-item name="risk">
              <template #title>
                供应链风险 <el-badge :value="riskIndicators.filter(i=>i.value>50).length" v-if="riskIndicators.some(i=>i.value>50)" />
              </template>
              <SupplyChainRiskChart />
            </el-collapse-item>
            <el-collapse-item name="feedback">
              <template #title>
                业务反馈 <el-badge :value="businessFeedback.filter(i=>i.status==='pending').length" v-if="businessFeedback.some(i=>i.status==='pending')" />
              </template>
              <div class="business-feedback-list">
                <div v-for="item in businessFeedback" :key="item.id" class="feedback-item">
                  <el-tag :type="item.type==='complaint' ? 'danger' : 'info'" size="small">{{ item.type==='complaint' ? '投诉' : '建议' }}</el-tag>
                  <span class="feedback-content">{{ item.content }}</span>
                  <span class="feedback-status" v-if="item.status==='pending'">待处理</span>
                  <span class="feedback-status done" v-else>已完成</span>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
    </ContentWrap>
    
    <!-- 表单弹窗：添加/修改 -->
    <PurchaseOrderForm ref="formRef" @success="getList" />

    <div class="tab-bar">
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="库存视图" name="stock" />
        <el-tab-pane label="供应商视图" name="supplier" />
        <el-tab-pane label="成本视图" name="cost" />
      </el-tabs>
    </div>
    <div v-if="activeTab === 'stock'">
      <el-card class="main-card">
        <div class="card-header">库存总览</div>
        <el-table :data="stockViewData">
          <el-table-column prop="name" label="产品" />
          <el-table-column prop="stock" label="当前库存" />
          <el-table-column prop="min" label="最低库存" />
        </el-table>
      </el-card>
    </div>
    <div v-if="activeTab === 'supplier'">
      <el-card class="main-card">
        <div class="card-header">供应商评分</div>
        <el-table :data="supplierViewData">
          <el-table-column prop="name" label="供应商" />
          <el-table-column prop="score" label="评分" />
          <el-table-column prop="price" label="报价" />
        </el-table>
      </el-card>
    </div>
    <div v-if="activeTab === 'cost'">
      <el-card class="main-card">
        <div class="card-header">采购成本</div>
        <el-table :data="costViewData">
          <el-table-column prop="name" label="产品" />
          <el-table-column prop="cost" label="总成本" />
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { PurchaseOrderApi, PurchaseOrderVO } from '@/api/erp/purchase/order'
import PurchaseOrderForm from '../order/PurchaseOrderForm.vue'
import { Warning, TrendCharts, Money, Search, ArrowDown, MagicStick } from '@element-plus/icons-vue'
import StockDemandChart from './components/StockDemandChart.vue'
import SupplierRatingChart from './components/SupplierRatingChart.vue'
import PurchaseTrendChart from './components/PurchaseTrendChart.vue'
import CategoryPieChart from './components/CategoryPieChart.vue'
import PriceTrendChart from './components/PriceTrendChart.vue'
import SupplyChainRiskChart from './components/SupplyChainRiskChart.vue'
import SupplyChainMapChart from './components/SupplyChainMapChart.vue'

/** ERP 采购决策仪表盘 */
defineOptions({ name: 'ErpPurchaseDashboard' })

// 角色视图控制
const currentView = ref('purchaser') // 默认采购员视图
const handleViewChange = (view: string) => {
  currentView.value = view
  // 根据不同角色调整显示的内容
  showAiAssistant.value = view !== 'sales' // 销售视图不显示AI助手
}

// 智能采购助手
const showAiAssistant = ref(true)
const aiSuggestions = ref([
  {
    id: 1,
    type: 'warning',
    icon: 'warning',
    title: '电池库存预警',
    description: '电动车电池48V库存低于安全水平，建议采购100个，预计节省5%成本',
    action: 'purchase',
    details: { product: '电动车电池48V', quantity: 100, supplier: '广州电池厂' }
  },
  {
    id: 2,
    type: 'info',
    icon: 'trend-charts',
    title: '价格趋势提醒',
    description: '锂电池价格预计下月上涨10%，建议提前锁定价格',
    action: 'lock-price',
    details: { product: '锂电池', supplier: '广州电池厂', currentPrice: 120 }
  },
  {
    id: 3,
    type: 'success',
    icon: 'money',
    title: '供应商替换建议',
    description: '发现深圳新供应商可提供同质量轮胎，价格低15%',
    action: 'change-supplier',
    details: { product: '摩托车轮胎26寸', newSupplier: '深圳轮胎厂', savingRate: 15 }
  }
])

const refreshAiSuggestions = () => {
  // 实际项目中，这里会调用后端API获取最新的AI建议
  console.log('刷新AI建议')
}

const handleSuggestion = (suggestion: any) => {
  // 处理采纳AI建议的逻辑
  console.log('采纳建议:', suggestion)
  if (suggestion.action === 'purchase') {
    // 可以直接调用创建采购单的方法
    openForm('create', suggestion.details)
  }
}

const ignoreSuggestion = (suggestion: any) => {
  // 忽略建议
  console.log('忽略建议:', suggestion)
  aiSuggestions.value = aiSuggestions.value.filter(item => item.id !== suggestion.id)
}

// 价格趋势图
const smartPurchaseList = ref([
  { id: 'battery48v', name: '电动车电池48V', suppliers: [
    { supplierName: '广州电池厂', priceBase: 120, trend: [0, -5, -8, -3, 2, 5], score: 92 },
    { supplierName: '深圳配件厂', priceBase: 118, trend: [0, -6, -10, -5, 1, 4], score: 85 }
  ] },
  { id: 'tire26', name: '摩托车轮胎26寸', suppliers: [
    { supplierName: '杭州轮胎厂', priceBase: 85, trend: [0, 2, 5, 8, 10, 12], score: 88 },
    { supplierName: '深圳配件厂', priceBase: 90, trend: [0, 1, 3, 5, 7, 9], score: 80 }
  ] },
  { id: 'controller', name: '电动车控制器', suppliers: [
    { supplierName: '深圳配件厂', priceBase: 65, trend: [0, 3, -2, -5, -8, -4], score: 83 }
  ] }
])
const selectedProduct = ref(smartPurchaseList.value[0] || { id: '', name: '', suppliers: [] })
const handleProductSelect = (row) => {
  selectedProduct.value = row || { id: '', name: '', suppliers: [] }
}
const priceTrendSuppliers = computed(() => (selectedProduct.value && selectedProduct.value.suppliers) ? selectedProduct.value.suppliers : [])
const priceTrendProduct = computed(() => selectedProduct.value?.id || '')
const topSuppliers = computed(() => (selectedProduct.value && selectedProduct.value.suppliers) ? selectedProduct.value.suppliers : [])

// 供应链风险指标
const riskIndicators = ref([
  { name: '供应商交付风险', value: 35 },
  { name: '价格波动风险', value: 65 },
  { name: '质量稳定性', value: 20 },
  { name: '地缘政治风险', value: 85 }
])

// 供应链地图
const mapViewType = ref('inventory')
const mapCategory = ref('all')

// 标签页控制
const activeTab = ref('stock')

// 全局搜索
const globalSearch = ref('')

// 分析筛选条件
const analysisTimeRange = ref('30d')
const analysisCategory = ref('all')
const purchaseTrendTimeRange = ref('6m')

// 采购订单列表相关
const loading = ref(true) // 列表的加载中
const list = ref<PurchaseOrderVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  no: undefined,
  supplierId: undefined,
  productId: undefined,
  orderTime: [],
  status: undefined,
  remark: undefined,
  creator: undefined,
  inStatus: undefined,
  returnStatus: undefined
})

// 库存预警数据
const lowStockList = ref([
  { productName: '电动车电池48V', stockCount: 15, minStock: 50 },
  { productName: '摩托车轮胎26寸', stockCount: 8, minStock: 30 },
  { productName: '电动车控制器', stockCount: 5, minStock: 20 },
  { productName: '刹车片套装', stockCount: 12, minStock: 40 }
])

// 热销品类数据
const hotProducts = ref([
  { categoryName: '电池', salesGrowth: 15, predictedDemand: 320 },
  { categoryName: '轮胎', salesGrowth: 8, predictedDemand: 180 },
  { categoryName: '刹车系统', salesGrowth: -3, predictedDemand: 90 },
  { categoryName: '车灯', salesGrowth: 12, predictedDemand: 150 }
])

// 采购任务数据
const purchaseTasks = ref([
  { 
    productName: '电动车电池48V', 
    urgencyLevel: 'high', 
    requiredCount: 100, 
    stockCount: 15, 
    suggestedSupplier: '广州电池厂',
    estimatedPrice: 120,
    orderNo: 'PO20230601001',
    createTime: '2023-06-01 09:30:00',
    remark: '紧急补货，客户已催促'
  },
  { 
    productName: '摩托车轮胎26寸', 
    urgencyLevel: 'medium', 
    requiredCount: 50, 
    stockCount: 8, 
    suggestedSupplier: '杭州轮胎厂',
    estimatedPrice: 85,
    orderNo: 'PO20230602001',
    createTime: '2023-06-02 14:20:00',
    remark: '常规补货'
  },
  { 
    productName: '电动车控制器', 
    urgencyLevel: 'low', 
    requiredCount: 30, 
    stockCount: 5, 
    suggestedSupplier: '深圳配件厂',
    estimatedPrice: 65,
    orderNo: 'PO20230603001',
    createTime: '2023-06-03 11:15:00',
    remark: '提前备货'
  }
])

// 市场情报数据
const marketNews = ref([
  { title: '锂电池价格下降5%', date: '2023-06-05' },
  { title: '新型环保轮胎上市', date: '2023-06-03' },
  { title: '电动车市场需求增长15%', date: '2023-06-01' }
])

// 供应商对比展开控制
const showSupplierCompare = ref(false)
// 右侧折叠面板激活项
const rightPanelActive = ref('risk')

// 智能采购清单一键下单
const handleSmartOrder = (row: any) => {
  // 实际业务可弹窗或直接创建采购单
  openForm('create', { product: row.productName, supplier: row.suggestedSupplier, quantity: row.suggestedQty })
}

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await PurchaseOrderApi.getPurchaseOrderPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 打开表单 */
const formRef = ref()
const openForm = (type: string, data?: any) => {
  formRef.value.open(type, data?.id)
}

// 顶部tab切换
const topTab = ref('stock')
// 库存预警点击
const handleStockWarningClick = () => {
  // 可弹窗或跳转库存预警详情
  console.log('点击库存预警')
}
// 紧急补货一键补货
const handleQuickReplenish = (row: any) => {
  // 实际业务可弹窗或直接创建采购单
  openForm('create', { product: row.productName, quantity: row.gap })
}

const urgentList = ref([])
const transitList = ref([])
const todoList = ref([])
const businessFeedback = ref([])

// 库存视图数据
const stockViewData = ref([])
async function loadStockViewData() {
  try {
    // 假设有API: getStockViewData
    // stockViewData.value = await getStockViewData()
    throw new Error('mock') // 模拟失败
  } catch {
    stockViewData.value = [
      { name: '电动车电池48V', stock: 120, min: 50 },
      { name: '摩托车轮胎26寸', stock: 80, min: 30 },
      { name: '电动车电池38V', stock: 100, min: 20 },
      { name: '摩托车轮胎16寸', stock: 380, min: 80 }
    ]
  }
}

// 供应商视图数据
const supplierViewData = ref([])
async function loadSupplierViewData() {
  try {
    // 假设有API: getSupplierViewData
    // supplierViewData.value = await getSupplierViewData()
    throw new Error('mock')
  } catch {
    supplierViewData.value = [
      { name: '广州电池厂', score: 92, price: 120 },
      { name: '杭州轮胎厂', score: 88, price: 85 }
    ]
  }
}

// 成本视图数据
const costViewData = ref([])
async function loadCostViewData() {
  try {
    // 假设有API: getCostViewData
    // costViewData.value = await getCostViewData()
    throw new Error('mock')
  } catch {
    costViewData.value = [
      { name: '电动车电池48V', cost: 12000 },
      { name: '摩托车轮胎26寸', cost: 6800 }
    ]
  }
}

/** 初始化 */
onMounted(() => {
  getList()
  loadStockViewData()
  loadSupplierViewData()
  loadCostViewData()
})
</script>

<style lang="scss" scoped>
.erp-purchase-dashboard {
  height: calc(100vh - var(--top-tool-height) - var(--tags-view-height));
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  :deep(.content-wrap) {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 0;
  }

  .header-card {
    margin-bottom: 2px;
    .dashboard-header {
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      min-height: 32px;
      .global-search { 
        width: 180px; 
        height: 24px; 
        font-size: 12px; 
      }
      .quick-actions { 
        display: flex; 
        gap: 4px; 
        align-items: center; 
      }
      .el-button, .el-dropdown, .el-badge { 
        font-size: 11px !important; 
        padding: 1px 6px !important; 
        height: 20px !important; 
        min-height: 0 !important; 
        line-height: 1.1 !important; 
      }
      .top-tabs { 
        margin-left: 8px; 
      }
    }
  }

  .dashboard-main-layout {
    flex: 1;
    display: flex;
    gap: 4px;
    min-height: 0;
    overflow: hidden;
    padding: 0 2px;

    .main-left { 
      width: 300px;
      display: flex; 
      flex-direction: column; 
      gap: 4px; 
      .main-card { 
        flex: 1; 
        min-height: 0; 
        :deep(.el-table) {
          .el-table__body {
            td {
              padding: 4px 0;
            }
          }
        }
      } 
    }

    .main-center { 
      flex: 1.5;
      display: flex; 
      flex-direction: column; 
      gap: 4px; 
      min-width: 320px;
      .main-card { 
        flex-shrink: 0; 
        margin-bottom: 0; 
        .card-header { 
          min-height: 20px; 
          padding: 1px 5px; 
          font-size: 12px; 
          line-height: 1.1; 
          background: #fafbfc; 
          border-bottom: 1px solid #f0f0f0; 
        } 
      }
      .smart-list-card { 
        flex: 1; 
        min-height: 0; 
      }
      .main-bottom-row { 
        display: flex; 
        gap: 4px; 
        min-height: 0; 
        .main-card { 
          flex: 1; 
          min-height: 0; 
        } 
      }
    }

    .main-right { 
      width: 260px;
      min-width: 200px;
      display: flex; 
      flex-direction: column; 
      gap: 4px; 
      .el-collapse { 
        border: none; 
      } 
      .el-collapse-item__header { 
        font-size: 12px; 
        min-height: 20px; 
        padding: 0 4px; 
      } 
      .el-collapse-item__wrap { 
        padding: 0 4px; 
      } 
      .business-feedback-list { 
        .feedback-item { 
          display: flex; 
          align-items: center; 
          gap: 4px; 
          font-size: 11px; 
          margin-bottom: 2px; 
          .feedback-content { 
            flex: 1; 
          } 
          .feedback-status { 
            color: #f56c6c; 
            margin-left: 4px; 
            &.done { 
              color: #67c23a; 
            } 
          } 
        } 
      } 
    }
  }

  .el-table { 
    flex: 1; 
    overflow: auto; 
    min-height: 0; 
    :deep(.el-table__body) { 
      font-size: 11px; 
    } 
  }
}

.selected-row {
  background: #e6f7ff !important;
}

.tab-bar {
  margin-top: 4px;
  margin-bottom: 4px;
}
</style> 