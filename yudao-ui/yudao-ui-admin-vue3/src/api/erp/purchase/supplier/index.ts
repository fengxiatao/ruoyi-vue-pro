import request from '@/config/axios'

// ERP 供应商 VO
export interface SupplierVO {
  id: number // 供应商编号
  name: string // 供应商名称
  contact: string // 联系人
  mobile: string // 手机号码
  telephone: string // 联系电话
  email: string // 电子邮箱
  fax: string // 传真
  remark: string // 备注
  status: number // 开启状态
  sort: number // 排序
  taxNo: string // 纳税人识别号
  taxPercent: number // 税率
  bankName: string // 开户行
  bankAccount: string // 开户账号
  bankAddress: string // 开户地址
  loginId: string // 登录ID
  line: string // 线路
  subLine: string // 下级线路
  website: string // 网址
  password: string // 密码
  contacts: SupplierContactVO[]
}

export interface SupplierContactVO {
  id: number
  supplierId: number
  type: number
  content: string
  contact: string
  remark: string
  primary: number
}

// 爬虫登录请求
export interface CrawlerLoginReqVO {
  username: string // 用户名
  password: string // 密码
  userCode: string // 用户标识码
}

// 爬虫任务状态响应
export interface CrawlerTaskRespVO {
  taskId: string // 任务ID
  status: string // 任务状态
  progress: number // 任务进度
  processedCount: number // 已处理数量
  totalCount: number // 总数量
  startTime: string // 开始时间
  endTime: string // 结束时间
  errorMessage: string // 错误信息
}

// ERP 供应商 API
export const SupplierApi = {
  // 查询供应商分页
  getSupplierPage: async (params: any) => {
    return await request.get({ url: `/erp/supplier/page`, params })
  },

  // 获得供应商精简列表
  getSupplierSimpleList: async () => {
    return await request.get({ url: `/erp/supplier/simple-list` })
  },

  // 查询供应商详情
  getSupplier: async (id: number) => {
    return await request.get({ url: `/erp/supplier/get`, params: { id } })
  },

  // 新增供应商
  createSupplier: async (data: SupplierVO) => {
    return await request.post({ url: `/erp/supplier/create`, data })
  },

  // 修改供应商
  updateSupplier: async (data: SupplierVO) => {
    return await request.put({ url: `/erp/supplier/update`, data })
  },

  // 删除供应商
  deleteSupplier: async (id: number) => {
    return await request.delete({ url: `/erp/supplier/delete`, params: { id } })
  },

  // 导出供应商 Excel
  exportSupplier: async (params) => {
    return await request.download({ url: `/erp/supplier/export-excel`, params })
  },
  
  // 批量创建供应商
  batchCreateSupplier: async (data: SupplierVO[]) => {
    return await request.post({ url: `/erp/supplier/batch-create`, data })
  },
  
  // 爬虫登录 - 旧接口
  crawlerLogin: async (data: CrawlerLoginReqVO) => {
    return await request.post({ url: `/erp/supplier/crawler/login`, data })
  },
  
  // 爬取供应商数据 - 旧接口
  crawlSuppliers: async () => {
    return await request.post({ url: `/erp/supplier/crawler/crawl-suppliers` })
  },
  
  // 保存爬取的供应商数据 - 旧接口
  saveSuppliers: async (data: SupplierVO[]) => {
    return await request.post({ url: `/erp/supplier/crawler/save-suppliers`, data })
  },

  // ========== 新增的爬虫相关接口 ==========
  
  // 爬虫登录
  crawlerLoginNew: async (data: CrawlerLoginReqVO) => {
    return await request.post({ url: `/erp/supplier-crawler/login`, data })
  },
  
  // 同步爬取供应商数据
  crawlSuppliersSync: async () => {
    return await request.get({ url: `/erp/supplier-crawler/crawl-sync` })
  },
  
  // 异步爬取供应商数据
  crawlSuppliersAsync: async () => {
    return await request.post({ url: `/erp/supplier-crawler/crawl-async` })
  },
  
  // 获取爬虫任务状态
  getCrawlTaskStatus: async (taskId: string) => {
    return await request.get({ url: `/erp/supplier-crawler/task-status/${taskId}` })
  },
  
  // 获取爬虫任务结果
  getCrawlTaskResult: async (taskId: string) => {
    return await request.get({ url: `/erp/supplier-crawler/task-result/${taskId}` })
  },
  
  // 保存爬虫任务结果
  saveCrawlTaskResult: async (taskId: string) => {
    return await request.post({ url: `/erp/supplier-crawler/save-task-result/${taskId}` })
  },
  
  // 在搜索框触发空格键
  triggerSpaceKey: async (userCode: string) => {
    return await request.get({ url: `/erp/supplier-crawler/trigger-space-key`, params: { userCode } })
  }
}
