import request from '@/config/axios'

export interface OrderVO extends BaseVO {
  customerId: number // 客户ID
  customerName: string // 客户名称
  contact: string // 联系人
  phone: string // 联系电话
  address: string // 配送地址
  planDeliveryTime: Date // 计划配送时间
  remark?: string // 备注
  status: number // 订单状态
  orderItems: OrderItemVO[] // 订单明细
}

export interface OrderItemVO {
  id: number // 明细ID
  itemId: number // 商品ID
  itemName: string // 商品名称
  spec: string // 规格
  unit: string // 单位
  quantity: number // 数量
  remark?: string // 备注
}

export interface OrderPageReqVO extends PageParam {
  orderNo?: string // 订单编号
  customerName?: string // 客户名称
  contact?: string // 联系人
  phone?: string // 联系电话
  status?: number // 订单状态
  createTime?: Date[] // 创建时间范围
}

// 查询订单列表
export const getOrderPage = (params: OrderPageReqVO) => {
  return request.get({ url: '/warehouse/outbound/order/page', params })
}

// 查询订单详情
export const getOrder = (id: number) => {
  return request.get({ url: `/warehouse/outbound/order/get?id=${id}` })
}

// 新增订单
export const createOrder = (data: OrderVO) => {
  return request.post({ url: '/warehouse/outbound/order/create', data })
}

// 修改订单
export const updateOrder = (data: OrderVO) => {
  return request.put({ url: '/warehouse/outbound/order/update', data })
}

// 删除订单
export const deleteOrder = (id: number) => {
  return request.delete({ url: `/warehouse/outbound/order/delete?id=${id}` })
}

// 导出订单
export const exportOrder = (params: OrderPageReqVO) => {
  return request.download({ url: '/warehouse/outbound/order/export', params })
} 