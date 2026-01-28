<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h2>用户登录</h2>
        <p>AI 智能招聘平台</p>
      </div>

      <div class="login-form">
        <div class="form-item">
          <label>手机号</label>
          <input
            v-model="formData.phone"
            type="text"
            placeholder="请输入手机号"
            maxlength="11"
            @keyup.enter="handleLogin"
          />
          <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
        </div>

        <div class="form-item">
          <label>密码</label>
          <input
            v-model="formData.password"
            type="password"
            placeholder="请输入密码"
            @keyup.enter="handleLogin"
          />
          <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
        </div>

        <div v-if="errorMessage" class="error-banner">
          {{ errorMessage }}
        </div>

        <button
          class="login-button"
          :disabled="authStore.loading"
          @click="handleLogin"
        >
          {{ authStore.loading ? '登录中...' : '登录' }}
        </button>

        <div class="login-footer">
          <router-link to="/register">还没有账号？立即注册</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import { validatePhone, validatePassword } from '@/utils/validators'

export default {
  name: 'LoginView',
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },
  data() {
    return {
      formData: {
        phone: '',
        password: ''
      },
      errors: {},
      errorMessage: ''
    }
  },
  methods: {
    validateForm() {
      this.errors = {}
      this.errorMessage = ''

      if (!this.formData.phone) {
        this.errors.phone = '请输入手机号'
        return false
      }
      if (!validatePhone(this.formData.phone)) {
        this.errors.phone = '手机号格式不正确'
        return false
      }
      if (!this.formData.password) {
        this.errors.password = '请输入密码'
        return false
      }
      if (!validatePassword(this.formData.password)) {
        this.errors.password = '密码至少6位'
        return false
      }

      return true
    },

    async handleLogin() {
      if (!this.validateForm()) {
        return
      }

      const result = await this.authStore.login(
        this.formData.phone,
        this.formData.password
      )

      if (result.success) {
        // 登录成功，跳转到首页或重定向页面
        const redirect = this.$route.query.redirect || '/'
        this.$router.push(redirect)
      } else {
        // 显示错误消息
        this.errorMessage = result.error || '登录失败'
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 400px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.login-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  text-align: center;
}

.login-header h2 {
  margin: 0 0 10px 0;
  font-size: 24px;
}

.login-header p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.login-form {
  padding: 30px;
}

.form-item {
  margin-bottom: 20px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.form-item input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.3s;
}

.form-item input:focus {
  outline: none;
  border-color: #667eea;
}

.error-message {
  display: block;
  margin-top: 5px;
  font-size: 12px;
  color: #f56c6c;
}

.error-banner {
  padding: 12px;
  background: #fef0f0;
  border: 1px solid #fde2e2;
  border-radius: 5px;
  color: #f56c6c;
  font-size: 14px;
  margin-bottom: 20px;
}

.login-button {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.3s;
}

.login-button:hover:not(:disabled) {
  opacity: 0.9;
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
}

.login-footer a {
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
}

.login-footer a:hover {
  text-decoration: underline;
}
</style>
