import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
	const token=ref(uni.getStorageSync('userinfo').token)
	const anId=ref('')
	const checkCodeKey=ref('')
	
	const setToken=(tk)=>{
		token.value=tk
	}
	const setCheckCodeKey=(str)=>{
		checkCodeKey.value=str
	}
	const setAnId=(id)=>{
		anId.value=id
	}
  return {
    token,
    checkCodeKey,
	anId,
	setAnId,
	setToken,
	setCheckCodeKey
  }
})