<template>
  <div class="app-container">
    <!-- 搜索工作栏 -->
    <el-card class="box-card">
    <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="拣货编号" prop="orderId">
        <el-input
        v-model.trim="queryParams.orderId"
        placeholder="请输入订单编号"
        clearable 
        />
      </el-form-item>
      </el-form>  
    </el-card> 
  </div>
</template>

<script setup lang="ts">
import { reactive} from 'vue' 

defineOptions({ name: 'Check' })
  
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  orderId: '',
  customerName: '',
  phone: '',
  orderStatus: '',
  createTime: []
})
   
</script> 