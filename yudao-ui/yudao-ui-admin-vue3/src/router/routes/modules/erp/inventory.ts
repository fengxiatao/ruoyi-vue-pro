import { Layout } from '@/layouts'

export default [
  {
    path: '/erp/inventory',
    component: Layout,
    redirect: '/erp/inventory/product',
    name: 'InventoryManagement',
    meta: {
      title: '库存管理',
      icon: 'ep:box',
      alwaysShow: true
    },
    children: [
      {
        path: 'product',
        component: () => import('@/views/erp/inventory/product/index.vue'),
        name: 'InventoryProduct',
        meta: {
          title: '库存查询'
        }
      },
      {
        path: 'check',
        component: () => import('@/views/erp/inventory/check/index.vue'),
        name: 'InventoryCheck',
        meta: {
          title: '库存盘点'
        }
      },
      {
        path: 'turnover',
        component: () => import('@/views/erp/inventory/turnover/index.vue'),
        name: 'InventoryTurnover',
        meta: {
          title: '周转率管理'
        }
      },
      {
        path: 'turnover/config',
        component: () => import('@/views/erp/inventory/turnover/TurnoverConfig.vue'),
        name: 'TurnoverConfig',
        meta: {
          title: '周转率配置',
          activeMenu: '/erp/inventory/turnover'
        },
        hidden: true
      },
      {
        path: 'turnover/low-products',
        component: () => import('@/views/erp/inventory/turnover/LowTurnoverProducts.vue'),
        name: 'LowTurnoverProducts',
        meta: {
          title: '低周转商品',
          activeMenu: '/erp/inventory/turnover'
        },
        hidden: true
      }
    ]
  }
] 