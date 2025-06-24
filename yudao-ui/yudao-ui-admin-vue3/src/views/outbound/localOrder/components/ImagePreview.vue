<template>
  <div class="pic-preview" style="text-align:center;">
    <el-button @click="handleClose" size="small" type="danger" style="margin-bottom:8px;">关闭图片</el-button>
    <el-carousel height="300px" direction="vertical" :autoplay="false" v-if="imageUrls.length > 1">
      <el-carousel-item v-for="(img, idx) in imageUrls" :key="idx">
        <el-image :src="img" style="max-width:250px;max-height:250px;" />
      </el-carousel-item>
    </el-carousel>
    <el-image v-else :src="imageUrls[0]" style="max-width:250px;max-height:250px;" />
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  imageUrls: {
    type: Array as () => string[],
    required: true
  }
})

const emit = defineEmits(['close'])

const handleClose = () => {
  emit('close')
}
</script>

<style scoped>
.pic-preview {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 15px;
  border-radius: 5px;
}
</style> 