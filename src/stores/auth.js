/**
 * 认证状态管理 Store
 * 使用 Pinia 管理用户认证状态
 */

import { defineStore } from 'pinia'
import { login as loginApi, register as registerApi, getUserProfile } from '@/api/auth'
import { setToken, getToken, setUser, getUser, clearAuth } from '@/utils/storage'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // 认证 token
    token: getToken() || null,
    // 用户信息
    user: getUser() || null,
    // 是否已认证
    isAuthenticated: !!getToken(),
    // 加载状态
    loading: false
  }),

  getters: {
    /**
     * 是否是管理员
     */
    isAdmin: (state) => state.user?.role === 'ADMIN',

    /**
     * 是否是招聘方
     */
    isRecruiter: (state) => state.user?.role === 'RECRUITER',

    /**
     * 是否是求职者
     */
    isJobSeeker: (state) => state.user?.role === 'JOB_SEEKER',

    /**
     * 用户角色
     */
    userRole: (state) => state.user?.role || null,

    /**
     * 用户角色显示名称
     */
    userRoleDisplay: (state) => {
      const roleMap = {
        'ADMIN': '管理员',
        'RECRUITER': '招聘方',
        'JOB_SEEKER': '求职者'
      }
      return roleMap[state.user?.role] || '未知'
    }
  },

  actions: {
    /**
     * 用户登录
     */
    async login(phone, password) {
      this.loading = true
      try {
        const response = await loginApi({ phone, password })

        if (response.success) {
          // 保存 token 和用户信息
          this.token = response.data.token
          this.user = response.data.user
          this.isAuthenticated = true

          setToken(response.data.token)
          setUser(response.data.user)

          return { success: true }
        } else {
          return { success: false, error: response.error || '登录失败' }
        }
      } catch (error) {
        console.error('登录失败:', error)
        return { success: false, error: error.error || '登录失败，请稍后重试' }
      } finally {
        this.loading = false
      }
    },

    /**
     * 用户注册
     */
    async register(userData) {
      this.loading = true
      try {
        const response = await registerApi(userData)

        if (response.success) {
          return { success: true, message: response.message }
        } else {
          return { success: false, error: response.error || '注册失败' }
        }
      } catch (error) {
        console.error('注册失败:', error)
        return { success: false, error: error.error || '注册失败，请稍后重试' }
      } finally {
        this.loading = false
      }
    },

    /**
     * 获取用户信息
     */
    async fetchUserProfile() {
      try {
        const response = await getUserProfile()

        if (response.success) {
          this.user = response.data
          this.isAuthenticated = true
          setUser(response.data)
        } else {
          // 获取失败，清除认证信息
          this.logout()
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        // 获取失败，清除认证信息
        this.logout()
      }
    },

    /**
     * 用户登出
     */
    logout() {
      this.token = null
      this.user = null
      this.isAuthenticated = false
      clearAuth()
    },

    /**
     * 初始化认证状态
     * 在应用启动时调用，验证 token 是否有效
     */
    async initAuth() {
      if (this.token) {
        await this.fetchUserProfile()
      }
    },

    /**
     * 更新用户信息
     */
    updateUser(userData) {
      this.user = { ...this.user, ...userData }
      setUser(this.user)
    }
  }
})
