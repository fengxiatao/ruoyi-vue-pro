import request from '@/config/axios'
import {mockGetWarehouseRackPage} from "@/api/erp/stock/warehouse/mock";

// 是否使用模拟数据 - 不再直接控制是否使用mock，改为通过API返回状态决定
// const useMock = true

// 模拟数据 - 坏品商品
const mockDefectiveProducts = (params) => {
  const { pageNo, pageSize } = params
  const total = 15
  const list = Array.from({ length: Math.min(pageSize, total) }).map((_, index) => {
    const actualIndex = (pageNo - 1) * pageSize + index
    return {
      productId: 1000 + actualIndex,
      skuId: `SKU${1000 + actualIndex}`,
      name: `坏品商品${actualIndex + 1}`,
      barCode: `BAR${1000 + actualIndex}`,
      spec: `规格${actualIndex + 1}`,
      unitName: '个',
      stockCount: Math.floor(Math.random() * 100) + 10,
      purchasePrice: (Math.random() * 100 + 50).toFixed(2),
      warehouseId: 1,
      warehouseName: '主仓库',
      supplierId: 1,
      supplierName: '默认供应商',
      isDefective: true,
      turnoverRate: Math.random() * 0.1
    }
  })
  return { list, total }
}

// 模拟数据 - 即将过期商品
const mockExpiringProducts = (params) => {
  const { pageNo, pageSize } = params
  const total = 12
  const list = Array.from({ length: Math.min(pageSize, total) }).map((_, index) => {
    const actualIndex = (pageNo - 1) * pageSize + index
    return {
      productId: 2000 + actualIndex,
      skuId: `SKU${2000 + actualIndex}`,
      name: `即将过期商品${actualIndex + 1}`,
      barCode: `BAR${2000 + actualIndex}`,
      spec: `规格${actualIndex + 1}`,
      unitName: '盒',
      stockCount: Math.floor(Math.random() * 100) + 10,
      purchasePrice: (Math.random() * 100 + 50).toFixed(2),
      warehouseId: 1,
      warehouseName: '主仓库',
      supplierId: 1,
      supplierName: '默认供应商',
      isExpiringSoon: true,
      expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString().split('T')[0], // 7天后过期
      turnoverRate: Math.random() * 0.2 + 0.1
    }
  })
  return { list, total }
}

// 模拟数据 - 客户退回商品
const mockCustomerReturnedProducts = (params) => {
  const { pageNo, pageSize } = params
  const total = 8
  const list = Array.from({ length: Math.min(pageSize, total) }).map((_, index) => {
    const actualIndex = (pageNo - 1) * pageSize + index
    return {
      productId: 3000 + actualIndex,
      skuId: `SKU${3000 + actualIndex}`,
      name: `客户退回商品${actualIndex + 1}`,
      barCode: `BAR${3000 + actualIndex}`,
      spec: `规格${actualIndex + 1}`,
      unitName: '箱',
      stockCount: Math.floor(Math.random() * 50) + 5,
      purchasePrice: (Math.random() * 100 + 50).toFixed(2),
      warehouseId: 1,
      warehouseName: '主仓库',
      supplierId: 1,
      supplierName: '默认供应商',
      isCustomerReturned: true,
      returnDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * (Math.floor(Math.random() * 30) + 1)).toISOString().split('T')[0], // 1-30天前退回
      turnoverRate: Math.random() * 0.3 + 0.2
    }
  })
  return { list, total }
}

// 模拟数据 - 低周转商品
const mockLowTurnoverProducts = (params) => {
  const { pageNo, pageSize } = params
  const total = 20
  const list = Array.from({ length: Math.min(pageSize, total) }).map((_, index) => {
    const actualIndex = (pageNo - 1) * pageSize + index
    return {
      productId: 4000 + actualIndex,
      skuId: `SKU${4000 + actualIndex}`,
      name: `低周转商品${actualIndex + 1}`,
      barCode: `BAR${4000 + actualIndex}`,
      spec: `规格${actualIndex + 1}`,
      unitName: '件',
      stockCount: Math.floor(Math.random() * 200) + 50,
      purchasePrice: (Math.random() * 100 + 50).toFixed(2),
      warehouseId: 1,
      warehouseName: '主仓库',
      supplierId: 1,
      supplierName: '默认供应商',
      turnoverRate: Math.random() * 0.05, // 低周转率
      lastSaleTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * (Math.floor(Math.random() * 90) + 30)).toISOString() // 30-120天前最后销售
    }
  })
  return { list, total }
}

// 模拟数据 - 所有库存商品
const mockAllProducts = (params) => {
  const { pageNo, pageSize } = params
  const total = 50
  const list = Array.from({ length: Math.min(pageSize, total) }).map((_, index) => {
    const actualIndex = (pageNo - 1) * pageSize + index
    return {
      productId: 5000 + actualIndex,
      skuId: `SKU${5000 + actualIndex}`,
      name: `库存商品${actualIndex + 1}`,
      barCode: `BAR${5000 + actualIndex}`,
      spec: `规格${actualIndex + 1}`,
      unitName: '个',
      stockCount: Math.floor(Math.random() * 300) + 20,
      purchasePrice: (Math.random() * 100 + 50).toFixed(2),
      warehouseId: 1,
      warehouseName: '主仓库',
      supplierId: 1,
      supplierName: '默认供应商',
      turnoverRate: Math.random() * 0.5 + 0.1, // 正常周转率
      lastSaleTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * (Math.floor(Math.random() * 30))).toISOString() // 0-30天前最后销售
    }
  })
  return { list, total }
}

export const StockApi = {
  // 获取库存商品批次列表
  getProductStockGetDefective: async (params) => {
    try {
      return await request.get({
        url: '/erp/stock/supplier-return/get-defective',
        params
      })
    } catch (error: any) {
      if (error.response && error.response.status === 501) {
        return mockDefectiveProducts(params)
      }
      throw error
    }
  },

  // getWarehouseRackPage: async (params: any) => {
  //   if (useMock) {
  //     return mockGetWarehouseRackPage(params)
  //   }
  //   return await request.get({ url: `/erp/warehouse-rack/page`, params })
  // },

  getProductStockGetExpiring: async (params) => {
    try {
      return await request.get({
        url: '/erp/stock/supplier-return/get-expiring',
        params
      })
    } catch (error: any) {
      if (error.response && error.response.status === 501) {
        return mockExpiringProducts(params)
      }
      throw error
    }
  },

  getProductStockCustomerReturned: async (params) => {
    try {
      return await request.get({
        url: '/erp/stock/supplier-return/get-customer-returned',
        params
      })
    } catch (error: any) {
      if (error.response && error.response.status === 501) {
        return mockCustomerReturnedProducts(params)
      }
      throw error
    }
  },
  
  // 获取低周转率商品列表
  getLowTurnoverProducts: async (params) => {
    try {
      return await request.get({
        url: '/erp/stock/turnover/low-turnover',
        params
      })
    } catch (error: any) {
      if (error.response && error.response.status === 501) {
        return mockLowTurnoverProducts(params)
      }
      throw error
    }
  },
  
  // 获取库存商品批次列表
  getProductStockBatchList: async (params) => {
    try {
      return await request.get({
        url: '/erp/stock/batch/list',
        params
      })
    } catch (error: any) {
      if (error.response && error.response.status === 501) {
        return mockAllProducts(params)
      }
      throw error
    }
  }
} 
