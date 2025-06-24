/**
 *
 * @author 杜大磊
 * @date 2023/12/4 9:48
 * @description index
 */

import VirtualListScroll from './VirtualListScroll/index.vue' 
import {type App} from "vue";

/* istanbul ignore next */
VirtualListScroll.install = function (Vue: App<Element>) {
    Vue.component('VirtualListScroll', VirtualListScroll);
};

export {
    VirtualListScroll  
};