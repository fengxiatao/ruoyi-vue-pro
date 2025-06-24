import type { App } from 'vue'
import { Icon } from './Icon'
import WarehouseLocationSelector from './WarehouseLocationSelector/index.vue'

export const setupGlobCom = (app: App<Element>): void => {
  app.component('Icon', Icon)
  app.component('WarehouseLocationSelector', WarehouseLocationSelector)
}

export default {
  install: (app: App) => {
    setupGlobCom(app)
  }
}
