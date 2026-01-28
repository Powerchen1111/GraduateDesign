/**
 * LocalStorage 封装工具
 * 用于管理 token 和用户信息的本地存储
 */

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'user_info'

/**
 * 保存 token
 */
export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token)
}

/**
 * 获取 token
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * 移除 token
 */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY)
}

/**
 * 保存用户信息
 */
export const setUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

/**
 * 获取用户信息
 */
export const getUser = () => {
  const user = localStorage.getItem(USER_KEY)
  return user ? JSON.parse(user) : null
}

/**
 * 移除用户信息
 */
export const removeUser = () => {
  localStorage.removeItem(USER_KEY)
}

/**
 * 清除所有认证信息
 */
export const clearAuth = () => {
  removeToken()
  removeUser()
}
