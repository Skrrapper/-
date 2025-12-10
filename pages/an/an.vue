<template>
  <view class="publish-page">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="back-btn" @click="handleBack">
        <uni-icon type="back" size="28" color="#388e3c"></uni-icon>
      </view>
      <view class="nav-title">发布消息</view>
      <view class="save-btn" @click="saveDraft">
        <text>保存草稿</text>
      </view>
    </view>
    
    <!-- 编辑区域 -->
    <view class="edit-container">
      <!-- 标题输入 -->
      <view class="title-input">
        <input 
          v-model="title" 
          placeholder="请输入标题" 
          placeholder-style="color:#999"
          maxlength="50"
        ></input>
      </view>
      
      <!-- 内容编辑 -->
      <view class="content-editor">
        <textarea 
          v-model="content" 
          placeholder="请输入消息内容..." 
          placeholder-style="color:#999"
          maxlength="2000"
          auto-height
        ></textarea>
        <view class="word-count">{{ content.length }}/2000</view>
      </view>
    </view>
    
    <!-- 预览弹窗 -->
    <uni-popup ref="previewPopup" type="bottom" :mask-click="false">
      <view class="preview-container">
        <view class="preview-header">
          <text class="preview-title">预览</text>
          <uni-icon type="close" size="24" color="#666" @click="closePreview"></uni-icon>
        </view>
        
        <view class="preview-content">
          <view class="preview-title-text">{{ draftTitle || '无标题' }}</view>
          <view class="preview-content-text">{{ draftContent || '无内容' }}</view>
        </view>
        
        <view class="preview-footer">
          <button class="publish-btn" @click="confirmPublish">确认发布</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { addAn, pubAn } from '../../util/api/an';
import { useUserStore } from '../../store';

const userStore=useUserStore()


// 编辑内容
const title = ref('');
const content = ref('');

// 草稿内容
const draftTitle = ref('');
const draftContent = ref('');

// 弹窗引用
const previewPopup = ref(null);

// 页面加载时，如果有草稿则加载
onLoad(() => {
  // 这里可以从本地存储或接口加载草稿
  const savedDraft = uni.getStorageSync('tempDraft');
  if (savedDraft) {
    title.value = savedDraft.title;
    content.value = savedDraft.content;
  }
});

// 处理返回
const handleBack = () => {
  // 如果内容有变化才询问是否保存草稿
  if (title.value || content.value) {
    uni.showModal({
      title: '提示',
      content: '是否保存当前内容为草稿？',
      cancelText: '不保存',
      confirmText: '保存',
      success: (res) => {
        if (res.confirm) {
          // 保存草稿
          saveDraft(true);
        } else if (res.cancel) {
          // 不保存，直接返回
          navigateBack();
        }
      }
    });
  } else {
    // 内容为空，直接返回
    navigateBack();
  }
};

// 保存草稿
const saveDraft = async(isFromBack = false) => {
  if (!title.value && !content.value) {
    uni.showToast({
      title: '请输入内容后再保存',
      icon: 'none',
      duration: 2000
    });
    return;
  }
  
  // 保存到本地临时存储
  uni.setStorageSync('tempDraft', {
    title: title.value,
    content: content.value,
    saveTime: new Date().getTime()
  });
 try{
	 const params=`title=${title.value}&content=${content.value}`
	 // const params={
		//  title:title.value,
		//  content:content.value
	 // }
	 const res= await addAn(params)
	 console.log("保存草稿接口返回的值:",res)
	 if(res.data.code===200){
		 console.log('hhhhhhhhh',res.data)
		 userStore.setAnId(res.data.data.announcementId)
		 console.log('store中的文章id:',userStore.anId)
		 const paramsone=`announcementId=${userStore.anId}`
		 const resone=await pubAn(paramsone)
		 console.log("发布公告接口返回的数据为:",resone)
		 if(resone.data.code===200){
			 uni.showToast({
			 	title:'发布成功',
				icon:'success',
				duration:2000
			 })
			 
			setTimeout(()=>{
				 uni.navigateBack()
			},2000)
		 }
	 }
	 else{
		 uni.showToast({
		 	title:'保存失败',
			icon:'none'
		 })
	 }
 }catch(err){
	 console.error('保存失败',err)
	 uni.showToast({
	 	title:'保存失败',
	 			icon:'none'
	 })
 }

};

// 关闭预览
const closePreview = () => {
  previewPopup.value.close();
};

// 确认发布
const confirmPublish = () => {
  if (!draftTitle.value || !draftContent.value) {
    uni.showToast({
      title: '内容不能为空',
      icon: 'none',
      duration: 2000
    });
    return;
  }
  
  // 发布接口调用（留空，用户自行实现）
  const publishMessage = async () => {
    try {
      // 实际项目中调用接口
      /* const res = await api.publishMessage({
        title: draftTitle.value,
        content: draftContent.value
      }); */
      
      // 模拟接口成功
      return true;
    } catch (error) {
      console.error('发布失败:', error);
      return false;
    }
  };
  
  // 调用发布函数
  publishMessage().then(success => {
    if (success) {
      // 发布成功，清除临时草稿
      uni.removeStorageSync('tempDraft');
      
      uni.showToast({
        title: '发布成功',
        icon: 'success',
        duration: 2000
      });
      
      // 关闭预览并返回
      closePreview();
      setTimeout(() => {
        navigateBack();
      }, 1500);
    } else {
      uni.showToast({
        title: '发布失败，请重试',
        icon: 'none',
        duration: 2000
      });
    }
  });
};

// 返回上一页
const navigateBack = () => {
  uni.navigateBack({
    delta: 1
  });
};
</script>

<style lang="less" scoped>
.publish-page {
  min-height: 100vh;
  background-color: #f9f9f9;
}

/* 导航栏 */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100rpx;
  padding: 0 30rpx;
  background-color: #fff;
  border-bottom: 1px solid #e8f5e9;
  
  .back-btn {
    width: 60rpx;
    height: 100rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .nav-title {
    font-size: 36rpx;
    color: #388e3c;
    font-weight: 500;
  }
  
  .save-btn {
    width: 120rpx;
    height: 60rpx;
    background-color: #388e3c;
    color: #fff;
    border-radius: 30rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
  }
}

/* 编辑区域 */
.edit-container {
  padding: 30rpx;
  background-color: #fff;
  margin-top: 15rpx;
  
  .title-input {
    margin-bottom: 30rpx;
    
    input {
      width: 100%;
      font-size: 34rpx;
      color: #333;
      padding: 15rpx 0;
      border-bottom: 1px solid #e8f5e9;
    }
  }
  
  .content-editor {
    position: relative;
    
    textarea {
      width: 100%;
      min-height: 400rpx;
      font-size: 30rpx;
      color: #666;
      line-height: 1.6;
    }
    
    .word-count {
      position: absolute;
      right: 0;
      bottom: 10rpx;
      font-size: 24rpx;
      color: #999;
    }
  }
}

/* 预览弹窗 */
.preview-container {
  width: 100%;
  background-color: #fff;
  border-radius: 30rpx 30rpx 0 0;
  padding-bottom: 30rpx;
  
  .preview-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 25rpx 30rpx;
    border-bottom: 1px solid #e8f5e9;
    
    .preview-title {
      font-size: 34rpx;
      color: #388e3c;
      font-weight: 500;
    }
  }
  
  .preview-content {
    padding: 30rpx;
    max-height: 600rpx;
    overflow-y: auto;
    
    .preview-title-text {
      font-size: 32rpx;
      color: #333;
      font-weight: 500;
      margin-bottom: 20rpx;
      padding-bottom: 15rpx;
      border-bottom: 1px solid #f0faf0;
    }
    
    .preview-content-text {
      font-size: 28rpx;
      color: #666;
      line-height: 1.8;
    }
  }
  
  .preview-footer {
    padding: 0 30rpx;
    
    .publish-btn {
      width: 100%;
      height: 90rpx;
      background-color: #388e3c;
      color: #fff;
      border-radius: 45rpx;
      font-size: 32rpx;
      font-weight: 500;
      line-height: 90rpx;
    }
  }
}
</style>
