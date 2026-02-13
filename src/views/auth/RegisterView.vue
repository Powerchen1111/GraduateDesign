<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <h2>用户注册</h2>
        <p>AI 智能招聘平台</p>
      </div>

      <div class="register-form">
        <div class="form-item">
          <label>手机号 <span class="required">*</span></label>
          <input
            v-model="formData.phone"
            type="text"
            placeholder="请输入手机号"
            maxlength="11"
          />
          <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
        </div>

        <div class="form-item">
          <label>密码 <span class="required">*</span></label>
          <input
            v-model="formData.password"
            type="password"
            placeholder="请输入密码（至少6位）"
          />
          <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
        </div>

        <div class="form-item">
          <label>确认密码 <span class="required">*</span></label>
          <input
            v-model="formData.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
          />
          <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
        </div>

        <div class="form-item">
          <label>用户名</label>
          <input
            v-model="formData.username"
            type="text"
            placeholder="请输入用户名（可选）"
          />
        </div>

        <div class="form-item">
          <label>真实姓名</label>
          <input
            v-model="formData.realName"
            type="text"
            placeholder="请输入真实姓名（可选）"
          />
        </div>

        <div class="form-item">
          <label>邮箱</label>
          <input
            v-model="formData.email"
            type="email"
            placeholder="请输入邮箱（可选）"
          />
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
        </div>

        <div class="form-item">
          <label>用户角色 <span class="required">*</span></label>
          <select v-model="formData.role">
            <option value="">请选择角色</option>
            <option value="JOB_SEEKER">求职者</option>
            <option value="RECRUITER">招聘方/HR</option>
          </select>
          <span v-if="errors.role" class="error-message">{{ errors.role }}</span>
        </div>

        <div v-if="formData.role === 'RECRUITER'" class="form-item">
          <label>公司名称 <span class="required">*</span></label>
          <input
            v-model="formData.company"
            type="text"
            placeholder="请输入公司名称"
          />
          <span v-if="errors.company" class="error-message">{{ errors.company }}</span>
        </div>

        <div v-if="errorMessage" class="error-banner">
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="success-banner">
          {{ successMessage }}
        </div>

        <button
          class="register-button"
          :disabled="authStore.loading"
          @click="handleRegister"
        >
          {{ authStore.loading ? '注册中...' : '注册' }}
        </button>

        <div class="register-footer">
          <router-link to="/login">已有账号？立即登录</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import { validatePhone, validateEmail, validatePassword } from '@/utils/validators'

export default {
  name: 'RegisterView',
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },
  data() {
    return {
      formData: {
        phone: '',
        password: '',
        confirmPassword: '',
        username: '',
        realName: '',
        email: '',
        role: '',
        company: ''
      },
      errors: {},
      errorMessage: '',
      successMessage: ''
    }
  },
  methods: {
    validateForm() {
      this.errors = {}
      this.errorMessage = ''
      this.successMessage = ''

      // 验证手机号
      if (!this.formData.phone) {
        this.errors.phone = '请输入手机号'
        return false
      }
      if (!validatePhone(this.formData.phone)) {
        this.errors.phone = '手机号格式不正确'
        return false
      }

      // 验证密码
      if (!this.formData.password) {
        this.errors.password = '请输入密码'
        return false
      }
      if (!validatePassword(this.formData.password)) {
        this.errors.password = '密码至少6位'
        return false
      }

      // 验证确认密码
      if (!this.formData.confirmPassword) {
        this.errors.confirmPassword = '请再次输入密码'
        return false
      }
      if (this.formData.password !== this.formData.confirmPassword) {
        this.errors.confirmPassword = '两次密码输入不一致'
        return false
      }

      // 验证邮箱（可选）
      if (this.formData.email && !validateEmail(this.formData.email)) {
        this.errors.email = '邮箱格式不正确'
        return false
      }

      // 验证角色
      if (!this.formData.role) {
        this.errors.role = '请选择用户角色'
        return false
      }

      // 验证公司名称（招聘者必填）
      if (this.formData.role === 'RECRUITER' && !this.formData.company) {
        this.errors.company = '招聘方必须填写公司名称'
        return false
      }

      return true
    },

    async handleRegister() {
      if (!this.validateForm()) {
        return
      }

      // eslint-disable-next-line no-unused-vars
      const { confirmPassword, ...registerData } = this.formData
      const result = await this.authStore.register(registerData)

      if (result.success) {
        this.successMessage = '注册成功！3秒后跳转到登录页面...'
        setTimeout(() => {
          this.$router.push('/login')
        }, 3000)
      } else {
        this.errorMessage = result.error || '注册失败'
      }
    }
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px 0;
}

.register-card {
  width: 450px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.register-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  text-align: center;
}

.register-header h2 {
  margin: 0 0 10px 0;
  font-size: 24px;
}

.register-header p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.register-form {
  padding: 30px;
  max-height: 70vh;
  overflow-y: auto;
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

.required {
  color: #f56c6c;
}

.form-item input,
.form-item select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.3s;
}

.form-item input:focus,
.form-item select:focus {
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

.success-banner {
  padding: 12px;
  background: #f0f9ff;
  border: 1px solid #d1e7fd;
  border-radius: 5px;
  color: #409eff;
  font-size: 14px;
  margin-bottom: 20px;
}

.register-button {
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

.register-button:hover:not(:disabled) {
  opacity: 0.9;
}

.register-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.register-footer {
  text-align: center;
  margin-top: 20px;
}

.register-footer a {
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
}

.register-footer a:hover {
  text-decoration: underline;
}
</style>
