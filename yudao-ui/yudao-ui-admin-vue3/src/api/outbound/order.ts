import request from '@/config/axios'

export interface OrderItemVO {
  id: number
  orderId: number
  productId: number
  productCode: string
  productName: string
  productSpec: string
  productUnit: string
  quantity: number
  price: number
  amount: number
}

export interface OrderVO {
  id: number
  orderNo: string
  customerId: number
  customerName: string
  contact: string
  phone: string
  address: string
  status: number
  itemCount: number
  totalAmount: number
  createTime: Date
  items: OrderItemVO[]
}

// 获取草稿单列表
export const getDraftList = () => {
  return request.get({ url: '/outbound/order/draft/list' })
}

// 获取历史单列表
export const getHistoryList = () => {
  return request.get({ url: '/outbound/order/history/list' })
}

// 保存草稿单
export const saveDraft = (data: { customerId: number; items: Omit<OrderItemVO, 'id' | 'orderId'>[] }) => {
  return request.post({ url: '/outbound/order/draft/save', data })
}

// 提交订单
export const createOrder = (data: { customerId: number; items: Omit<OrderItemVO, 'id' | 'orderId'>[] }) => {
  return request.post({ url: '/outbound/order/create', data })
}

// 删除草稿单
export const deleteDraft = (id: number) => {
  return request.delete({ url: `/outbound/order/draft/delete?id=${id}` })
}

// 获取订单详情
export const getOrderDetail = (id: number) => {
  return request.get({ url: `/outbound/order/get?id=${id}` })
} 