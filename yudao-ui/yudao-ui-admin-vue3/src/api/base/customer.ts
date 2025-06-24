import request from '@/config/axios'

export interface CustomerVO {
  id: number
  name: string
  contact: string
  phone: string
  address: string
  createTime: Date
}

// 获取客户列表
export const getCustomerList = (params: { keyword: string }) => {
  return request.get({ url: '/base/customer/list', params })
}

// 获取客户详情
export const getCustomer = (id: number) => {
  return request.get({ url: `/base/customer/get?id=${id}` })
}

// 创建客户
export const createCustomer = (data: Omit<CustomerVO, 'id' | 'createTime'>) => {
  return request.post({ url: '/base/customer/create', data })
}

// 更新客户
export const updateCustomer = (data: Omit<CustomerVO, 'createTime'>) => {
  return request.put({ url: '/base/customer/update', data })
}

// 删除客户
export const deleteCustomer = (id: number) => {
  return request.delete({ url: `/base/customer/delete?id=${id}` })
} 