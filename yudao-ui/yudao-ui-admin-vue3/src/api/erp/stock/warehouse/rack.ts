import request from '@/config/axios'
import { 
  mockGetWarehouseRackPage,
  mockGetWarehouseRackSimpleList,
  mockGetWarehouseRack,
  mockCreateWarehouseRack,
  mockUpdateWarehouseRack,
  mockDeleteWarehouseRack
} from './mock'

// ERP 货架 VO
export interface WarehouseRackVO {
  id: number // 货架编号
  warehouseId: number // 所属仓库编号
  warehouseName?: string // 所属仓库名称
  code: string // 货架编码
  name: string // 货架名称
  sort: number // 排序
  remark: string // 备注
  status: number // 开启状态
}

// 是否使用Mock数据
const useMock = false

// ERP 货架 API
export const WarehouseRackApi = {
  // 查询货架分页
  getWarehouseRackPage: async (params: any) => {
    if (useMock) {
      return mockGetWarehouseRackPage(params)
    }
    return await request.get({ url: `/erp/warehouse-rack/page`, params })
  },

  // 查询货架精简列表
  getWarehouseRackSimpleList: async (warehouseId?: number) => {
    if (useMock) {
      return mockGetWarehouseRackSimpleList(warehouseId)
    }
    const params = warehouseId ? { warehouseId } : {}
    return await request.get({ url: `/erp/warehouse-rack/simple-list`, params })
  },

  // 查询货架详情
  getWarehouseRack: async (id: number) => {
    if (useMock) {
      return mockGetWarehouseRack(id)
    }
    return await request.get({ url: `/erp/warehouse-rack/get?id=` + id })
  },

  // 新增货架
  createWarehouseRack: async (data: WarehouseRackVO) => {
    if (useMock) {
      return mockCreateWarehouseRack(data)
    }
    return await request.post({ url: `/erp/warehouse-rack/create`, data })
  },

  // 修改货架
  updateWarehouseRack: async (data: WarehouseRackVO) => {
    if (useMock) {
      return mockUpdateWarehouseRack(data)
    }
    return await request.put({ url: `/erp/warehouse-rack/update`, data })
  },

  // 删除货架
  deleteWarehouseRack: async (id: number) => {
    if (useMock) {
      return mockDeleteWarehouseRack(id)
    }
    return await request.delete({ url: `/erp/warehouse-rack/delete?id=` + id })
  },

  // 导出货架 Excel
  exportWarehouseRack: async (params) => {
    if (useMock) {
      return new Blob(['Mock Excel Data'], { type: 'application/vnd.ms-excel' })
    }
    return await request.download({ url: `/erp/warehouse-rack/export-excel`, params })
  }
} 