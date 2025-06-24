import request from '@/config/axios'

// 创建采购单
export const createPurchase = (data: any) => {
  return request.post({ url: '/trade/purchase/create', data })
}

// 更新采购单
export const updatePurchase = (data: any) => {
  return request.put({ url: '/trade/purchase/update', data })
}

// 获取采购单详情
export const getPurchaseDetail = (id: number) => {
  return request.get({ url: `/trade/purchase/get?id=${id}` })
}

// 获取采购单分页
export const getPurchasePage = (params: any) => {
  return request.get({ url: '/trade/purchase/page', params })
}

// 删除采购单
export const deletePurchase = (id: number) => {
  return request.delete({ url: `/trade/purchase/delete?id=${id}` })
}

// 获取采购单草稿
export const getPurchaseDraft = (draftId: string) => {
  return request.get({ url: `/trade/purchase/draft/get?draftId=${draftId}` })
}

// 保存采购单草稿
export const savePurchaseDraft = (data: any) => {
  return request.post({ url: '/trade/purchase/draft/save', data })
}

// 提交采购单
export const submitPurchase = (id: number) => {
  return request.post({ url: `/trade/purchase/submit?id=${id}` })
}

// 取消采购单
export const cancelPurchase = (id: number) => {
  return request.post({ url: `/trade/purchase/cancel?id=${id}` })
}

// 审核采购单
export const auditPurchase = (id: number, status: number, remark?: string) => {
  const data = { id, status, remark }
  return request.post({ url: '/trade/purchase/audit', data })
}

// 获取采购单批次历史
export const getBatchPage = (pageNo: number, pageSize: number, supplierId: number, keyword?: string) => {
  const params = { pageNo, pageSize, supplierId, keyword }
  return request.get({ url: '/trade/purchase/batch/page', params })
}

// 获取供货商列表
export const getSupplierList = (params: any) => {
  return request.get({ url: '/trade/supplier/list', params })
}

// 获取供货商详情
export const getSupplierDetail = (id: number) => {
  return request.get({ url: `/trade/supplier/get?id=${id}` })
}

// 获取商品列表
export const getProductList = (params: any) => {
  return request.get({ url: '/product/spu/list', params })
}

// 获取商品详情
export const getProductDetail = (id: number) => {
  return request.get({ url: `/product/spu/get?id=${id}` })
}

// 获取商品SKU列表
export const getSkuList = (spuId: number) => {
  return request.get({ url: `/product/sku/list?spuId=${spuId}` })
}

// 获取商品SKU详情
export const getSkuDetail = (id: number) => {
  return request.get({ url: `/product/sku/get?id=${id}` })
} 