<template>
  <view class="myPage">
    <!-- 页面头部 -->
    <view class="pageHeader">
      <view class="greet">我的</view>
    </view>
    
    <!-- 用户信息区域 -->
    <view class="header">
      <view class="h_left" @click="chooseAvatar">
        <image 
          class="avatar" 
          :src="avatarUrl||userInfo.avatar || defaultAvatar" 
          mode="cover"
        ></image>
      </view>
		<view 
		  class="h_right" 
		  @click="toUserDetail" 
		  :class="{ 'disabled': userInfo.nickName }" 
		>
		  <view class="hr_top">
			<view class="name">{{ userInfo.nickName || '点击登录' }}</view>
		  </view>
		  <view class="user-level">
			<text class="level-text">普通用户</text>
			<i class="fa fa-angle-right arrow-icon"></i>
		  </view>
		</view>
    </view>

    <!-- 功能菜单区域 -->
    <view class="content">
      <view class="common-content" @click="handleItemClick(item)" v-for="(item,index) in myList" :key="index">
        <view class="lingLeft">
          <view class="icon">
            <i :class="item.icon" class="menu-icon"></i>
          </view>
          <view class="text">
            {{item.name}}
          </view>
        </view>
        <view class="lineRight" v-if="item.url || item.action">
        </view>
      </view>
    </view>

    <!-- 退出登录按钮 -->
    <button 
      class="logout-btn" 
      @click="handleLogout"
      v-if="userInfo.nickname"
    >
      退出登录
    </button>

    <!-- 意见反馈弹窗 -->
    <uni-popup ref="feedbackPopup" type="center" :mask-click="true">
      <view class="feedback-popup">
        <view class="popup-title">意见反馈</view>
        <view class="popup-input">
          <textarea v-model="myadvice" placeholder="请输入您的宝贵意见..." placeholder-style="color:#999"
            maxlength="200"></textarea>
          <view class="word-count">{{ myadvice.length }}/200</view>
        </view>
        <view class="popup-buttons">
          <button class="cancel-btn" @click="closeFeedbackPopup">取消</button>
          <button class="confirm-btn" @click="submitFeedback">确认提交</button>
        </view>
      </view>
    </uni-popup>
	<!-- <button @click="test">测试</button> -->
  </view>
</template>

<script setup>
import { onLoad, onShow } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { BASE_URL } from '../../util/api';
import { useUserStore } from '../../store';
import { testList } from '../../util/api/an';
// import axios from 'axios'
// import qs from 'qs' // 引入 qs

// 默认头像
const defaultAvatar = '../../static/img/default.jpg';
const avatarUrl = ref('')
const userStore = useUserStore()

// 用户信息
const userInfo = ref({
  avatar: '',
  nickname: ''
});

// 反馈相关
const feedbackPopup = ref(null);
const myadvice = ref('');

const checkId = ref('W928582781')
const status = ref(1)

// const test = async () => {
//   const params = {
//     checkId: checkId.value,
//     status: status.value
//   }
  
//   // 使用 qs 序列化参数
//   const formData = qs.stringify(params);
  
//   try {
//     const res = await axios.post('http://127.0.0.1:7070/admin/approveAnnouncement', formData, {
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded'
//       }
//     });
//     console.log('审批成功', res.data);
//   } catch (error) {
//     console.error('请求失败', error);
//   }
// }
// 消息发布平台菜单列表
const myList = [
  {
    name: "我的发布",
    icon: "fa fa-pencil-square-o menu-icon",
    url: '/pages/my/published'
  },
  {
    name: "我的草稿",
    icon: "fa fa-file-text-o menu-icon",
    url: '/pages/my/drafts'
  },
  {
    name: "收到的赞",
    icon: "fa fa-thumbs-o-up menu-icon",
    url: '/pages/my/likes'
  },
  {
    name: "消息通知",
    icon: "fa fa-bell-o menu-icon",
    url: '/pages/my/notifications'
  },
  {
    name: "意见反馈",
    icon: "fa fa-comment-o menu-icon",
    action: "feedback"
  },
  {
    name: "设置",
    icon: "fa fa-cog menu-icon",
    url: '/pages/my/setting'
  }
];
const chooseAvatar = () => {


		uni.chooseImage({
			count: 1,
			sizeType: ['original', 'compressed'],
			sourceType: ['album', 'camera'],
			success: (res) => {
				const tempFilePath = res.tempFilePaths[0];
				avatarUrl.value = tempFilePath;
				console.log("新头像路径:", avatarUrl.value);
				console.log('token',userStore.token);
				uni.uploadFile({

					url: `${BASE_URL}/userInfo/uploadAvatar`,
					filePath: tempFilePath,
					name: 'file',
					header: {
								token: uni.getStorageSync('token'),
							},
					formData: {
						file: tempFilePath
					},
					success: (uploadFileRes) => {
						console.log("头像上传返回的数据", uploadFileRes.data);

						try {
							const result = JSON.parse(uploadFileRes.data);

							if (result.code === 200) {
								uni.showToast({
									title: '上传成功',
									icon: 'success'
								});
								avatarUrl.value = result.data.per_image;
								resume_info.personal_image = avatarUrl.value;
								userStore.setResumeinfo(resume_info);
								resume_info.personal_info.avatar_url = result.data.avatar_url;
							} else if (result.code === 401) {
								uni.showToast({
									title: '登录已过期，请重新登录',
									icon: 'none'
								});
								setTimeout(() => {
									uni.navigateTo({
										url: '/pages/login/login'
									});
								}, 1500);
							} else {
								throw new Error(result.msg || '上传失败');
							}
						} catch (parseError) {
							console.error('解析上传结果失败:', parseError);
							// uni.showToast({
							// 	title: '服务器响应格式错误',
							// 	icon: 'none'
							// });
						}
					},
					fail: (err) => {
						console.error('上传失败:', err);
						uni.showToast({
							title: '上传失败，请重试',
							icon: 'none'
						});
					},
					complete: () => {
						uni.hideLoading();
					}
				});
			},
			fail: (err) => {
				console.error('选择图片失败：', err);
				uni.showToast({
					title: '选择图片失败',
					icon: 'none'
				});
			}
		});
	};

// 页面加载时获取用户信息
onLoad(() => {
  getUserInfo();
});

// 页面显示时刷新用户信息
onShow(() => {
  getUserInfo();
});

// 从本地存储获取用户信息
const getUserInfo = () => {
  const storedUserInfo = uni.getStorageSync('userinfo');
  console.log("从本地拿到的登录数据为",storedUserInfo)
  if (storedUserInfo) {
    userInfo.value = storedUserInfo;
  }
};

// 跳转到用户详情页
const toUserDetail = () => {
  if (!userInfo.value.nickname) {
    // 如果未登录，跳转到登录页
    uni.navigateTo({
      url: '/pages/login/login'
    });
  } else {
    // 如果已登录，跳转到个人资料页
    uni.navigateTo({
      url: '/pages/userDetail/userDetail'
    });
  }
};

// 处理列表项点击
const handleItemClick = (item) => {
  if (item.action === "feedback") {
    openFeedbackPopup();
  } else if (item.url) {
    intoOtherPage(item.url);
  }
};

// 跳转子级页面
const intoOtherPage = (url) => {
  if (!url) {
    uni.showToast({
      title: "正在开发中...",
      icon: 'none'
    });
    return;
  }
  
  // 检查是否已登录
  if (!userInfo.value.nickname) {
    uni.showToast({
      title: '请先登录',
      icon: 'none',
      duration: 2000
    });
    return;
  }
  
  uni.navigateTo({
    url
  });
};

// 打开意见反馈弹窗
const openFeedbackPopup = () => {
  if (!userInfo.value.nickname) {
    uni.showToast({
      title: '请先登录',
      icon: 'none',
      duration: 2000
    });
    return;
  }
  feedbackPopup.value.open();
};

// 关闭意见反馈弹窗
const closeFeedbackPopup = () => {
  feedbackPopup.value.close();
};

// 提交反馈
const submitFeedback = () => {
  if (!myadvice.value.trim()) {
    uni.showToast({
      title: '请输入反馈内容',
      icon: 'none',
      duration: 2000
    });
    return;
  }

  // 这里仅做前端演示，实际项目中需要调用接口提交
  uni.showToast({
    title: '反馈提交成功，感谢您的建议',
    icon: 'none',
    duration: 2000
  });
  myadvice.value = '';
  closeFeedbackPopup();
};

// 退出登录
const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        // 清除本地存储的用户信息
        uni.removeStorageSync('USERINFO');
        // 更新用户信息
        userInfo.value = {
          avatar: '',
          nickname: ''
        };
        uni.showToast({
          title: '已退出登录',
          icon: 'none'
        });
      }
    }
  });
};
</script>

<style lang="less" scoped>
.myPage {
  padding: 0 22rpx;
  /* 淡绿色渐变背景 */
  background: linear-gradient(to top, #ffffff 0%, #f0faf0 40%, #e6f7e6 70%, #dceddc 100%);
  min-height: 100vh;
  font-size: 14px;

  .pageHeader {
    min-height: 200rpx;
    width: 100%;
    padding: 102rpx 0 40rpx;
    box-sizing: border-box;

    .greet {
      font-weight: 600;
      font-size: 34rpx;
      color: #388e3c; /* 淡绿色主题色 */
    }
  }

  .header {
    display: flex;
    align-items: center;
    padding-bottom: 30rpx;

    .h_left {
      width: 120rpx;
      height: 120rpx;
      border-radius: 50%;
      border: 8rpx solid #c8e6c9; /* 淡绿色边框 */
      background-color: #fff;
      min-width: 120rpx;
      margin-right: 20rpx;
      cursor: pointer;

      .avatar {
        width: 100%;
        height: 100%;
        border-radius: 50%;
      }
    }
	// .h_right.disabled{
	// 	pointer-events: none;  // 核心：禁止所有鼠标/触摸事件
	// 	cursor: default;       // 鼠标指针变为默认样式
	// 	opacity: 0.8;   
	// }
    .h_right {
      flex: 1;
      height: 128rpx;
      display: flex;
      flex-direction: column;
      justify-content: center;
      cursor: pointer;
      .hr_top {
        .name {
          font-size: 32rpx;
          color: #388e3c; /* 淡绿色文字 */
          font-weight: 600;
          margin-bottom: 8rpx;
        }
      }

      .user-level {
        display: flex;
        align-items: center;

        .level-text {
          font-size: 24rpx;
          background-color: rgba(56, 142, 60, 0.1); /* 淡绿色背景 */
          color: #388e3c; /* 淡绿色文字 */
          padding: 2rpx 15rpx;
          border-radius: 15rpx;
        }

        .arrow-icon {
          margin-left: 10rpx;
          font-size: 28rpx;
          color: #388e3c; /* 淡绿色箭头 */
        }
      }
    }
  }

  .content {
    display: flex;
    flex-direction: column;

    .common-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #ffffffa8;
      padding: 24rpx 40rpx;
      box-sizing: border-box;
      border-bottom: 2rpx solid #e8f5e9; /* 淡绿色边框 */
      cursor: pointer;

      &:first-child {
        border-radius: 25rpx 25rpx 0 0;
      }

      &:last-child {
        border-radius: 0 0 25rpx 25rpx;
        border-bottom: none;
      }

      .lingLeft {
        display: flex;
        align-items: center;

        .icon {
          .menu-icon {
            color: #388e3c; /* 淡绿色图标 */
            font-size: 36rpx;
            width: 40rpx;
            text-align: center;
          }
        }

        .text {
          margin-left: 25rpx;
          font-size: 30rpx;
          color: #388e3c; /* 淡绿色文字 */
          font-weight: 600;
        }
      }

      .lineRight {
        display: inline-block;
        width: 10rpx;
        height: 10rpx;
        border-top: 4rpx solid #388e3c; /* 淡绿色箭头 */
        border-right: 4rpx solid #388e3c;
        transform: rotate(45deg);
      }
    }
  }

  /* 退出登录按钮 */
  .logout-btn {
    width: 90%;
    margin: 50rpx auto;
    background-color: #fff;
    color: #388e3c; /* 淡绿色文字 */
    border: 2rpx solid #388e3c; /* 淡绿色边框 */
    border-radius: 45rpx;
    padding: 25rpx 0;
    font-size: 30rpx;
    font-weight: 500;
  }

  /* 意见反馈弹窗 */
  .feedback-popup {
    width: 650rpx;
    max-width: 90%;
    min-width: 300rpx;
    background-color: #fff;
    border-radius: 30rpx;
    padding: 20rpx 30rpx;
    box-sizing: border-box;

    .popup-title {
      font-size: 34rpx;
      color: #388e3c; /* 淡绿色标题 */
      font-weight: 600;
      text-align: center;
      margin-bottom: 30rpx;
      padding-bottom: 20rpx;
      border-bottom: 1px solid #f0faf0; /* 淡绿色边框 */
    }

    .popup-input {
      position: relative;

      textarea {
        width: 100%;
        min-height: 200rpx;
        padding: 20rpx;
        border: 2rpx solid #c8e6c9; /* 淡绿色边框 */
        border-radius: 20rpx;
        font-size: 28rpx;
        color: #333;
        box-sizing: border-box;
        resize: none;
      }

      .word-count {
        position: absolute;
        right: 20rpx;
        bottom: 15rpx;
        font-size: 24rpx;
        color: #999;
      }
    }

    .popup-buttons {
      display: flex;
      gap: 30rpx;
      margin-top: 30rpx;

      .cancel-btn,
      .confirm-btn {
        flex: 1;
        height: 90rpx;
        border-radius: 45rpx;
        font-size: 30rpx;
        font-weight: 500;
        line-height: 90rpx;
        text-align: center;
        border: none;
      }

      .cancel-btn {
        background-color: #f0faf0; /* 淡绿色背景 */
        color: #388e3c; /* 淡绿色文字 */
      }

      .confirm-btn {
        background-color: #388e3c; /* 淡绿色背景 */
        color: #fff;
      }
    }
  }
}
</style>
