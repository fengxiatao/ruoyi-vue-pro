<template>
  <el-table
    ref="customerTableRef"
    v-loading="customerLoading"
    :data="customerList"
    :show-overflow-tooltip="true"
    :stripe="false"
    class="customer-table"
    row-key="id"
    highlight-current-row
    @current-change="handleCurrentChange"
    @row-dblclick="handleRowDblclick"
  >
    <el-table-column align="center" label="客户名称" prop="name" min-width="160">
      <template #default="scope">
        <span class="customer-name">{{ scope.row.name }}</span>
      </template>
    </el-table-column>
    <el-table-column align="center" label="来源" prop="source" width="100">
      <template #default="scope">
        <dict-tag :type="DICT_TYPE.CRM_CUSTOMER_SOURCE" :value="scope.row.source" />
      </template>
    </el-table-column>
    <el-table-column align="center" label="手机" prop="mobile" width="120" />
    <el-table-column align="center" label="电话" prop="telephone" width="120" />
    <el-table-column
      align="center"
      label="最后跟进时间"
      prop="contactLastTime"
      width="150"
    >
      <template #default="scope">
        {{ formatDate(scope.row.contactLastTime) }}
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      label="最后跟进记录"
      prop="contactLastContent"
      min-width="150"
    />
    <el-table-column align="center" label="地址" prop="detailAddress" min-width="150" />
  </el-table>

  <!-- 分页 -->
  <Pagination
    class="custom-pagination"
    :small="true"
    :page-sizes="[10, 20, 50]"
    layout="sizes, prev,jumper, next"
    v-model:limit="customerQueryParams.pageSize"
    v-model:page="customerQueryParams.pageNo"
    :total="customerTotal"
    @pagination="handlePagination"
  />
</template>
<script setup lang="ts">
import { ref } from "vue";
import { DICT_TYPE } from "@/utils/dict";
import { formatDate } from "@/utils/formatTime";
import { getCustomerPage, CustomerVO } from "@/api/crm/customer";
import type { ElTable } from "element-plus";

// 定义需要向父组件传递的事件
const emit = defineEmits(['row-dblclick']);

const customerTableRef = ref<InstanceType<typeof ElTable>>();
const tableRowIndex = ref<number>(0);
const customerLoading = ref(false);
const customerTotal = ref(0);
const currentCustomer = ref<CustomerVO>();
const customerList = ref<CustomerVO[]>([]);
const customerQueryParams = ref({
  pageNo: 1,
  pageSize: 10,
  name: "",
  mobile: "",
  line: 0 as number | undefined,
});
const handleCurrentChange = (currentRow) => {
  if (currentRow) {
    currentCustomer.value = currentRow;
    tableRowIndex.value = customerList.value.findIndex((row) => row.id === currentRow.id);
  }
};
// 查询客户列表
const getCustomerList = async () => {
  customerLoading.value = true;
  try {
    const queryParams = { ...customerQueryParams.value };
    if (queryParams.line === 0) {
      queryParams.line = undefined;
    }
    const res = await getCustomerPage(queryParams);
    customerList.value = res.list || [];
    customerTotal.value = res.total || 0;
  } catch (error) {
    console.error("获取客户列表失败:", error);
    customerList.value = [];
    customerTotal.value = 0;
    if (customerList.value.length > 0) {
      nextTick(() => {
        customerTableRef.value?.setCurrentRow(customerList.value[0]);
      });
    }
  } finally {
    customerLoading.value = false;
  }
};

const selectCustomerByArrow = (isUp) => {
  if (isUp) {
    if (tableRowIndex.value == 0) {
      tableRowIndex.value = customerList.value.length - 1;
    } else {
      tableRowIndex.value = tableRowIndex.value - 1;
    }
  } else {
    if (tableRowIndex.value == customerList.value.length - 1) {
      tableRowIndex.value = 0;
    } else {
      tableRowIndex.value = tableRowIndex.value + 1;
    }
  }
  (customerTableRef.value as any).setCurrentRow(customerList.value[tableRowIndex.value]);
};
// 提供给父组件调用的方法，用于加载数据
const loadData = (params) => {
  console.log("父容器过来的参数是" + params);
  if (params) {
    const newParams = { ...params };
    if (newParams.line === 0) {
      newParams.line = undefined;
    }
    customerQueryParams.value = { ...customerQueryParams.value, ...newParams };
  } else {
  }
  getCustomerList();
};
// 处理分页操作
const handlePagination = () => {
  getCustomerList();
};
const handlePaginationByArrow = (isRight) => {
  if (isRight) {
    customerQueryParams.value.pageNo += 1;
  } else {
    customerQueryParams.value.pageNo -= 1;
  }
  if (customerQueryParams.value.pageNo <= 0) {
    customerQueryParams.value.pageNo = 1;
  }
  if (
    customerQueryParams.value.pageNo * customerQueryParams.value.pageSize >
    customerTotal.value
  ) {
    customerQueryParams.value.pageNo = 1;
  }
  getCustomerList();
};

// 处理行双击事件
const handleRowDblclick = (row) => {
  // 设置当前选中行
  currentCustomer.value = row;
  tableRowIndex.value = customerList.value.findIndex((item) => item.id === row.id);
  
  // 触发双击事件，向父组件传递选中的行数据
  emit('row-dblclick', row);
};

// 暴露方法给父组件调用
defineExpose({
  loadData,
  getCustomerList,
  selectCustomerByArrow,
  handlePaginationByArrow,
  currentCustomer,
});
</script>
<style lang="scss" scoped>
/* 在全局或当前组件样式 */
.custom-pagination {
  height: 26px; /* 自定义高度 */
  margin-top: 5px; /* 覆盖原有 mt-15px */
  margin-bottom: 5px;
}

/* 调整内部元素垂直居中 */
.custom-pagination .el-pagination {
  display: flex;
  align-items: center;
  height: 100%;
}
</style>
