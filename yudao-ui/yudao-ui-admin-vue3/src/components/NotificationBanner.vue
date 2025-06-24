<template>
  <div class="marquee-container">
    <div class="marquee-wrapper">
      <marquee-text :repeat="3" class="ticker">
        <span
          v-for="msg in messages"
          :key="msg.id"
          class="ticker-item"
          :class="msg.type.toLowerCase()"
        >
          [{{ formatTime(msg.timestamp) }}] {{ msg.content }}
        </span>
      </marquee-text>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import MarqueeText from "vue-marquee-text-component"; 
import { AlertMessage } from "@/types/types.ts";
import { defineOptions } from "vue";
defineOptions({ name: "NotificationBanner" });

const props = defineProps<{
  messages: AlertMessage[];
}>();

// 格式化时间为小时:分钟
const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>

<style scoped>
.marquee-container {
  width: 100%;
  margin-bottom: 8px;
  overflow: hidden;
  background-color: #f5f7fa;
  border-radius: 4px;
  flex: none; /* 不参与伸缩 */
}

.marquee-wrapper {
  width: 100%;
  padding: 4px 0;
  line-height: 24px;
}

.ticker {
  display: inline-block;
  white-space: nowrap;
}

.ticker-item {
  position: relative;
  display: inline-block;
  padding: 0 24px;
  font-size: 13px;
  color: #606266;
}

.ticker-item::after {
  position: absolute;
  right: 0;
  color: #dcdfe6;
  content: "|";
}

.ticker-item:last-child::after {
  display: none;
}

/* 消息类型样式 */
.ticker-item.order {
  color: #409eff;
}

.ticker-item.warning {
  color: #e6a23c;
}

.ticker-item.system {
  color: #67c23a;
}
</style> 