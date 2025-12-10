<template>
	<TopNavbar title="青言速递消息平台"></TopNavbar>
  <view class="message-platform">

    <!-- 系统公告 -->
    <view class="system-notice">
      <view class="notice-icon">
        <uni-icons type="volume-2" size="24" color="#4CAF50"></uni-icons>
      </view>
      <view class="notice-content">
        <text class="notice-text">系统公告：本平台将于10月20日进行系统升级，期间可能影响部分功能使用，请提前做好准备</text>
      </view>
      <view class="notice-arrow">
        <uni-icons type="right" size="18" color="#666"></uni-icons>
      </view>
    </view>

      <view class="carousel-container">
        <!-- 轮播图实现：图片+自上而下黑色阴影+阴影上文字，复用importantNews数据 -->
        <uni-swiper class="carousel-swiper" autoplay interval="3000" circular indicator-dots>
          <uni-swiper-item class="carousel-item" v-for="(item, index) in importantNews" :key="item.id">
            <!-- 轮播背景图片 -->
            <view class="carousel-item" :style="{ backgroundImage: `url(${item.imageUrl})` }">
              <!-- 自上而下的黑色渐变阴影（从底部深色到顶部透明） -->
              <view class="carousel-overlay"></view>
              <!-- 阴影上方的文字内容 -->
              <view class="carousel-text">
                <text class="carousel-title">{{ item.title }}</text>
                <text class="carousel-desc">{{ item.description }}</text>
              </view>
            </view>
          </uni-swiper-item>
        </uni-swiper>
      </view>

    <!-- 消息列表 -->
    <view class="message-list">
      <view class="list-header">
        <text class="header-text">最新消息</text>
		
		<view class="header-add" @click="draft">
			<uni-icons type="paperplane-filled" size="36"></uni-icons>
		</view>
      </view>
      
      <view 
        class="message-item" 
        v-for="(message, index) in messages" 
        :key="message.id"
        @click="viewMessageDetail(message)"
      >
        <!-- 消息头像 - 确保每个消息都有头像 -->
        <view class="message-avatar">
          <view class="avatar-frame">
            <image :src="message.avatar" mode="widthFix" class="avatar-img" :alt="message.sender + '的头像'"></image>
          </view>
        </view>
        
        <view class="message-content">
          <view class="message-header">
            <text class="message-sender">{{ message.sender }}</text>
            <text class="message-time">{{ message.time }}</text>
          </view>
          
          <view class="message-body">
            <text class="message-text">{{ message.content }}</text>
          </view>
        </view>
        
        <view class="message-actions">
          <view class="action-button" @click.stop="handleLike(index)">
            <uni-icons 
              :type="message.liked ? 'heart-filled' : 'heart'" 
              size="22" 
              :color="message.liked ? '#4CAF50' : '#999'"
              class="action-icon"
            ></uni-icons>
            <text class="action-text" :class="message.liked ? 'liked' : ''">{{ message.likeCount }}</text>
          </view>
          
          <view class="action-button" @click.stop="handleReceived(index)">
            <uni-icons 
              :type="message.received ? 'checkmark-circle-filled' : 'checkmark-circle'" 
              size="22" 
              :color="message.received ? '#4CAF50' : '#999'"
              class="action-icon"
            ></uni-icons>
            <text class="action-text" :class="message.received ? 'received' : ''">收到</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import TopNavbar from '../components/TopNavbar.vue';
import { getAnList } from '../../util/api/an';

const pageNum=ref(1)
const pageSize=ref(3)
const way=ref(1)

// 重要消息轮播数据 - 已修复图片URL
const importantNews = ref([
  {
    id: 1,
    title: "平台用户突破100万",
    description: "感谢各位用户的支持，我们将推出更多优质功能",
    imageUrl: "../../static/img/keda.jpg"
  },
  {
    id: 2,
    title: "新功能上线通知",
    description: "消息互动功能已正式上线，快来体验吧",
    imageUrl: "../../static/img/keda1.jpg"
  },
  {
    id: 3,
    title: "年度用户回馈活动",
    description: "参与活动即可获得丰厚奖励，详情点击查看",
    imageUrl: "../../static/img/keda2.jpg"
  }
]);

// 消息列表数据 - 确保每个消息都有头像
const messages = ref([
  {
    id: 1,
    sender: "系统管理员",
    avatar: "../../static/img/default.jpg",
    content: "您的账号已成功完成实名认证，现在可以使用所有功能",
    time: "09:30",
    liked: false,
    likeCount: 24,
    received: false
  },
  {
    id: 2,
    sender: "活动中心",
    avatar: "../../static/img/default.jpg",
    content: "您参与的「秋季活动」已获奖，奖品将在3个工作日内发放",
    time: "昨天",
    liked: true,
    likeCount: 156,
    received: true
  },
  {
    id: 3,
    sender: "技术支持",
    avatar: "../../static/img/default.jpg",
    content: "您反馈的问题已解决，如有其他疑问请随时联系我们",
    time: "10-12",
    liked: false,
    likeCount: 8,
    received: false
  },
  {
    id: 4,
    sender: "内容推荐",
    avatar: "../../static/img/default.jpg",
    content: "为您推荐了5篇相关文章，点击查看详情",
    time: "10-10",
    liked: false,
    likeCount: 32,
    received: true
  }
]);

// 处理点赞功能 - 增加动画效果
const handleLike = (index) => {
  // 切换点赞状态和数量
  if (messages.value[index].liked) {
    messages.value[index].likeCount--;
  } else {
    messages.value[index].likeCount++;
  }
  messages.value[index].liked = !messages.value[index].liked;
  
  // 添加点赞动画效果
  const likeButton = uni.createSelectorQuery().select(`.message-item:nth-child(${index + 1}) .action-button:first-child .action-icon`);
  likeButton.fields({ node: true, size: true }, (res) => {
    if (res) {
      const icon = res.node;
      icon.style.transition = 'transform 0.3s ease, color 0.3s ease';
      icon.style.transform = 'scale(1.3)';
      setTimeout(() => {
        icon.style.transform = 'scale(1)';
      }, 300);
    }
  }).exec();
};

// 处理收到功能 - 增加动画效果
const handleReceived = (index) => {
  messages.value[index].received = !messages.value[index].received;
  
  // 添加收到动画效果
  const receivedButton = uni.createSelectorQuery().select(`.message-item:nth-child(${index + 1}) .action-button:last-child .action-icon`);
  receivedButton.fields({ node: true, size: true }, (res) => {
    if (res) {
      const icon = res.node;
      icon.style.transition = 'transform 0.3s ease, color 0.3s ease';
      icon.style.transform = 'rotate(30deg)';
      setTimeout(() => {
        icon.style.transform = 'rotate(0)';
      }, 300);
    }
  }).exec();
};

// 查看消息详情
const viewMessageDetail = (message) => {
  uni.navigateTo({
    url: `/pages/message/detail?id=${message.id}`
  });
};

const draft=()=>{
	console.log("准备编辑要发布的公告草稿")
	uni.navigateTo({
		url:'/pages/an/an'
	})
}

onLoad(async() =>{
	const params=`pageNum=${pageNum.value}&pageSize=${pageSize.value}&way=${way.value}`
  const res= await getAnList(params)
  console.log("获取公告列表返回的值为:",res);
});
</script>

<style lang="scss" scoped>
.message-platform {
  min-height: 100vh;
  background-color: #f9fbf9;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

/* 导航栏样式 - 改为绿色系 */
.navbar {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #4CAF50;
  position: relative;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  
  .navbar-title {
    color: #FFFFFF;
    font-size: 18px;
    font-weight: 500;
  }
}

/* 系统公告样式 - 融入绿色元素 */
.system-notice {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #f1f8e9;
  border-bottom: 1px solid #dcedc8;
  
  .notice-icon {
    margin-right: 12px;
    flex-shrink: 0;
  }
  
  .notice-content {
    flex: 1;
    overflow: hidden;
    
    .notice-text {
      color: #060606;
      font-size: 14px;
      line-height: 1.5;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  
  .notice-arrow {
    margin-left: 12px;
    flex-shrink: 0;
  }
}

/* 轮播图样式 - 优化外观 */
.carousel-container {
  margin: 16px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
}

.carousel-swiper {
  height: 180px;
}

.carousel-item {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
}

.carousel-overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 60%);
}

.carousel-text {
  padding: 20px 16px 16px;
  position: relative;
  z-index: 1;
}

.carousel-title {
  color: #0b0b0b;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  display: block;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.carousel-desc {
  color: rgba(0, 0, 0, 0.9);
  font-size: 14px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 消息列表样式 - 增强头像显示 */
.message-list {
  padding: 0 16px 20px;
  
  .list-header {
    padding: 16px 0;
    display: flex;
	justify-content: space-between;
	.header-add{
		padding-right: 20rpx;
	}
    .header-text {
      color: #333333;
      font-size: 16px;
      font-weight: 600;
      position: relative;
      
      &::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: -6px;
        width: 24px;
        height: 3px;
        background-color: #ffffff;
        border-radius: 2px;
      }
    }
  }
  
  .message-item {
    display: flex;
    align-items: flex-start;
    padding: 16px 0;
    border-bottom: 1px solid #e8f5e9;
    transition: background-color 0.2s ease;
    
    &:last-child {
      border-bottom: none;
    }
    
    &:hover {
      background-color: #f1f8e9;
      border-radius: 8px;
      padding-left: 8px;
      padding-right: 8px;
      margin-left: -8px;
      margin-right: -8px;
    }
    
    .message-avatar {
      width: 52px;
      height: 52px;
      margin-right: 14px;
      flex-shrink: 0;
      
      .avatar-frame {
        width: 100%;
        height: 100%;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(76, 175, 80, 0.15);
        background-color: #b7dbbd;
        
        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        
        &:hover .avatar-img {
          transform: scale(1.05);
        }
      }
    }
    
    .message-content {
      flex: 1;
      
      .message-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;
        
        .message-sender {
          color: #2e7d32;
          font-size: 16px;
          font-weight: 500;
        }
        
        .message-time {
          color: #81c784;
          font-size: 12px;
        }
      }
      
      .message-body {
        .message-text {
          color: #388e3c;
          font-size: 14px;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      }
    }
    
    .message-actions {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
      
      .action-button {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        opacity: 0.9;
        transition: all 0.2s ease;
        padding: 4px;
        border-radius: 6px;
        
        &:active {
          transform: scale(0.95);
          opacity: 1;
          background-color: rgba(76, 175, 80, 0.1);
        }
        
        .action-icon {
          transition: all 0.2s ease;
        }
        
        .action-text {
          color: #666;
          font-size: 12px;
          transition: all 0.2s ease;
        }
        
        .liked {
          color: #4CAF50;
          font-weight: 500;
        }
        
        .received {
          color: #4CAF50;
          font-weight: 500;
        }
      }
    }
  }
}

/* 动画效果 */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

/* 适配不同屏幕尺寸 */
@media (min-width: 768px) {
  .carousel-swiper {
    height: 240px;
  }
  
  .message-item {
    padding: 20px 0;
  }
  
  .message-avatar {
    width: 60px;
    height: 60px;
  }
}
</style>
    