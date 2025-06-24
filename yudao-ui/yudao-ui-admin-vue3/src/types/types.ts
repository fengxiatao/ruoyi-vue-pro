export type AlertLevel = 1 | 2 | 3

export interface AlertMessage {
  id: number
  type: 'DEMAND' | 'WARNING' | 'ORDER' | 'SYSTEM'
  content: string
  timestamp: number
}
export interface TableColumn {
  key: string
  title?: string
  width: number
  renderer?: (scope: { row: any }) => VNode
  sortable?: boolean
  filterable?: boolean
}
export interface StockItem {
  id: number
  skuCode: string
  name: string
  image: string
  currentStock: number
  safetyStock: number
  stockAge: number
  lastSaleDate: string
  warehouse: string
  suppliers: Supplier[]
}

export interface Supplier {
  id: number
  name: string
  score: number
  responseRate: number
  deliveryTime: string
  defectRate: string 
  priceHistory: { date: string; price: number; }[]; // 允许对象数组
}

export interface Warehouse {
  id: string
  name: string
}
export interface StockItem {
  id: number
  skuCode: string
  name: string
  image: string
  currentStock: number
  safetyStock: number
  stockAge: number
  lastSaleDate: string
  warehouse: string
  suppliers: Supplier[]
} 

export interface TableColumn {
  key: string
  title?: string
  width: number
  sortable?: boolean
  filterable?: boolean
  render?: (params: { row: any }) => VNode // 确保render函数类型正确
}

export interface CartItemType {
  id: number
  skuCode: string
  name: string
  quantity: number 
  supplier?: Supplier
  image: string 
  // ...其他字段
}
// types.ts
export interface ProductItem {
  id: number
  skuCode: string
  name: string
  image: string
  price: {
    current: number
    original?: number
    discount?: string
  }
  promotions?: string[]
  rating?: {
    score: string
    count: number
  }
  services?: string[]
  shop?: {
    name: string
    isOfficial: boolean
  }
  badge?: string  // 角标内容，如："秒杀"、"百亿补贴"
  stock: number
}

export interface VirtualListProps {
  data: any[]
  itemHeight: number
  containerHeight: number
  buffer?: number
}

export interface ScrollData {
  startIndex: number
  endIndex: number
  visibleCount: number
  scrollTop: number
}

export interface TableRow {
  index: number
  bianhao: string
  name: string
  mount: number
  price: string
  amount: string
  bak: string
  permount: number
  discode: string
  perprice: string
  operator: string
  client: string
} 