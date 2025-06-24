// hooks/useMoney.ts
import { computed, type Ref } from 'vue'

export function useMoney(amount: Ref<number>) {
  const yuan = computed({
    get: () => (amount.value / 100).toFixed(2),
    set: (val) => {
      amount.value = Math.round(parseFloat(val) * 100) || 0
    }
  })
  
  return { yuan }
}