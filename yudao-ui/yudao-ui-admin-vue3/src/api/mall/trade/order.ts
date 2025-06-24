import request from '@/config/axios'

// 创建简单订单（电话客服创建草稿单）
export function createSimpleOrder(data: any) {
  return request.post({ url: '/trade/order/create-simple', data })
}

// 获取草稿单详情
export function getOrderDraftDetail(draftId: number) {
  return request.get({ url: '/trade/order/draft/detail', params: { draftId } })
}

// 更新草稿单
export function updateOrderDraft(data: any) {
  return request.put({ url: '/trade/order/draft/update', data })
}

// 取消草稿单
export function cancelOrderDraft(draftId: number) {
  return request.delete({ url: '/trade/order/draft/cancel', params: { draftId } })
}

// 添加或编辑草稿单中的单个商品项
export function updateDraftItem(data: any) {
  return request.post({ url: '/trade/order/draft/item/update', data })
}

// 删除草稿单中的商品项
export function deleteDraftItem(draftId: number, itemId: number) {
  return request.delete({ url: '/trade/order/draft/item/delete', params: { draftId, itemId } })
}

// 提交订单到仓库
export function submitDraftOrder(draftId: number) {
  return request.post({ url: '/trade/order/draft/submit', params: { draftId } })
}

// 获取客户的草稿单列表
export function getCustomerDrafts(customerId: number) {
  console.log(`正在请求客户(ID:${customerId})的草稿单列表...`);
  return request.get({ 
    url: '/trade/order/draft/list', 
    params: { customerId } 
  }).then(response => {
    console.log('获取草稿单列表成功:', response);
    return response;
  }).catch(error => {
    console.error('获取客户草稿单列表失败:', error);
    // 如果后端接口未实现或发生错误，返回空数组
    return [];
  });
}

// 获取当前销售客服的草稿单列表
export function getMyDrafts(customerId?: number, draftStatus?: number) {
  console.log(`正在请求当前销售客服的草稿单列表...`);
  const params: any = {};
  
  // 可选参数
  if (customerId !== undefined) params.customerId = customerId;
  if (draftStatus !== undefined) params.draftStatus = draftStatus;
  
  return request.get({ 
    url: '/trade/order/draft/list', 
    params
  }).then(response => {
    console.log('获取销售客服草稿单列表成功:', response);
    return response;
  }).catch(error => {
    console.error('获取销售客服草稿单列表失败:', error);
    // 如果后端接口未实现或发生错误，返回空数组
    return [];
  });
}

// 加载草稿单到当前会话
export function loadDraft(draftId: number) {
  return request.get({ 
    url: '/trade/order/draft/load', 
    params: { draftId } 
  });
}

// 添加的分页API方法
// 分页获取草稿单列表
export function getDraftsPage(pageNo: number, pageSize: number, customerId?: number, draftStatus?: number) {
  return request.get({ 
    url: '/trade/order/draft/page', 
    params: { pageNo, pageSize, draftStatus } 
  });
}

// 分页获取历史订单列表
export function getHistoryPage(customerId: number, pageNo: number, pageSize: number) {
  return request.get({ 
    url: '/trade/order/history/page', 
    params: { customerId, pageNo, pageSize } 
  });
}

// 分页获取批次列表
export function getBatchPage(pageNo: number, pageSize: number, customerId?: number, keyword?: string) {
  return request.get({ 
    url: '/trade/order/batch/page', 
    params: { pageNo, pageSize, customerId, keyword } 
  });
}

// 分页获取订单列表
export function getOrderPage(params: any) {
  return request.get({ url: '/trade/order/page', params })
}

// 获取订单详情
export function getOrder(id: number) {
  return request.get({ url: '/trade/order/get', params: { id } })
}

// 更新订单备注
export function updateOrderRemark(data: any) {
  return request.put({ url: '/trade/order/update-remark', data })
}

// 更新订单收货地址
export function updateOrderAddress(data: any) {
  return request.put({ url: '/trade/order/update-address', data })
}

// 更新订单价格
export function updateOrderPrice(data: any) {
  return request.put({ url: '/trade/order/update-price', data })
}

// 订单发货
export function deliveryOrder(data: any) {
  return request.put({ url: '/trade/order/delivery', data })
}

// 订单自提
export function pickUpOrder(id: number) {
  return request.put({ url: '/trade/order/pick-up', params: { id } })
}

// 通过核销码自提订单
export function pickUpOrderByVerifyCode(data: any) {
  return request.put({ url: '/trade/order/pick-up-by-verify-code', data })
}

// 通过核销码获取订单
export function getOrderByPickUpVerifyCode(verifyCode: string) {
  return request.get({ url: '/trade/order/get-by-verify-code', params: { verifyCode } })
}

// 获取物流轨迹
export function getExpressTrackList(id: number, logisticsId: number) {
  return request.get({ url: '/trade/order/express-track/get', params: { id, logisticsId } })
}

// 获取订单统计信息
export function getOrderSummary(params: any) {
  return request.get({ url: '/trade/order/summary', params })
} 