<template>
  <div class="change-password-container">
    <div class="change-password-card">
      <div class="change-password-header">
        <h2>修改密码</h2>
      </div>

      <div class="change-password-form">
        <div class="form-item">
          <label>旧密码 <span class="required">*</span></label>
          <input
            v-model="formData.oldPassword"
            type="password"
            placeholder="请输入旧密码"
          />
          <span v-if="errors.oldPassword" class="error-message">{{ errors.oldPassword }}</span>
        </div>

        <div class="form-item">
          <label>新密码 <span class="required">*</span></label>
          <input
            v-model="formData.newPassword"
            type="password"
            placeholder="请输入新密码（至少6位）"
          />
          <span v-if="errors.newPassword" class="error-message">{{ errors.newPassword }}</span>
        </div>

        <div class="form-item">
          <label>确认新密码 <span class="required">*</span></label>
          <input
            v-model="formData.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
          />
          <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
        </div>

        <div v-if="errorMessage" class="error-banner">
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="success-banner">
          {{ successMessage }}
        </div>

        <div class="button-group">
          <button class="submit-button" :disabled="loading" @click="handleSubmit">
            {{ loading ? '提交中...' : '确认修改' }}
          </button>
          <button class="cancel-button" @click="goBack">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { changePassword } from '@/api/auth'
import { validatePassword } from '@/utils/validators'

export default {
  name: 'ChangePasswordView',
  data() {
    return {
      formData: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      errors: {},
      errorMessage: '',
      successMessage: '',
      loading: false
    }
  },
  methods: {
    validateForm() {
      this.errors = {}
      this.errorMessage = ''
      this.successMessage = ''

      if (!this.formData.oldPassword) {
        this.errors.oldPassword = '请输入旧密码'
        return false
      }

      if (!this.formData.newPassword) {
        this.errors.newPassword = '请输入新密码'
        return false
      }

      if (!validatePassword(this.formData.newPassword)) {
        this.errors.newPassword = '新密码至少6位'
        return false
      }

      if (!this.formData.confirmPassword) {
        this.errors.confirmPassword = '请再次输入新密码'
        return false
      }

      if (this.formData.newPassword !== this.formData.confirmPassword) {
        this.errors.confirmPassword = '两次密码输入不一致'
        return false
      }

      if (this.formData.oldPassword === this.formData.newPassword) {
        this.errors.newPassword = '新密码不能与旧密码相同'
        return false
      }

      return true
    },

    async handleSubmit() {
      if (!this.validateForm()) {
        return
      }

      this.loading = true
      try {
        const { confirmPassword, ...data } = this.formData
        const response = await changePassword(data)

        if (response.success) {
          this.successMessage = '密码修改成功！3秒后返回个人信息页面...'
          setTimeout(() => {
            this.$router.push('/profile')
          }, 3000)
        } else {
          this.errorMessage = response.error || '修改失败'
        }
      } catch (error) {
        this.errorMessage = error.error || '修改失败'
      } finally {
        this.loading = false
      }
    },

    goBack() {
      this.$router.back()
    }
  }
}
</script>

<style scoped>
.change-password-container {
  max-width: 500px;
  margin: 40px auto;
  padding: 0 20px;
}

.change-password-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.change-password-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 30px;
}

.change-password-header h2 {
  margin: 0;
  font-size: 20px;
}

.change-password-form {
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

.required {
  color: #f56c6c;
}

.form-item input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  box-sizing: border-box;
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

.success-banner {
  padding: 12px;
  background: #f0f9ff;
  border: 1px solid #d1e7fd;
  border-radius: 5px;
  color: #67c23a;
  font-size: 14px;
  margin-bottom: 20px;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 30px;
}

.submit-button,
.cancel-button {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.3s;
}

.submit-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.cancel-button {
  background: #f5f7fa;
  color: #606266;
}

.submit-button:hover:not(:disabled),
.cancel-button:hover {
  opacity: 0.9;
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
