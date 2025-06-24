<template>
  <Dialog v-model="dialogVisible" title="导入供应商" width="600px">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="从Excel导入" name="excel">
        <el-upload
          ref="upload"
          :limit="1"
          accept=".xls,.xlsx"
          :headers="uploadHeaders"
          :action="uploadUrl"
          :disabled="uploadLoading"
          :on-exceed="handleExceed"
          :on-success="handleSuccess"
          :on-error="handleError"
          :auto-upload="false"
          drag
        >
          <Icon icon="ep:upload-filled" class="el-icon--upload" />
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">
              请上传 .xlsx、.xls 格式文件，文件大小不超过 5M
            </div>
          </template>
        </el-upload>
      </el-tab-pane>
      <el-tab-pane label="从系统抓取" name="crawler">
        <el-form v-if="!isLoggedIn" :model="loginForm" label-width="80px">
          <el-form-item label="用户名">
            <el-select v-model="loginForm.username" placeholder="请选择用户名">
              <el-option label="ADMIN1" value="ADMIN1" />
              <el-option label="ADMIN2" value="ADMIN2" />
              <el-option label="ADMIN3" value="ADMIN3" />
            </el-select>
          </el-form-item>
          <el-form-item label="密码">
            <el-input v-model="loginForm.password" type="password" show-password />
          </el-form-item>
          <el-form-item label="标识码">
            <el-input v-model="loginForm.userCode" placeholder="请输入用户标识码" />
            <div class="el-form-item-msg">例如：13686770014</div>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleLogin" :loading="loginLoading">登录</el-button>
          </el-form-item>
        </el-form>
        <div v-else>
          <div v-if="!crawling && !taskId && suppliers.length === 0">
            <el-alert type="success" :closable="false">
              已成功登录系统，可以开始抓取供应商数据
            </el-alert>
            <div class="mt-4 text-center">
              <el-button type="primary" @click="handleStartCrawl" :loading="startCrawlLoading">
                开始抓取
              </el-button>
              <el-button type="success" @click="handleTriggerSpaceKey" :loading="triggerSpaceLoading">
                触发空格键
              </el-button>
            </div>
          </div>
          <div v-else-if="crawling">
            <el-alert type="info" :closable="false">
              正在抓取供应商数据，请耐心等待...
            </el-alert>
            <div class="mt-4">
              <el-progress :percentage="crawlProgress" :format="progressFormat" />
              <div class="mt-2 text-sm text-gray-500" v-if="taskStatus">
                {{ taskStatus.processedCount || 0 }}/{{ taskStatus.totalCount || '?' }} 条数据
              </div>
            </div>
          </div>
          <div v-else-if="suppliers.length > 0">
            <el-alert type="success" :closable="false">
              抓取完成，共获取到 {{ suppliers.length }} 条供应商数据
            </el-alert>
            <div class="mt-4">
              <el-table :data="suppliers" height="250" border style="width: 100%">
                <el-table-column prop="name" label="供应商名称" width="180" />
                <el-table-column prop="contact" label="联系人" width="100" />
                <el-table-column prop="mobile" label="手机号" />
              </el-table>
            </div>
            <div class="mt-4 text-center">
              <el-button type="primary" @click="handleSaveSuppliers" :loading="saveLoading">
                保存供应商
              </el-button>
              <el-button @click="resetCrawler">重新开始</el-button>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
    <template #footer>
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button v-if="activeTab === 'excel'" type="primary" @click="submitUpload" :loading="uploadLoading">
        上 传
      </el-button>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onUnmounted } from 'vue'
import { useUserStore } from '@/store/modules/user'
import { useMessage } from '@/hooks/web/useMessage'
import { getAccessToken } from '@/utils/auth'
import { SupplierApi, CrawlerLoginReqVO, CrawlerTaskRespVO } from '@/api/erp/purchase/supplier'

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false)
const activeTab = ref('excel')
const upload = ref(null)
const uploadLoading = ref(false)
const uploadHeaders = computed(() => {
  return { Authorization: 'Bearer ' + getAccessToken() }
})

// 定义上传URL
const uploadUrl = `${import.meta.env.VITE_BASE_URL}/erp/supplier/import`

// 登录相关
const isLoggedIn = ref(false)
const loginLoading = ref(false)
const loginForm = reactive({
  username: 'ADMIN3',
  password: '6694072', // 更新为题目中提到的密码
  userCode: '13686770014'
})

// 爬虫相关
const crawling = ref(false)
const startCrawlLoading = ref(false)
const suppliers = ref<any[]>([])
const saveLoading = ref(false)
const taskId = ref<string>('')
const taskStatus = ref<CrawlerTaskRespVO | null>(null)
const statusTimer = ref<number | null>(null)
const triggerSpaceLoading = ref(false)

// 计算爬取进度
const crawlProgress = computed(() => {
  if (!taskStatus.value) return 0
  return taskStatus.value.progress || 0
})

// 打开弹窗
const open = () => {
  dialogVisible.value = true
}

// 处理上传超出限制
const handleExceed = () => {
  message.error('最多只能上传一个文件')
}

// 处理上传成功
const handleSuccess = (response: any) => {
  uploadLoading.value = false
  if (response.code === 0) {
    message.success('上传成功')
    dialogVisible.value = false
  } else {
    message.error(response.msg || '上传失败')
  }
}

// 处理上传失败
const handleError = () => {
  uploadLoading.value = false
  message.error('上传失败，请重试')
}

// 提交上传
const submitUpload = () => {
  if (!upload.value) return
  uploadLoading.value = true
  // @ts-ignore - 忽略类型检查
  upload.value.submit()
}

// 处理登录
const handleLogin = async () => {
  if (!loginForm.username || !loginForm.password) {
    message.error('请输入用户名和密码')
    return
  }
  
  if (!loginForm.userCode) {
    message.error('请输入用户标识码')
    return
  }
  
  try {
    loginLoading.value = true
    const res = await SupplierApi.crawlerLoginNew(loginForm)
    isLoggedIn.value = true
    message.success('登录成功')
  } catch (error: any) {
    message.error(error.message || '登录失败')
  } finally {
    loginLoading.value = false
  }
}

// 开始抓取
const handleStartCrawl = async () => {
  try {
    startCrawlLoading.value = true
    crawling.value = true
    
    // 使用异步爬取API
    const res = await SupplierApi.crawlSuppliersAsync()
    taskId.value = res.data
    
    // 启动定时器，轮询任务状态
    startStatusPolling()
    
    message.success('爬虫任务已启动')
  } catch (error: any) {
    crawling.value = false
    message.error(error.message || '启动爬虫任务失败')
    startCrawlLoading.value = false
  }
}

// 启动状态轮询
const startStatusPolling = () => {
  if (statusTimer.value) {
    clearInterval(statusTimer.value)
  }
  
  // 每2秒查询一次任务状态
  statusTimer.value = setInterval(async () => {
    try {
      if (!taskId.value) {
        stopStatusPolling()
        return
      }
      
      const res = await SupplierApi.getCrawlTaskStatus(taskId.value)
      taskStatus.value = res.data
      
      // 如果任务完成或失败，停止轮询
      if (taskStatus.value && ['COMPLETED', 'FAILED'].includes(taskStatus.value.status)) {
        stopStatusPolling()
        
        if (taskStatus.value && taskStatus.value.status === 'COMPLETED') {
          // 获取爬取结果
          await fetchTaskResult()
        } else if (taskStatus.value) {
          crawling.value = false
          message.error(taskStatus.value.errorMessage || '爬虫任务执行失败')
          startCrawlLoading.value = false
        }
      }
    } catch (error) {
      console.error('获取任务状态失败', error)
    }
  }, 2000) as unknown as number
}

// 停止状态轮询
const stopStatusPolling = () => {
  if (statusTimer.value) {
    clearInterval(statusTimer.value)
    statusTimer.value = null
  }
}

// 获取任务结果
const fetchTaskResult = async () => {
  try {
    const res = await SupplierApi.getCrawlTaskResult(taskId.value)
    suppliers.value = res.data
    crawling.value = false
    startCrawlLoading.value = false
    message.success(`抓取完成，共获取到 ${suppliers.value.length} 条供应商数据`)
  } catch (error: any) {
    crawling.value = false
    startCrawlLoading.value = false
    message.error(error.message || '获取爬虫结果失败')
  }
}

// 保存供应商数据
const handleSaveSuppliers = async () => {
  if (suppliers.value.length === 0) {
    message.warning('没有可保存的供应商数据')
    return
  }
  
  try {
    saveLoading.value = true
    
    // 如果有任务ID，使用任务结果保存API
    if (taskId.value) {
      const res = await SupplierApi.saveCrawlTaskResult(taskId.value)
    message.success(`成功保存 ${res.data} 个供应商`)
    } else {
      // 兼容旧逻辑，直接保存suppliers数组
      const res = await SupplierApi.batchCreateSupplier(suppliers.value)
      message.success(`成功保存 ${suppliers.value.length} 个供应商`)
    }
    
    dialogVisible.value = false
  } catch (error: any) {
    message.error(error.message || '保存供应商失败')
  } finally {
    saveLoading.value = false
  }
}

// 触发空格键
const handleTriggerSpaceKey = async () => {
  if (!loginForm.userCode) {
    message.error('用户标识码不能为空')
    return
  }
  
  try {
    triggerSpaceLoading.value = true
    const res = await SupplierApi.triggerSpaceKey(loginForm.userCode)
    message.success('成功触发空格键')
  } catch (error: any) {
    message.error(error.message || '触发空格键失败')
  } finally {
    triggerSpaceLoading.value = false
  }
}

// 重置爬虫状态
const resetCrawler = () => {
  suppliers.value = []
  crawling.value = false
  taskId.value = ''
  taskStatus.value = null
  stopStatusPolling()
}

// 进度格式化
const progressFormat = (percentage: number) => {
  return percentage === 100 ? '完成' : `${percentage}%`
}

// 组件卸载时清理
onUnmounted(() => {
  stopStatusPolling()
})

// 暴露方法
defineExpose({
  open
})
</script>

<style scoped>
.mt-2 {
  margin-top: 0.5rem;
}
.mt-4 {
  margin-top: 1rem;
}
.text-center {
  text-align: center;
}
.text-sm {
  font-size: 0.875rem;
}
.text-gray-500 {
  color: #6b7280;
}
.el-form-item-msg {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}
</style> 
 