import request from '@/config/axios'

export interface CustomerVO extends BaseVO {
  name: string // 客户名称
  contact: string // 联系人
  phone: string // 联系电话
  address: string // 地址
  remark?: string // 备注
  status: number // 状态
}

export interface CustomerPageReqVO extends PageParam {
  name?: string // 客户名称
  contact?: string // 联系人
  phone?: string // 联系电话
  status?: number // 状态
}

// 查询客户列表
export const getCustomerPage = (params: CustomerPageReqVO) => {
  return request.get({ url: '/warehouse/base/customer/page', params })
}

// 查询客户列表（精简)，主要用于下拉选择
export const getCustomerList = (params: CustomerPageReqVO) => {
  return request.get({ url: '/warehouse/base/customer/list-all-simple', params })
}

// 查询客户详情
export const getCustomer = (id: number) => {
  return request.get({ url: `/warehouse/base/customer/get?id=${id}` })
}

// 新增客户
export const createCustomer = (data: CustomerVO) => {
  return request.post({ url: '/warehouse/base/customer/create', data })
}

// 修改客户
export const updateCustomer = (data: CustomerVO) => {
  return request.put({ url: '/warehouse/base/customer/update', data })
}

// 删除客户
export const deleteCustomer = (id: number) => {
  return request.delete({ url: `/warehouse/base/customer/delete?id=${id}` })
}

// 导出客户
export const exportCustomer = (params: CustomerPageReqVO) => {
  return request.download({ url: '/warehouse/base/customer/export', params })
} 