<template>
  <div class="app-container">
    <!-- 顶部通知栏 -->
    <div class="marquee-container">
      <div class="notification-area">
        <!-- 库存告警面板 -->
        <div class="alert-panel">
          <div class="panel-header">
            <span class="title">
              <el-icon><Warning /></el-icon>
              库存告警清单
            </span>
            <el-button type="primary" link>全部处理</el-button>
          </div>
          <div class="alert-list">
            <el-table
              :data="stockAlerts"
              style="width: 100%"
              size="small"
              :max-height="200"
            >
              <el-table-column prop="productName" label="商品名称" min-width="150" show-overflow-tooltip>
                <template #default="scope">
                  <el-button type="danger" :icon="Warning" circle size="small" v-if="scope.row.level === 'critical'" />
                  <el-button type="warning" :icon="Warning" circle size="small" v-else />
                  <span class="product-name">{{ scope.row.productName }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="sku" label="SKU" width="120" />
              <el-table-column prop="currentStock" label="当前库存" width="100" align="right" />
              <el-table-column prop="minStock" label="最低库存" width="100" align="right" />
              <el-table-column prop="suggestPurchase" label="建议采购" width="100" align="right">
                <template #default="scope">
                  <span class="suggest-qty">{{ scope.row.suggestPurchase }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150" fixed="right">
                <template #default="scope">
                  <el-button type="primary" link @click="handleCreatePurchase(scope.row)">创建采购单</el-button>
                  <el-button type="info" link @click="handleViewDetail(scope.row)">查看详情</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </div>

    <el-card class="box-card">
      <div class="left-info">
        <!-- 搜索区域 -->
        <div class="search-header">
          <el-form :inline="true">
            <el-form-item>
              <el-input
                v-model="searchForm.keyword"
                :placeholder="getSearchPlaceholder"
                style="width: 200px"
              >
                <template #append>
                  <el-button>
                    <el-icon><Search /></el-icon>
                  </el-button>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary">查询</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 主要内容区 -->
        <div class="main-content">
          <div class="content-wrapper">
            <!-- 左侧面板 -->
            <div class="left-panel">
              <div class="list-container">
                <el-table
                  :data="tableData"
                  style="width: 100%"
                  height="calc(100vh - 320px)"
                  highlight-current-row
                  @current-change="handleRowSelect"
                >
                  <el-table-column type="index" label="序号" width="60" />
                  <el-table-column prop="orderNo" label="采购单号" width="150" />
                  <el-table-column prop="supplierName" label="供应商" width="150" />
                  <el-table-column prop="totalAmount" label="总金额" width="120">
                    <template #default="scope">
                      ¥{{ scope.row.totalAmount }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="status" label="状态" width="100">
                    <template #default="scope">
                      <el-tag :type="getStatusType(scope.row.status)">
                        {{ getStatusText(scope.row.status) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="createTime" label="创建时间" width="180" />
                </el-table>
              </div>
            </div>

            <!-- 右侧面板 -->
            <div class="right-panel">
              <div class="status-bar">
                <el-radio-group v-model="purchaseStatus" class="status-group">
                  <el-radio label="normal">常规采购</el-radio>
                  <el-radio label="urgent">紧急采购</el-radio>
                  <el-radio label="strategic">战略采购</el-radio>
                  <el-radio label="spot">现货采购</el-radio>
                </el-radio-group>
              </div>

              <!-- 采购信息 -->
              <div class="info-bar">
                <div class="info-row">
                  <div class="info-item">
                    <span class="label">预算金额:</span>
                    <el-input v-model="purchaseInfo.budget" class="info-input" />
                  </div>
                  <div class="info-item">
                    <span class="label">已用金额:</span>
                    <el-input v-model="purchaseInfo.used" class="info-input" />
                  </div>
                  <div class="info-item">
                    <span class="label">剩余额度:</span>
                    <el-input v-model="purchaseInfo.remaining" class="info-input" />
                  </div>
                </div>
              </div>

              <!-- 商品列表 -->
              <div class="product-list">
                <el-table
                  :data="productList"
                  style="width: 100%"
                  :highlight-current-row="true"
                  :show-header="true"
                  class="product-table"
                >
                  <el-table-column type="index" label="序" width="50" align="center" />
                  <el-table-column label="商品信息" min-width="200">
                    <template #default="scope">
                      <div class="product-info">
                        <div class="product-name">{{ scope.row.name }}</div>
                        <div class="product-code">编码: {{ scope.row.code }}</div>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="quantity" label="数量" width="100" />
                  <el-table-column prop="price" label="单价" width="120" align="right">
                    <template #default="scope">
                      <span class="price">¥{{ scope.row.price }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="amount" label="金额" width="120" align="right">
                    <template #default="scope">
                      <span class="price">¥{{ scope.row.amount }}</span>
                    </template>
                  </el-table-column>
                </el-table>
              </div>

              <!-- 采购单信息 -->
              <div class="order-summary">
                <div class="summary-row">
                  <div class="summary-item">
                    <span class="label">采购状态:</span>
                    <span class="value">{{ purchaseInfo.status }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="label">审核状态:</span>
                    <span class="value">{{ purchaseInfo.auditStatus }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="label">风控等级:</span>
                    <span class="value">{{ purchaseInfo.riskLevel }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="label">采购总额:</span>
                    <span class="value price">¥{{ purchaseInfo.totalAmount }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部工具栏 -->
        <div class="bottom-bar">
          <div class="left-actions">
            <el-input v-model="remark" placeholder="采购备注" class="remark-input" />
            <el-date-picker
              v-model="expectedDeliveryDate"
              type="datetime"
              placeholder="预计到货时间"
              class="delivery-time"
            />
          </div>
          <div class="center-actions">
            <el-button type="primary">保存草稿</el-button>
            <el-button type="primary">提交审核</el-button>
          </div>
          <div class="right-actions">
            <el-button type="primary">寻源分析</el-button>
            <el-button>供应商</el-button>
            <el-button>商品</el-button>
            <el-button>历史价格</el-button>
            <el-button>绩效评估</el-button>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, Warning, Goods, Document } from '@element-plus/icons-vue'

// 库存告警数据
const stockAlerts = ref([
  {
    productName: 'WH110T-9B转灯(左)',
    sku: 'WH110T-9B左',
    currentStock: 50,
    minStock: 100,
    suggestPurchase: 200,
    level: 'critical'
  },
  {
    productName: 'FV6 2.0阀门',
    sku: 'FV6-2.0',
    currentStock: 80,
    minStock: 100,
    suggestPurchase: 100,
    level: 'warning'
  },
  {
    productName: '新版4812无电器',
    sku: '4812-NE',
    currentStock: 120,
    minStock: 150,
    suggestPurchase: 100,
    level: 'warning'
  }
])

// 通知消息
const notices = ref([
  {
    type: 'risk',
    content: '风控提醒：3笔采购单待审核',
    time: '10分钟前'
  },
  {
    type: 'supplier',
    content: '供应商A（广州）延期交付预警',
    time: '30分钟前'
  },
  {
    type: 'reconciliation',
    content: '2笔采购单对账差异待处理',
    time: '1小时前'
  }
])

// 按类型分组的通知
const groupedNotices = computed(() => {
  return notices.value.reduce((groups: any, notice) => {
    if (!groups[notice.type]) {
      groups[notice.type] = []
    }
    groups[notice.type].push(notice)
    return groups
  }, {})
})

// 获取通知组标题
const getNoticeGroupTitle = (type: string) => {
  const titles: { [key: string]: string } = {
    risk: '风控提醒',
    supplier: '供应商预警',
    reconciliation: '对账提醒'
  }
  return titles[type] || '其他通知'
}

// 处理创建采购单
const handleCreatePurchase = (row: any) => {
  console.log('创建采购单:', row)
  // TODO: 实现创建采购单逻辑
}

// 处理查看详情
const handleViewDetail = (row: any) => {
  console.log('查看详情:', row)
  // TODO: 实现查看详情逻辑
}

// 当前激活的标签页
const activeTab = ref('purchase')

// 搜索表单
const searchForm = ref({
  keyword: ''
})

// 查询参数
const queryParams = ref({
  pageNo: 1,
  pageSize: 10
})

// 总数
const total = ref(100)

// 采购状态
const purchaseStatus = ref('normal')

// 采购信息
const purchaseInfo = ref({
  budget: '1000000.00',
  used: '580000.00',
  remaining: '420000.00',
  status: '执行中',
  auditStatus: '已审核',
  riskLevel: '低风险',
  totalAmount: '58000.00'
})

// 预计到货时间
const expectedDeliveryDate = ref('')

// 备注
const remark = ref('')

// 表格数据
const tableData = ref([
  {
    orderNo: 'PO202402240001',
    supplierName: '供应商A',
    totalAmount: '58000.00',
    status: 'processing',
    createTime: '2024-02-24 10:00:00'
  },
  {
    orderNo: 'PO202402240002',
    supplierName: '供应商B',
    totalAmount: '23000.00',
    status: 'pending',
    createTime: '2024-02-24 11:00:00'
  }
])

// 商品列表数据
const productList = ref([
  {
    name: '商品A',
    code: 'SKU001',
    quantity: 100,
    price: '580.00',
    amount: '58000.00'
  },
  {
    name: '商品B',
    code: 'SKU002',
    quantity: 50,
    price: '460.00',
    amount: '23000.00'
  }
])

// 搜索框提示文字
const getSearchPlaceholder = computed(() => {
  const placeholders = {
    purchase: '输入采购单号搜索',
    source: '输入商品名称搜索',
    supplier: '输入供应商名称搜索',
    risk: '输入风控事项搜索',
    reconciliation: '输入对账单号搜索'
  }
  return placeholders[activeTab.value] || '请输入关键字搜索'
})

// 获取状态标签类型
const getStatusType = (status: string) => {
  const typeMap: { [key: string]: string } = {
    processing: 'primary',
    pending: 'warning',
    completed: 'success',
    rejected: 'danger'
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: { [key: string]: string } = {
    processing: '执行中',
    pending: '待审核',
    completed: '已完成',
    rejected: '已拒绝'
  }
  return textMap[status] || '未知'
}

// 获取供应商等级标签类型
const getSupplierLevelType = (level: string) => {
  const typeMap: { [key: string]: string } = {
    'A': 'success',
    'B': 'warning',
    'C': 'danger'
  }
  return typeMap[level] || 'info'
}

// 处理分页大小改变
const handleSizeChange = (val: number) => {
  queryParams.value.pageSize = val
  // 重新加载数据
}

// 处理当前页改变
const handleCurrentChange = (val: number) => {
  queryParams.value.pageNo = val
  // 重新加载数据
}

// 处理行选择
const handleRowSelect = (row: any) => {
  if (row) {
    console.log('选中行:', row)
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  display: flex;
  height: calc(100vh - 30px);
  padding: 10px;
  background-color: #f0f2f5;
  flex-direction: column;
  gap: 10px;
}

.marquee-container {
  flex-shrink: 0;
}

.box-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.left-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-header {
  padding: 10px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-wrapper {
  display: flex;
  gap: 16px;
  flex: 1;
  overflow: hidden;
}

.left-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.list-container {
  flex: 1;
  overflow: hidden;
}

.right-panel {
  display: flex;
  width: 400px;
  overflow-y: auto;
  flex-direction: column;
  gap: 16px;
}

.status-bar {
  padding: 12px;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;

  .status-group {
    display: flex;
    gap: 16px;
  }
}

.info-bar {
  padding: 12px;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;

  .info-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .info-item {
    display: flex;
    align-items: center;
    gap: 4px;

    .label {
      color: #606266;
      white-space: nowrap;
    }

    .info-input {
      width: 100px;
    }
  }
}

.product-list {
  overflow: hidden;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  flex: 1;

  .product-table {
    :deep(.el-table__header) {
      background-color: #fafafa;
    }
  }

  .product-info {
    .product-name {
      font-size: 14px;
      color: #303133;
    }

    .product-code {
      margin-top: 4px;
      font-size: 12px;
      color: #909399;
    }
  }

  .price {
    font-weight: 500;
    color: #f56c6c;
  }
}

.order-summary {
  padding: 12px;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;

  .summary-row {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }

  .summary-item {
    display: flex;
    align-items: center;
    gap: 4px;

    .label {
      color: #606266;
    }

    .value {
      font-weight: 500;
      color: #303133;

      &.price {
        color: #f56c6c;
      }
    }
  }
}

.bottom-bar {
  display: flex;
  padding: 16px;
  background-color: #fff;
  border-top: 1px solid #e4e7ed;
  justify-content: space-between;
  align-items: center;

  .left-actions {
    display: flex;
    gap: 8px;

    .remark-input {
      width: 200px;
    }

    .delivery-time {
      width: 200px;
    }
  }

  .center-actions {
    display: flex;
    gap: 8px;
  }

  .right-actions {
    display: flex;
    gap: 8px;
  }
}

.notification-area {
  margin-bottom: 0;
}

.alert-panel {
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  
  .panel-header {
    display: flex;
    padding: 12px 16px;
    border-bottom: 1px solid #e4e7ed;
    justify-content: space-between;
    align-items: center;

    .title {
      display: flex;
      font-size: 16px;
      font-weight: 500;
      color: #303133;
      align-items: center;
      gap: 8px;

      .el-icon {
        color: #e6a23c;
      }
    }
  }

  .alert-list {
    padding: 12px;

    .product-name {
      margin-left: 8px;
    }

    .suggest-qty {
      font-weight: 500;
      color: #f56c6c;
    }
  }
}
</style> 