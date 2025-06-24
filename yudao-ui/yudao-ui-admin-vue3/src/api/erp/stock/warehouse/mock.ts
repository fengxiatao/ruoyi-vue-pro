import { WarehouseRackVO } from './rack'
import { WarehouseLocationVO } from './location'

// Mock数据：货架列表
const mockRacks: WarehouseRackVO[] = [
  {
    id: 1,
    warehouseId: 1,
    warehouseName: '总仓库',
    code: 'RACK-A',
    name: 'A区货架',
    sort: 1,
    remark: 'A区主要存放电子产品',
    status: 0
  },
  {
    id: 2,
    warehouseId: 1,
    warehouseName: '总仓库',
    code: 'RACK-B',
    name: 'B区货架',
    sort: 2,
    remark: 'B区主要存放家居用品',
    status: 0
  },
  {
    id: 3,
    warehouseId: 2,
    warehouseName: '北京仓库',
    code: 'BJ-RACK-A',
    name: '北京A区货架',
    sort: 1,
    remark: '北京A区存放各类产品',
    status: 0
  },
  {
    id: 4,
    warehouseId: 2,
    warehouseName: '北京仓库',
    code: 'BJ-RACK-B',
    name: '北京B区货架',
    sort: 2,
    remark: '北京B区存放各类产品',
    status: 0
  }
]

// Mock数据：货位列表
const mockLocations: WarehouseLocationVO[] = [
  {
    id: 1,
    warehouseId: 1,
    warehouseName: '总仓库',
    rackId: 1,
    rackName: 'A区货架',
    code: 'A-01',
    name: 'A区01号货位',
    sort: 1,
    remark: '小型电子产品',
    status: 0,
    capacity: 100,
    capacityUnit: '件'
  },
  {
    id: 2,
    warehouseId: 1,
    warehouseName: '总仓库',
    rackId: 1,
    rackName: 'A区货架',
    code: 'A-02',
    name: 'A区02号货位',
    sort: 2,
    remark: '中型电子产品',
    status: 0,
    capacity: 50,
    capacityUnit: '件'
  },
  {
    id: 3,
    warehouseId: 1,
    warehouseName: '总仓库',
    rackId: 2,
    rackName: 'B区货架',
    code: 'B-01',
    name: 'B区01号货位',
    sort: 1,
    remark: '小型家居用品',
    status: 0,
    capacity: 200,
    capacityUnit: '件'
  },
  {
    id: 4,
    warehouseId: 1,
    warehouseName: '总仓库',
    rackId: 2,
    rackName: 'B区货架',
    code: 'B-02',
    name: 'B区02号货位',
    sort: 2,
    remark: '中型家居用品',
    status: 0,
    capacity: 100,
    capacityUnit: '件'
  },
  {
    id: 5,
    warehouseId: 2,
    warehouseName: '北京仓库',
    rackId: 3,
    rackName: '北京A区货架',
    code: 'BJ-A-01',
    name: '北京A区01号货位',
    sort: 1,
    remark: '北京小型产品',
    status: 0,
    capacity: 150,
    capacityUnit: '件'
  },
  {
    id: 6,
    warehouseId: 2,
    warehouseName: '北京仓库',
    rackId: 4,
    rackName: '北京B区货架',
    code: 'BJ-B-01',
    name: '北京B区01号货位',
    sort: 1,
    remark: '北京中型产品',
    status: 0,
    capacity: 120,
    capacityUnit: '件'
  }
]

// 模拟API函数：获取货架分页数据
export const mockGetWarehouseRackPage = (params: any) => {
  const { warehouseId, code, name, status, pageNo = 1, pageSize = 10 } = params

  // 过滤数据
  let filteredRacks = [...mockRacks]
  if (warehouseId !== undefined) {
    filteredRacks = filteredRacks.filter(rack => rack.warehouseId === warehouseId)
  }
  if (code) {
    filteredRacks = filteredRacks.filter(rack => rack.code.includes(code))
  }
  if (name) {
    filteredRacks = filteredRacks.filter(rack => rack.name.includes(name))
  }
  if (status !== undefined) {
    filteredRacks = filteredRacks.filter(rack => rack.status === status)
  }

  // 分页
  const start = (pageNo - 1) * pageSize
  const end = start + pageSize
  const list = filteredRacks.slice(start, end)

  return {
    list,
    total: filteredRacks.length
  }
}

// 模拟API函数：获取货架详情
export const mockGetWarehouseRack = (id: number) => {
  return mockRacks.find(rack => rack.id === id)
}

// 模拟API函数：获取货架简单列表
export const mockGetWarehouseRackSimpleList = (warehouseId?: number) => {
  if (warehouseId !== undefined) {
    return mockRacks.filter(rack => rack.warehouseId === warehouseId)
  }
  return mockRacks
}

// 模拟API函数：创建货架
export const mockCreateWarehouseRack = (data: WarehouseRackVO) => {
  const newId = Math.max(...mockRacks.map(rack => rack.id)) + 1
  const newRack = { ...data, id: newId }
  mockRacks.push(newRack)
  return newRack
}

// 模拟API函数：更新货架
export const mockUpdateWarehouseRack = (data: WarehouseRackVO) => {
  const index = mockRacks.findIndex(rack => rack.id === data.id)
  if (index !== -1) {
    mockRacks[index] = { ...mockRacks[index], ...data }
    return mockRacks[index]
  }
  return null
}

// 模拟API函数：删除货架
export const mockDeleteWarehouseRack = (id: number) => {
  const index = mockRacks.findIndex(rack => rack.id === id)
  if (index !== -1) {
    mockRacks.splice(index, 1)
    return true
  }
  return false
}

// 模拟API函数：获取货位分页数据
export const mockGetWarehouseLocationPage = (params: any) => {
  const { warehouseId, rackId, code, name, status, pageNo = 1, pageSize = 10 } = params

  // 过滤数据
  let filteredLocations = [...mockLocations]
  if (warehouseId !== undefined) {
    filteredLocations = filteredLocations.filter(location => location.warehouseId === warehouseId)
  }
  if (rackId !== undefined) {
    filteredLocations = filteredLocations.filter(location => location.rackId === rackId)
  }
  if (code) {
    filteredLocations = filteredLocations.filter(location => location.code.includes(code))
  }
  if (name) {
    filteredLocations = filteredLocations.filter(location => location.name.includes(name))
  }
  if (status !== undefined) {
    filteredLocations = filteredLocations.filter(location => location.status === status)
  }

  // 分页
  const start = (pageNo - 1) * pageSize
  const end = start + pageSize
  const list = filteredLocations.slice(start, end)

  return {
    list,
    total: filteredLocations.length
  }
}

// 模拟API函数：获取货位详情
export const mockGetWarehouseLocation = (id: number) => {
  return mockLocations.find(location => location.id === id)
}

// 模拟API函数：获取货位简单列表
export const mockGetWarehouseLocationSimpleList = (rackId?: number) => {
  if (rackId !== undefined) {
    return mockLocations.filter(location => location.rackId === rackId)
  }
  return mockLocations
}

// 模拟API函数：创建货位
export const mockCreateWarehouseLocation = (data: WarehouseLocationVO) => {
  const newId = Math.max(...mockLocations.map(location => location.id)) + 1
  const newLocation = { ...data, id: newId }
  mockLocations.push(newLocation)
  return newLocation
}

// 模拟API函数：更新货位
export const mockUpdateWarehouseLocation = (data: WarehouseLocationVO) => {
  const index = mockLocations.findIndex(location => location.id === data.id)
  if (index !== -1) {
    mockLocations[index] = { ...mockLocations[index], ...data }
    return mockLocations[index]
  }
  return null
}

// 模拟API函数：删除货位
export const mockDeleteWarehouseLocation = (id: number) => {
  const index = mockLocations.findIndex(location => location.id === id)
  if (index !== -1) {
    mockLocations.splice(index, 1)
    return true
  }
  return false
} 