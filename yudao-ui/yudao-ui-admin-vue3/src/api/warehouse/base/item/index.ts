import request from '@/config/axios'

export interface ItemVO extends BaseVO {
  code: string // 商品编码
  name: string // 商品名称
  spec: string // 规格
  unit: string // 单位
  categoryId: number // 分类ID
  categoryName: string // 分类名称
  stock: number // 当前库存
  minStock: number // 最小库存
  maxStock: number // 最大库存
  remark?: string // 备注
  status: number // 状态
}

export interface ItemPageReqVO extends PageParam {
  code?: string // 商品编码
  name?: string // 商品名称
  categoryId?: number // 分类ID
  status?: number // 状态
}

// 查询商品列表
export const getItemPage = (params: ItemPageReqVO) => {
  return request.get({ url: '/warehouse/base/item/page', params })
}

// 查询商品列表（精简)，主要用于下拉选择
export const getItemList = (params: ItemPageReqVO) => {
  return request.get({ url: '/warehouse/base/item/list-all-simple', params })
}

// 查询商品详情
export const getItem = (id: number) => {
  return request.get({ url: `/warehouse/base/item/get?id=${id}` })
}

// 新增商品
export const createItem = (data: ItemVO) => {
  return request.post({ url: '/warehouse/base/item/create', data })
}

// 修改商品
export const updateItem = (data: ItemVO) => {
  return request.put({ url: '/warehouse/base/item/update', data })
}

// 删除商品
export const deleteItem = (id: number) => {
  return request.delete({ url: `/warehouse/base/item/delete?id=${id}` })
}

// 导出商品
export const exportItem = (params: ItemPageReqVO) => {
  return request.download({ url: '/warehouse/base/item/export', params })
} 