// @ts-ignore
import { faker } from '@faker-js/faker'
import type { StockItem, Supplier, AlertMessage, ProductItem } from '../types/types'

export function genStockoutItems(count: number): StockItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    skuCode: `SKU${faker.string.alphanumeric(8).toUpperCase()}`,
    name: `${faker.commerce.productName()} ${faker.commerce.productAdjective()}`,
    image: faker.image.urlLoremFlickr({ category: 'technics' }),
    currentStock: faker.number.int({ min: 0, max: 20 }),
    safetyStock: faker.number.int({ min: 30, max: 100 }),
    stockAge: faker.number.int({ min: 0, max: 365 }),
    lastSaleDate: faker.date.recent({ days: 180 }).toISOString(),
    warehouse: `WH${faker.number.int({ min: 1, max: 8 })}`,
    suppliers: Array.from({ length: faker.number.int({ min: 1, max: 4 }) }, () => ({
      id: faker.number.int(1000),
      name: faker.company.name(),
      score: faker.number.float({ min: 5, max: 10, fractionDigits: 2 }),
      responseRate: faker.number.int({ min: 80, max: 99 }),
      deliveryTime: `${faker.number.int({ min: 24, max: 72 })}小时`,
      defectRate: `${faker.number.float({ min: 0.1, max: 3, fractionDigits: 2 })}%`,
      priceHistory: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => ({
        date: faker.date.recent({ days: 365 }).toISOString(),
        price: faker.number.float({ min: 10, max: 500, fractionDigits: 2 }),
      }))
    }))
  }));
}

export function genProductItems(count: number): ProductItem[] {
  return Array.from({ length: count }, (_, i) => ({ 
    id: i + 1,
    skuCode: `SKU${faker.string.alphanumeric(8).toUpperCase()}`,
    name: `${faker.commerce.productName()} ${faker.commerce.productAdjective()}`,
    image: faker.image.urlPicsumPhotos({ width: 300, height: 300 }),
    price: {
      current: faker.number.float({
        min: 10,
        max: 500,
        multipleOf: 0.01
      }),
      original: faker.number.float({
        min: 500,
        max: 1000,
        multipleOf: 0.01
      }),
      discount: `${faker.number.float({
        min: 1,
        max: 9.9,
        multipleOf: 0.1
      }).toFixed(1)}折`
    },
    promotions: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => faker.lorem.sentence()),
    rating: {
      score: (Math.random() * 3 + 2).toFixed(1),
      count: faker.number.int({ min: 1000, max: 100000 })
    },
    services: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => faker.lorem.sentence()),
    shop: {
      name: faker.company.name(),
      isOfficial: faker.datatype.boolean()
    },
    badge: faker.helpers.arrayElement(['NEW', 'HOT']),
    stock: faker.number.int({ min: 0, max: 20 })
  }));
}


export function genSuppliers(count: number): Supplier[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: faker.company.name(),
    score: faker.number.float({ min: 5, max: 10, fractionDigits: 2 }),
    responseRate: faker.number.int({ min: 85, max: 99 }),
    deliveryTime: `${faker.number.int({ min: 24, max: 72 })}小时`,
    defectRate: `${faker.number.float({ min: 0.1, max: 2.5, fractionDigits: 2 })}%`,
    priceHistory: Array.from({ length: 6 }, () => ({
      date: faker.date.past().toISOString().split('T')[0], // 生成过去日期
      price: faker.number.float({ min: 50, max: 200, fractionDigits: 2 })
    }))
}))
}

export function genAlerts(count: number): AlertMessage[] {
  const types = ['DEMAND', 'WARNING', 'ORDER', 'SYSTEM']
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    type: types[i % 4] as AlertMessage['type'],
    content: faker.lorem.sentence(),
    timestamp: faker.date.recent({ days: 7 }).getTime()
  }))
}