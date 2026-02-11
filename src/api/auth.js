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
 * @param {string} data.company - 公司名称（招聘者必填）
 * @param {string} data.realName - 真实姓名（可选）
 */
export const register = (data) => {
  return axios.post('/auth/register', data)
}

/**
 * 用户登录
 * @param {Object} data - 登录数据
 * @param {string} data.phone - 手机号
 * @param {string} data.password - 密码
 */
export const login = (data) => {
  return axios.post('/auth/login', data)
}

/**
 * 获取用户信息
 * @param {number} userId - 用户ID
 */
export const getUserInfo = (userId) => {
  return axios.get(`/auth/user/${userId}`)
}

/**
 * 修改密码
 * @param {Object} data - 密码数据
 * @param {string} data.userId - 用户ID
 * @param {string} data.oldPassword - 旧密码
 * @param {string} data.newPassword - 新密码
 */
export const changePassword = (data) => {
  return axios.post('/auth/change-password', data)
}

/**
 * 更新用户信息
 * @param {number} userId - 用户ID
 * @param {Object} data - 更新数据
 * @param {string} data.username - 用户名
 * @param {string} data.email - 邮箱
 * @param {string} data.company - 公司名称
 * @param {string} data.realName - 真实姓名
 */
export const updateUserInfo = (userId, data) => {
  return axios.put(`/auth/user/${userId}`, data)
}

