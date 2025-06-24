<template>
  <!-- 情况一：添加/修改 -->
  <el-table
    v-if="!isDetail && !isActivityComponent"
    :data="isBatch ? skuList : formData!.skus!"
    border
    class="tabNumWidth"
    max-height="500"
    size="small"
  >
    <el-table-column align="center" label="图片" min-width="65">
      <template #default="{ row }">
        <UploadImg v-model="row.picUrl" height="50px" width="50px" />
      </template>
    </el-table-column>
    <template v-if="formData!.specType && !isBatch">
      <!--  根据商品属性动态添加 -->
      <el-table-column
        v-for="(item, index) in tableHeaders"
        :key="index"
        :label="item.label"
        align="center"
        min-width="120"
      >
        <template #default="{ row }">
          <span style="font-weight: bold; color: #40aaff">
            {{ row.properties?.[index]?.valueName }}
          </span>
        </template>
      </el-table-column>
    </template>
    <el-table-column align="center" label="商品条码" min-width="168">
      <template #default="{ row }">
        <el-input v-model="row.barCode" class="w-100%" />
      </template>
    </el-table-column>
    <el-table-column align="center" label="销售价" min-width="168">
      <template #default="{ row }">
        <el-input-number
          v-model="row.price"
          :min="0"
          :precision="2"
          :step="0.1"
          class="w-100%"
          controls-position="right"
        />
      </template>
    </el-table-column>
    <el-table-column align="center" label="市场价" min-width="168">
      <template #default="{ row }">
        <el-input-number
          v-model="row.marketPrice"
          :min="0"
          :precision="2"
          :step="0.1"
          class="w-100%"
          controls-position="right"
        />
      </template>
    </el-table-column>
    <el-table-column align="center" label="成本价" min-width="168">
      <template #default="{ row }">
        <el-input-number
          v-model="row.costPrice"
          :min="0"
          :precision="2"
          :step="0.1"
          class="w-100%"
          controls-position="right"
        />
      </template>
    </el-table-column>
    <el-table-column align="center" label="库存" min-width="168">
      <template #default="{ row }">
        <el-button type="primary" link @click="openInventoryDialog(row)">
          管理库存 ({{ getTotalStock(row) }})
        </el-button>
      </template>
    </el-table-column>
    <el-table-column align="center" label="重量(kg)" min-width="168">
      <template #default="{ row }">
        <el-input-number
          v-model="row.weight"
          :min="0"
          :precision="2"
          :step="0.1"
          class="w-100%"
          controls-position="right"
        />
      </template>
    </el-table-column>
    <el-table-column align="center" label="体积(m^3)" min-width="168">
      <template #default="{ row }">
        <el-input-number
          v-model="row.volume"
          :min="0"
          :precision="2"
          :step="0.1"
          class="w-100%"
          controls-position="right"
        />
      </template>
    </el-table-column>
    <template v-if="formData!.subCommissionType">
      <el-table-column align="center" label="一级返佣(元)" min-width="168">
        <template #default="{ row }">
          <el-input-number
            v-model="row.firstBrokeragePrice"
            :min="0"
            :precision="2"
            :step="0.1"
            class="w-100%"
            controls-position="right"
          />
        </template>
      </el-table-column>
      <el-table-column align="center" label="二级返佣(元)" min-width="168">
        <template #default="{ row }">
          <el-input-number
            v-model="row.secondBrokeragePrice"
            :min="0"
            :precision="2"
            :step="0.1"
            class="w-100%"
            controls-position="right"
          />
        </template>
      </el-table-column>
    </template>
    <el-table-column
      v-if="formData?.specType"
      align="center"
      fixed="right"
      label="操作"
      width="80"
    >
      <template #default="{ row }">
        <el-button v-if="isBatch" link size="small" type="primary" @click="batchAdd">
          批量添加
        </el-button>
        <el-button v-else link size="small" type="primary" @click="deleteSku(row)"
          >删除</el-button
        >
      </template>
    </el-table-column>
  </el-table>

  <!-- 情况二：详情 -->
  <el-table
    v-if="isDetail"
    ref="activitySkuListRef"
    :data="formData!.skus!"
    border
    max-height="500"
    size="small"
    style="width: 99%"
    @selection-change="handleSelectionChange"
  >
    <el-table-column v-if="isComponent" type="selection" width="45" />
    <el-table-column align="center" label="图片" min-width="80">
      <template #default="{ row }">
        <el-image
          v-if="row.picUrl"
          :src="row.picUrl"
          class="h-50px w-50px"
          @click="imagePreview(row.picUrl)"
        />
      </template>
    </el-table-column>
    <template v-if="formData!.specType && !isBatch">
      <!--  根据商品属性动态添加 -->
      <el-table-column
        v-for="(item, index) in tableHeaders"
        :key="index"
        :label="item.label"
        align="center"
        min-width="80"
      >
        <template #default="{ row }">
          <span style="font-weight: bold; color: #40aaff">
            {{ row.properties?.[index]?.valueName }}
          </span>
        </template>
      </el-table-column>
    </template>
    <el-table-column align="center" label="商品条码" min-width="100">
      <template #default="{ row }">
        {{ row.barCode }}
      </template>
    </el-table-column>
    <el-table-column align="center" label="销售价(元)" min-width="80">
      <template #default="{ row }">
        {{ row.price }}
      </template>
    </el-table-column>
    <el-table-column align="center" label="市场价(元)" min-width="80">
      <template #default="{ row }">
        {{ row.marketPrice }}
      </template>
    </el-table-column>
    <el-table-column align="center" label="成本价(元)" min-width="80">
      <template #default="{ row }">
        {{ row.costPrice }}
      </template>
    </el-table-column>
    <el-table-column align="center" label="总库存" min-width="80">
      <template #default="{ row }">
        {{ getTotalStock(row) }}
      </template>
    </el-table-column>
    <el-table-column align="center" label="库存详情" min-width="120">
      <template #default="{ row }">
        <el-popover placement="right" :width="400" trigger="hover">
          <template #reference>
            <el-button link type="primary">查看详情</el-button>
          </template>
          <el-table :data="row.inventoryLocations || []" size="small" border>
            <el-table-column label="仓库" prop="warehouseName" />
            <el-table-column label="货架" prop="rackName" />
            <el-table-column label="货位" prop="locationName" />
            <el-table-column label="库存" prop="stock" />
            <el-table-column label="预警库存" prop="warnStock" />
            <el-table-column label="上限库存" prop="maxStock" />
          </el-table>
        </el-popover>
      </template>
    </el-table-column>
    <el-table-column align="center" label="重量(kg)" min-width="80">
      <template #default="{ row }">
        {{ row.weight }}
      </template>
    </el-table-column>
    <el-table-column align="center" label="体积(m^3)" min-width="80">
      <template #default="{ row }">
        {{ row.volume }}
      </template>
    </el-table-column>
    <template v-if="formData!.subCommissionType">
      <el-table-column align="center" label="一级返佣(元)" min-width="80">
        <template #default="{ row }">
          {{ row.firstBrokeragePrice }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="二级返佣(元)" min-width="80">
        <template #default="{ row }">
          {{ row.secondBrokeragePrice }}
        </template>
      </el-table-column>
    </template>
  </el-table>

  <!-- 情况三：作为活动组件 -->
  <el-table
    v-if="isActivityComponent"
    :data="formData!.skus!"
    border
    max-height="500"
    size="small"
    style="width: 99%"
  >
    <el-table-column v-if="isComponent" type="selection" width="45" />
    <el-table-column align="center" label="图片" min-width="80">
      <template #default="{ row }">
        <el-image
          :src="row.picUrl"
          class="h-60px w-60px"
          @click="imagePreview(row.picUrl)"
        />
      </template>
    </el-table-column>
    <template v-if="formData!.specType">
      <!--  根据商品属性动态添加 -->
      <el-table-column
        v-for="(item, index) in tableHeaders"
        :key="index"
        :label="item.label"
        align="center"
        min-width="80"
      >
        <template #default="{ row }">
          <span style="font-weight: bold; color: #40aaff">
            {{ row.properties?.[index]?.valueName }}
          </span>
        </template>
      </el-table-column>
    </template>
    <el-table-column align="center" label="商品条码" min-width="100">
      <template #default="{ row }">
        {{ row.barCode }}
      </template>
    </el-table-column>
    <el-table-column align="center" label="销售价(元)" min-width="80">
      <template #default="{ row }">
        {{ formatToFraction(row.price) }}
      </template>
    </el-table-column>
    <el-table-column align="center" label="市场价(元)" min-width="80">
      <template #default="{ row }">
        {{ formatToFraction(row.marketPrice) }}
      </template>
    </el-table-column>
    <el-table-column align="center" label="成本价(元)" min-width="80">
      <template #default="{ row }">
        {{ formatToFraction(row.costPrice) }}
      </template>
    </el-table-column>
    <el-table-column align="center" label="总库存" min-width="80">
      <template #default="{ row }">
        {{ getTotalStock(row) }}
      </template>
    </el-table-column>
    <el-table-column align="center" label="库存详情" min-width="120">
      <template #default="{ row }">
        <el-popover placement="right" :width="400" trigger="hover">
          <template #reference>
            <el-button link type="primary">查看详情</el-button>
          </template>
          <el-table :data="row.inventoryLocations || []" size="small" border>
            <el-table-column label="仓库" prop="warehouseName" />
            <el-table-column label="货架" prop="rackName" />
            <el-table-column label="货位" prop="locationName" />
            <el-table-column label="库存" prop="stock" />
            <el-table-column label="预警库存" prop="warnStock" />
            <el-table-column label="上限库存" prop="maxStock" />
          </el-table>
        </el-popover>
      </template>
    </el-table-column>
    <!--  方便扩展每个活动配置的属性不一样  -->
    <slot name="extension"></slot>
  </el-table>

  <!-- 库存管理对话框 -->
  <el-dialog
    v-model="inventoryDialogVisible"
    title="库存管理"
    width="800px"
    append-to-body
  >
    <div v-if="currentSku">
      <div class="mb-10px">
        <el-button type="primary" @click="addInventoryLocation">添加库存位置</el-button>
        <span class="ml-10px">总库存: {{ getTotalStock(currentSku) }}</span>
      </div>

      <el-table :data="currentSku.inventoryLocations || []" border>
        <el-table-column label="仓库" prop="warehouseName" min-width="120">
          <template #default="{ row }">
            <el-select
              v-model="row.warehouseId"
              filterable
              placeholder="选择仓库"
              @change="handleWarehouseChange($event, row)"
            >
              <el-option
                v-for="item in warehouseOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
            <div v-if="warehouseOptions.length === 0" style="font-size: 12px; color: red">
              仓库列表为空
            </div>
          </template>
        </el-table-column>

        <el-table-column label="货架" prop="rackName" min-width="120">
          <template #default="{ row }">
            <el-select
              v-model="row.rackId"
              filterable
              placeholder="选择货架"
              :disabled="!row.warehouseId"
              @change="handleRackChange($event, row)"
            >
              <el-option
                v-for="item in getRackOptions(row.warehouseId)"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </template>
        </el-table-column>

        <el-table-column label="货位" prop="locationName" min-width="120">
          <template #default="{ row }">
            <el-select
              v-model="row.locationId"
              filterable
              placeholder="选择货位"
              :disabled="!row.rackId"
              @change="handleLocationChange($event, row)"
            >
              <el-option
                v-for="item in getLocationOptions(row.rackId)"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </template>
        </el-table-column>

        <el-table-column label="库存数量" min-width="120">
          <template #default="{ row }">
            <el-input-number
              v-model="row.stock"
              :min="0"
              controls-position="right"
              @change="updateTotalStock"
            />
          </template>
        </el-table-column>

        <el-table-column label="预警库存" min-width="120">
          <template #default="{ row }">
            <el-input-number
              v-model="row.warnStock"
              :min="0"
              controls-position="right"
              placeholder="预警库存"
            />
          </template>
        </el-table-column>

        <el-table-column label="上限库存" min-width="120">
          <template #default="{ row }">
            <el-input-number
              v-model="row.maxStock"
              :min="0"
              controls-position="right"
              placeholder="上限库存"
            />
          </template>
        </el-table-column>

        <el-table-column label="操作" width="80" fixed="right">
          <template #default="{ $index }">
            <el-button link type="danger" @click="removeInventoryLocation($index)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="inventoryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmInventory">确认</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup>
import { PropType, Ref } from "vue";
import { copyValueToTarget, formatToFraction } from "@/utils";
import { propTypes } from "@/utils/propTypes";
import { UploadImg } from "@/components/UploadFile";
import type { Property, Sku, Spu, InventoryLocation } from "@/api/mall/product/spu";
import { createImageViewer } from "@/components/ImageViewer";
import { RuleConfig } from "@/views/mall/product/spu/components/index";
import { PropertyAndValues } from "./index";
import { ElTable } from "element-plus";
import { isEmpty } from "@/utils/is";
import { WarehouseApi } from "@/api/erp/stock/warehouse";
import { WarehouseRackApi } from "@/api/erp/stock/warehouse/rack";
import { WarehouseLocationApi } from "@/api/erp/stock/warehouse/location";
import { ProductSkuStockApi } from "@/api/mall/product/sku-stock";

defineOptions({ name: "SkuList" });
const message = useMessage(); // 消息弹窗

const props = defineProps({
  propFormData: {
    type: Object as PropType<Spu>,
    default: () => {},
  },
  propertyList: {
    type: Array as PropType<PropertyAndValues[]>,
    default: () => [],
  },
  ruleConfig: {
    type: Array as PropType<RuleConfig[]>,
    default: () => [],
  },
  isBatch: propTypes.bool.def(false), // 是否作为批量操作组件
  isDetail: propTypes.bool.def(false), // 是否作为 sku 详情组件
  isComponent: propTypes.bool.def(false), // 是否作为 sku 选择组件
  isActivityComponent: propTypes.bool.def(false), // 是否作为 sku 活动配置组件
});
const formData: Ref<Spu | undefined> = ref<Spu>(); // 表单数据
const skuList = ref<Sku[]>([
  {
    price: 0, // 商品价格
    marketPrice: 0, // 市场价
    costPrice: 0, // 成本价
    barCode: "", // 商品条码
    picUrl: "", // 图片地址
    stock: 0, // 库存
    inventoryLocations: [], // 库存位置信息
    weight: 0, // 商品重量
    volume: 0, // 商品体积
    firstBrokeragePrice: 0, // 一级分销的佣金
    secondBrokeragePrice: 0, // 二级分销的佣金
  },
]); // 批量添加时的临时数据

// 添加仓库、货架、货位相关的状态
const warehouseOptions = ref([]);
const rackOptionsMap = ref({}); // 按仓库ID分组的货架选项
const locationOptionsMap = ref({}); // 按货架ID分组的货位选项

// 库存管理对话框
const inventoryDialogVisible = ref(false);
const currentSku = ref<Sku | null>(null);

// 获取仓库列表
const fetchWarehouses = async () => {
  try {
    console.log("开始获取仓库列表");
    const res = await WarehouseApi.getWarehouseSimpleList();
    console.log("仓库API返回数据:", res);

    // 检查返回数据的格式
    if (Array.isArray(res)) {
      // 如果直接返回数组，则直接使用
      warehouseOptions.value = res;
    } else if (res && res.data) {
      // 如果返回对象中包含 data 属性，则使用 data
      warehouseOptions.value = res.data;
    } else {
      // 其他情况，设置为空数组
      warehouseOptions.value = [];
    }

    console.log("处理后的仓库列表:", warehouseOptions.value);
  } catch (error) {
    console.error("获取仓库列表失败:", error);
    warehouseOptions.value = [];
  }
};

// 获取指定仓库的货架列表
const fetchRacks = async (warehouseId: number) => {
  if (!warehouseId) return;
  try {
    console.log(`开始获取仓库ID=${warehouseId}的货架列表`);
    const res = await WarehouseRackApi.getWarehouseRackSimpleList(warehouseId);
    console.log(`仓库ID=${warehouseId}的货架API返回数据:`, res);

    // 检查返回数据的格式
    if (Array.isArray(res)) {
      // 如果直接返回数组，则直接使用
      rackOptionsMap.value[warehouseId] = res;
    } else if (res && res.data) {
      // 如果返回对象中包含 data 属性，则使用 data
      rackOptionsMap.value[warehouseId] = res.data;
    } else {
      // 其他情况，设置为空数组
      rackOptionsMap.value[warehouseId] = [];
    }

    console.log(
      `处理后的仓库ID=${warehouseId}的货架列表:`,
      rackOptionsMap.value[warehouseId]
    );
  } catch (error) {
    console.error("获取货架列表失败:", error);
    rackOptionsMap.value[warehouseId] = [];
  }
};

// 获取指定货架的货位列表
const fetchLocations = async (rackId: number) => {
  if (!rackId) return;
  try {
    console.log(`开始获取货架ID=${rackId}的货位列表`);
    const res = await WarehouseLocationApi.getWarehouseLocationSimpleList(rackId);
    console.log(`货架ID=${rackId}的货位API返回数据:`, res);

    // 检查返回数据的格式
    if (Array.isArray(res)) {
      // 如果直接返回数组，则直接使用
      locationOptionsMap.value[rackId] = res;
    } else if (res && res.data) {
      // 如果返回对象中包含 data 属性，则使用 data
      locationOptionsMap.value[rackId] = res.data;
    } else {
      // 其他情况，设置为空数组
      locationOptionsMap.value[rackId] = [];
    }

    console.log(`处理后的货架ID=${rackId}的货位列表:`, locationOptionsMap.value[rackId]);
  } catch (error) {
    console.error("获取货位列表失败:", error);
    locationOptionsMap.value[rackId] = [];
  }
};

// 获取指定仓库ID的货架选项
const getRackOptions = (warehouseId: number) => {
  return rackOptionsMap.value[warehouseId] || [];
};

// 获取指定货架ID的货位选项
const getLocationOptions = (rackId: number) => {
  return locationOptionsMap.value[rackId] || [];
};

// 处理仓库变更
const handleWarehouseChange = async (warehouseId: number, row: any) => {
  row.rackId = undefined;
  row.rackName = "";
  row.locationId = undefined;
  row.locationName = "";

  // 设置仓库名称
  const warehouse = warehouseOptions.value.find((item) => item.id === warehouseId);
  if (warehouse) {
    row.warehouseName = warehouse.name;
  }

  // 获取该仓库下的货架
  if (warehouseId) {
    await fetchRacks(warehouseId);
  }
};

// 处理货架变更
const handleRackChange = async (rackId: number, row: any) => {
  row.locationId = undefined;
  row.locationName = "";

  // 设置货架名称
  const rack = getRackOptions(row.warehouseId).find((item) => item.id === rackId);
  if (rack) {
    row.rackName = rack.name;
  }

  // 获取该货架下的货位
  if (rackId) {
    await fetchLocations(rackId);
  }
};

// 处理货位变更
const handleLocationChange = async (locationId: number, row: any) => {
  // 设置货位名称
  const location = getLocationOptions(row.rackId).find((item) => item.id === locationId);
  if (location) {
    row.locationName = location.name;
  }

  // 检查是否存在重复的库存位置（本地检查）
  checkDuplicateLocation(row);

  // 如果当前行已完整填写仓库、货架、货位信息，则调用后端API检查
  if (row.warehouseId && row.rackId && row.locationId) {
    try {
      console.log("检查库存位置是否被占用:", {
        skuId: currentSku.value?.id,
        warehouseId: row.warehouseId,
        rackId: row.rackId,
        locationId: row.locationId,
      });

      const res = await ProductSkuStockApi.checkDuplicateLocation({
        skuId: currentSku.value?.id, // 当前SKU的ID
        warehouseId: row.warehouseId,
        rackId: row.rackId,
        locationId: row.locationId,
      });

      console.log("检查结果:", res);

      // 检查返回结果，根据API返回格式进行适当处理
      // 如果API直接返回布尔值
      if (typeof res === "boolean") {
        if (res) {
          message.warning("该库存位置已被其他SKU占用，请选择其他位置");
          // 清空当前选择的货位
          row.locationId = undefined;
          row.locationName = "";
        }
      }
      // 如果API返回对象包含data字段
      else if (res && typeof res.data === "boolean") {
        if (res.data) {
          message.warning("该库存位置已被其他SKU占用，请选择其他位置");
          // 清空当前选择的货位
          row.locationId = undefined;
          row.locationName = "";
        }
      }
    } catch (error) {
      console.error("检查库存位置占用状态失败:", error);
      message.error("检查库存位置占用状态失败，请稍后重试");
    }
  }
};

// 检查重复的库存位置
const checkDuplicateLocation = (currentRow: any) => {
  if (!currentSku.value || !currentSku.value.inventoryLocations) return;

  // 如果当前行的仓库、货架、货位ID都已设置
  if (currentRow.warehouseId && currentRow.rackId && currentRow.locationId) {
    // 查找是否有其他行与当前行的仓库、货架、货位ID组合相同
    const duplicates = currentSku.value.inventoryLocations.filter(
      (loc) =>
        loc !== currentRow && // 排除当前行自身
        loc.warehouseId === currentRow.warehouseId &&
        loc.rackId === currentRow.rackId &&
        loc.locationId === currentRow.locationId
    );

    // 如果存在重复，显示警告消息
    if (duplicates.length > 0) {
      message.warning(`该库存位置已存在，请选择其他位置`);
      // 清空当前选择的货位
      currentRow.locationId = undefined;
      currentRow.locationName = "";
    }
  }
};

// 打开库存管理对话框
const openInventoryDialog = async (sku: Sku) => {
  currentSku.value = sku;
  // 确保每个SKU都有inventoryLocations数组
  if (!sku.inventoryLocations) {
    sku.inventoryLocations = [];
  }

  // 确保已加载仓库数据
  if (warehouseOptions.value.length === 0) {
    console.log("仓库列表为空，正在获取...");
    await fetchWarehouses();
  }

  console.log("打开对话框时的仓库列表:", warehouseOptions.value);

  // 预加载已有库存位置的仓库和货架数据
  if (sku.inventoryLocations.length > 0) {
    for (const location of sku.inventoryLocations) {
      if (location.warehouseId && !rackOptionsMap.value[location.warehouseId]) {
        await fetchRacks(location.warehouseId);
      }
      if (location.rackId && !locationOptionsMap.value[location.rackId]) {
        await fetchLocations(location.rackId);
      }
    }
  }

  inventoryDialogVisible.value = true;
};

// 添加库存位置
const addInventoryLocation = async () => {
  if (!currentSku.value) return;

  // 确保已加载仓库数据
  if (warehouseOptions.value.length === 0) {
    await fetchWarehouses();
  }

  currentSku.value.inventoryLocations!.push({
    warehouseId: undefined,
    warehouseName: "",
    rackId: undefined,
    rackName: "",
    locationId: undefined,
    locationName: "",
    stock: 0,
    warnStock: 0, // 预警库存
    maxStock: 0, // 上限库存
  });
};

// 移除库存位置
const removeInventoryLocation = (index: number) => {
  if (!currentSku.value || !currentSku.value.inventoryLocations) return;
  currentSku.value.inventoryLocations.splice(index, 1);
  updateTotalStock();
};

// 确认库存设置
const confirmInventory = () => {
  if (!currentSku.value) return;

  // 验证库存位置是否完整
  const incompleteLocations = currentSku.value.inventoryLocations!.filter(
    (loc) => !loc.warehouseId || !loc.rackId || !loc.locationId
  );

  if (incompleteLocations.length > 0) {
    message.warning("所有库存位置信息必须完整，请确保选择了仓库、货架和货位");
    return;
  }

  // 检查是否有重复的库存位置
  const locationMap = new Map();
  let hasDuplicate = false;

  for (const loc of currentSku.value.inventoryLocations!) {
    const key = `${loc.warehouseId}-${loc.rackId}-${loc.locationId}`;
    if (locationMap.has(key)) {
      hasDuplicate = true;
      break;
    }
    locationMap.set(key, true);
  }

  if (hasDuplicate) {
    message.warning("存在重复的库存位置，请检查并修改");
    return;
  }

  // 检查预警库存和上限库存的合理性
  const invalidStockSettings = currentSku.value.inventoryLocations!.some(
    (loc) => (loc.warnStock !== undefined && loc.maxStock !== undefined && loc.warnStock > loc.maxStock) || 
            (loc.maxStock !== undefined && loc.stock > loc.maxStock)
  );

  if (invalidStockSettings) {
    message.warning("库存设置不合理：预警库存不应大于上限库存，当前库存不应超过上限库存");
    return;
  }

  updateTotalStock();
  inventoryDialogVisible.value = false;
};

// 更新总库存
const updateTotalStock = () => {
  if (!currentSku.value || !currentSku.value.inventoryLocations) return;

  // 计算总库存
  currentSku.value.stock = currentSku.value.inventoryLocations.reduce(
    (sum, loc) => sum + (loc.stock || 0),
    0
  );
};

// 获取SKU的总库存
const getTotalStock = (sku: Sku) => {
  if (!sku) return 0;

  // 如果有inventoryLocations，计算总和
  if (sku.inventoryLocations && sku.inventoryLocations.length > 0) {
    return sku.inventoryLocations.reduce((sum, loc) => sum + (loc.stock || 0), 0);
  }

  // 否则返回原始stock值
  return sku.stock || 0;
};

/** 商品图预览 */
const imagePreview = (imgUrl: string) => {
  createImageViewer({
    zIndex: 9999999,
    urlList: [imgUrl],
  });
};

/** 批量添加 */
const batchAdd = () => {
  validateProperty();
  formData.value!.skus!.forEach((item) => {
    copyValueToTarget(item, skuList.value[0]);
    // 复制库存位置信息
    if (
      skuList.value[0].inventoryLocations &&
      skuList.value[0].inventoryLocations.length > 0
    ) {
      item.inventoryLocations = JSON.parse(
        JSON.stringify(skuList.value[0].inventoryLocations)
      );
      // 更新总库存
      item.stock = item.inventoryLocations.reduce(
        (sum, loc) => sum + (loc.stock || 0),
        0
      );
    }
  });
};
/** 校验商品属性属性值 */
const validateProperty = () => {
  // 校验商品属性属性值是否为空，有一个为空都不给过
  const warningInfo = "存在属性属性值为空，请先检查完善属性值后重试！！！";
  for (const item of props.propertyList) {
    if (!item.values || isEmpty(item.values)) {
      message.warning(warningInfo);
      throw new Error(warningInfo);
    }
  }
};
/** 删除 sku */
const deleteSku = (row) => {
  const index = formData.value!.skus!.findIndex(
    // 直接把列表转成字符串比较
    (sku) => JSON.stringify(sku.properties) === JSON.stringify(row.properties)
  );
  formData.value!.skus!.splice(index, 1);
};
const tableHeaders = ref<{ prop: string; label: string }[]>([]); // 多属性表头
/**
 * 保存时，每个商品规格的表单要校验下。例如说，销售金额最低是 0.01 这种。
 */
const validateSku = () => {
  console.log("调用validateSku方法");

  // 检查SKU列表是否为空
  if (!formData.value || !formData.value.skus || formData.value.skus.length === 0) {
    const errorMsg = "商品规格列表为空，请添加至少一个规格值";
    console.error(errorMsg);
    message.warning(errorMsg);
    throw new Error(errorMsg);
  }

  try {
    // 校验商品属性值是否存在
    validateProperty();
    console.log("属性值校验通过");

    let warningInfo = "请检查商品各行相关属性配置，";
    let validate = true; // 默认通过

    // 校验每个SKU
    for (const sku of formData.value!.skus!) {
      console.log("校验SKU:", sku);

      // 检查SKU的properties是否存在并有效
      if (!sku.properties || sku.properties.length === 0) {
        console.warn("SKU缺少properties属性:", sku);
      }

      // 校验库存位置
      if (sku.inventoryLocations && sku.inventoryLocations.length > 0) {
        // 检查是否有未完成的库存位置配置
        const incomplete = sku.inventoryLocations.some(
          (loc) =>
            !loc.warehouseId ||
            (loc.warehouseId && !loc.rackId) ||
            (loc.rackId && !loc.locationId)
        );

        if (incomplete) {
          validate = false;
          warningInfo += "请完整配置库存位置信息；";
          console.error(`校验失败: 库存位置配置不完整`);
          break;
        }
      }

      // 作为活动组件的校验
      for (const rule of props?.ruleConfig) {
        const arg = getValue(sku, rule.name);
        console.log(`校验规则: ${rule.name}, 值: ${arg}`);

        if (!rule.rule(arg)) {
          validate = false; // 只要有一个不通过则直接不通过
          warningInfo += rule.message;
          console.error(`校验失败: ${rule.message}, 值: ${arg}`);
          break;
        }
      }

      // 只要有一个不通过则结束后续的校验
      if (!validate) {
        console.error(warningInfo);
        message.warning(warningInfo);
        throw new Error(warningInfo);
      }
    }

    console.log("所有SKU校验通过");
  } catch (error) {
    console.error("SKU校验失败:", error);
    throw error; // 重新抛出错误以便上层处理
  }
};
const getValue = (obj, arg) => {
  const keys = arg.split(".");
  let value = obj;
  for (const key of keys) {
    if (value && typeof value === "object" && key in value) {
      value = value[key];
    } else {
      value = undefined;
      break;
    }
  }
  return value;
};

const emit = defineEmits<{
  (e: "selectionChange", value: Sku[]): void;
}>();
/**
 * 选择时触发
 * @param Sku 传递过来的选中的 sku 是一个数组
 */
const handleSelectionChange = (val: Sku[]) => {
  emit("selectionChange", val);
};

/**
 * 将传进来的值赋值给 skuList
 */
watch(
  () => props.propFormData,
  (data) => {
    if (!data) return;
    formData.value = data;
  },
  {
    deep: true,
    immediate: true,
  }
);

/** 生成表数据 */
const generateTableData = (propertyList: any[]) => {
  console.log("generateTableData被调用，属性列表:", propertyList);

  // 构建数据结构
  const propertyValues = propertyList.map((item) =>
    item.values.map((v: any) => ({
      propertyId: item.id,
      propertyName: item.name,
      valueId: v.id,
      valueName: v.name,
    }))
  );

  console.log("处理后的属性值列表:", propertyValues);

  // 存储所有有效的规格值ID
  const validValueIds = new Set();
  propertyList.forEach((property) => {
    property.values?.forEach((value) => {
      validValueIds.add(value.id);
    });
  });

  console.log("有效的规格值ID:", [...validValueIds]);

  // 在重新生成前，先移除包含无效规格值的SKU
  if (formData.value?.skus?.length > 0) {
    // 过滤掉包含无效规格值的SKU
    const originalLength = formData.value.skus.length;
    formData.value.skus = formData.value.skus.filter((sku) => {
      // 检查所有properties是否都包含有效的规格值
      const hasInvalidValue = sku.properties?.some(
        (prop) => prop.valueId && !validValueIds.has(prop.valueId)
      );
      return !hasInvalidValue;
    });
    console.log(
      `清理无效SKU：从${originalLength}个减少到${formData.value.skus.length}个`
    );
  }

  const buildSkuList = build(propertyValues);
  console.log("构建的SKU列表:", buildSkuList);

  // 记录原始SKU数量
  const originalSkuCount = formData.value?.skus?.length || 0;

  // 如果回显的 sku 属性和添加的属性不一致则重置 skus 列表
  const shouldResetSkus = !validateData(propertyList);
  console.log("是否需要重置SKU列表:", shouldResetSkus);

  if (shouldResetSkus) {
    // 如果不一致则重置表数据，默认添加新的属性重新生成 sku 列表
    console.log("重置SKU列表");
    formData.value!.skus = [];
  }

  let newSkuCount = 0;

  for (const item of buildSkuList) {
    const row = {
      properties: Array.isArray(item) ? item : [item], // 如果只有一个属性的话返回的是一个 property 对象
      price: 0,
      marketPrice: 0,
      costPrice: 0,
      barCode: "",
      picUrl: "",
      stock: 0,
      inventoryLocations: [], // 初始化为空数组
      weight: 0,
      volume: 0,
      firstBrokeragePrice: 0,
      secondBrokeragePrice: 0,
    };

    // 检查是否存在相同属性的SKU
    const skuExists = formData.value!.skus!.some(
      (sku) => JSON.stringify(sku.properties) === JSON.stringify(row.properties)
    );

    // 如果存在属性相同的 sku 则不做处理
    if (skuExists) {
      console.log("已存在相同属性的SKU，跳过:", row.properties);
      continue;
    }

    console.log("添加新的SKU:", row);
    formData.value!.skus!.push(row);
    newSkuCount++;
  }

  console.log(
    `SKU生成完成，原有${originalSkuCount}个，新增${newSkuCount}个，现在共有${
      formData.value!.skus!.length
    }个`
  );
};

/**
 * 生成 skus 前置校验
 */
const validateData = (propertyList: any[]) => {
  const skuPropertyIds: number[] = [];
  formData.value!.skus!.forEach((sku) =>
    sku.properties
      ?.map((property) => property.propertyId)
      ?.forEach((propertyId) => {
        if (skuPropertyIds.indexOf(propertyId!) === -1) {
          skuPropertyIds.push(propertyId!);
        }
      })
  );
  const propertyIds = propertyList.map((item) => item.id);
  return skuPropertyIds.length === propertyIds.length;
};

/** 构建所有排列组合 */
const build = (propertyValuesList: Property[][]) => {
  if (propertyValuesList.length === 0) {
    return [];
  } else if (propertyValuesList.length === 1) {
    return propertyValuesList[0];
  } else {
    const result: Property[][] = [];
    const rest = build(propertyValuesList.slice(1));
    for (let i = 0; i < propertyValuesList[0].length; i++) {
      for (let j = 0; j < rest.length; j++) {
        // 第一次不是数组结构，后面的都是数组结构
        if (Array.isArray(rest[j])) {
          result.push([propertyValuesList[0][i], ...rest[j]]);
        } else {
          result.push([propertyValuesList[0][i], rest[j]]);
        }
      }
    }
    return result;
  }
};

/** 监听属性列表，生成相关参数和表头 */
watch(
  () => props.propertyList,
  (propertyList: PropertyAndValues[]) => {
    console.log("SkuList接收到属性列表变化:", propertyList);

    // 如果不是多规格则结束
    if (!formData.value!.specType) {
      console.log("不是多规格模式，不处理");
      return;
    }

    // 如果当前组件作为批量添加数据使用，则重置表数据
    if (props.isBatch) {
      console.log("批量添加模式，重置skuList");
      skuList.value = [
        {
          price: 0,
          marketPrice: 0,
          costPrice: 0,
          barCode: "",
          picUrl: "",
          stock: 0,
          inventoryLocations: [], // 添加库存位置数组
          weight: 0,
          volume: 0,
          firstBrokeragePrice: 0,
          secondBrokeragePrice: 0,
        },
      ];
    }

    // 判断属性列表是否为空
    if (
      !propertyList ||
      propertyList.length === 0 ||
      JSON.stringify(propertyList) === "[]"
    ) {
      console.log("属性列表为空，不处理");
      return;
    }

    // 检查是否有属性值
    const hasValues = propertyList.every((item) => item.values && item.values.length > 0);
    if (!hasValues) {
      console.log("属性列表中有属性没有值，不处理");
      return;
    }

    console.log("开始处理属性列表");

    // 重置表头
    tableHeaders.value = [];
    // 生成表头
    propertyList.forEach((item, index) => {
      // name加属性项index区分属性值
      tableHeaders.value.push({ prop: `name${index}`, label: item.name });
    });

    console.log("生成的表头:", tableHeaders.value);

    // 如果回显的 sku 属性和添加的属性一致则不处理
    // 但是现在我们始终重新生成SKU列表，不再检查是否一致
    // if (validateData(propertyList)) {
    //   console.log('SKU属性与添加的属性一致，无需重新生成');
    //   return
    // }

    // 检查属性值
    if (propertyList.some((item) => !item.values || isEmpty(item.values))) {
      console.log("有属性没有值，不生成SKU列表");
      return;
    }

    // 生成 table 数据，即 sku 列表
    console.log("开始生成SKU表格数据");
    generateTableData(propertyList);
  },
  {
    deep: true,
    immediate: true,
  }
);
const activitySkuListRef = ref<InstanceType<typeof ElTable>>();

const getSkuTableRef = () => {
  return activitySkuListRef.value;
};

// 初始化时获取仓库列表
onMounted(async () => {
  // 立即获取仓库列表
  await fetchWarehouses();
});

// 暴露出生成 sku 方法，给添加属性成功时调用
defineExpose({ generateTableData, validateSku, getSkuTableRef });
</script>
