import request from '@/config/axios'

export interface ProductVO {
  id: number
  code: string
  name: string
  spec: string
  unit: string
  price: number
  stock: number
  createTime: Date
}

// 获取商品列表
export const getProductList = (params: { keyword: string }) => {
  return request.get({ url: '/base/product/list', params })
}

// 获取商品详情
export const getProduct = (id: number) => {
  return request.get({ url: `/base/product/get?id=${id}` })
}

// 创建商品
export const createProduct = (data: Omit<ProductVO, 'id' | 'createTime'>) => {
  return request.post({ url: '/base/product/create', data })
}

// 更新商品
export const updateProduct = (data: Omit<ProductVO, 'createTime'>) => {
  return request.put({ url: '/base/product/update', data })
}

// 删除商品
export const deleteProduct = (id: number) => {
  return request.delete({ url: `/base/product/delete?id=${id}` })
} 