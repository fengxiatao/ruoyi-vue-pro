import request from '@/config/axios'

/**
 * 商品SKU库存位置查重请求VO
 */
export interface ProductSkuStockCheckDuplicateReqVO {
  skuId?: number // SKU编号
  warehouseId: number // 仓库编号
  rackId?: number // 货架编号
  locationId?: number // 货位编号
}

/**
 * 商品SKU库存相关API
 */
export class ProductSkuStockApi {
  /**
   * 检查库存位置是否被其他SKU占用
   * 
   * @param data 查重请求参数
   * @returns 如果位置已被占用，返回true；否则返回false
   */
  static checkDuplicateLocation(data: ProductSkuStockCheckDuplicateReqVO): Promise<boolean> {
    return request.get({ 
      url: '/product/sku-stock/checkDuplicateLocation',
      params: data 
    });
  }
  
  /**
   * 获取指定SKU的库存分布列表
   * 
   * @param skuId SKU编号
   * @returns SKU的库存分布列表
   */
  static getSkuStockDistribution(skuId: number): Promise<any[]> {
    return request.get({
      url: '/product/sku-stock/list-by-sku',
      params: { skuId }
    });
  }
} 