/**
 * Axios 配置和拦截器
 * 统一管理 HTTP 请求
 */

import axios from 'axios'
import { clearAuth } from '@/utils/storage'
import router from '@/router'

// 创建 axios 实例
const instance = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 120000, // 120秒，适合大文件上传和AI解析
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 后端不使用 JWT token，直接返回配置
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
    // 处理超时错误
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.error('请求超时，请稍后重试')
      alert('请求超时，文件可能较大或网络较慢，请稍后重试')
      return Promise.reject({ error: '请求超时' })
    }

    // 处理网络错误
    if (error.code === 'ERR_NETWORK' || !error.response) {
      console.error('网络错误，请检查网络连接')
      alert('网络连接失败，请检查网络后重试')
      return Promise.reject({ error: '网络错误' })
    }

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
        case 413:
          // 文件太大
          console.error('文件太大')
          alert('文件太大，请上传小于10MB的文件')
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
    } else {
      // 其他错误
      console.error('请求配置错误:', error.message)
      return Promise.reject({ error: error.message })
    }
  }
)

export default instance
