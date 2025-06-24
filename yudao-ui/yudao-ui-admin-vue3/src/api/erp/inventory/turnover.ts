import request from '@/config/axios'

/**
 * 商品周转率配置VO
 */
export interface ProductTurnoverConfigVO {
  id: number
  categoryId: number
  categoryName?: string
  calculationPeriod: string // MONTHLY, QUARTERLY, YEARLY
  lowTurnoverThreshold: number
  normalTurnoverThreshold: number
  enabled: boolean
}

/**
 * 商品库存健康评分VO
 */
export interface stockHealthScoreVO {
  productId: number
  productName?: string
  totalScore: number
  turnoverScore: number
  ageScore: number
  trendScore: number
  profitScore: number
  suggestions: stockSuggestionVO[]
}

/**
 * 库存建议VO
 */
export interface stockSuggestionVO {
  type: string // CLEARANCE, SEASONAL, REPLACEMENT, etc.
  message: string
  action: string
  priority: number // 1-5, 5最高
}

/**
 * 商品周转率API
 */
export class ProductTurnoverApi {
  /**
   * 获取商品周转率配置列表
   */
  static getTurnoverConfigList(): Promise<ProductTurnoverConfigVO[]> {
    return request.get({ 
      url: '/erp/stock/turnover/config/page',
      params: {
        pageNo: 1,
        pageSize: 500 // 设置较大的页面大小，以获取所有配置
      }
    }).then(res => res.list) // 从分页结果中提取列表数据
  }

  /**
   * 保存商品周转率配置
   */
  static saveTurnoverConfig(data: ProductTurnoverConfigVO): Promise<boolean> {
    // 根据ID是否存在决定是创建还是更新
    if (data.id) {
      return request.put({ url: '/erp/stock/turnover/config/update', data })
    } else {
      return request.post({ 
        url: '/erp/stock/turnover/config/create', 
        data 
      }).then(() => true)
    }
  }

  /**
   * 获取商品库存健康评分
   */
  static getstockHealthScore(productId: number): Promise<stockHealthScoreVO> {
    return request.get({ 
      url: '/erp/stock/turnover/health-score',
      params: { productId }
    })
  }

  /**
   * 获取低周转商品列表
   */
  static getLowTurnoverProducts(params: any): Promise<any> {
    return request.get({ 
      url: '/erp/stock/turnover/low-turnover',
      params
    })
  }

  /**
   * 获取库存优化建议
   */
  static getstockOptimizationSuggestions(params: any): Promise<stockSuggestionVO[]> {
    return request.get({ 
      url: '/erp/stock/turnover/suggestions',
      params
    })
  }

  /**
   * 手动触发周转率计算
   */
  static calculateTurnoverRates(): Promise<boolean> {
    return request.post({ url: '/erp/stock/turnover/calculate' })
  }
} 