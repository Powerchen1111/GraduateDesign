/**
 * 认证相关 API
 */

import axios from './axios'

/**
 * 用户注册
 * @param {Object} data - 注册数据
 * @param {string} data.phone - 手机号
 * @param {string} data.password - 密码
 * @param {string} data.username - 用户名
 * @param {string} data.role - 用户角色 (ADMIN, RECRUITER, JOB_SEEKER)
 * @param {string} data.email - 邮箱（可选）
 */
export const register = (data) => {
  return axios.post('/api/auth/register', data)
}

/**
 * 用户登录
 * @param {Object} data - 登录数据
 * @param {string} data.phone - 手机号
 * @param {string} data.password - 密码
 */
export const login = (data) => {
  return axios.post('/api/auth/login', data)
}

/**
 * 用户登出
 */
export const logout = () => {
  return axios.post('/api/auth/logout')
}

/**
 * 获取当前用户信息
 */
export const getUserProfile = () => {
  return axios.get('/api/user/profile')
}

/**
 * 更新用户信息
 * @param {Object} data - 更新数据
 * @param {string} data.username - 用户名
 * @param {string} data.email - 邮箱
 * @param {string} data.avatarUrl - 头像URL
 */
export const updateUserProfile = (data) => {
  return axios.put('/api/user/profile', data)
}

/**
 * 修改密码
 * @param {Object} data - 密码数据
 * @param {string} data.oldPassword - 旧密码
 * @param {string} data.newPassword - 新密码
 */
export const changePassword = (data) => {
  return axios.post('/api/user/change-password', data)
}

/**
 * 获取用户列表（管理员）
 * @param {Object} params - 查询参数
 * @param {string} params.role - 角色筛选
 * @param {number} params.page - 页码
 * @param {number} params.size - 每页数量
 */
export const getUserList = (params) => {
  return axios.get('/api/user/list', { params })
}

/**
 * 修改用户状态（管理员）
 * @param {number} userId - 用户ID
 * @param {string} status - 新状态 (ACTIVE, DISABLED, LOCKED)
 */
export const updateUserStatus = (userId, status) => {
  return axios.put(`/api/user/${userId}/status`, { status })
}

/**
 * 获取用户统计信息（管理员）
 */
export const getUserStatistics = () => {
  return axios.get('/api/user/statistics')
}
