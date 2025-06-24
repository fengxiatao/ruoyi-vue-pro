import request from '@/config/axios'
import { 
  mockGetWarehouseLocationPage,
  mockGetWarehouseLocationSimpleList,
  mockGetWarehouseLocation,
  mockCreateWarehouseLocation,
  mockUpdateWarehouseLocation,
  mockDeleteWarehouseLocation
} from './mock'

// ERP 货位 VO
export interface WarehouseLocationVO {
  id: number // 货位编号
  warehouseId: number // 所属仓库编号
  warehouseName?: string // 所属仓库名称
  rackId: number // 所属货架编号
  rackName?: string // 所属货架名称
  code: string // 货位编码
  name: string // 货位名称
  sort: number // 排序
  remark: string // 备注
  status: number // 开启状态
  capacity: number // 容量
  unitId: number // 容量单位编号
  unitName?: string // 容量单位名称
}

// 是否使用Mock数据
const useMock = false

// ERP 货位 API
export const WarehouseLocationApi = {
  // 查询货位分页
  getWarehouseLocationPage: async (params: any) => {
    if (useMock) {
      return mockGetWarehouseLocationPage(params)
    }
    return await request.get({ url: `/erp/warehouse-location/page`, params })
  },

  // 查询货位精简列表
  getWarehouseLocationSimpleList: async (rackId?: number) => {
    if (useMock) {
      return mockGetWarehouseLocationSimpleList(rackId)
    }
    const params = rackId ? { rackId } : {}
    return await request.get({ url: `/erp/warehouse-location/simple-list`, params })
  },

  // 查询货位详情
  getWarehouseLocation: async (id: number) => {
    if (useMock) {
      return mockGetWarehouseLocation(id)
    }
    return await request.get({ url: `/erp/warehouse-location/get?id=` + id })
  },

  // 新增货位
  createWarehouseLocation: async (data: WarehouseLocationVO) => {
    if (useMock) {
      return mockCreateWarehouseLocation(data)
    }
    return await request.post({ url: `/erp/warehouse-location/create`, data })
  },

  // 修改货位
  updateWarehouseLocation: async (data: WarehouseLocationVO) => {
    if (useMock) {
      return mockUpdateWarehouseLocation(data)
    }
    return await request.put({ url: `/erp/warehouse-location/update`, data })
  },

  // 删除货位
  deleteWarehouseLocation: async (id: number) => {
    if (useMock) {
      return mockDeleteWarehouseLocation(id)
    }
    return await request.delete({ url: `/erp/warehouse-location/delete?id=` + id })
  },

  // 导出货位 Excel
  exportWarehouseLocation: async (params) => {
    if (useMock) {
      return new Blob(['Mock Excel Data'], { type: 'application/vnd.ms-excel' })
    }
    return await request.download({ url: `/erp/warehouse-location/export-excel`, params })
  }
} 