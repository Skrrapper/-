<script setup>
const { safeAreaInsets } = uni.getSystemInfoSync()
const props = defineProps({
  title: {
    type: String,
    default: '默认标题'
  },
  position:{
    type: String,
    default: 'left',
    validator: (value) => {
      return ['left', 'center'].includes(value)
    }
  }
})
</script>

<template>
  <view class="navbar" :style="{ paddingTop: (safeAreaInsets?.top) + 'px' }">
    <view :class="props.position">
      <text class="logo-text">{{ props.title }}</text>
    </view>
  </view>
</template>

<style lang="scss">
.navbar {
  background: linear-gradient(0deg, #d2beef 0%, #b39ddb 50%, #9575cd 100%);
  position: relative;
  display: flex;
  align-items: center;
  height: 100rpx;
  padding: 0 30rpx;

  .left {
    width: 100%;
    .logo-text {
      font-size: 50rpx;
      color: #fff;
      font-weight: 600;
    }
  }

  .center {
    width: 100%;
    text-align: center;
    .logo-text {
      font-size: 50rpx;
      color: #fff;
      font-weight: 600;
    }
  }

  .right {
    display: flex;
    gap: 30rpx;
    align-items: center;
  }

  .icon {
    width: 50rpx;
    height: 50rpx;
    object-fit: contain;
    filter: brightness(1.2) contrast(1.1);
  }
}
</style>
    