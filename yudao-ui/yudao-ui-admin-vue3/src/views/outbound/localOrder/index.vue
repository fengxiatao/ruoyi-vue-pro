<template>
  <div class="app-container">
    <div class="marquee-container">
      <NotificationBanner :messages="alertMessages" />
    </div>
    <el-card class="box-card">
      <div class="left-info">
        <CustomerSearchHeader 
          :isOrderMode="isOrderMode" 
          :queryParams="customerQueryParams"
          @search="handleCustomerQueryUpdate"
          @keydown="handleCustomerSearchKeydown"
          @toggle-mode="handleViewList"
          ref="customerSearchHeaderRef"
        />
        <div class="left-info-content">
          <template v-if="showPicVisible">
            <ImagePreview :imageUrls="showPicUrls" @close="closePicPreview" />
          </template>
          <template v-else>
            <div class="customer-info" v-if="isOrderMode">
              <div class="customer-card-wrapper">
                <CustomerCard :selectedCustomer="currentCustomer" />
              </div>
              <div class="order-table-wrapper">
                <div class="order-table-scroll">
                  <OrderTable :selectedOrder="currentOrder" @select-item="handleSelectOrderItem" />
                </div>
                <OrderSummary 
                  :items="currentOrder?.items || []"
                  :batch-version="currentOrder?.batchVersion"
                  :submitting="isSubmitting"
                  :last-submit-time="lastSubmitTime"
                  @lock="handleLockOrder"
                  @audit="handleAuditOrder"
                  @cancel="handleCancelOrder"
                  @delete-items="handleDeleteSelectedItems"
                  @submit="handleSubmitOrder"
                  @view-drafts="() => activeTab = 'drafts'"
                  @view-history="handleViewHistory"
                  @view-batch-details="handleViewBatchDetails"
                />
              </div>
            </div>
            <div class="customer-table-card" v-else>
              <div class="customer-table-list">
                <CustomerTable :queryParams="customerQueryParams" ref="customerTableCompRef" @row-dblclick="handleCustomerRowDblclick" />
              </div>
            </div>
          </template>
        </div>
        <OrderFooterToolbar @refresh="refreshOrderData" @print-preview="handlePrintPreview" />
      </div>
      <div class="center-info">
        <div class="center-info-left">
          <div class="tab-switch-buttons">
            <el-button 
              :type="activeTab === 'products' ? 'primary' : 'default'" 
              size="small" 
              @click="activeTab = 'products'"
              class="tab-button"
            >
              商品列表 (Alt+P)
            </el-button>
            <el-button 
              :type="activeTab === 'drafts' ? 'primary' : 'default'" 
              size="small" 
              @click="activeTab = 'drafts'"
              class="tab-button"
            >
              草稿单列表 (Alt+D)
            </el-button>
            <el-button 
              :type="activeTab === 'history' ? 'primary' : 'default'" 
              size="small" 
              @click="activeTab = 'history'"
              class="tab-button"
            >
              历史订单 (Alt+H)
            </el-button>
            <el-button 
              :type="activeTab === 'batches' ? 'primary' : 'default'" 
              size="small" 
              @click="activeTab = 'batches'"
              class="tab-button"
            >
              批次管理 (Alt+B)
            </el-button>
          </div>
          
          <OperateProduct v-if="activeTab === 'products'" ref="operateProductRef" :selectedOrderItem="currentOrderItem" @show-pics="handleShowPics" @add-draft-item="handleAddDraftItem" />
          
          <div v-else-if="activeTab === 'drafts'" class="draft-list-panel">
            <h3>草稿单列表</h3>
            
            <!-- 添加当前已加载草稿单信息提示 -->
            <div v-if="currentOrder && isOrderMode" class="current-draft-info">
              <el-alert
                type="success"
                :closable="false"
                show-icon
              >
                <template #title>
                  <div class="draft-alert-content">
                    <span>当前已加载草稿单: {{ currentOrder.draftId }}</span>
                    <el-button 
                      size="small" 
                      type="primary" 
                      @click="activeTab = 'products'"
                    >
                      查看订单商品
                    </el-button>
                  </div>
                </template>
              </el-alert>
            </div>
            
            <div class="draft-list-filters">
              <el-form :inline="true" class="filter-form">
                <el-form-item label="客户:">
                  <el-select 
                    v-model="draftFilter.customerId" 
                    placeholder="全部客户" 
                    clearable
                    size="small"
                    @change="loadDraftsList"
                  >
                    <el-option label="全部客户" :value="null" />
                    <el-option 
                      v-if="currentCustomer" 
                      :label="currentCustomer.name" 
                      :value="currentCustomer.id" 
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="状态:">
                  <el-select 
                    v-model="draftFilter.draftStatus" 
                    placeholder="全部状态" 
                    clearable
                    size="small"
                    @change="loadDraftsList"
                  >
                    <el-option label="全部状态" :value="null" />
                    <el-option label="未保存" :value="0" />
                    <el-option label="编辑中" :value="1" />
                    <el-option label="已提交" :value="2" />
                    <el-option label="已取消" :value="3" />
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" size="small" @click="loadDraftsList">刷新</el-button>
                </el-form-item>
              </el-form>
            </div>
            <el-table
              :data="draftsList" 
              style="width: 100%" 
              row-key="draftId"
              highlight-current-row
              @row-click="handleDraftRowClick"
            >
              <el-table-column prop="draftId" label="草稿单号" width="180" />
              <el-table-column prop="createTime" label="创建时间" width="180">
                <template #default="scope">
                  {{ formatDateTime(scope.row.createTime) }}
                </template>
              </el-table-column>
              <el-table-column prop="draftStatus" label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="getDraftStatusType(scope.row.draftStatus)">
                    {{ getDraftStatusText(scope.row.draftStatus) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="productCount" label="商品数" width="80" />
              <el-table-column prop="totalPrice" label="总金额" width="100">
                <template #default="scope">
                  <span class="price-text">¥{{ formatPrice(scope.row.totalPrice) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="客户" min-width="120">
                <template #default="scope">
                  {{ getCustomerNameById(scope.row.customerId) || '无客户' }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150">
                <template #default="scope">
                  <el-button size="small" type="primary" @click.stop="loadDraft(scope.row)">加载</el-button>
                  <el-button size="small" type="danger" @click.stop="deleteDraft(scope.row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <!-- 添加分页组件 -->
            <Pagination
              v-if="draftsTotal > 0"
              v-model:page="draftQuery.pageNo"
              v-model:limit="draftQuery.pageSize"
              :total="draftsTotal"
              @pagination="loadDraftsList"
            />
          </div>
          
          <div v-else-if="activeTab === 'history'" class="history-list-panel">
            <h3>历史订单列表</h3>
            
            <!-- 添加当前已加载历史订单信息提示 -->
            <div v-if="currentOrder && isOrderMode" class="current-order-info">
              <el-alert
                type="success"
                :closable="false"
                show-icon
              >
                <template #title>
                  <div class="order-alert-content">
                    <span>当前已加载历史订单: {{ currentOrder.draftId }}</span>
                    <el-button 
                      size="small" 
                      type="primary" 
                      @click="activeTab = 'products'"
                    >
                      查看订单商品
                    </el-button>
                  </div>
                </template>
              </el-alert>
            </div>
            
            <div v-if="selectedHistory" class="order-detail-panel">
              <div class="order-detail-header">
                <h4>历史订单详情 <span class="order-id">#{{ selectedHistory.draftId }}</span></h4>
                <el-button size="small" @click="selectedHistory = null">返回列表</el-button>
              </div>
              <div class="order-detail-info">
                <div class="info-row">
                  <span class="info-label">订单号:</span>
                  <span class="info-value">{{ selectedHistory.no || '未生成' }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">创建时间:</span>
                  <span class="info-value">{{ formatDateTime(selectedHistory.createTime) }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">草稿状态:</span>
                  <span class="info-value">{{ getDraftStatusText(selectedHistory.draftStatus) }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">处理状态:</span>
                  <span class="info-value">{{ getProcessStatusText(selectedHistory.processStatus) }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">总金额:</span>
                  <span class="info-value price">¥{{ formatPrice(selectedHistory.totalPrice) }}</span>
                </div>
              </div>
              <h4>商品明细</h4>
              <el-table :data="selectedHistory.items || selectedHistory.orderItems || []" style="width: 100%">
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="name" label="商品名称" min-width="180" show-overflow-tooltip />
                <el-table-column prop="count" label="数量" width="80" />
                <el-table-column prop="price" label="单价" width="100">
                  <template #default="scope">
                    ¥{{ formatPrice(scope.row.price) }}
                  </template>
                </el-table-column>
                <el-table-column label="小计" width="100">
                  <template #default="scope">
                    ¥{{ formatPrice(scope.row.price * scope.row.count) }}
                  </template>
                </el-table-column>
              </el-table>
              <div class="order-detail-actions">
                <el-button size="small" type="primary" @click="loadHistoryOrder(selectedHistory)">加载此订单</el-button>
              </div>
            </div>
            <el-table v-else :data="historyOrders" style="width: 100%" highlight-current-row @row-click="handleHistorySelect">
              <el-table-column prop="draftId" label="草稿单号" width="180" />
              <el-table-column prop="no" label="订单号" width="180" />
              <el-table-column prop="createTime" label="创建时间" width="180">
                <template #default="scope">
                  {{ formatDateTime(scope.row.createTime) }}
                </template>
              </el-table-column>
              <el-table-column prop="draftStatus" label="草稿状态" width="100">
                <template #default="scope">
                  {{ getDraftStatusText(scope.row.draftStatus) }}
                </template>
              </el-table-column>
              <el-table-column prop="processStatus" label="处理状态" width="100">
                <template #default="scope">
                  {{ getProcessStatusText(scope.row.processStatus) }}
                </template>
              </el-table-column>
              <el-table-column prop="totalPrice" label="总金额" width="100">
                <template #default="scope">
                  ¥{{ formatPrice(scope.row.totalPrice) }}
                </template>
              </el-table-column>
              <el-table-column label="操作">
                <template #default="scope">
                  <el-button size="small" type="primary" @click.stop="loadHistoryOrder(scope.row)">加载</el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <!-- 添加历史订单分页组件 -->
            <Pagination
              v-if="!selectedHistory && historyTotal > 0"
              v-model:page="historyQuery.pageNo"
              v-model:limit="historyQuery.pageSize"
              :total="historyTotal"
              @pagination="loadHistoryPage"
            />
          </div>
          
          <div v-else-if="activeTab === 'batches'" class="batch-history-panel">
            <h3>批次管理</h3>
            
            <!-- 添加当前已加载批次订单信息提示 -->
            <div v-if="currentOrder && isOrderMode" class="current-batch-info">
              <el-alert
                type="success"
                :closable="false"
                show-icon
              >
                <template #title>
                  <div class="batch-alert-content">
                    <span>当前已加载批次订单: {{ currentOrder.draftId }}</span>
                    <el-button 
                      size="small" 
                      type="primary" 
                      @click="activeTab = 'products'"
                    >
                      查看订单商品
                    </el-button>
                  </div>
                </template>
              </el-alert>
            </div>
            
            <div class="batch-list-filters">
              <el-form :inline="true" class="filter-form">
                <el-form-item label="客户:">
                  <el-select 
                    v-model="batchFilter.customerId" 
                    placeholder="全部客户" 
                    clearable
                    size="small"
                    @change="loadBatchList"
                  >
                    <el-option label="全部客户" :value="null" />
                    <el-option 
                      v-if="currentCustomer" 
                      :label="currentCustomer.name" 
                      :value="currentCustomer.id" 
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="关键词:">
                  <el-input 
                    v-model="batchFilter.keyword" 
                    placeholder="单号/客户名" 
                    clearable
                    size="small"
                    @keyup.enter="loadBatchList"
                  />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" size="small" @click="loadBatchList">查询</el-button>
                  <el-button size="small" @click="resetBatchFilter">重置</el-button>
                </el-form-item>
              </el-form>
            </div>

            <el-table 
              :data="batchList" 
              style="width: 100%"
              highlight-current-row
              @row-click="handleBatchRowClick"
            >
              <el-table-column prop="batchId" label="草稿单号" width="180" />
              <el-table-column prop="batchVersion" label="批次版本" width="100" />
              <el-table-column prop="createTime" label="创建时间" width="180">
                <template #default="scope">
                  {{ formatDateTime(scope.row.createTime) }}
                </template>
              </el-table-column>
              <el-table-column prop="customerName" label="客户" min-width="120" />
              <el-table-column prop="productCount" label="商品数" width="80" />
              <el-table-column prop="totalPrice" label="总金额" width="100">
                <template #default="scope">
                  <span class="price-text">¥{{ formatPrice(scope.row.totalPrice) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag type="success">{{ scope.row.status }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="180">
                <template #default="scope">
                  <el-button size="small" type="primary" @click.stop="handleViewBatch(scope.row)">详情</el-button>
                  <el-button size="small" type="success" @click.stop="loadDraftById(scope.row.batchId)">加载</el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <!-- 添加批次列表分页组件 -->
            <Pagination
              v-if="batchTotal > 0"
              v-model:page="batchQuery.pageNo"
              v-model:limit="batchQuery.pageSize"
              :total="batchTotal"
              @pagination="loadBatchList"
            />
          </div>
        </div>
        <div class="center-info-right">
          <div class="status-panel">
            <h3>订单状态</h3>
            <div class="status-item">
              <span class="status-label">草稿状态:</span>
              <span class="status-value">{{ getDraftStatusText(currentOrder?.draftStatus) }}</span>
            </div>
            <div class="status-item">
              <span class="status-label">处理状态:</span>
              <span class="status-value">{{ getProcessStatusText(currentOrder?.processStatus) }}</span>
            </div>
            <div class="status-item">
              <span class="status-label">批次版本:</span>
              <span class="status-value">{{ currentOrder?.batchVersion || 0 }}</span>
            </div>
            <div class="status-item">
              <span class="status-label">订单总额:</span>
              <span class="status-value price">¥{{ formatPrice(currentOrder?.totalPrice) }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="right-info"></div>
    </el-card>
    
    <!-- 批次详情对话框 -->
    <el-dialog
      v-model="batchDialogVisible"
      title="批次详情"
      width="800px"
      class="batch-details-dialog"
      :close-on-click-modal="false"
    >
      <div v-if="currentBatch" class="batch-details-content">
        <div class="batch-header">
          <div class="batch-header-left">
            <h3>批次 #{{ currentBatch.batchVersion }}</h3>
            <div class="batch-meta">
              <span class="batch-id">ID: {{ currentBatch.batchId }}</span>
              <span class="batch-time">创建时间: {{ currentBatch.createTime }}</span>
            </div>
          </div>
          <div class="batch-header-right">
            <el-tag type="success" effect="dark">{{ currentBatch.status }}</el-tag>
          </div>
        </div>
        
        <div class="batch-info">
          <div class="info-group">
            <div class="info-item">
              <span class="info-label">客户:</span>
              <span class="info-value">{{ currentBatch.customerName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">商品数量:</span>
              <span class="info-value">{{ currentBatch.itemCount }}件</span>
            </div>
            <div class="info-item">
              <span class="info-label">总金额:</span>
              <span class="info-value price">¥{{ formatPrice(currentBatch.totalPrice) }}</span>
            </div>
          </div>
        </div>
        
        <div class="batch-items">
          <h4>批次商品明细</h4>
          <el-table :data="currentBatch.items" style="width: 100%">
            <el-table-column prop="id" label="ID" width="60" />
            <el-table-column prop="name" label="商品名称" min-width="180" show-overflow-tooltip />
            <el-table-column label="图片" width="80">
              <template #default="scope">
                <el-image
                  v-if="scope.row.picUrl"
                  :src="scope.row.picUrl"
                  :preview-src-list="[scope.row.picUrl]"
                  fit="contain"
                  style="width: 40px; height: 40px"
                />
                <span v-else>无图片</span>
              </template>
            </el-table-column>
            <el-table-column prop="count" label="数量" width="70" />
            <el-table-column prop="price" label="单价" width="100">
              <template #default="scope">
                ¥{{ formatPrice(scope.row.price) }}
              </template>
            </el-table-column>
            <el-table-column label="小计" width="100">
              <template #default="scope">
                ¥{{ formatPrice(scope.row.price * scope.row.count) }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="printBatchDetails">打印批次单</el-button>
          <el-button @click="batchDialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted, computed, watch } from 'vue'
import type { AlertMessage } from '@/types/types'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { ElInput, ElSelect, ElMessage } from 'element-plus' // 导入组件类型
import NotificationBanner from '@/components/NotificationBanner.vue'
import CustomerTable from './components/customerTable.vue'
import CustomerCard from './components/customerCard.vue'
import OperateProduct from './components/operateProduct.vue'
import OrderTable from './components/orderTable.vue'
import OrderFooterToolbar from './components/OrderFooterToolbar.vue'
import OrderSummary from './components/OrderSummary.vue'
import ImagePreview from './components/ImagePreview.vue'
import CustomerSearchHeader from './components/CustomerSearchHeader.vue'
import HistoryOrderDetail from './components/HistoryOrderDetail.vue'
import { CustomerVO } from '@/api/crm/customer'
import * as TradeOrderApi from '@/api/mall/trade/order'
import { OrderVO, OrderItemRespVO } from '@/types/localOrder'
import { formatDate } from '@/utils/formatTime'
import BatchHistory from './components/BatchHistory.vue'
import Pagination from '@/components/Pagination/index.vue'

// Define PageResult interface for pagination response
interface PageResult<T> {
  list: T[];
  total: number;
}

// Add TypeScript interface for the missing API methods
// This is just for TypeScript type checking, not a module declaration
interface TradeOrderApiExtensions {
  getDraftsPage: (pageNo: number, pageSize: number, customerId?: number, draftStatus?: number) => Promise<PageResult<any>>;
  getHistoryPage: (customerId: number, pageNo: number, pageSize: number) => Promise<PageResult<any>>;
  getBatchPage: (pageNo: number, pageSize: number, customerId?: number, keyword?: string) => Promise<PageResult<any>>;
}

// Ensure the TradeOrderApi actually has these methods
// This is just for TypeScript, doesn't affect runtime
type ExtendedTradeOrderApi = typeof TradeOrderApi & TradeOrderApiExtensions;

defineOptions({ name: 'LocalOrder' })
const customerTableCompRef = ref()
const operateProductRef = ref()
const customerSearchHeaderRef = ref()
const customerQueryParams = ref({
  pageNo: 1,
  pageSize: 10,
  name: '',
  line: 0 as number | undefined
})
const isOrderMode = ref(false)
const currentCustomer = ref<CustomerVO | null>(null)
const orderList = ref<OrderVO[]>([])
const currentOrder = ref<OrderVO|null>(null)
const currentOrderItem = ref<OrderItemRespVO>()
const orderDate = ref(new Date())

// 添加新的activeTab状态
const activeTab = ref('products')

// 添加分页查询参数
const draftQuery = ref({
  pageNo: 1,
  pageSize: 10,
  customerId: null as number | null,
  draftStatus: null as number | null
})
const historyQuery = ref({
  pageNo: 1,
  pageSize: 10,
  customerId: null as number | null
})
const batchQuery = ref({
  pageNo: 1,
  pageSize: 10,
  customerId: null as number | null,
  keyword: ''
})

// 草稿单列表
const draftsList = ref<OrderVO[]>([])
const draftsTotal = ref(0)

// 历史订单列表
const historyOrders = ref<OrderVO[]>([])
const historyTotal = ref(0)
const selectedHistory = ref<OrderVO | null>(null)

// 批次列表
const batchList = ref<any[]>([])
const batchTotal = ref(0)
const batchFilter = ref({
  customerId: null as number | null,
  keyword: ''
})

// Add the missing selectedDraft reference
const selectedDraft = ref<OrderVO | null>(null)

// 客户名称缓存，用于显示客户信息
const customerNameCache = ref<Record<string, string>>({})

// 根据客户ID获取客户名称
const getCustomerNameById = (customerId: number) => {
  if (!customerId) return null
  
  // 如果当前选择的客户ID与参数相同，直接返回名称
  if (currentCustomer.value?.id === customerId) {
    return currentCustomer.value.name
  }
  
  // 如果缓存中有此客户，使用缓存数据
  if (customerNameCache.value[customerId]) {
    return customerNameCache.value[customerId]
  }
  
  // 如果没有缓存，返回ID并后台异步获取
  // 实际项目中可以调用相关API获取客户信息并缓存
  return `客户#${customerId}`
}

// 处理订单项选择
const handleSelectOrderItem = (item: OrderItemRespVO) => {
  // 确保选中的项目标记为来自草稿单，这样编辑时会保留ID
  currentOrderItem.value = {
    ...item,
    fromDraft: true // 标记为来自草稿单，编辑时需要保留ID
  }
}

const handleViewList = () => {
  isOrderMode.value = !isOrderMode.value
  if (!isOrderMode.value) {
    // 当切换到显示列表模式时
    handleCustomerQuery() // 重新加载客户列表数据
  }
}

// 测试用的消息数据
const alertMessages = ref<AlertMessage[]>([
  {
    id: 1,
    type: 'ORDER',
    timestamp: Date.now(),
    content: '新订单提醒：客户张三已下单 3 件商品'
  },
  {
    id: 2,
    type: 'WARNING',
    timestamp: Date.now() - 60000,
    content: '库存预警：商品 SKU-001 库存低于警戒线'
  },
  {
    id: 3,
    type: 'SYSTEM',
    timestamp: Date.now() - 120000,
    content: '订单状态更新：订单 #12345 已完成配送'
  }
])

// 客户查询参数更新处理
const handleCustomerQueryUpdate = (params) => {
  customerQueryParams.value.name = params.name
  customerQueryParams.value.line = params.line
  handleCustomerQuery()
}

// 客户查询方法
const handleCustomerQuery = async () => {
  isOrderMode.value = false
  customerQueryParams.value.pageNo = 1
  await nextTick() // 等待组件更新
  if (customerTableCompRef.value) {
    customerTableCompRef.value.loadData(customerQueryParams.value)
  }
}

// 客户搜索输入框的键盘事件处理
const handleCustomerSearchKeydown = (event: KeyboardEvent) => {
  if (event.key === ' ' || event.key === 'Spacebar') {
    handleCustomerQuery() // 触发查询
  }
  if (event.key === 'ArrowUp') {
    if (customerTableCompRef.value) {
      ;(customerTableCompRef.value as any).selectCustomerByArrow(true)
    }
  }
  if (event.key === 'ArrowDown') {
    if (customerTableCompRef.value) {
      ;(customerTableCompRef.value as any).selectCustomerByArrow(false)
    }
  }
  if (event.key === 'ArrowLeft') {
    if (customerTableCompRef.value) {
      ;(customerTableCompRef.value as any).handlePaginationByArrow(false)
    }
  }
  if (event.key === 'ArrowRight') {
    if (customerTableCompRef.value) {
      ;(customerTableCompRef.value as any).handlePaginationByArrow(true)
    }
  } else if (event.key === 'Enter') {
    currentCustomer.value = customerTableCompRef.value?.currentCustomer
    if (currentCustomer.value?.id) {
      handleCustomerSelected(currentCustomer.value)
    } else {
      ElMessage.warning('请先选择客户')
    }
    isOrderMode.value = true
  }
}

// 添加客户行双击事件处理函数
const handleCustomerRowDblclick = (row) => {
  currentCustomer.value = row
  if (currentCustomer.value?.id) {
    handleCustomerSelected(currentCustomer.value)
    isOrderMode.value = true
  } else {
    ElMessage.warning('请先选择客户')
  }
}

// 工具函数：判断是否同一天
function isSameDay(date1, date2) {
  if (!date1 || !date2) return false;
  const d1 = new Date(date1), d2 = new Date(date2);
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

// 客户选中后，查找当天订单
async function handleCustomerSelected(customer) {
  currentCustomer.value = customer;
  
  try {
    console.log('选择客户:', customer.id, customer.name);
    
    // 1. 先获取该客户的草稿单列表
    console.log('正在请求客户草稿单列表...');
    const drafts = await TradeOrderApi.getCustomerDrafts(customer.id);
    console.log('获取到草稿单列表:', drafts);
    
    // 保存到草稿单列表，用于显示
    draftsList.value = drafts;
    
    // 2. 查找今天的草稿单
    const today = new Date();
    const todayDraft = drafts.find(d => 
      isSameDay(d.createTime, today) && 
      d.draftStatus !== 3 // 非取消状态
    );
    
    if (todayDraft) {
      // 3a. 如果有今天的草稿单，加载它
      console.log('找到今天的草稿单:', todayDraft.draftId);
      currentOrder.value = todayDraft;
    } else {
      // 3b. 如果没有，创建新草稿单
      console.log('未找到今天的草稿单，创建新草稿单');
      const createOrderReq = {
        customerId: customer.id,
        remark: `${customer.name}的电话销售订单`
      }
      const newOrder = await TradeOrderApi.createSimpleOrder(createOrderReq);
      console.log('创建的新草稿单:', newOrder);
      currentOrder.value = newOrder;
      
      // 将新创建的草稿单添加到列表中
      draftsList.value.unshift(newOrder);
    }
    
    isOrderMode.value = true;
  } catch (error) {
    console.error('处理客户订单时出错:', error);
    ElMessage.error('加载或创建订单失败，请重试');
  }
}

// 添加键盘快捷键处理函数
const handleKeyDown = (event) => {
  if (event.altKey && event.key === 'p') {
    event.preventDefault() // 阻止浏览器默认的打印对话框
    activeTab.value = 'products'
    operateProductRef.value?.spuSearchInputFocus()
  }
  if (event.altKey && event.key === 'd') {
    event.preventDefault()
    activeTab.value = 'drafts'
  }
  if (event.altKey && event.key === 'h') {
    event.preventDefault()
    activeTab.value = 'history'
    // 如果有客户ID，加载历史订单
    if (currentCustomer.value?.id) {
      loadCustomerHistoryOrders(currentCustomer.value.id)
    }
  }
  if (event.altKey && event.key === 'b') {
    event.preventDefault()
    activeTab.value = 'batches'
  }
  if (event.altKey && event.key === 'c') {
    event.preventDefault() // 阻止浏览器默认的打印对话框
    if (customerSearchHeaderRef.value) {
      customerSearchHeaderRef.value.focus()
      console.log('已聚焦到客户搜索框')
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
  handleCustomerQuery()
  isOrderMode.value = false // 确保初始状态是显示列表
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})

// 订单操作相关数据
const orderAmount = ref('')
const returnType = ref('prepay')
const payType = ref('cash')
const collector = ref('')
const printType = ref('print')
const showPicUrls = ref<string[]>([])
const showPicVisible = ref(false)

// 图片预览
const handleShowPics = (pics: string[]) => {
  showPicUrls.value = pics
  showPicVisible.value = true
}
const closePicPreview = () => {
  showPicVisible.value = false
  showPicUrls.value = []
}

// 添加商品到草稿单
async function handleAddDraftItem(item) {
  if (!currentOrder.value) {
    ElMessage.warning('当前没有订单，不能添加订单明细项')
    return
  }
  
  try {
    console.log('添加商品项:', item);
    
    // 1. 准备请求参数
    const draftItemReq = {
      draftId: currentOrder.value.draftId,
      itemId: item.id, // 如果是编辑已有项目，传递原始itemId
      skuId: item.skuId || item.id, // 优先使用skuId，如果没有则使用id
      spuId: item.spuId, // 使用spuId
      count: item.count,
      price: item.price,
      properties: JSON.stringify(item.properties || []),
      name: item.spuName || item.name, // 兼容处理
      picUrl: item.picUrl
    }
    
    // 如果是新增项目，不传itemId
    if (!item.fromDraft) {
      delete draftItemReq.itemId;
    }
    
    console.log('发送到后端的商品项数据:', draftItemReq);
    
    // 2. 调用后端API添加商品项
    await TradeOrderApi.updateDraftItem(draftItemReq)
    
    // 3. 重新加载草稿单数据
    await refreshOrderData()
    
    // 4. 确保items和orderItems字段同步
    if (currentOrder.value) {
      // 如果只有orderItems字段有数据，复制到items字段
      if (currentOrder.value.orderItems && (!currentOrder.value.items || currentOrder.value.items.length === 0)) {
        currentOrder.value.items = [...currentOrder.value.orderItems].map(item => ({
          ...item,
          fromDraft: true // 标记为来自草稿单，编辑时需要保留ID
        }));
        console.log('已将orderItems数据同步到items字段');
      }
      // 如果只有items字段有数据，复制到orderItems字段
      else if (currentOrder.value.items && (!currentOrder.value.orderItems || currentOrder.value.orderItems.length === 0)) {
        currentOrder.value.orderItems = [...currentOrder.value.items];
        console.log('已将items数据同步到orderItems字段');
      }
      
      // 5. 自动保存草稿单状态为"编辑中"
      if (currentOrder.value.draftStatus !== 1) {
        const updatedDraft = { ...currentOrder.value, draftStatus: 1 };
        await TradeOrderApi.updateOrderDraft(updatedDraft);
        console.log('自动保存草稿单状态为"编辑中"');
      }
    }
    
    // 6. 打印刷新后的订单数据，用于调试
    console.log('刷新后的订单数据:', currentOrder.value);
    
    ElMessage.success('商品添加成功')
  } catch (error) {
    console.error('添加商品项失败:', error)
    ElMessage.error('添加商品失败，请重试')
  }
}

// 删除选中的商品项
async function handleDeleteSelectedItems() {
  if (!currentOrder.value || !currentOrder.value.items) {
    return
  }
  
  const selectedItems = currentOrder.value.items.filter(item => item.selected)
  if (selectedItems.length === 0) {
    ElMessage.warning('请先选择要删除的商品项')
    return
  }
  
  try {
    // 逐个删除选中的商品项
    for (const item of selectedItems) {
      await TradeOrderApi.deleteDraftItem(currentOrder.value.draftId, item.id)
    }
    
    // 重新加载草稿单数据
    await refreshOrderData()
    
    ElMessage.success(`已删除 ${selectedItems.length} 个商品项`)
  } catch (error) {
    console.error('删除商品项失败:', error)
    ElMessage.error('删除商品失败，请重试')
  }
}

// 保存草稿单
async function handleSaveDraft() {
  if (!currentOrder.value) {
    ElMessage.warning('当前没有可保存的订单')
    return
  }
  
  try {
    // 更新草稿单状态为"编辑中"
    const updatedDraft = { ...currentOrder.value, draftStatus: 1 }
    await TradeOrderApi.updateOrderDraft(updatedDraft)
    
    // 重新加载草稿单数据
    await refreshOrderData()
    
    ElMessage.success('草稿单保存成功')
  } catch (error) {
    console.error('保存草稿单失败:', error)
    ElMessage.error('保存草稿单失败，请重试')
  }
}

// 添加这些引用
const isSubmitting = ref(false)
const lastSubmitTime = ref('')
const batchDialogVisible = ref(false)
const currentBatch = ref<any>(null)

// 修改handleSubmitOrder函数
async function handleSubmitOrder() {
  if (!currentOrder.value) {
    ElMessage.warning('当前没有可提交的订单')
    return
  }
  
  // 检查订单项 - 同时检查items和orderItems字段
  const hasItems = currentOrder.value.items && currentOrder.value.items.length > 0;
  const hasOrderItems = currentOrder.value.orderItems && currentOrder.value.orderItems.length > 0;
  
  if (!hasItems && !hasOrderItems) {
    ElMessage.warning('订单中没有商品，无法提交')
    return
  }
  
  try {
    isSubmitting.value = true;  // 设置提交状态为加载中
    console.log('准备提交订单，草稿单ID:', currentOrder.value.draftId);
    
    // 重要：确保将items中的数据同步到orderItems字段中，因为后端只检查orderItems
    if (hasItems && !hasOrderItems) {
      // 如果只有items字段有数据，将其复制到orderItems字段
      currentOrder.value.orderItems = [...currentOrder.value.items];
      
      // 更新草稿单，确保后端能找到商品项
      await TradeOrderApi.updateOrderDraft(currentOrder.value);
      console.log('已将items数据同步到orderItems字段');
    }
    
    // 调用提交接口
    const result = await TradeOrderApi.submitDraftOrder(currentOrder.value.draftId)
    console.log('订单提交结果:', result);
    
    // 记录提交时间
    lastSubmitTime.value = formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss');
    
    // 显示批次提交成功的动画和提示
    showBatchSuccessMessage(result);
    
    // 重新加载草稿单数据
    await refreshOrderData()
    
    // 弹出批次详情对话框
    showBatchDetails(result);
    
  } catch (error) {
    console.error('提交订单失败:', error)
    ElMessage.error('提交订单失败，请重试')
  } finally {
    isSubmitting.value = false;  // 重置提交状态
  }
}

// 显示批次成功消息
function showBatchSuccessMessage(result) {
  ElMessage({
    message: `批次 #${result.batchVersion || currentOrder.value?.batchVersion} 已成功传出到仓库`,
    type: 'success',
    duration: 3000,
    showClose: true,
    customClass: 'batch-success-message'
  });
}

// 显示批次详情对话框
function showBatchDetails(result) {
  // 准备批次数据
  currentBatch.value = {
    batchId: result.batchId || currentOrder.value?.draftId,
    batchVersion: result.batchVersion || currentOrder.value?.batchVersion,
    createTime: lastSubmitTime.value,
    itemCount: currentOrder.value?.items?.length || 0,
    totalPrice: currentOrder.value?.totalPrice || 0,
    customerId: currentOrder.value?.customerId,
    customerName: currentCustomer.value?.name || '未知客户',
    status: '已传出',
    items: currentOrder.value?.items || []
  };
  
  // 显示批次详情对话框
  batchDialogVisible.value = true;
}

// 查看批次详情
function handleViewBatchDetails() {
  if (!currentOrder.value?.batchVersion) {
    ElMessage.warning('当前订单无批次信息');
    return;
  }
  
  // 使用当前订单信息构建批次数据
  showBatchDetails({
    batchId: currentOrder.value.draftId,
    batchVersion: currentOrder.value.batchVersion
  });
}

// 刷新订单数据
async function refreshOrderData() {
  if (!currentOrder.value?.draftId) {
    console.warn('无法刷新订单数据：当前订单或草稿单ID为空');
    return;
  }
  
  console.log('正在刷新订单数据，草稿单ID:', currentOrder.value.draftId);
  
  try {
    const refreshedOrder = await TradeOrderApi.getOrderDraftDetail(currentOrder.value.draftId);
    console.log('获取到刷新后的订单数据:', refreshedOrder);
    
    // 检查返回的数据是否有效
    if (!refreshedOrder) {
      console.error('刷新订单数据失败：返回数据为空');
      ElMessage.error('刷新订单数据失败：返回数据为空');
      return;
    }
    
    // 确保订单项数组存在
    if (!refreshedOrder.orderItems) {
      refreshedOrder.orderItems = [];
    }
    
    // 确保每个订单项都有totlePrice和payPrice字段，并标记为来自草稿单
    refreshedOrder.orderItems.forEach(item => {
      if (!item.totlePrice && item.price && item.count) {
        item.totlePrice = item.price * item.count;
      }
      if (!item.payPrice && item.totlePrice) {
        item.payPrice = item.totlePrice - (item.discountPrice || 0);
      }
      // 标记为来自草稿单，编辑时需要保留ID
      item.fromDraft = true;
    });
    
    // 确保items和orderItems字段同步
    if (refreshedOrder.orderItems && refreshedOrder.orderItems.length > 0) {
      // 复制orderItems到items字段，保持两者同步
      refreshedOrder.items = [...refreshedOrder.orderItems];
    } else if (refreshedOrder.items && refreshedOrder.items.length > 0) {
      // 复制items到orderItems字段，保持两者同步
      refreshedOrder.orderItems = [...refreshedOrder.items].map(item => ({
        ...item,
        fromDraft: true // 标记为来自草稿单
      }));
    }
    
    // 更新当前订单
    currentOrder.value = refreshedOrder;
    console.log('订单数据刷新成功，更新后的订单:', currentOrder.value);
  } catch (error) {
    console.error('刷新订单数据失败:', error);
    ElMessage.error('刷新订单数据失败，请重试');
  }
}

// 查看历史订单
async function handleViewHistory() {
  if (!currentCustomer.value?.id) {
    ElMessage.warning('请先选择客户')
    return
  }
  
  activeTab.value = 'history'
  
  // 重置分页参数并加载第一页
  historyQuery.value.pageNo = 1
  historyQuery.value.customerId = currentCustomer.value.id
  await loadHistoryPage()
}

// 加载历史订单分页
const loadHistoryPage = async (params?: any) => {
  if (params) {
    historyQuery.value.pageNo = params.page
    historyQuery.value.pageSize = params.limit
  }
  
  if (!currentCustomer.value?.id && historyQuery.value.customerId == null) {
    ElMessage.warning('请先选择客户或设置筛选条件')
    return
  }
  
  // 优先使用当前客户
  const customerId = historyQuery.value.customerId || currentCustomer.value?.id
  
  try {
    console.log('加载历史订单列表, 客户:', customerId, '页码:', historyQuery.value.pageNo)
    const res = await TradeOrderApi.getHistoryPage(
      customerId,
      historyQuery.value.pageNo,
      historyQuery.value.pageSize
    )
    
    historyOrders.value = res.list
    historyTotal.value = res.total
    
    if (historyOrders.value.length === 0) {
      ElMessage.info('该客户暂无历史订单')
    }
  } catch (error) {
    console.error('加载历史订单失败:', error)
    ElMessage.error('加载历史订单失败，请重试')
  }
}

// 加载客户历史订单
async function loadCustomerHistoryOrders(customerId: number) {
  try {
    console.log('加载客户历史订单:', customerId)
    
    // 设置查询参数并加载第一页
    historyQuery.value.customerId = customerId
    historyQuery.value.pageNo = 1
    await loadHistoryPage()
  } catch (error) {
    console.error('加载历史订单失败:', error)
    ElMessage.error('加载历史订单失败，请重试')
  }
}

// 锁定订单
function handleLockOrder() {
  ElMessage.info('锁定订单功能待实现')
}

// 审核订单
function handleAuditOrder() {
  ElMessage.info('审核订单功能待实现')
}

// 取消订单
async function handleCancelOrder() {
  if (!currentOrder.value?.draftId) {
    ElMessage.warning('当前没有可取消的订单')
    return
  }
  
  try {
    await TradeOrderApi.cancelOrderDraft(currentOrder.value.draftId)
    ElMessage.success('订单已取消')
    // 重置当前订单
    currentOrder.value = null
    // 返回客户列表
    isOrderMode.value = false
  } catch (error) {
    console.error('取消订单失败:', error)
    ElMessage.error('取消订单失败，请重试')
  }
}

// 打印预览
function handlePrintPreview() {
  ElMessage.info('打印预览功能待实现')
}

// 格式化价格显示
function formatPrice(price) {
  if (price == null) return '0.00'
  return (price / 100).toFixed(2)
}

// 格式化日期时间
function formatDateTime(dateTime) {
  if (!dateTime) return ''
  return formatDate(new Date(dateTime), 'YYYY-MM-DD HH:mm:ss')
}

// 获取草稿状态文本
function getDraftStatusText(status) {
  const statusMap = {
    0: '未保存',
    1: '编辑中',
    2: '已提交',
    3: '已取消'
  }
  return statusMap[status] || '未知'
}

// 获取草稿状态标签类型
function getDraftStatusType(status) {
  const typeMap = {
    0: 'info',
    1: 'primary',
    2: 'success',
    3: 'danger'
  }
  return typeMap[status] || 'info'
}

// 获取处理状态文本
function getProcessStatusText(status) {
  const statusMap = {
    0: '未处理',
    1: '派发中',
    2: '已派发',
    3: '拣货中',
    4: '已拣货',
    5: '打包中',
    6: '已打包',
    7: '已发货'
  }
  return statusMap[status] || '未知'
}

// 处理草稿单展开/收起
const handleToggleExpand = async (row) => {
  // 已选中相同行，则收起
  if (row.draftId === selectedDraft.value?.draftId) {
    selectedDraft.value = null;
    return;
  }
  
  try {
    // 加载草稿单详情（包括商品明细）
    const draftDetail = await TradeOrderApi.getOrderDraftDetail(row.draftId);
    
    // 同步items和orderItems字段
    if (draftDetail) {
      if (draftDetail.orderItems && (!draftDetail.items || draftDetail.items.length === 0)) {
        draftDetail.items = [...draftDetail.orderItems];
      } else if (draftDetail.items && (!draftDetail.orderItems || draftDetail.orderItems.length === 0)) {
        draftDetail.orderItems = [...draftDetail.items];
      }
      
      // 更新行数据并展开
      const index = draftsList.value.findIndex(item => item.draftId === row.draftId);
      if (index !== -1) {
        // 合并保留原有数据的同时更新详情
        draftsList.value[index] = { ...draftsList.value[index], ...draftDetail };
      }
      
      // 设置选中行
      selectedDraft.value = draftDetail;
    }
  } catch (error) {
    console.error('获取草稿单详情失败:', error);
    ElMessage.error('获取草稿单详情失败，请重试');
  }
}

// 监听标签页切换，重置选中状态
watch(activeTab, (newTab) => {
  if (newTab === 'drafts') {
    selectedHistory.value = null
    // 当切换到草稿单标签时，加载当前销售客服的草稿单
    loadDraftsList()
  } else if (newTab === 'history') {
    selectedDraft.value = null
  } else if (newTab === 'products') {
    selectedDraft.value = null
    selectedHistory.value = null
  }
})

// 加载草稿单列表 - 使用分页API
const loadDraftsList = async (params?: any) => {
  try {
    // 如果传入了分页参数，更新查询条件
    if (params) {
      draftQuery.value.pageNo = params.page
      draftQuery.value.pageSize = params.limit
    }
    
    // 同步过滤条件
    draftQuery.value.customerId = draftFilter.value.customerId
    draftQuery.value.draftStatus = draftFilter.value.draftStatus
    
    console.log('加载草稿单列表，过滤条件:', draftQuery.value)
    
    // 使用新的分页API获取当前销售客服的草稿单列表
    const res = await TradeOrderApi.getDraftsPage(
      draftQuery.value.pageNo,
      draftQuery.value.pageSize,
      draftQuery.value.customerId || undefined, 
      draftQuery.value.draftStatus || undefined
    )
    
    console.log('获取到草稿单列表:', res)
    draftsList.value = res.list
    draftsTotal.value = res.total
    
    // 如果是首次加载，默认选中第一个客户
    if (draftFilter.value.customerId === null && currentCustomer.value?.id) {
      draftFilter.value.customerId = currentCustomer.value.id
    }
  } catch (error) {
    console.error('加载草稿单列表失败:', error)
    ElMessage.error('加载草稿单列表失败，请重试')
  }
}

// 草稿单点击事件 - 改为回填左侧订单
const handleDraftRowClick = async (row) => {
  try {
    console.log('选中草稿单, 准备回填左侧订单:', row)
    await loadDraft(row)
    // 不切换标签页，保留在草稿单列表
    // activeTab.value = 'products' - 移除此行
  } catch (error) {
    console.error('回填草稿单失败:', error)
    ElMessage.error('回填草稿单失败，请重试')
  }
}

// 加载历史订单
async function loadHistoryOrder(order: OrderVO, switchTab: boolean = false) {
  currentOrder.value = order
  
  // 根据参数决定是否切换到商品标签
  if (switchTab) {
    activeTab.value = 'products';
  }
  isOrderMode.value = true
  
  // 重置选中的历史订单
  selectedHistory.value = null
  
  ElMessage.success('历史订单加载成功')
}

// 加载批次列表
const loadBatchList = async (params?: any) => {
  try {
    if (params) {
      batchQuery.value.pageNo = params.page
      batchQuery.value.pageSize = params.limit
    }
    
    // 同步过滤条件
    batchQuery.value.customerId = batchFilter.value.customerId
    batchQuery.value.keyword = batchFilter.value.keyword
    
    console.log('加载批次列表，查询条件:', batchQuery.value)
    
    const res = await TradeOrderApi.getBatchPage(
      batchQuery.value.pageNo,
      batchQuery.value.pageSize,
      batchQuery.value.customerId,
      batchQuery.value.keyword
    )
    
    batchList.value = res.list
    batchTotal.value = res.total
    
    console.log('获取到批次列表:', res)
  } catch (error) {
    console.error('加载批次列表失败:', error)
    ElMessage.error('加载批次列表失败，请重试')
  }
}

// 重置批次过滤条件
const resetBatchFilter = () => {
  batchFilter.value.customerId = null
  batchFilter.value.keyword = ''
  // 保持当前页码，仅重置过滤条件
  loadBatchList()
}

// 批次行点击事件
const handleBatchRowClick = (row) => {
  console.log('选中批次:', row)
  handleViewBatch(row)
}

// 查看批次详情
const handleViewBatch = (batch) => {
  // 构建批次数据
  currentBatch.value = {
    ...batch,
    batchId: batch.batchId,
    batchVersion: batch.batchVersion,
    createTime: formatDateTime(batch.createTime),
    customerName: batch.customerName,
    itemCount: batch.productCount,
    totalPrice: batch.totalPrice,
    status: batch.status
  }
  
  // 显示批次详情对话框
  batchDialogVisible.value = true
}

// 根据草稿单ID加载草稿单
const loadDraftById = async (draftId, switchTab: boolean = false) => {
  try {
    console.log('根据ID加载草稿单:', draftId)
    
    // 使用API加载草稿单
    const loadedDraft = await TradeOrderApi.loadDraft(draftId)
    
    // 更新当前订单
    currentOrder.value = loadedDraft
    
    // 根据参数决定是否切换到商品标签
    if (switchTab) {
      activeTab.value = 'products';
    }
    isOrderMode.value = true
    
    ElMessage.success('草稿单加载成功')
  } catch (error) {
    console.error('加载草稿单失败:', error)
    ElMessage.error('加载草稿单失败，请重试')
  }
}

// 加载草稿单
const loadDraft = async (draft: OrderVO, switchTab: boolean = false) => {
  try {
    console.log('加载草稿单:', draft.draftId);
    
    // 使用新的API加载草稿单
    const loadedDraft = await TradeOrderApi.loadDraft(draft.draftId);
    
    // 更新当前订单
    currentOrder.value = loadedDraft;
    
    // 根据参数决定是否切换到商品标签
    if (switchTab) {
      activeTab.value = 'products';
    }
    isOrderMode.value = true;
    
    ElMessage.success('草稿单加载成功');
  } catch (error) {
    console.error('加载草稿单失败:', error);
    ElMessage.error('加载草稿单失败，请重试');
  }
}

// 删除草稿单
const deleteDraft = async (draft: OrderVO) => {
  try {
    await TradeOrderApi.cancelOrderDraft(draft.draftId);
    ElMessage.success('草稿单删除成功');
    
    // 重新加载草稿单列表
    await loadDraftsList();
    
    // 如果删除的是当前草稿单，重置当前订单
    if (currentOrder.value?.draftId === draft.draftId) {
      currentOrder.value = null;
    }
  } catch (error) {
    console.error('删除草稿单失败:', error);
    ElMessage.error('删除草稿单失败，请重试');
  }
}

// 处理历史订单选择
const handleHistorySelect = async (row) => {
  console.log('选中历史订单:', row)
  
  try {
    // 获取订单详情（包括商品明细）
    const orderDetail = await TradeOrderApi.getOrderDraftDetail(row.draftId)
    selectedHistory.value = orderDetail
    
    // 确保items和orderItems字段同步
    if (selectedHistory.value) {
      if (selectedHistory.value.orderItems && (!selectedHistory.value.items || selectedHistory.value.items.length === 0)) {
        selectedHistory.value.items = [...selectedHistory.value.orderItems]
      } else if (selectedHistory.value.items && (!selectedHistory.value.orderItems || selectedHistory.value.orderItems.length === 0)) {
        selectedHistory.value.orderItems = [...selectedHistory.value.items]
      }
    }
  } catch (error) {
    console.error('获取历史订单详情失败:', error)
    ElMessage.error('获取历史订单详情失败，请重试')
  }
}

// 打印批次详情
function printBatchDetails() {
  ElMessage.info('打印批次单功能待实现')
  // 实际项目中可以调用打印API或生成PDF
}

// 添加草稿单过滤条件
const draftFilter = ref({
  customerId: null as number | null,
  draftStatus: null as number | null
})

// 注意：请确保在src/api/mall/trade/order.ts文件中已经实现了以下API方法：
// - getDraftsPage：分页获取草稿单列表
// - getHistoryPage：分页获取历史订单列表
// - getBatchPage：分页获取批次列表
</script>

<style scoped>
@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.box-card {
  display: flex;
  flex-direction: row;
  flex: 1;
  overflow: hidden;
  background-color: rgb(4 32 75);
}

:deep(.el-card__body) {
  display: flex;
  height: 100%;
  padding: 0; /* 移除默认内边距 */
  flex: 1;
}

.left-info,
.center-info,
.right-info {
  display: flex;
  min-width: 0; /* 防止flex项在内容过多时溢出 */
  padding: 5px;
  overflow: auto;
  flex-direction: column;
  flex: 1;
}

.left-info {
  display: flex;
  padding: 0; /* 移除padding，由子元素控制 */
  background-color: rgb(32 32 75);
  flex-direction: column;
  flex: 2;
}

.center-info {
  padding: 4px;
  overflow: hidden;
  background: rgb(255 255 255 / 5%);
  border-left: 1px solid rgb(255 255 255 / 10%);
  flex: 2;
  flex-direction: row;
}

.center-info-left {
  flex: 3;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.center-info-right {
  flex: 1;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  margin-left: 10px;
}

.right-info {
  flex: 1;
  background-color: rgb(4 32 2);
}

.left-info-header,
.left-info-footer {
  display: flex;
  flex-direction: row;
  align-items: center; /* 垂直居中对齐 */
  padding: 2px;
  background-color: rgb(0 0 0 / 20%);
  flex: none;
  justify-content: space-between; /* 两侧对齐 */
  border-radius: 5px;
}

.left-group,
.right-group {
  display: flex;
  align-items: center;
  gap: -5px; /* 组内元素间距 */
}

.left-info-content {
  flex: 1; /* 填充剩余空间 */
  display: flex;
  flex-direction: column;
  padding: 5px;
  overflow: hidden;
}

.right-info {
  background-color: rgb(4 32 2);
}

.customer-info {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.customer-card-wrapper {
  flex: none; /* 高度自适应内容 */
}

.order-table-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.order-table-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.order-table-footer-fixed {
  z-index: 2;
  display: flex;
  height: 40px;
  padding: 0 10px;
  background: #f5f7fa;
  border-top: 1px solid #dcdfe6;
  border-radius: 0 0 4px 4px;
  flex: none;
  justify-content: space-between;
  align-items: center;
}

.order-table-summary {
  display: flex;
  height: 26px;
  font-size: 13px;
  line-height: 26px;
  color: #606266;
  align-items: center;
  gap: 5px;
}

.order-table-actions {
  display: flex;
  align-items: center;
  gap: 5px;
}

.customer-table-card {
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-top: 5px;
  overflow: hidden;
  background-color: #f5f7fa;
  border-radius: 5px;
}

.customer-table-list {
  display: flex;
  height: 100%;
  overflow: hidden;
  background-color: #f5f7fa;
  border-radius: 5px;
  flex-direction: column;
}

.total-value {
  font-size: 14px;
  font-weight: bold;
  color: #f56c6c;
}

.order-number-input {
  width: 150px;
}

.order-number-input :deep(.el-input__inner) {
  height: 24px;
  line-height: 24px;
}

.order-table {
  width: 100%;
  height: auto;
  max-height: none;
  min-height: 0;
  overflow: visible;
  flex: none;
}

/* 修改表格样式 */
:deep(.el-table) {
  width: 100%;
  height: auto;
  max-height: none;
  min-height: 0;
}

:deep(.el-table__inner-wrapper) {
  height: auto;
  max-height: none;
  min-height: 0;
}

.el-table {
  overflow: hidden; /* 隐藏外部滚动条 */
}

.el-table__body-wrapper {
  overflow-y: auto; /* 内容区域显示垂直滚动条 */
}

.client-form {
  flex: none;
  width: 100%;
}

.client-form .first-row {
  justify-self: space-between;
}

.client-form .form-row {
  display: flex;
  flex-direction: row;
  margin-bottom: 1px;
}

.client-form :deep(.el-form-item) {
  padding: 0;
  margin: 0;
}

.client-form :deep(.el-form-item__content) {
  display: flex;
  align-items: center;
}

.client-form .form-row-right {
  display: flex;
  height: 32px;
  padding-top: 2px;
}

.client-form .form-row-right-small {
  display: flex;
  gap: 5px;
  align-items: center;
  height: 32px;
}

:deep(.compact-input.el-input) {
  --el-input-height: 23px;

  width: 140px;
  padding-top: 3px;

  .el-input__wrapper {
    height: 23px;
    padding: 0 8px;
    line-height: 23px;
  }

  .el-input__inner {
    height: 23px;
    line-height: 23px;
    color: #000;
    border-radius: 3px;

    &::placeholder {
      font-size: 11px;
    }
  }

  /* 清除按钮尺寸适配 */
  .el-input__clear {
    margin-right: 2px;
    font-size: 14px;
  }
}

.client-form :deep(.el-form-item__label) {
  height: 32px;
  padding: 0 5px 0 0;
  font-size: 13px;
  line-height: 32px;
  color: #606266;
}

.client-form :deep(.el-button--small) {
  height: 26px;
  padding: 0 10px;
  margin: 0;
  font-size: 12px;
  line-height: 1;
}

.client-form .form-footer {
  display: flex;
  height: 32px;
  padding-top: 5px;
  margin-top: 5px;
  border-top: 1px solid #dcdfe6;
  justify-content: space-between;
  align-items: center;
}

.client-form .amount {
  margin-left: 5px;
  color: red;
}

.client-form .footer-actions {
  display: flex;
  margin-top: -5px;
  gap: 5px;
}

.left-info-footer {
  padding: 8px;
  flex: none;
  flex-direction: column;
  border-top: 1px solid #dcdfe6;
}

.toolbar-buttons {
  display: flex;
  width: 100%;
  padding-top: 5px;
  justify-content: space-between;
  gap: 5px;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 0 5px;
}

.form-label {
  margin-right: 2px;
  margin-left: -5px;
  font-size: 13px;
  color: #606266;
  white-space: nowrap;
}

.compact-input {
  height: 28px;
}

.compact-input :deep(.el-input__wrapper) {
  height: 28px;
  padding: 0 8px;
}

.compact-input :deep(.el-input__inner) {
  height: 28px;
  line-height: 28px;
}

.form-select,
.print-select {
  width: 80px;
  height: 26px;
}

.action-btn,
.function-btn {
  padding: 0 15px;
}

/* 覆盖Element组件样式 */
:deep(.el-input__wrapper),
:deep(.el-select .el-input__wrapper) {
  height: 28px;
  background-color: #fff;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

:deep(.el-button--small) {
  height: 28px;
  font-size: 12px;
}

:deep(.el-button--default) {
  background-color: #f5f7fa;
  border-color: #dcdfe6;
}

:deep(.el-button--danger) {
  color: #fff;
  background-color: #f56c6c;
}

:deep(.el-checkbox__inner) {
  border-color: #dcdfe6;
}

.dynamic-form {
  display: flex;
  flex-direction: column;
  padding-right: 2px;
  margin: 0;
  overflow: hidden;
  background-color: rgb(4 32 75);
}

.product-spu-container {
  margin-bottom: 8px;
}

:deep(.order-table-header) {
  padding-bottom: 0;
  margin-bottom: 0;
}

:deep(.order-table) {
  width: 100%;
  height: auto;
  max-height: none;
  min-height: 0;
  overflow: visible;
  flex: none;
}

:deep(.el-table) {
  width: 100%;
  height: auto;
  max-height: none;
  min-height: 0;
}

:deep(.el-table__inner-wrapper) {
  height: auto;
  max-height: none;
  min-height: 0;
}

:deep(.order-table-footer) {
  padding-top: 0;
  margin-top: 0;
}

.status-panel {
  color: #fff;
  padding: 10px;
}

.status-panel h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 5px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.status-label {
  color: #ccc;
}

.status-value {
  font-weight: bold;
}

.status-value.price {
  color: #f56c6c;
}

.tab-switch-buttons {
  margin-bottom: 10px;
}

.tab-button {
  margin-right: 5px;
}

.draft-list-panel {
  padding: 10px;
}

.draft-list-panel h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 5px;
}

.history-list-panel {
  padding: 10px;
}

.history-list-panel h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 5px;
}

.order-detail-panel {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 5px;
  padding: 15px;
}

.order-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.order-detail-header h4 {
  margin: 0;
  font-size: 16px;
}

.order-id {
  color: #67c23a;
  margin-left: 5px;
}

.order-detail-info {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 15px;
}

.info-row {
  display: flex;
  margin-bottom: 8px;
}

.info-label {
  width: 80px;
  color: #909399;
}

.info-value {
  font-weight: bold;
}

.info-value.price {
  color: #f56c6c;
}

.order-detail-actions {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.draft-list-filters {
  margin-bottom: 15px;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 5px;
}

.filter-form {
  display: flex;
  align-items: center;
}

.filter-form :deep(.el-form-item) {
  margin-bottom: 0;
  margin-right: 15px;
}

.filter-form :deep(.el-form-item__label) {
  color: #e6e6e6;
}

/* 嵌套表格样式 */
.draft-detail-section {
  padding: 15px;
  margin: 0 20px;
  background-color: #f5f7fa;
  border-radius: 5px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.draft-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10px;
}

.draft-detail-header h4 {
  margin: 0;
  font-size: 16px;
  color: #303133;
  font-weight: bold;
}

.draft-detail-summary {
  display: flex;
  gap: 15px;
  align-items: center;
}

.detail-label {
  color: #606266;
}

.detail-value {
  font-weight: bold;
  color: #303133;
}

.detail-value.price {
  color: #f56c6c;
  font-weight: bold;
}

.price-text {
  color: #f56c6c;
  font-weight: bold;
}

.draft-detail-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
}

/* 商品信息样式 */
.product-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.product-image {
  flex-shrink: 0;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
  overflow: hidden;
}

.product-name {
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-props {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  font-size: 12px;
  color: #909399;
}

.product-props span {
  padding: 0 5px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

/* 嵌套表格内部样式覆盖 */
.nested-items-table :deep(th.el-table__cell) {
  background-color: rgba(0, 0, 0, 0.2) !important;
  color: #e6e6e6;
}

.nested-items-table :deep(td.el-table__cell) {
  background-color: rgba(0, 0, 0, 0.1) !important;
  color: #e6e6e6;
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

/* 商品卡片样式 */
.item-cards-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
}

.item-card {
  display: flex;
  flex-direction: column;
  width: calc(50% - 8px);
  background-color: #fff;
  border-radius: 5px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.item-card-header {
  display: flex;
  padding: 10px;
  background-color: #f5f7fa;
}

.item-image {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: #f5f7fa;
  border-radius: 3px;
  border: 1px solid #ebeef5;
}

.no-image {
  font-size: 12px;
  color: #909399;
}

.item-info {
  flex: 1;
  min-width: 0;
  padding: 0 10px;
}

.item-name {
  font-weight: bold;
  margin-bottom: 5px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-specs {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.item-price-info {
  width: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex-shrink: 0;
}

.item-price, .item-count, .item-subtotal {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 13px;
}

.price-label, .count-label, .subtotal-label {
  color: #909399;
}

.price-value, .subtotal-value {
  color: #f56c6c;
  font-weight: bold;
}

.count-value {
  font-weight: bold;
  color: #303133;
}

.item-card-footer {
  display: flex;
  justify-content: space-between;
  padding: 5px 10px;
  background-color: #f5f7fa;
  border-top: 1px solid #ebeef5;
  font-size: 12px;
  color: #909399;
}

.batch-details-dialog :deep(.el-dialog__body) {
  padding: 20px;
}

.batch-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.batch-header h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #303133;
}

.batch-meta {
  display: flex;
  gap: 15px;
  font-size: 13px;
  color: #909399;
}

.batch-info {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.info-group {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.info-item {
  min-width: 200px;
}

.info-label {
  color: #909399;
  margin-right: 5px;
}

.info-value {
  font-weight: 500;
  color: #303133;
}

.info-value.price {
  color: #f56c6c;
  font-weight: 600;
}

.batch-items {
  margin-top: 20px;
}

.batch-items h4 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #303133;
}

.batch-success-message {
  font-weight: bold;
  font-size: 14px;
}

/* 添加当前草稿单提示样式 */
.current-draft-info {
  margin-bottom: 15px;
}

.draft-alert-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

/* 添加当前订单提示样式 */
.current-order-info,
.current-batch-info {
  margin-bottom: 15px;
}

.order-alert-content,
.batch-alert-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
</style>

