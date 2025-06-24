<template>
  <el-card class="client-info-card">
    <el-form
      :model="currentCustomer"
      class="client-form"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <div class="form-row first-row">
        <el-form-item label="客户" prop="name">
          <el-input
            v-model="currentCustomer.name"
            class="compact-input"
            placeholder="客户名称"
            disabled
          />
        </el-form-item>

        <el-form-item label="线路" prop="line">
          <el-select
            v-model="currentCustomer.line"
            placeholder="线路"
            size="small"
            style="width: 80px"
            disabled
          >
            <el-option
              v-for="dict in getIntDictOptions(DICT_TYPE.CRM_CUSTOMER_LINE)"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <div class="form-row-right">
          <el-button size="small">新增单号</el-button>
          <el-button size="small">员工</el-button>
          <el-button size="small">客户</el-button>
        </div>
      </div>

      <div class="form-row">
        <el-form-item label="地址" prop="address">
          <el-input
            v-model="currentCustomer.detailAddress"
            class="compact-input"
            placeholder="详细地址"
            disabled
          />
        </el-form-item>
        <el-form-item label="客户级别" prop="level">
          <el-select
            v-model="currentCustomer.level"
            clearable
            size="small"
            style="width: 100px"
            placeholder="客户级别"
          >
            <el-option
              v-for="dict in getIntDictOptions(DICT_TYPE.CRM_CUSTOMER_LEVEL)"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
      </div>

      <!-- 联系人表格区域 -->
      <div class="contacts-table-container">
        <div v-if="contactLoading" class="contacts-loading">
          <el-icon class="is-loading"><Loading /></el-icon> 加载联系人...
        </div>
        <div v-else-if="contactList.length === 0" class="contacts-empty">
          暂无联系人信息
        </div>
        <el-table
          v-else
          :data="contactList"
          size="small"
          class="contacts-table"
          :show-header="false"
          :highlight-current-row="true"
          :cell-style="{ padding: '2px 0' }"
        >
          <!-- 添加展开列 -->
          <el-table-column type="expand" width="30">
            <template #default="{ row }">
              <div class="contact-expand">
                <el-tooltip
                  :content="`最后跟进: ${formatDate(
                    row.contactTime || row.createTime
                  )} | 跟进记录: ${row.content || row.remark || '暂无跟进记录'}`"
                  placement="top"
                  :show-after="500"
                >
                  <div class="contact-expand-content text-ellipsis">
                    <span class="contact-expand-label">最后跟进:</span>
                    <span class="contact-expand-value">{{
                      formatDate(row.contactTime || row.createTime)
                    }}</span>
                    <span class="contact-expand-separator">|</span>
                    <span class="contact-expand-label">跟进记录:</span>
                    <span class="contact-expand-value">{{
                      row.content || row.remark || "暂无跟进记录"
                    }}</span>
                  </div>
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
          <el-table-column min-width="80">
            <template #default="{ row }">
              <el-tooltip :content="row.name" placement="top" :show-after="500">
                <span class="contact-name text-ellipsis">{{ row.name }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column min-width="110">
            <template #default="{ row }">
              <el-tooltip
                :content="row.mobile || '无手机'"
                placement="top"
                :show-after="500"
              >
                <span class="contact-phone text-ellipsis">{{
                  row.mobile || "无手机"
                }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column min-width="110">
            <template #default="{ row }">
              <el-tooltip
                :content="row.telephone || '无电话'"
                placement="top"
                :show-after="500"
              >
                <span class="contact-phone text-ellipsis">{{
                  row.telephone || "无电话"
                }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column width="100" fixed="right">
            <template #default="{ row }">
              <div class="contact-actions">
                <el-button
                  size="small"
                  type="primary"
                  @click.stop="handleCallContact(row)"
                  >打</el-button
                >
                <el-button size="small" type="info" @click.stop="handleMarkContact(row)"
                  >未</el-button
                >
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="form-footer">
        <div class="total-label">总计欠款<span class="amount">0</span></div>
        <div class="footer-actions">
          <el-button size="small" class="footer-button">预览</el-button>
          <el-button size="small" class="footer-button">修改客户</el-button>
          <el-button size="small" class="footer-button">新增客户</el-button>
        </div>
      </div>
    </el-form>
  </el-card>
</template>
<script setup lang="ts">
import { DICT_TYPE, getIntDictOptions } from "@/utils/dict";
import { CustomerVO } from "@/api/crm/customer";
import * as ContactApi from "@/api/crm/contact";
import { Loading } from '@element-plus/icons-vue';
import { ref, watch } from 'vue';
import { ElMessage } from 'element-plus';

const props = defineProps<{
  selectedCustomer?: CustomerVO | null;
}>();

const currentCustomer = ref({ ...props.selectedCustomer });
// 联系人数据
const contactList = ref([]);
const contactLoading = ref(false);

// 获取联系人列表
const getContactList = async () => {
  if (!currentCustomer.value.id) return;
  contactLoading.value = true;
  try {
    const params = {
      pageNo: 1,
      pageSize: 10,
      customerId: currentCustomer.value.id,
    };

    const res = await ContactApi.getContactPageByCustomer(params);
    contactList.value = res.list || [];
  } catch (error) {
    console.error("获取联系人列表失败", error);
  } finally {
    contactLoading.value = false;
  }
};

// 监听客户变化，自动加载联系人列表
watch(
  () => props.selectedCustomer,
  (newCustomer) => {
    if (newCustomer) {
      currentCustomer.value = { ...newCustomer };
      getContactList();
    }
  },
  { immediate: true }
);
const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d
    .toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(/\//g, "-");
};

// 联系人操作方法
const handleCallContact = (contact) => {
  if (!contact || !contact.mobile) {
    ElMessage.warning("该联系人没有手机号码");
    return;
  }

  // 这里可以添加拨打电话的逻辑，例如调用系统API或记录拨打状态
  ElMessage.success(`正在拨打 ${contact.name} 的电话: ${contact.mobile}`);

  // 可以在这里添加记录联系历史的逻辑
  // 例如：记录联系时间、联系方式等
};

const handleMarkContact = (contact) => {
  if (!contact) return;

  // 这里可以添加标记联系状态的逻辑
  ElMessage.success(`已标记 ${contact.name} 为未联系状态`);

  // 可以在这里添加更新联系状态的逻辑
  // 例如：更新联系状态、记录备注等
};
</script>
<style lang="scss" scoped>
$primary-color: #606266;
$border-color: #dcdfe6;
$input-height: 26px;
$label-height: 32px;
$spacing-base: 8px;
$spacing-small: 5px;

// 响应式布局
@media screen and (width <= 768px) {
  .client-form {
    .first-row,
    .form-row {
      flex-direction: column;
    }

    :deep(.el-form-item) {
      width: 100%;
    }

    .form-row-right,
    .footer-actions {
      justify-content: flex-start;
    }
  }
}

// 通用flex布局
%flex-base {
  display: flex;
  gap: $spacing-base;
  align-items: center;
}

%flex-wrap {
  @extend %flex-base;

  flex-wrap: wrap;
}

// 主容器
.client-info-card {
  @extend %flex-base;
  width: 100%;
  min-width: 0;
  background-color: #f5f7fa;
  border: none;
  border-radius: 5px;
  flex: 1;
}

// 表单样式
.client-form {
  flex: 1;
  width: 100%;
  min-width: 0;

  // 行样式
  .first-row,
  .form-row {
    @extend %flex-wrap;

    margin-bottom: $spacing-base;
  }

  .first-row {
    justify-content: space-between;
  }

  // 表单项样式
  :deep(.el-form-item) {
    min-width: 120px;
    padding: 0;
    margin: 0;
    flex: 1;
  }

  :deep(.el-form-item__content) {
    @extend %flex-base;
  }

  :deep(.el-form-item__label) {
    height: $label-height;
    padding: 0 $spacing-small 0 0;
    font-size: 13px;
    line-height: $label-height;
    color: $primary-color;
  }

  // 按钮组样式
  .form-row-right,
  .form-row-right-small {
    @extend %flex-wrap;

    height: $label-height;
  }

  // 输入框样式
  :deep(.compact-input.el-input) {
    --el-input-height: $input-height;

    width: 100%;
    min-width: 120px;
  }

  :deep(.compact-input.el-input .el-input__wrapper) {
    height: $input-height;
    padding: 0 $spacing-base;
    line-height: $input-height;
  }

  :deep(.compact-input.el-input .el-input__inner) {
    height: $input-height;
    line-height: $input-height;
    color: #000;
    border-radius: 3px;

    &::placeholder {
      font-size: 11px;
    }
  }

  :deep(.compact-input.el-input .el-input__clear) {
    margin-right: 2px;
    font-size: 14px;
  }

  // 按钮样式
  :deep(.el-button--small) {
    height: $input-height;
    padding: 0 10px;
    margin: 0;
    font-size: 12px;
    line-height: 1;
  }

  // 底部样式
  .form-footer {
    @extend %flex-wrap;

    padding: $spacing-base 0;
    margin-top: $spacing-base;
    border-top: 1px solid $border-color;
    justify-content: space-between;

    .total-label {
      padding-left: 10px;
      font-size: 14px;
      font-weight: bold;
      color: $primary-color;

      .amount {
        margin-left: $spacing-small;
        color: red;
      }
    }

    .footer-actions {
      @extend %flex-wrap;
    }
  }
}

// 定义通用变量
</style>
