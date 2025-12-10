<template>
  <view class="forgot-password-container">
    <!-- 背景装饰元素，与登录和注册页保持一致 -->
    <view class="bg-decoration top-left"></view>
    <view class="bg-decoration bottom-right"></view>
    
    <view class="forgot-password">
      <!-- 上半部分盒子 - 包含3D旋转球体动画 -->
      <view class="logoBg">
        <!-- 3D旋转球体容器 -->
        <view class="sphere-container">
          <view class="sphere sphere-green"></view>
          <view class="sphere sphere-blue"></view>
        </view>
        <view class="app-slogan">重置密码</view>
      </view>
      
      <!-- 步骤指示器 -->
      <view class="steps-indicator">
        <view class="step" :class="{ active: currentStep === 1, completed: currentStep > 1 }">
          <view class="step-number">{{ currentStep > 1 ? '✓' : '1' }}</view>
          <view class="step-text">验证邮箱</view>
        </view>
        <view class="step-line" :class="{ completed: currentStep > 1 }"></view>
        <view class="step" :class="{ active: currentStep === 2, completed: currentStep > 2 }">
          <view class="step-number">{{ currentStep > 2 ? '✓' : '2' }}</view>
          <view class="step-text">验证码</view>
        </view>
        <view class="step-line" :class="{ completed: currentStep > 2 }"></view>
        <view class="step" :class="{ active: currentStep === 3 }">
          <view class="step-number">3</view>
          <view class="step-text">设置密码</view>
        </view>
      </view>
      
      <!-- 忘记密码卡片 -->
      <view class="forgot-password-card">
        <!-- 第一步：输入邮箱和图形验证码 -->
        <view v-if="currentStep === 1">
          <view class="inputItem" :class="errors.email ? 'error' : ''">
            <text class="label">邮箱</text>
            <input 
              type="text" 
              placeholder="请输入邮箱地址" 
              v-model="email"
              class="input"
            />
            <text v-if="errors.email" class="error-message">{{ errors.email }}</text>
          </view>

          <view class="inputItem captchaItem" :class="errors.captcha ? 'error' : ''">
           <text class="label">图形验证</text>
            <input 
              type="text" 
              placeholder="请输入图形验证码" 
              v-model="captcha"
              class="input captchaInput"
            />
            <image 
              class="captchaImg" 
              :src="pngadress" 
              mode="widthFix"
              @click="refreshCaptcha"
              alt="图形验证码，点击可刷新"
            ></image>
            <text v-if="errors.captcha" class="error-message">{{ errors.captcha }}</text>
          </view>

          <button class="nextBtn" @click="toStep(2)">
            下一步
          </button>
        </view>
        
        <!-- 第二步：输入邮箱验证码 -->
        <view v-if="currentStep === 2">
          <view class="inputItem verifyCodeItem" :class="errors.verifyCode ? 'error' : ''">
            <text class="label">验证码</text>
            <input 
              type="text" 
              placeholder="请输入邮箱验证码" 
              v-model="verifyCode"
              class="input verifyInput"
            />
            <button 
              class="sendCodeBtn" 
              @click="sendVerifyCode"
              :disabled="isSendingCode"
            >
              {{ isSendingCode ? `${countdown}s后重发` : '发送验证码' }}
            </button>
            <text v-if="errors.verifyCode" class="error-message">{{ errors.verifyCode }}</text>
          </view>

          <button class="prevBtn" @click="toStep(1)">
            上一步
          </button>
          <button class="nextBtn" @click="toStep(3)">
            下一步
          </button>
        </view>
        
        <!-- 第三步：输入新密码 -->
        <view v-if="currentStep === 3">
          <view class="inputItem" :class="errors.newPassword ? 'error' : ''">
            <text class="label">新密码</text>
            <input 
              type="password" 
              placeholder="请设置新密码" 
              v-model="newPassword"
              class="input"
            />
            <text v-if="errors.newPassword" class="error-message">{{ errors.newPassword }}</text>
          </view>

          <view class="inputItem" :class="errors.confirmPassword ? 'error' : ''">
            <text class="label">确认密码</text>
            <input 
              type="password" 
              placeholder="请再次输入新密码" 
              v-model="confirmPassword"
              class="input"
            />
            <text v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</text>
          </view>

          <button class="prevBtn" @click="toStep(2)">
            上一步
          </button>
          <button class="submitBtn" @click="handleResetPassword">
            重置密码
          </button>
        </view>
        
        <view class="login-link" @click="goto('/pages/login/login')">
          想起密码了？去登录
        </view>
      </view>
      
      <!-- 协议同意 -->
      <view class="agree" :class="shakeFlag?'shakeActive':''">
        <label class="radio" @click="changeAll">
          <radio class="a_radio" :value="String(agreeSelect)" :checked="agreeSelect" color="#84D26C" />
        </label>
        <text class="agreeText">勾选即代表已阅读并同意平台“<text class="xy" @click="goto('/pages/login/userAgreement/userAgreement')">使用协议</text>”和“<text class="xy" @click="goto('/pages/login/privacy/privacy')">隐私政策</text>”</text>
        <text v-if="errors.agree" class="error-message agree-error">{{ errors.agree }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getPng, sendEmailCode, resetPassword } from '../../util/api/login';
import { useUserStore } from '../../store';

// 表单数据
const userStore = useUserStore()
const currentStep = ref(1); 
const email = ref('');
const verifyCode = ref(''); 
const captcha = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const agreeSelect = ref(false);
const shakeFlag = ref(false);
const pngadress = ref('');

// 验证码发送状态
const isSendingCode = ref(false);
const countdown = ref(60);

// 错误信息对象
const errors = ref({
  email: '',
  verifyCode: '',
  captcha: '',
  newPassword: '',
  confirmPassword: '',
  agree: ''
});

// 获取验证码图片
const getverify = async () => {
  const res = await getPng();
  console.log("返回的图片验证值:", res.data.data.checkCode);
  pngadress.value = res.data.data.checkCode;
  userStore.setCheckCodeKey(res.data.data.checkCodeKey)
};

const changeAll = () => {
  agreeSelect.value = !agreeSelect.value;
  if (agreeSelect.value) {
    errors.value.agree = '';
  }
};

// 刷新验证码图片
const refreshCaptcha = () => {
  getverify();
  captcha.value = '';
  errors.value.captcha = '';
};

// 发送邮箱验证码
const sendVerifyCode = () => {
  // 重置错误信息
  errors.value.email = '';
  errors.value.captcha = '';
  
  let isValid = true;
  
  // 验证邮箱
  if (!email.value) {
    errors.value.email = '请输入邮箱地址';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = '请输入有效的邮箱地址';
    isValid = false;
  }
  
  if (!isValid) {
    shakeFlag.value = true;
    setTimeout(() => shakeFlag.value = false, 1000);
    return;
  }
  
  // 调用发送验证码API
  const sendCode = async () => {
    try {
      isSendingCode.value = true;
      const params = `email=${email.value}&checkCode=${captcha.value}&checkCodeKey=${userStore.checkCodeKey}`;
      const res = await sendEmailCode(params);
      
      if (res.data.code === 200) {
        uni.showToast({
          title: '验证码发送成功',
          icon: 'success',
          duration: 1500
        });
        
        // 开始倒计时
        const timer = setInterval(() => {
          countdown.value--;
          if (countdown.value <= 0) {
            clearInterval(timer);
            isSendingCode.value = false;
            countdown.value = 60;
          }
        }, 1000);
      } else {
        console.error('验证码发送失败:', res.data.info);
        errors.value.verifyCode = res.data.info || '发送验证码失败';
        isSendingCode.value = false;
      }
    } catch (error) {
      console.error('发送验证码出错:', error);
      errors.value.email = '发送验证码失败，请稍后重试';
      isSendingCode.value = false;
    }
  };
  
  sendCode();
};

// 步骤切换
const toStep = (step) => {
  // 验证当前步骤的数据
  if (step > currentStep.value) {
    if (currentStep.value === 1 && !validateStep1()) {
      return;
    }
    if (currentStep.value === 2 && !validateStep2()) {
      return;
    }
  }
  
  currentStep.value = step;
  // 滚动到顶部
  uni.pageScrollTo({
    scrollTop: 0,
    duration: 300
  });
};

// 验证第一步
const validateStep1 = () => {
  let isValid = true;
  errors.value.email = '';
  errors.value.captcha = '';
  
  // 验证邮箱
  if (!email.value) {
    errors.value.email = '请输入邮箱地址';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = '请输入有效的邮箱地址';
    isValid = false;
  }
  
  // 验证图形验证码
  if (!captcha.value) {
    errors.value.captcha = '请输入图形验证码';
    isValid = false;
  }
  
  if (!isValid) {
    shakeFlag.value = true;
    setTimeout(() => shakeFlag.value = false, 1000);
  }
  
  return isValid;
};

// 验证第二步
const validateStep2 = () => {
  let isValid = true;
  errors.value.verifyCode = '';
  
  // 验证邮箱验证码
  if (!verifyCode.value) {
    errors.value.verifyCode = '请输入邮箱验证码';
    isValid = false;
  } else if (verifyCode.value.length < 4) {
    errors.value.verifyCode = '验证码长度不正确';
    isValid = false;
  }
  
  if (!isValid) {
    shakeFlag.value = true;
    setTimeout(() => shakeFlag.value = false, 1000);
  }
  
  return isValid;
};

// 重置密码处理
const handleResetPassword = async() => {
  // 重置所有错误信息
  errors.value.newPassword = '';
  errors.value.confirmPassword = '';
  errors.value.agree = '';
  
  let isValid = true;
  
  // 验证新密码
  if (!newPassword.value) {
    errors.value.newPassword = '请设置新密码';
    isValid = false;
  } else if (newPassword.value.length < 6) {
    errors.value.newPassword = '密码长度不能少于6位';
    isValid = false;
  } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(newPassword.value)) {
    errors.value.newPassword = '密码需包含字母和数字';
    isValid = false;
  }
  
  // 验证确认密码
  if (!confirmPassword.value) {
    errors.value.confirmPassword = '请再次输入新密码';
    isValid = false;
  } else if (newPassword.value !== confirmPassword.value) {
    errors.value.confirmPassword = '两次输入的密码不一致';
    isValid = false;
  }
  
  // 验证协议勾选
  if (!agreeSelect.value) {
    errors.value.agree = '请阅读并同意使用协议和隐私政策';
    isValid = false;
  }
  
  // 如果验证失败，添加抖动效果
  if (!isValid) {
    shakeFlag.value = true;
    setTimeout(() => shakeFlag.value = false, 1000);
    return;
  }
  
  // 所有验证通过，执行重置密码逻辑
  console.log(`重置密码信息: 
    邮箱=${email.value}, 
    验证码=${verifyCode.value},
    新密码=${newPassword.value}`);
  
  const params = `email=${email.value}&emailCode=${verifyCode.value}
    &newPassword=${newPassword.value}&checkCode=${captcha.value}&checkCodeKey=${userStore.checkCodeKey}`;
  
  try {
    const res = await resetPassword(params);
    console.log("重置密码接口返回的值为:", res);
    
    if (res.data.code === 200) {
      uni.showToast({
        title: '密码重置成功',
        icon: 'success',
        duration: 2000
      });
      
      // 重置成功后跳转到登录页
      setTimeout(() => {
        goto('/pages/login/login');
      }, 2000);
    } else {
      uni.showToast({
        title: res.data.info || '密码重置失败', 
        icon: 'none',
        duration: 2000
      });
    }
  } catch (error) {
    console.error('重置密码出错:', error);
    uni.showToast({
      title: '重置密码失败，请稍后重试',
      icon: 'none',
      duration: 2000
    });
  }
};

// 页面挂载时获取验证码图片
onMounted(() => {
  getverify();
  refreshCaptcha();
});

// 页面跳转
const goto = (url) => {
  uni.navigateTo({ url });
};
</script>

<style lang="less" scoped>
// 主容器样式，与登录和注册页保持一致
.forgot-password-container {
  position: relative;
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4eaf1 100%);
  overflow: hidden;
  padding: 20rpx;
}

.bg-decoration {
  position: absolute;
  width: 600rpx;
  height: 600rpx;
  border-radius: 50%;
  background: rgba(132, 210, 108, 0.05);
  z-index: 0;
}

.top-left {
  top: -250rpx;
  left: -250rpx;
}

.bottom-right {
  bottom: -250rpx;
  right: -250rpx;
}

.forgot-password {
  position: relative;
  z-index: 1;
  max-width: 600rpx;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  justify-content: start;
  padding: 40rpx 0;
}

// 上半部分盒子样式
.logoBg {
  padding: 30rpx 0 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  width: 100%;
  text-align: center;
  overflow: hidden;
  margin-bottom: 20rpx;
  
  &::before {
    content: '';
    position: absolute;
    width: 350rpx;
    height: 350rpx;
    background: radial-gradient(circle, rgba(132, 210, 108, 0.15) 0%, transparent 70%);
    border-radius: 50%;
    z-index: -1;
  }
  
  .sphere-container {
    position: absolute;
    width: 100%;
    height: 100%;
    perspective: 1200rpx;
    z-index: -1;
  }
  
  .sphere {
    position: absolute;
    border-radius: 50%;
    opacity: 0.5;
    filter: blur(35rpx);
    animation: rotate 20s infinite linear;
    transform-style: preserve-3d;
  }
  
  .sphere-green {
    width: 220rpx;
    height: 220rpx;
    background: radial-gradient(circle, rgba(144, 238, 144, 0.8) 0%, rgba(60, 179, 113, 0.4) 100%);
    top: 20rpx;
    left: 20rpx;
    animation-delay: 0s;
  }
  
  .sphere-blue {
    width: 180rpx;
    height: 180rpx;
    background: radial-gradient(circle, rgba(173, 216, 230, 0.8) 0%, rgba(70, 130, 180, 0.4) 100%);
    bottom: 10rpx;
    right: 50rpx;
    animation-delay: 2s; 
  }
  
  .app-slogan {
    font-size: 26rpx;
    color: #558b2f;
    letter-spacing: 1rpx;
    opacity: 0.9;
    position: relative;
    z-index: 1;
  }
}

// 步骤指示器样式
.steps-indicator {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 90%;
  margin-bottom: 40rpx;
  padding: 0 20rpx;
  
  .step {
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 1;
    
    .step-number {
      width: 50rpx;
      height: 50rpx;
      border-radius: 50%;
      background-color: #e0e0e0;
      color: #999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26rpx;
      margin-bottom: 10rpx;
      transition: all 0.3s ease;
    }
    
    .step-text {
      font-size: 22rpx;
      color: #999;
      transition: all 0.3s ease;
    }
    
    &.active {
      .step-number {
        background-color: #84D26C;
        color: white;
        box-shadow: 0 4rpx 10rpx rgba(132, 210, 108, 0.3);
      }
      
      .step-text {
        color: #84D26C;
        font-weight: 500;
      }
    }
    
    &.completed {
      .step-number {
        background-color: #84D26C;
        color: white;
      }
      
      .step-text {
        color: #84D26C;
      }
    }
  }
  
  .step-line {
    flex: 1;
    height: 4rpx;
    background-color: #e0e0e0;
    margin: 0 10rpx;
    transition: all 0.3s ease;
    
    &.completed {
      background-color: #84D26C;
    }
  }
}

// 忘记密码卡片样式
.forgot-password-card {
  width: 100%;
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 24rpx;
  padding: 50rpx 40rpx;
  box-shadow: 0 15rpx 50rpx rgba(0, 0, 0, 0.08);
  margin-bottom: 30rpx;
  position: relative;
  z-index: 1;
}

.inputItem {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
  padding-bottom: 15rpx;
  border-bottom: 1px solid #eee;
  transition: border-color 0.3s ease;
  position: relative;
  
  &:focus-within {
    border-bottom-color: #84D26C;
  }
  
  // 错误状态样式
  &.error {
    border-bottom-color: #ff4d4f;
  }
  
  .label {
    width: 140rpx;
    font-size: 30rpx;
    color: #555;
  }
  
  .input {
    flex: 1;
    height: 60rpx;
    font-size: 28rpx;
    padding: 0 10rpx;
    color: #333;
    background: transparent;
  }
  
  .input::placeholder {
    color: #ccc;
  }
  
  // 错误提示信息样式
  .error-message {
    position: absolute;
    right: 10rpx;
    font-size: 24rpx;
    color: #ff4d4f;
    margin-top: 65rpx;
  }
}

// 验证码输入项样式
.verifyCodeItem {
  .verifyInput {
    flex: 2;
  }
  
  .sendCodeBtn {
    flex: 1;
    height: 60rpx;
    line-height: 60rpx;
    text-align: center;
    background-color: #e8f5e9;
    color: #558b2f;
    font-size: 26rpx;
    border-radius: 30rpx;
    padding: 0;
    margin-left: 20rpx;
    transition: all 0.3s ease;
  }
  
  .sendCodeBtn:not(:disabled):active {
    background-color: #dcedc8;
    transform: scale(0.98);
  }
  
  .sendCodeBtn:disabled {
    background-color: #f5f5f5;
    color: #999;
  }
}

.captchaItem {
  .captchaInput {
    flex: 2;
  }
  
  .captchaImg {
    flex: 1;
    height: 60rpx;
    margin-left: 20rpx;
    border-radius: 8rpx;
    cursor: pointer;
    box-shadow: 0 2rpx 5rpx rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease;
  }
  
  .captchaImg:active {
    transform: scale(0.95);
  }
}

// 按钮样式
.nextBtn, .prevBtn, .submitBtn {
  height: 90rpx;
  line-height: 90rpx;
  font-size: 36rpx;
  border-radius: 45rpx;
  margin-top: 20rpx;
  transition: all 0.3s ease;
  border: none;
}

.nextBtn, .submitBtn {
  width: 100%;
  background: linear-gradient(90deg, #84D26C 0%, #6dc955 100%);
  color: #fff;
  box-shadow: 0 8rpx 15rpx rgba(132, 210, 108, 0.3);
}

.nextBtn:active, .submitBtn:active {
  transform: translateY(3rpx);
  box-shadow: 0 4rpx 10rpx rgba(132, 210, 108, 0.2);
  background: linear-gradient(90deg, #79c460 0%, #64b84d 100%);
}

.prevBtn {
  width: 100%;
  background-color: #f5f5f5;
  color: #666;
  margin-bottom: 20rpx;
}

.prevBtn:active {
  background-color: #eaeaea;
  transform: translateY(2rpx);
}

// 登录链接样式
.login-link {
  text-align: center;
  font-size: 26rpx;
  color: #84D26C;
  margin-top: 30rpx;
  cursor: pointer;
  transition: color 0.2s ease;
  
  &:active {
    color: #558b2f;
  }
}

// 协议同意样式
.agree {
  margin-top: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #666;
  max-width: 520rpx;
  text-align: center;
  position: relative;
  z-index: 1;
  
  .a_radio {
    transform: scale(0.7);
    margin-right: 10rpx;
  }
  
  .agreeText {
    line-height: 1.5;
  }
  
  .xy {
    color: #84D26C;
    text-decoration: underline;
    margin: 0 5rpx;
    cursor: pointer;
  }
  
  .agree-error {
    position: absolute;
    top: 40rpx;
    left: 0;
    right: 0;
    text-align: center;
  }
}

// 动画效果
.shakeActive {
  animation: shake 1s ease-in-out;
}

@keyframes rotate {
  0% {
    transform: rotateX(0deg) rotateY(0deg) translateZ(0rpx);
  }
  100% {
    transform: rotateX(360deg) rotateY(720deg) translateZ(50rpx);
  }
}

@keyframes shake {
  10%, 90% { transform: translate3d(-2rpx, 0, 0); }
  20%, 80% { transform: translate3d(+4rpx, 0, 0); }
  30%, 70% { transform: translate3d(-8rpx, 0, 0); }
  40%, 60% { transform: translate3d(+8rpx, 0, 0); }
  50% { transform: translate3d(-8rpx, 0, 0); }
}

// 适配不同屏幕尺寸
@media (max-height: 667px) {
  .forgot-password-card {
    padding: 30rpx 40rpx;
  }
  
  .inputItem {
    margin-bottom: 30rpx;
  }
  
  .nextBtn, .prevBtn, .submitBtn {
    height: 80rpx;
    line-height: 80rpx;
    font-size: 32rpx;
  }
}
</style>
    