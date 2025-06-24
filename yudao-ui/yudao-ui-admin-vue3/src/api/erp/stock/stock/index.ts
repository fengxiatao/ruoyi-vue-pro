import request from '@/config/axios'

// ERP 产品库存 VO
export interface StockVO {
  // 编号
  id: number
  // 产品编号
  productId: number
  // 仓库编号
  warehouseId: number
  // 库存数量
  count: number
}

// ERP 产品库存批次 VO
export interface StockBatchVO {
  // 产品编号
  productId: number
  // 产品名称
  name: string
  // 产品条码
  barCode: string
  // 规格型号
  spec: string
  // 单位名称
  unitName: string
  // 仓库编号
  warehouseId: number
  // 仓库名称
  warehouseName: string
  // 货架编号
  rackId: number
  // 货架名称
  rackName: string
  // 货位编号
  locationId: number
  // 货位名称
  locationName: string
  // 批次号
  batchNumber: string
  // 库存数量
  stockCount: number
  // 采购价
  purchasePrice: number
}

// 库存预警统计 VO
export interface StockAlertStatVO {
  // 预警类型
  title: string
  // 预警数量
  count: number
  // 预警描述
  desc: string
}

// ERP 产品库存 API
export const StockApi = {
  // 查询产品库存分页
  getStockPage: async (params: any) => {
    return await request.get({ url: `/erp/stock/page`, params })
  },

  // 查询产品库存详情
  getStock: async (id: number) => {
    return await request.get({ url: `/erp/stock/get?id=` + id })
  },

  // 查询产品库存详情
  getStock2: async (productId: number, warehouseId: number) => {
    return await request.get({ url: `/erp/stock/get`, params: { productId, warehouseId } })
  },

  // 获得产品库存数量
  getStockCount: async (productId: number) => {
    return await request.get({ url: `/erp/stock/get-count`, params: { productId } })
  },

  // 导出产品库存 Excel
  exportStock: async (params) => {
    return await request.download({ url: `/erp/stock/export-excel`, params })
  },
  
  // 获取产品库存分布
  getProductStockDistribution: async (productId: number) => {
    return await request.get({ url: `/erp/stock/get-distribution`, params: { productId } })
  },
  
  // 获取产品批次列表
  getProductBatchList: async (productId: number) => {
    return await request.get({ url: `/erp/stock/get-batch-list`, params: { productId } })
  },
  
  // 获取产品库存批次分页列表
  getProductStockBatchList: async (params: any) => {
    return await request.get({ url: `/erp/stock/batch/page`, params })
  },
  
  // 获取库存预警统计
  getStockAlertStats: async () => {
    return await request.get({ url: `/erp/stock/alert/stats` })
  }
}
