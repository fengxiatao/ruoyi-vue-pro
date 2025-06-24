import { formatDate } from '@/utils/formatTime'

/**
 * 格式化价格显示
 * @param price 价格（单位：分）
 * @returns 格式化后的价格（如 12.34）
 */
export function formatPrice(price: number | null | undefined): string {
  if (price == null) return '0.00'
  return (price / 100).toFixed(2)
}

/**
 * 格式化日期时间
 * @param dateTime 日期时间
 * @returns 格式化后的日期时间字符串
 */
export function formatDateTime(dateTime: string | Date | null | undefined): string {
  if (!dateTime) return ''
  return formatDate(new Date(dateTime), 'YYYY-MM-DD HH:mm:ss')
}

/**
 * 获取草稿状态文本
 * @param status 状态码
 * @returns 状态文本
 */
export function getDraftStatusText(status: number | null | undefined): string {
  const statusMap: Record<number, string> = {
    0: '未保存',
    1: '编辑中',
    2: '已提交',
    3: '已取消'
  }
  return status !== undefined && status !== null ? (statusMap[status] || '未知') : '未知'
}

/**
 * 获取草稿状态标签类型
 * @param status 状态码
 * @returns 标签类型
 */
export function getDraftStatusType(status: number | null | undefined): string {
  const typeMap: Record<number, string> = {
    0: 'info',
    1: 'primary',
    2: 'success',
    3: 'danger'
  }
  return status !== undefined && status !== null ? (typeMap[status] || 'info') : 'info'
}

/**
 * 获取处理状态文本
 * @param status 状态码
 * @returns 状态文本
 */
export function getProcessStatusText(status: number | null | undefined): string {
  const statusMap: Record<number, string> = {
    0: '未处理',
    1: '派发中',
    2: '已派发',
    3: '拣货中',
    4: '已拣货',
    5: '打包中',
    6: '已打包',
    7: '已发货'
  }
  return status !== undefined && status !== null ? (statusMap[status] || '未知') : '未知'
}

/**
 * 判断是否同一天
 * @param date1 日期1
 * @param date2 日期2
 * @returns 是否同一天
 */
export function isSameDay(date1: Date | string | null, date2: Date | string | null): boolean {
  if (!date1 || !date2) return false
  const d1 = new Date(date1), d2 = new Date(date2)
  return d1.getFullYear() === d2.getFullYear() && 
         d1.getMonth() === d2.getMonth() && 
         d1.getDate() === d2.getDate()
} 