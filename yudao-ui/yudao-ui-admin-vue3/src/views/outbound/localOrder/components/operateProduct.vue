<template>
  <!-- 操作模式切换 -->
  <div class="operation-mode">
    <span
      class="sku-display"
      :title="currentSkuInput"
      style="font-size: 20px; color: red; background: yellow"
    >
      {{ currentSkuInput || "--" }}
    </span>

    <el-radio-group
      v-model="currentOrderItem.operateType"
      ref="operationTypeRef"
      style="padding-right: 0; margin-right: 0"
      @change="handleOperationChange"
      tabindex="0"
      @keydown="handleOperationTypeKeydown"
    >
      <el-radio
        label="0"
        @keydown.enter="handleOperateTypeRadioEnter"
        style="padding-right: 8px; margin-right: 0"
        class="custom-radio"
        >正常</el-radio
      >
      <el-radio
        style="padding-right: 8px; margin-right: 0"
        class="custom-radio"
        label="1"
        @keydown.enter="handleOperateTypeRadioEnter"
        >退货</el-radio
      >
      <el-radio
        style="padding-right: 8px; margin-right: 0"
        class="custom-radio"
        label="2"
        @keydown.enter="handleOperateTypeRadioEnter"
        >换货</el-radio
      >
      <el-radio
        style="padding-right: 8px; margin-right: 0"
        class="custom-radio"
        label="3"
        @keydown.enter="handleOperateTypeRadioEnter"
        >赠送</el-radio
      >
      <el-radio
        style="padding-right: 8px; margin-right: 0"
        class="custom-radio"
        label="4"
        @keydown.enter="handleOperateTypeRadioEnter"
        >补货</el-radio
      >
    </el-radio-group>
  </div>

  <!-- 动态表单区域 -->
  <div class="dynamic-form">
    <!-- 订单细项区 -->
    <div class="action-bar">
      <el-form
        :model="currentOrderItem"
        :inline="true"
        style="display: block; overflow-x: auto; white-space: nowrap"
      >
        <div class="form-row">
          <span class="form-label">单价</span>
          <MoneyInput
            v-model="currentOrderItem.price"
            :precision="2"
            @keydown.enter="handleInputKeydown($event, countInputRef)"
            class="compact-input"
            style="width: 70px; margin-top: -5px; margin-right: 3px"
            ref="priceInputRef"
          />
          <span class="form-label">数量</span>
          <el-input
            v-model="currentOrderItem.count"
            @keydown.enter="handleInputKeydown($event, discountInputRef)"
            class="compact-input"
            style="width: 48px; margin-top: -5px; margin-right: 3px"
            ref="countInputRef"
          />
          <span class="form-label">金额</span>
          <MoneyInput
            v-model="currentOrderItem.totlePrice"
            :precision="2"
            class="compact-input"
            disabled
            style="width: 70px; margin-top: -5px; margin-right: 3px"
          />
          <span class="form-label">优惠</span>
          <MoneyInput
            v-model="currentOrderItem.discountPrice"
            :precision="2"
            @keydown.enter="handleInputKeydown($event, null, true)"
            class="compact-input"
            style="width: 70px; margin-top: -5px; margin-right: 3px"
            ref="discountInputRef"
          />
          <span class="form-label">应付</span>
          <MoneyInput
            v-model="currentOrderItem.payPrice"
            :precision="2"
            class="compact-input"
            disabled
            style="width: 70px; margin-top: -5px; margin-right: 3px"
            ref="payPriceInputRef"
          />
        </div>
      </el-form>
    </div>

    <!-- 商品SPU表格 -->
    <div class="product-spu-container">
      <!-- 商品列表 -->
      <div class="spu-list">
        <el-table
          ref="skuTableRef"
          v-loading="skuLoading"
          :data="skuList"
          :show-overflow-tooltip="true"
          :stripe="false"
          class="spu-table"
          highlight-current-row
          row-key="id"
          v-show="skuList.length > 0 || skuLoading"
          @row-dblclick="handleSkuRowDblclick"
        >
          <el-table-column
            type="index"
            label="序"
            width="50"
            align="center"
            :index="indexMethod"
          />
          <el-table-column label="图" width="50" align="center">
            <template #default="{ row }">
              <span
                v-if="getPicUrl(row)"
                class="pic-tip"
                @click="handleShowPic(row)"
                style="color: #409eff; cursor: pointer"
                title="点击查看图片"
                >图</span
              >
            </template>
          </el-table-column>
          <el-table-column label="商品信息" min-width="200">
            <template #default="{ row }">
              <div class="product-info-cell" :title="row.name">
                    {{ row.name || `${row.spuId}的规格商品` }}
                  </div>
            </template>
          </el-table-column>
          <el-table-column label="规格" min-width="180" prop="properties">
            <template #default="{ row }">
              <el-tag
                v-for="(prop, index) in row.properties"
                :key="index"
                size="small"
                class="sku-property-tag"
              >
                {{ prop.propertyName }}: {{ prop.valueName }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="价格" width="85" align="center" prop="price">
            <template #default="{ row }"> ¥ {{ (row.price / 100).toFixed(2) }} </template>
          </el-table-column>
          <el-table-column label="库存" width="70" align="center" prop="stock" />
          <el-table-column
            label="条码"
            min-width="150"
            prop="barCode"
            show-overflow-tooltip
          />
        </el-table>

        <Pagination
          class="spu-pagination"
          :small="true"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, jumper, next"
          v-model:limit="skuQueryParams.pageSize"
          v-model:page="skuQueryParams.pageNo"
          :total="skuTotal"
          @pagination="getSkuList"
        />
        <div class="spu-search">
          <el-form :inline="true" :model="skuQueryParams">
            <el-form-item label="名称" label-width="40px">
              <el-input
                ref="skuSearchInput"
                v-model="skuQueryParams.name"
                placeholder="商品名称"
                type="text"
                size="small"
                @keydown="handleSkuSearchKeydown"
              />
            </el-form-item>
            <el-form-item label="分类" label-width="40px">
              <el-cascader
                v-model="skuQueryParams.categoryId"
                :options="categoryList"
                :props="defaultProps"
                size="small"
                clearable
                filterable
                placeholder="请选择商品分类"
              />
            </el-form-item>
            <div class="button-container">
              <el-button @click="handleSkuQuery" size="small">
                <Icon icon="ep:search" />搜索
              </el-button>
              <el-button @click="resetSkuQuery" size="small">
                <Icon icon="ep:refresh" />重置
              </el-button>
            </div>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { OrderItemRespVO } from "@/types/localOrder";
import * as ProductSpuApi from "@/api/mall/product/spu";
import * as ProductCategoryApi from "@/api/mall/product/category";
import { defaultProps } from "@/utils/tree";
import { ElInput } from "element-plus"; // 导入组件类型
import { ref, watch, onMounted, onUnmounted, nextTick } from "vue";
import type { ElTable } from "element-plus";

const skuSearchInput = ref<InstanceType<typeof ElInput>>();
const skuLoading = ref(false); // 列表的加载中
const skuTotal = ref(0); // 列表的总页数
const skuList = ref<ProductSpuApi.Sku[]>([]); // 列表的数据
const categoryList = ref<any[]>([]); // 分类树

const skuQueryFormRef = ref(); // 搜索的表单Ref
const skuQueryParams = ref({
  pageNo: 1,
  pageSize: 10,
  tabType: 0,
  name: "",
  nameList: [], // 新增关键词列表
  categoryId: undefined,
  createTime: undefined,
});
const props = defineProps<{
  selectedOrderItem?: OrderItemRespVO | null;
}>();
const handleOperationChange = (type: number) => {
  currentOrderItem.value.operateType = type;
};
const moveToOrderEnter = () => {};
const handleSkuQuery = () => {
  skuQueryParams.value.pageNo = 1;
  getSkuList();
};
const lastSpaceIndex = ref(0);
const currentSkuTableIndex = ref(0);

const handleSkuSearchKeydown = (event) => {
  if (event.key === " ") {
    const input = skuQueryParams.value.name;
    const keyword = input.substring(lastSpaceIndex.value).trim();
    if (keyword) {
      skuQueryParams.value.nameList.push(keyword);
      handleSkuQuery();
    }
    lastSpaceIndex.value = input.length;
    // 保证输入框内容以空格结尾，方便多次输入
    if (!skuQueryParams.value.name.endsWith(" ")) {
      skuQueryParams.value.name += " ";
    }
    event.preventDefault();
  } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    if (skuList.value.length === 0) return;
    if (event.key === "ArrowDown") {
      if (
        currentSkuTableIndex.value === null ||
        currentSkuTableIndex.value === undefined
      ) {
        currentSkuTableIndex.value = 0;
        selectSkuTableRow(0);
      } else if (currentSkuTableIndex.value < skuList.value.length - 1) {
        currentSkuTableIndex.value++;
        selectSkuTableRow(currentSkuTableIndex.value);
      } else if (
        skuQueryParams.value.pageNo * skuQueryParams.value.pageSize <
        skuTotal.value
      ) {
        // 有下一页
        skuQueryParams.value.pageNo++;
        currentSkuTableIndex.value = 0;
        getSkuList({ highlightRow: 0 });
      }
    } else if (event.key === "ArrowUp") {
      if (
        currentSkuTableIndex.value === null ||
        currentSkuTableIndex.value === undefined
      ) {
        currentSkuTableIndex.value = 0;
        selectSkuTableRow(0);
      } else if (currentSkuTableIndex.value > 0) {
        currentSkuTableIndex.value--;
        selectSkuTableRow(currentSkuTableIndex.value);
      } else if (skuQueryParams.value.pageNo > 1) {
        // 有上一页
        skuQueryParams.value.pageNo--;
        getSkuList({ highlightRow: "last" });
      }
    }
    event.preventDefault();
  } else if (event.key === "Enter") {
    // 选中当前高亮商品，聚焦到数量输入框
    if (skuList.value.length && currentSkuTableIndex.value >= 0) {
      selectSkuTableRow(currentSkuTableIndex.value);
      currentOrderItem.value.operateType = "0";
      
      // 直接同步价格（不需要转换，表格中显示的已经是元）
      const selectedSku = skuList.value[currentSkuTableIndex.value];
      if (selectedSku && selectedSku.price) {
        currentOrderItem.value.price = selectedSku.price;
      }
      
      // 直接聚焦到数量输入框
      nextTick(() => {
        if (countInputRef.value) {
          countInputRef.value.focus();
        }
      });
      event.preventDefault();
    }
  }
};

function selectSkuTableRow(index) {
  if (!skuTableRef.value || !skuList.value.length) return;
  const row = skuList.value[index];
  skuTableRef.value.setCurrentRow(row);
  scrollToSkuTableRow(index);
  // 切换商品时显示sku名称
  if (row && row.name) {
    currentSkuInput.value = row.name;
    console.log("selectSkuTableRow set currentSkuInput:", currentSkuInput.value);
  } else {
    currentSkuInput.value = "";
    console.log("selectSkuTableRow set currentSkuInput: 空");
  }
}

function scrollToSkuTableRow(index) {
  // 尝试滚动到指定行
  const tableEl = skuTableRef.value?.$el;
  if (!tableEl) return;
  const bodyWrapper = tableEl.querySelector(".el-table__body-wrapper");
  const rowEls = tableEl.querySelectorAll(".el-table__body tr");
  if (bodyWrapper && rowEls && rowEls[index]) {
    rowEls[index].scrollIntoView({ block: "nearest" });
  }
}

// 监听全局键盘事件，表格上下键切换
function handleTableArrowKey(event) {
  if (document.activeElement?.tagName === "INPUT") return; // 输入框聚焦时不处理
  if (event.key === "ArrowDown") {
    if (currentSkuTableIndex.value < skuList.value.length - 1) {
      currentSkuTableIndex.value++;
      selectSkuTableRow(currentSkuTableIndex.value);
      event.preventDefault();
    }
  } else if (event.key === "ArrowUp") {
    if (currentSkuTableIndex.value > 0) {
      currentSkuTableIndex.value--;
      selectSkuTableRow(currentSkuTableIndex.value);
      event.preventDefault();
    }
  }
}

const resetSkuQuery = () => {
  if (skuQueryFormRef.value) {
    skuQueryFormRef.value.resetFields();
  }
  skuQueryParams.value.name = "";
  skuQueryParams.value.nameList = [];
  lastSpaceIndex.value = 0;
  skuQueryParams.value.categoryId = undefined;
  handleSkuQuery();
};
/** 查询SKU列表 */
const getSkuList = async (options: { highlightRow?: number | "last" } = {}) => {
  skuLoading.value = true;
  try {
    const params = { ...skuQueryParams.value, name: undefined };
    const data = await ProductSpuApi.getSkuPage(params);
    skuList.value = data.list;
    skuTotal.value = data.total;
    // 翻页后自动高亮目标行
    if (options.highlightRow === 0 && skuList.value.length > 0) {
      currentSkuTableIndex.value = 0;
      selectSkuTableRow(0);
    } else if (options.highlightRow === "last" && skuList.value.length > 0) {
      currentSkuTableIndex.value = skuList.value.length - 1;
      selectSkuTableRow(currentSkuTableIndex.value);
    } else if (
      options.highlightRow !== undefined &&
      typeof options.highlightRow === "number" &&
      skuList.value.length > 0
    ) {
      currentSkuTableIndex.value = options.highlightRow;
      selectSkuTableRow(currentSkuTableIndex.value);
    } else if (
      skuList.value.length > 0 &&
      currentSkuTableIndex.value >= 0 &&
      currentSkuTableIndex.value < skuList.value.length
    ) {
      // 翻页后如果有高亮行，自动同步currentSkuInput
      currentSkuInput.value = skuList.value[currentSkuTableIndex.value]?.name || "";
      console.log("getSkuList set currentSkuInput:", currentSkuInput.value);
    } else {
      currentSkuInput.value = "";
      console.log("getSkuList set currentSkuInput: 空");
    }
  } catch (error) {
    console.error("获取SKU列表失败", error);
  } finally {
    skuLoading.value = false;
  }
};

// 新增引用
const skuTableRef = ref<InstanceType<typeof ElTable> | null>(null);

const currentOrderItem = ref({
  ...props.selectedOrderItem,
  price: props.selectedOrderItem?.price ?? 0,
  discountPrice: props.selectedOrderItem?.discountPrice ?? 0,
  totlePrice: props.selectedOrderItem?.totlePrice ?? 0,
  payPrice: props.selectedOrderItem?.payPrice ?? 0,
});
const currentSkuInput = ref("");
watch(
  () => props.selectedOrderItem,
  (newOrderItem) => {
    if (newOrderItem) {
      currentOrderItem.value = { ...newOrderItem };
    }
  },
  { immediate: true }
);

const skuSearchInputFocus = () => {
  skuSearchInput.value?.focus();
};
defineExpose({
  skuSearchInputFocus,
});

// 组件初始化
onMounted(async () => {
  // 获取SKU列表
  await getSkuList();
  // 获取分类数据
  try {
    const data = await ProductCategoryApi.getCategoryList({});
    categoryList.value = data;
  } catch (error) {
    console.error("获取分类数据失败", error);
  }
  window.addEventListener("keydown", handleTableArrowKey);
  window.addEventListener("keydown", handleSkuNameShortcut);
  // 事件代理：监听radio input的键盘事件
  nextTick(() => {
    const radioGroupEl = operationTypeRef.value?.$el || operationTypeRef.value;
    if (radioGroupEl) {
      const radios = radioGroupEl.querySelectorAll('input[type="radio"]');
      radios.forEach((radio) => {
        radio.addEventListener("keydown", handleRadioInputKeydown);
      });
    }
  });
});
onUnmounted(() => {
  window.removeEventListener("keydown", handleTableArrowKey);
  window.removeEventListener("keydown", handleSkuNameShortcut);
  // 移除radio input事件监听
  const radioGroupEl = operationTypeRef.value?.$el || operationTypeRef.value;
  if (radioGroupEl) {
    const radios = radioGroupEl.querySelectorAll('input[type="radio"]');
    radios.forEach((radio) => {
      radio.removeEventListener("keydown", handleRadioInputKeydown);
    });
  }
});

function handleSkuNameShortcut(e) {
  // ALT+S 快捷键聚焦商品名称输入框
  if (e.altKey && (e.key === "s" || e.key === "S")) {
    e.preventDefault();
    skuSearchInput.value?.focus();
  }
}

function handleRadioInputKeydown(event) {
  if (event.key === "Enter") {
    nextTick(() => {
      console.log("nextRef.value", priceInputRef.value);
      priceInputRef.value?.focus?.();
    });
    event.preventDefault();
  }
}

const indexMethod = (index: number) => index + 1;

const emit = defineEmits(["show-pics", "add-draft-item"]);
const handleShowPic = (row) => {
  let urls: string[] = [];
  if (typeof row.picUrl === "string" && row.picUrl.startsWith("[")) {
    try {
      urls = JSON.parse(row.picUrl);
    } catch {
      urls = [row.picUrl];
    }
  } else if (Array.isArray(row.picUrl)) {
    urls = row.picUrl;
  } else if (row.picUrl) {
    urls = [row.picUrl];
  }
  if (urls.length) emit("show-pics", urls);
};
const getPicUrl = (row) => {
  if (!row.picUrl) return "";
  // 如果是字符串且是数组格式，先转成数组
  if (typeof row.picUrl === "string" && row.picUrl.startsWith("[")) {
    try {
      const arr = JSON.parse(row.picUrl);
      if (Array.isArray(arr)) return arr[0] || "";
    } catch (e) {
      // 解析失败，降级为原字符串
      return row.picUrl;
    }
  }
  if (Array.isArray(row.picUrl)) return row.picUrl[0] || "";
  return row.picUrl;
};

// 新增ref
const operationTypeRef = ref();
const priceInputRef = ref();
const countInputRef = ref();
const discountInputRef = ref();
const payPriceInputRef = ref();

function handleOperationTypeKeydown(event) {
  const types = ["0", "1", "2", "3", "4"];
  let idx = types.indexOf(currentOrderItem.value.operateType?.toString() || "0");
  if (event.key === "ArrowRight" || event.key === "Tab") {
    idx = (idx + 1) % types.length;
    currentOrderItem.value.operateType = types[idx];
    event.preventDefault();
  } else if (event.key === "ArrowLeft") {
    idx = (idx - 1 + types.length) % types.length;
    currentOrderItem.value.operateType = types[idx];
    event.preventDefault();
  } else if (/^[1-5]$/.test(event.key)) {
    currentOrderItem.value.operateType = types[parseInt(event.key) - 1];
    event.preventDefault();
  } else if (event.key === "Enter") {
    nextTick(() => {
      console.log("nextRef.value", priceInputRef.value);
      priceInputRef.value?.focus?.();
    });
    event.preventDefault();
  }
}

function handleInputKeydown(event, nextRef, isLast) {
  console.log("handleInputKeydown", { event, nextRef, isLast });
  if (event.key === "Enter" || event.key === "Tab") {
    if (isLast) {
      // 回车在优惠时，直接添加到草稿单
      addToDraft();
    } else if (nextRef) {
      nextTick(() => {
        // 兼容 el-input 和自定义组件
        if (nextRef?.focus) {
          nextRef.focus();
        } else if (nextRef?.value?.focus) {
          nextRef.value.focus();
        }
      });
    }
    event.preventDefault();
  }
}

function addToDraft() {
  const item = { ...currentOrderItem.value };

  // 保留fromDraft标记和原始itemId（如果存在）
  const fromDraft = item.fromDraft;
  const originalId = item.id;

  // 自动补全sku id、spuName、properties
  if (skuList.value && skuList.value[currentSkuTableIndex.value]) {
    const sku = skuList.value[currentSkuTableIndex.value];
    // 设置正确的skuId和spuId
    item.skuId = sku.id; // 使用sku.id作为skuId
    item.spuId = sku.spuId; // 使用sku.spuId作为spuId
    item.spuName = sku.name;
    item.properties = sku.properties || [];
    item.picUrl = sku.picUrl;
  }
  // 兜底，保证为数组
  if (!Array.isArray(item.properties)) item.properties = [];

  // 自动计算金额
  item.totlePrice = (item.price || 0) * (item.count || 0);
  // 自动计算应付
  item.payPrice = item.totlePrice - (item.discountPrice || 0);

  // 如果是来自草稿单的项目，保留原始ID和标记
  if (fromDraft) {
    item.id = originalId;
    item.fromDraft = true;
  }

  emit("add-draft-item", item);

  // 重置表单
  currentOrderItem.value = {
    price: 0,
    count: 1,
    discountPrice: 0,
    totlePrice: 0,
    payPrice: 0,
    operateType: "0",
    properties: [],
  };
  currentSkuInput.value = "";
  nextTick(() => skuSearchInput.value?.focus());
}

function handleOperateTypeRadioEnter() {
  nextTick(() => {
    console.log("nextRef.value", priceInputRef.value);
    priceInputRef.value?.focus?.();
  });
}

watch(
  () => [
    currentOrderItem.value.price,
    currentOrderItem.value.count,
    currentOrderItem.value.discountPrice,
  ],
  ([price, count, discount]) => {
    const totle = (Number(price) || 0) * (Number(currentOrderItem.value.count) || 0);
    currentOrderItem.value.totlePrice = totle;
    currentOrderItem.value.payPrice =
      totle - (Number(currentOrderItem.value.discountPrice) || 0);
  },
  { immediate: true }
);

// 处理行双击事件，与回车键选择商品功能相同
function handleSkuRowDblclick(row) {
  // 获取当前行的索引
  const rowIndex = skuList.value.findIndex(item => item.id === row.id);
  if (rowIndex >= 0) {
    // 设置当前索引
    currentSkuTableIndex.value = rowIndex;
    // 选中当前行
    selectSkuTableRow(rowIndex);
    // 设置操作类型为"正常"
    currentOrderItem.value.operateType = "0";
    // 直接同步价格（不需要转换，表格中显示的已经是元）
    if (row.price) {
      currentOrderItem.value.price = row.price;
    }
    // 直接聚焦到数量输入框
    nextTick(() => {
      if (countInputRef.value) {
        countInputRef.value.focus();
      }
    });
  }
}
</script>
<style lang="scss" scoped>
::v-deep .custom-radio .el-radio__label {
  margin-left: -5px; /* 调整间距，设为 0 使文字更靠近单选框 */
}

.operation-mode {
  display: flex;
  flex-direction: row;
  margin-bottom: 16px;
  justify-self: space-between;
}

.sku-display {
  flex-grow: 1; /* 让 span 占满剩余空间 */
  min-width: 0; /* 解决溢出问题 */
  padding: 5px 0;
  margin-right: 5px;
  overflow: hidden;
  color: black;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: default;
  background-color: white;
}

.dynamic-form {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding-right: 2px;
  margin: 0;
  overflow: hidden;
  background-color: rgb(4 32 75);
}

.action-bar {
  height: 40px;
  padding: 0;
  margin: 0;
  line-height: 40px;
  background-color: #409eff;
  border-radius: 5px;
}

.form-label {
  margin-right: 4px;
  font-size: 13px;
  color: #606266;
  white-space: nowrap;
}

.product-spu-container {
  position: relative;
  display: flex;
  min-width: 0;
  min-height: 0;
  padding: 0;
  margin-top: 8px;
  overflow: visible;
  background: rgb(255 255 255 / 5%);
  border-radius: 4px;
  flex: 1;
  flex-direction: column;
}

.spu-list {
  display: flex;
  min-height: 0;
  padding-bottom: 32px; /* 为搜索框预留空间 */
  overflow: visible;
  flex: 1;
  flex-direction: column;
  gap: 4px;
}

.spu-search {
  position: absolute; /* 固定在页面底部 */
  bottom: 0;
  left: 0;
  z-index: 1000; /* 确保在最前 */
  display: flex;
  width: 100%;
  padding: 0;
  background-color: #fff;
  align-items: center;
  justify-content: space-between; /* 让内容均匀排列 */
}

.spu-search .el-form {
  flex: 1;
  display: flex;
  align-items: center;
  flex-wrap: nowrap; /* 防止换行 */
}

.spu-search .el-form-item {
  margin-right: 10px; /* 适当间距 */
  margin-bottom: 0; /* 避免默认的换行间距 */
}

.spu-search .button-container {
  display: flex;
  align-items: center;
}

.spu-search .el-button {
  display: flex;
  align-items: center;
  gap: 5px; /* 图标与文本间距 */
}

.spu-pagination {
  height: 26px; /* 自定义高度 */
  margin-top: 5px; /* 覆盖原有 mt-15px */
  margin-bottom: 5px;
}

/* 调整内部元素垂直居中 */
.spu-pagination .el-pagination {
  display: flex;
  align-items: center;
  height: 100%;
}

.pic-tip {
  font-size: 16px;
  font-weight: bold;
}
</style>
