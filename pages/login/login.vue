<template>
  <view class="login-container">
    <view class="bg-decoration top-left"></view>
    <view class="bg-decoration bottom-right"></view>
    
    <view class="login">
      <view class="logoBg">
        <view class="sphere-container">
          <view class="sphere sphere-pink"></view>
          <view class="sphere sphere-green"></view>
        </view>
        
        <view class="logo-container">
          <image class="toolsbg" src="../../static/img/QYlogo.png" mode="" alt="平台logo"></image>
        </view>
        <view class="app-slogan">高效管理，消息速达</view>
      </view>

      <view class="login-card">
        <view class="loginType">
          <view 
            :class="loginMethod === 'password' ? 'typeActive' : ''" 
            @click="loginMethod = 'password'"
          >
            密码登录
          </view>
          <view 
            :class="loginMethod === 'verifyCode' ? 'typeActive' : ''" 
            @click="loginMethod = 'verifyCode'"
          >
            验证码登录
          </view>
        </view>

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

        <view class="inputItem" v-if="loginMethod === 'password'" :class="errors.password ? 'error' : ''">
          <text class="label">密码</text>
          <input 
            type="password" 
            placeholder="请输入密码" 
            v-model="password"
            class="input"
          />
          <text v-if="errors.password" class="error-message">{{ errors.password }}</text>
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

        <view class="inputItem verifyCodeItem" v-if="loginMethod === 'verifyCode'" :class="errors.verifyCode ? 'error' : ''">
          <text class="label">验证码</text>
          <input 
            type="text" 
            placeholder="请输入验证码" 
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

        <button class="loginBtn" @click="handleLogin">
          登录
        </button>
        <view class="more-view">
			<view class="forget-link" @click="goto('/pages/login/forget')">
			  忘记密码？
			</view>
			<view class="register-link" @click="goto('/pages/login/register')">
			  还没有账号？去注册
			</view>
		</view>
      </view>

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
import { emailLogin, getPng, sendEmailCode, userLogin } from '../../util/api/login';
import { useUserStore } from '../../store';

const userStore=useUserStore()
const loginMethod = ref('password');
const email = ref('');
const password = ref('');
const verifyCode = ref('');
const captcha = ref('');
const isSendingCode = ref(false);
const countdown = ref(60);
const captchaImageUrl = ref('../../static/img/captcha.png');
const agreeSelect = ref(false);
const shakeFlag = ref(false);
const errors = ref({
  email: '',
  password: '',
  verifyCode: '',
  captcha: '',
  agree: ''
});

const pngadress=ref('')

const getverify=async()=>{
	const res=await getPng()
	console.log("返回的图片验证值:",res.data.data.checkCode)
	pngadress.value=res.data.data.checkCode
	console.log("新的钥匙key",res.data.data.checkCodeKey)
	userStore.setCheckCodeKey(res.data.data.checkCodeKey)
}

const changeAll = () => {
  agreeSelect.value = !agreeSelect.value;
  if (agreeSelect.value) {
    errors.value.agree = '';
  }
};

const refreshCaptcha = () => {
  getverify();
  captcha.value = '';
  errors.value.captcha = '';
};

const sendVerifyCode = async() => {
  errors.value.email = '';
  errors.value.captcha = '';
  
  let isValid = true;
  
  if (!email.value) {
    errors.value.email = '请输入邮箱地址';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = '请输入有效的邮箱地址';
    isValid = false;
  }
  
  if (!captcha.value) {
    errors.value.captcha = '请输入图形验证码';
    isValid = false;
  }
  
  if (!isValid) {
    shakeFlag.value = true;
    setTimeout(() => shakeFlag.value = false, 1000);
    return;
  }
  
  isSendingCode.value = true;
  const timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer);
      isSendingCode.value = false;
      countdown.value = 60;
    }
  }, 1000);
  console.log("钥匙key",userStore.checkCodeKey)
  const params=`email=${email.value}&checkCode=${captcha.value}&checkCodeKey=${userStore.checkCodeKey}`
  console.log(params)
  const res= await sendEmailCode(params)
  console.log("发送邮箱验证码返回的结果为",res)
};

const handleLogin = async() => {
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
  
  // 验证图形验证码
  if (!captcha.value) {
    errors.value.captcha = '请输入图形验证码';
    isValid = false;
  }

  if (loginMethod.value === 'password') {
    if (!password.value) {
      errors.value.password = '请输入密码';
      isValid = false;
    }
  } else {
    if (!verifyCode.value) {
      errors.value.verifyCode = '请输入验证码';
      isValid = false;
    }
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
  if (loginMethod.value === 'password') {
    console.log(`密码登录: 邮箱=${email.value}, 密码=${password.value}, 图形验证码=${captcha.value}`);
    const params=`email=${email.value}&password=${password.value}&checkCode=${captcha.value}&checkCodeKey=${userStore.checkCodeKey}`
	const res= await userLogin(params)
	console.log("密码登录接口返回的值为:",res)
	if(res.data.code===200){
		console.log("token的值为",res.data.data.token)
			 uni.setStorageSync('token', res.data.data.token);
				// 可选：同时存储用户信息到Pinia
				uni.setStorageSync('userinfo',res.data.data)
				// userStore.setToken(res.data.data.token);
				
				// 2. 显示登录成功提示

				uni.switchTab({
					url:'/pages/index/index'
				})
				uni.showToast({
				  title: '登录成功',
				  icon: 'none',
				  duration: 1500
				});
		}
	else{
		uni.showToast({
		  title: res.data.info,
		  icon: 'none',
		  duration: 1500
		});
	}
  } else {
    console.log(`验证码登录: 邮箱=${email.value}, 验证码=${verifyCode.value}, 图形验证码=${captcha.value}`);
    const params=`email=${email.value}&emailCode=${verifyCode.value}
	&checkCode=${captcha.value}&checkCodeKey=${userStore.checkCodeKey}`
	const res = await emailLogin(params)
	console.log("验证码登录接口返回的值为:",res)
	if(res.data.code===200){
		console.log("token的值为",res.data.data.token)
			 uni.setStorageSync('token', res.data.data.token);
				// 可选：同时存储用户信息到Pinia
				// userStore.setToken(res.data.data.token);
				
				// 2. 显示登录成功提示
				uni.showToast({
				  title: '登录成功',
				  icon: 'success',
				  duration: 1500
				});
		}
	else{
		uni.showToast({
		  title: res.data.info,
		  icon: 'none',
		  duration: 1500
		});
	}
}};

onMounted(() => {
	getverify()
  refreshCaptcha();
});

const goto = (url) => {
	uni.navigateTo({ url })
};
</script>

<style lang="less" scoped>
// 主容器样式保持不变
.login-container {
  position: relative;
  height: 96vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4eaf1 100%);
  overflow: hidden;
  padding: 20rpx;
}

.bg-decoration {
  position: absolute;
  width: 500rpx;
  height: 500rpx;
  border-radius: 50%;
  background: rgba(163, 113, 228, 0.05);
  z-index: 0;
}

.top-left {
  top: -200rpx;
  left: -200rpx;
}

.bottom-right {
  bottom: -200rpx;
  right: -200rpx;
}

.login {
  position: relative;
  z-index: 1;
  max-width: 600rpx;
  margin: 0 auto;
  padding: -10rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  justify-content: center;
}

// 上半部分盒子优化样式 - 包含3D球体动画
.logoBg {
  padding: 60rpx 0 80rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  width: 100%;
  text-align: center;
  overflow: hidden;
  
  // 添加背景装饰
  &::before {
    content: '';
    position: absolute;
    width: 300rpx;
    height: 300rpx;
    background: radial-gradient(circle, rgba(163, 113, 228, 0.15) 0%, transparent 70%);
    border-radius: 50%;
    z-index: -1;
  }
  
  // 3D旋转球体容器
  .sphere-container {
    position: absolute;
    width: 100%;
    height: 100%;
    perspective: 1000rpx; // 3D透视效果
    z-index: -1; // 确保在logo后面
  }
  
  // 球体样式
  .sphere {
    position: absolute;
    border-radius: 50%;
    opacity: 0.6;
    filter: blur(30rpx); // 模糊效果，增强视觉效果
    animation: rotate 15s infinite linear;
    transform-style: preserve-3d;
  }
  
  // 浅粉色球体
  .sphere-pink {
    width: 200rpx;
    height: 200rpx;
    background: radial-gradient(circle, rgba(255, 183, 197, 0.8) 0%, rgba(255, 105, 180, 0.4) 100%);
    top: 50rpx;
    left: 50rpx;
    animation-delay: 0s;
  }
  
  // 浅绿色球体
  .sphere-green {
    width: 180rpx;
    height: 180rpx;
    background: radial-gradient(circle, rgba(144, 238, 144, 0.8) 0%, rgba(60, 179, 113, 0.4) 100%);
    bottom: 50rpx;
    right: 50rpx;
    animation-delay: 2s; 
  }
  
  .logo-container {
    position: relative;
    margin-bottom: 40rpx;
    animation: breathe 3s infinite ease-in-out;
  }
  
  .toolsbg {
    width: 210rpx;
    height: 230rpx;
    border-radius: 50%;
    box-shadow: 0 15rpx 30rpx rgba(163, 113, 228, 0.2);
    background-color: #fff;
    padding: 25rpx;
    transition: transform 0.3s ease;
    
    &:hover {
      transform: scale(1.05);
    }
  }
  
  .app-name {
    font-size: 42rpx;
    color: #333;
    font-weight: 700;
    letter-spacing: 3rpx;
    margin-bottom: 15rpx;
    text-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  }
  
  .app-slogan {
    font-size: 26rpx;
    color: #777;
    letter-spacing: 1rpx;
    opacity: 0.9;
  }
}

// 登录卡片及其他样式保持不变
.login-card {
  width: 100%;
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 24rpx;
  padding: 50rpx 40rpx;
  box-shadow: 0 15rpx 50rpx rgba(0, 0, 0, 0.08);
  margin-bottom: 40rpx;
}

.loginType {
  display: flex;
  border-bottom: 1px solid #eee;
  margin-bottom: 50rpx;
  
  view {
    flex: 1;
    text-align: center;
    padding: 15rpx 0;
    font-size: 32rpx;
    color: #666;
    position: relative;
    transition: all 0.3s ease;
    cursor: pointer;
  }
  
  view:active {
    opacity: 0.8;
  }
  
  .typeActive {
    color: #a371e4;
    font-weight: bold;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      width: 100%;
      height: 3rpx;
      background-color: #a371e4;
    }
  }
}

.inputItem {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
  padding-bottom: 15rpx;
  border-bottom: 1px solid #eee;
  transition: border-color 0.3s ease;
  
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
  
  // 新增的图形验证图片样式
  .label-image {
    width: 140rpx;
    height: 60rpx;
    object-fit: contain;
    cursor: pointer;
    transition: transform 0.2s ease;
  }
  
  .label-image:active {
    transform: scale(0.95);
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

.verifyCodeItem {
  position: relative;
  
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
  position: relative;
  
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

.loginBtn {
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

.loginBtn:active {
  transform: translateY(3rpx);
  box-shadow: 0 4rpx 10rpx rgba(132, 210, 108, 0.2);
  background: linear-gradient(90deg, #79c460 0%, #64b84d 100%);
}
.more-view{
	display: flex;
	padding-top:30rpx ;
	justify-content: space-between;
}
.forget-link{
	text-align: left;
	font-size: 26rpx;
	color: #a371e4;
	margin-bottom: 10rpx;
	cursor: pointer;
	transition: color 0.2s ease;
	
	&:active {
	  color: #8d5bc9;
	}
}
// 注册链接样式
.register-link {
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

.forgot-password {
  text-align: right;
  width: 100%;
  font-size: 26rpx;
  color: #a371e4;
  margin-top: 10rpx;
  cursor: pointer;
  transition: color 0.2s ease;
}

.forgot-password:active {
  color: #8d5bc9;
}

.agree {
  margin-top: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #666;
  max-width: 520rpx;
  text-align: center;
  position: relative;
  
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

.shakeActive {
  animation: shake 1s ease-in-out;
}

// 新增3D旋转动画
@keyframes rotate {
  0% {
    transform: rotateX(0deg) rotateY(0deg) translateZ(0rpx);
  }
  100% {
    transform: rotateX(360deg) rotateY(360deg) translateZ(0rpx);
  }
}

// 呼吸动画
@keyframes breathe {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

// 抖动动画
@keyframes shake {
  10%, 90% { transform: translate3d(-2rpx, 0, 0); }
  20%, 80% { transform: translate3d(+4rpx, 0, 0); }
  30%, 70% { transform: translate3d(-8rpx, 0, 0); }
  40%, 60% { transform: translate3d(+8rpx, 0, 0); }
  50% { transform: translate3d(-8rpx, 0, 0); }
}
</style>
