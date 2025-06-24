// 定义商品属性接口
export interface ProductPropertiesVO {
  propertyId: number | null; // 属性编号
  propertyName: string; // 属性名字
  valueId: number | null; // 属性值编号
  valueName: string; // 属性值名字
}

export interface OrderItemRespVO {
  id?: number;
  skuId: number;
  spuId: number;
  spuName?: string;
  picUrl?: string;
  count: number;
  price: number;
  payPrice?: number;
  properties?: any[];
  selected?: boolean; // 前端选中状态
}

// 定义订单接口
export interface OrderVO {
  id?: number;
  no?: string;
  customerId?: number;
  payOrderId?: number;
  items?: OrderItemRespVO[];
  draftId?: string;
  remark?: string;
  
  // 数量和金额
  productCount?: number;
  totalPrice?: number;
  payPrice?: number;
  
  // 创建和更新信息
  creatorId?: number;
  updaterId?: number;
  createTime?: string;
  updateTime?: string;
  
  // 状态信息
  draftStatus?: number; // 0-未保存 1-编辑中 2-已提交 3-已取消
  processStatus?: number; // 0-未处理 1-派发中 2-已派发 3-拣货中 4-已拣货 5-打包中 6-已打包 7-已发货
  latestBatchId?: number;
  batchVersion?: number;
  
  // 原有字段
  status?: number;
}

// 草稿单商品项请求类型
export interface DraftItemReqVO {
  draftId: string;
  itemId?: number;
  skuId: number;
  spuId: number;
  count: number;
  price: number;
  properties?: string;
  name?: string;
  picUrl?: string;
}

// 批次差异类型
export interface BatchDiffVO {
  id?: number;
  batchId?: number;
  orderId?: number;
  skuId: number;
  diffType: number; // 1-新增 2-修改 3-删除
  oldCount?: number;
  newCount?: number;
  oldPrice?: number;
  newPrice?: number;
}