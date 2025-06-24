import request from '@/config/axios'

export interface SupplierVO {
  id: number
  code: string
  name: string
  contact: string
  mobile: string
  address: string
  remark?: string
  status: number
  createTime: string
  updateTime: string
}

export interface SupplierPageReqVO extends PageParam {
  code?: string
  name?: string
  contact?: string
  mobile?: string
  status?: number
  createTime?: Date[]
}

// 查询供货商列表
export const getSupplierPage = (params: SupplierPageReqVO) => {
  return request.get({ url: '/trade/supplier/page', params })
}

// 查询供货商详情
export const getSupplier = (id: number) => {
  return request.get({ url: `/trade/supplier/get?id=${id}` })
}

// 新增供货商
export const createSupplier = (data: SupplierVO) => {
  return request.post({ url: '/trade/supplier/create', data })
}

// 修改供货商
export const updateSupplier = (data: SupplierVO) => {
  return request.put({ url: '/trade/supplier/update', data })
}

// 删除供货商
export const deleteSupplier = (id: number) => {
  return request.delete({ url: `/trade/supplier/delete?id=${id}` })
}

// 导出供货商
export const exportSupplier = (params: SupplierPageReqVO) => {
  return request.download({ url: '/trade/supplier/export', params })
}

// 获取供货商精简信息列表
export const getSimpleSupplierList = () => {
  return request.get({ url: '/trade/supplier/list-all-simple' })
}

// 更新供货商状态
export const updateSupplierStatus = (id: number, status: number) => {
  const data = { id, status }
  return request.put({ url: '/trade/supplier/update-status', data })
} 