/**
 * Axios 配置和拦截器
 * 统一管理 HTTP 请求
 */

import axios from 'axios'
import { getToken, clearAuth } from '@/utils/storage'
import router from '@/router'

// 创建 axios 实例
const instance = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 自动添加 token 到请求头
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    // 直接返回响应数据
    return response.data
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          // 未授权，清除 token 并跳转登录
          console.error('未授权，请重新登录')
          clearAuth()
          router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } })
          break
        case 403:
          // 无权限
          console.error('无权限访问该资源')
          alert('无权限访问该资源')
          break
        case 409:
          // 冲突（如用户已存在）
          console.error('资源冲突:', data.error)
          break
        case 500:
          // 服务器错误
          console.error('服务器错误')
          alert('服务器错误，请稍后重试')
          break
        default:
          console.error('请求失败:', data.error || '未知错误')
      }

      // 返回错误信息
      return Promise.reject(data || { error: '请求失败' })
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error('网络错误，请检查网络连接')
      alert('网络错误，请检查网络连接')
      return Promise.reject({ error: '网络错误' })
    } else {
      // 其他错误
      console.error('请求配置错误:', error.message)
      return Promise.reject({ error: error.message })
    }
  }
)

export default instance
