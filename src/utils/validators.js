/**
 * 表单验证工具
 * 提供常用的验证规则
 */

/**
 * 验证手机号
 */
export const validatePhone = (phone) => {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

/**
 * 验证邮箱
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 验证密码强度（至少6位）
 */
export const validatePassword = (password) => {
  return password && password.length >= 6
}

/**
 * 手机号验证规则（用于表单）
 */
export const phoneRules = [
  { required: true, message: '请输入手机号' },
  {
    validator: (rule, value) => {
      if (!value) return true
      return validatePhone(value)
    },
    message: '手机号格式不正确'
  }
]

/**
 * 密码验证规则（用于表单）
 */
export const passwordRules = [
  { required: true, message: '请输入密码' },
  { min: 6, message: '密码至少6位' },
  { max: 20, message: '密码最多20位' }
]

/**
 * 邮箱验证规则（用于表单）
 */
export const emailRules = [
  {
    validator: (rule, value) => {
      if (!value) return true
      return validateEmail(value)
    },
    message: '邮箱格式不正确'
  }
]

/**
 * 用户名验证规则（用于表单）
 */
export const usernameRules = [
  { max: 100, message: '用户名最多100个字符' }
]
