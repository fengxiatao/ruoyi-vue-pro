import { AppRouteRecordRaw } from '@/router/types'
import { Layout } from '@/utils/routerHelper'
import { t } from '@/hooks/web/useI18n'

const erpRouter: AppRouteRecordRaw = {
  path: '/erp',
  component: Layout,
  redirect: '/erp/stock/warehouse',
  name: 'Erp',
  meta: {
    orderNo: 2000,
    icon: 'ep:shopping-cart',
    title: 'ERP'
  },
  children: [
    {
      path: 'purchase',
      name: 'ErpPurchase',
      component: null,
      meta: {
        title: '采购管理',
        icon: 'ep:shopping-bag'
      },
      redirect: '/erp/purchase/dashboard',
      children: [
        {
          path: 'dashboard',
          component: () => import('@/views/erp/purchase/dashboard/index.vue'),
          name: 'ErpPurchaseDashboard',
          meta: {
            title: '采购决策',
            noCache: true
          }
        },
        {
          path: 'order',
          component: () => import('@/views/erp/purchase/order/index.vue'),
          name: 'ErpPurchaseOrder',
          meta: {
            title: '采购订单',
            noCache: true
          }
        },
        {
          path: 'in',
          component: () => import('@/views/erp/purchase/in/index.vue'),
          name: 'ErpPurchaseIn',
          meta: {
            title: '采购入库',
            noCache: true
          }
        },
        {
          path: 'return',
          component: () => import('@/views/erp/purchase/return/index.vue'),
          name: 'ErpPurchaseReturn',
          meta: {
            title: '采购退货',
            noCache: true
          }
        },
        {
          path: 'supplier',
          component: () => import('@/views/erp/purchase/supplier/index.vue'),
          name: 'ErpSupplier',
          meta: {
            title: '供应商管理',
            noCache: true
          }
        }
      ]
    },
    {
      path: 'stock',
      name: 'ErpStock',
      component: null,
      meta: {
        title: '库存管理',
        icon: 'ep:box'
      },
      redirect: '/erp/stock/warehouse',
      children: [
        {
          path: 'warehouse',
          component: () => import('@/views/erp/stock/warehouse/index.vue'),
          name: 'ErpWarehouse',
          meta: {
            title: '仓库管理',
            noCache: true
          }
        },
        {
          path: 'move',
          component: () => import('@/views/erp/stock/move/index.vue'),
          name: 'ErpMove',
          meta: {
            title: '库存调度',
            noCache: true
          }
        },
        {
          path: 'in',
          component: () => import('@/views/erp/stock/in/index.vue'),
          name: 'ErpIn',
          meta: {
            title: '入库管理',
            noCache: true
          }
        },
        {
          path: 'out',
          component: () => import('@/views/erp/stock/out/index.vue'),
          name: 'ErpOut',
          meta: {
            title: '出库管理',
            noCache: true
          }
        },
        {
          path: 'check',
          component: () => import('@/views/erp/stock/check/index.vue'),
          name: 'ErpCheck',
          meta: {
            title: '库存盘点',
            noCache: true
          }
        }
      ]
    }
  ]
}

export default erpRouter 