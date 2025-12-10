<template>
  <view class="register-container">
    <!-- 背景装饰元素，与登录页保持一致 -->
    <view class="bg-decoration top-left"></view>
    <view class="bg-decoration bottom-right"></view>
    
    <view class="register">
      <!-- 上半部分盒子 - 包含3D旋转球体动画 -->
      <view class="logoBg">
        <!-- 3D旋转球体容器 -->
        <view class="sphere-container">
          <view class="sphere sphere-pink"></view>
          <view class="sphere sphere-blue"></view>
          <view class="sphere sphere-purple"></view>
        </view>
        <view class="app-slogan">创建账号，开始使用</view>
      </view>
      
      <!-- 注册卡片 -->
      <view class="register-card">
        <!-- 邮箱输入框 -->
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
        
<!--        邮箱验证码
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
        </view> -->
        
        <!-- 用户名输入框 -->
        <view class="inputItem" :class="errors.username ? 'error' : ''">
          <text class="label">用户名</text>
          <input 
            type="text" 
            placeholder="请设置用户名" 
            v-model="username"
            class="input"
          />
          <text v-if="errors.username" class="error-message">{{ errors.username }}</text>
        </view>
        
        <!-- 密码输入框 -->
        <view class="inputItem" :class="errors.password ? 'error' : ''">
          <text class="label">密码</text>
          <input 
            type="password" 
            placeholder="请设置密码" 
            v-model="password"
            class="input"
          />
          <text v-if="errors.password" class="error-message">{{ errors.password }}</text>
        </view>

        <view class="inputItem" :class="errors.confirmPassword ? 'error' : ''">
          <text class="label">确认密码</text>
          <input 
            type="password" 
            placeholder="请再次输入密码" 
            v-model="confirmPassword"
            class="input"
          />
          <text v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</text>
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

        <button class="registerBtn" @click="handleRegister">
          注册
        </button>

        <view class="login-link" @click="goto('/pages/login/login')">
          已有账号？去登录
        </view>
      </view>
      
      <!-- 协议同意 -->
      <view class="agree" :class="shakeFlag?'shakeActive':''">
        <label class="radio" @click="changeAll">
          <radio class="a_radio" :value="String(agreeSelect)" :checked="agreeSelect" color="#a371e4" />
        </label>
        <text class="agreeText">勾选即代表已阅读并同意平台“<text class="xy" @click="goto('/pages/login/userAgreement/userAgreement')">使用协议</text>”和“<text class="xy" @click="goto('/pages/login/privacy/privacy')">隐私政策</text>”</text>
        <text v-if="errors.agree" class="error-message agree-error">{{ errors.agree }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getPng, sendEmailCode, userRegister } from '../../util/api/login';
import { useUserStore } from '../../store';

// 表单数据
const userStore=useUserStore()
const email = ref('');
const verifyCode = ref(''); 
const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const captcha = ref('');
const agreeSelect = ref(false);
const shakeFlag = ref(false);
const pngadress = ref('');

// 验证码发送状态
const isSendingCode = ref(false);
const countdown = ref(60);

// 错误信息对象
const errors = ref({
  email: '',
  verifyCode: '', // 新增邮箱验证码错误提示
  username: '',
  password: '',
  confirmPassword: '',
  captcha: '',
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
  
  // 验证图形验证码
  if (!captcha.value) {
    errors.value.captcha = '请输入图形验证码';
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
      // 调用与登录页面相同的验证码发送接口
      const res = await sendEmailCode({
        email: email.value,
        captcha: captcha.value
      });
      
      if (res.data.success) {
        console.log('验证码发送成功');
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
        console.error('验证码发送失败:', res.data.message);
        errors.value.captcha = res.data.message || '图形验证码错误';
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

// 注册处理
const handleRegister = async() => {
  // 重置所有错误信息
  Object.keys(errors.value).forEach(key => {
    errors.value[key] = '';
  });
  
  let isValid = true;
  
  // 验证邮箱
  if (!email.value) {
    errors.value.email = '请输入邮箱地址';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = '请输入有效的邮箱地址';
    isValid = false;
  }
  
  // // 验证邮箱验证码
  // if (!verifyCode.value) {
  //   errors.value.verifyCode = '请输入邮箱验证码';
  //   isValid = false;
  // }
  
  // 验证用户名
  if (!username.value) {
    errors.value.username = '请设置用户名';
    isValid = false;
  } else if (username.value.length < 3 || username.value.length > 20) {
    errors.value.username = '用户名长度应为3-20个字符';
    isValid = false;
  }
  
  // 验证密码
  if (!password.value) {
    errors.value.password = '请设置密码';
    isValid = false;
  } else if (password.value.length < 6) {
    errors.value.password = '密码长度不能少于6位';
    isValid = false;
  } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password.value)) {
    errors.value.password = '密码需包含字母和数字';
    isValid = false;
  }
  
  // 验证确认密码
  if (!confirmPassword.value) {
    errors.value.confirmPassword = '请再次输入密码';
    isValid = false;
  } else if (password.value !== confirmPassword.value) {
    errors.value.confirmPassword = '两次输入的密码不一致';
    isValid = false;
  }
  
  // 验证图形验证码
  if (!captcha.value) {
    errors.value.captcha = '请输入图形验证码';
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
  
  // 所有验证通过，执行注册逻辑
  console.log(`注册信息: 
    邮箱=${email.value}, 
    邮箱验证码=${verifyCode.value},
    用户名=${username.value}, 
    密码=${password.value}, 
    图形验证码=${captcha.value}`);
	const params=`email=${email.value}&nickName=${username.value}
	&registerPassword=${password.value}&checkCode=${captcha.value}&checkCodeKey=${userStore.checkCodeKey}`
	
	const res=await userRegister(params)
	console.log("注册接口返回的值为:",res)
	if (res.data.code === 200) {
	  uni.showToast({
	    title: '注册成功',
	    icon: 'success',
	    duration: 2000
	  });
	  setTimeout(()=>{
		  uni.navigateBack({
			  delta:1
		  })
	  },2000)
	} else {
	  uni.showToast({
	    title: res.data.info || '注册失败', 
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
  console.log(`跳转到: ${url}`);
  // 实际项目中这里会使用路由跳转，例如:
  // uni.navigateTo({ url }) 或 this.$router.push(url)
};
</script>

<style lang="less" scoped>
// 主容器样式，与登录页保持一致
.register-container {
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
  background: rgba(163, 113, 228, 0.05);
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

.register {
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

// 上半部分盒子样式，移除logo并调整
.logoBg {
  padding: 30rpx 0 50rpx;
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
    background: radial-gradient(circle, rgba(163, 113, 228, 0.15) 0%, transparent 70%);
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
  
  .sphere-pink {
    width: 220rpx;
    height: 220rpx;
    background: radial-gradient(circle, rgba(255, 183, 197, 0.8) 0%, rgba(255, 105, 180, 0.4) 100%);
    top: 20rpx;
    left: 20rpx;
    animation-delay: 0s;
  }
  
  .sphere-blue {
    width: 180rpx;
    height: 180rpx;
    background: radial-gradient(circle, rgba(173, 216, 230, 0.8) 0%, rgba(70, 130, 180, 0.4) 100%);
    bottom: 10rpx;
    left: 100rpx;
    animation-delay: 3s; 
  }
  
  .sphere-purple {
    width: 160rpx;
    height: 160rpx;
    background: radial-gradient(circle, rgba(221, 160, 221, 0.8) 0%, rgba(147, 112, 219, 0.4) 100%);
    top: 80rpx;
    right: 50rpx;
    animation-delay: 1.5s;
  }
  
  .app-slogan {
    font-size: 26rpx;
    color: #777;
    letter-spacing: 1rpx;
    opacity: 0.9;
    position: relative;
    z-index: 1;
  }
}

// 注册卡片样式，与登录卡片保持一致
.register-card {
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
    border-bottom-color: #a371e4;
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
    background-color: #f0eaf9;
    color: #a371e4;
    font-size: 26rpx;
    border-radius: 30rpx;
    padding: 0;
    margin-left: 20rpx;
    transition: all 0.3s ease;
  }
  
  .sendCodeBtn:not(:disabled):active {
    background-color: #e1d5f2;
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

// 注册按钮样式，与登录按钮保持一致的设计语言
.registerBtn {
  width: 100%;
  height: 90rpx;
  line-height: 90rpx;
  background: linear-gradient(90deg, #84D26C 0%, #6dc955 100%);
  color: #fff;
  font-size: 36rpx;
  border-radius: 45rpx;
  margin-top: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 8rpx 15rpx rgba(132, 210, 108, 0.3);
  transition: all 0.3s ease;
  border: none;
}

.registerBtn:active {
  transform: translateY(3rpx);
  box-shadow: 0 4rpx 10rpx rgba(132, 210, 108, 0.2);
  background: linear-gradient(90deg, #79c460 0%, #64b84d 100%);
}

// 登录链接样式，与注册链接保持一致
.login-link {
  text-align: right;
  font-size: 26rpx;
  color: #a371e4;
  margin-bottom: 10rpx;
  cursor: pointer;
  transition: color 0.2s ease;
  
  &:active {
    color: #8d5bc9;
  }
}

// 协议同意样式，与登录页保持一致
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
    color: #a371e4;
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

// 动画效果，调整动画参数
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

@keyframes breathe {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes shake {
  10%, 90% { transform: translate3d(-2rpx, 0, 0); }
  20%, 80% { transform: translate3d(+4rpx, 0, 0); }
  30%, 70% { transform: translate3d(-8rpx, 0, 0); }
  40%, 60% { transform: translate3d(+8rpx, 0, 0); }
  50% { transform: translate3d(-8rpx, 0, 0); }
}
</style>
