<template>
  <div class="profile-container">
    <div class="profile-card">
      <div class="profile-header">
        <h2>个人信息</h2>
      </div>

      <div v-if="loading" class="loading">加载中...</div>

      <div v-else-if="user" class="profile-content">
        <div class="info-item">
          <label>手机号</label>
          <div class="info-value">{{ user.phone }}</div>
        </div>

        <div class="info-item">
          <label>用户名</label>
          <input
            v-model="formData.username"
            type="text"
            placeholder="请输入用户名"
          />
        </div>

        <div class="info-item">
          <label>邮箱</label>
          <input
            v-model="formData.email"
            type="email"
            placeholder="请输入邮箱"
          />
        </div>

        <div class="info-item">
          <label>用户角色</label>
          <div class="info-value role-badge">{{ roleDisplay }}</div>
        </div>

        <div class="info-item">
          <label>账号状态</label>
          <div class="info-value">
            <span :class="['status-badge', statusClass]">{{ statusDisplay }}</span>
          </div>
        </div>

        <div class="info-item">
          <label>注册时间</label>
          <div class="info-value">{{ formatDate(user.createdAt) }}</div>
        </div>

        <div class="info-item">
          <label>最后登录</label>
          <div class="info-value">{{ user.lastLoginTime ? formatDate(user.lastLoginTime) : '未记录' }}</div>
        </div>

        <div v-if="errorMessage" class="error-banner">
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="success-banner">
          {{ successMessage }}
        </div>

        <div class="button-group">
          <button class="save-button" @click="handleUpdate">保存修改</button>
          <button class="secondary-button" @click="goToChangePassword">修改密码</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import { updateUserProfile } from '@/api/auth'

export default {
  name: 'ProfileView',
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },
  data() {
    return {
      loading: true,
      formData: {
        username: '',
        email: ''
      },
      errorMessage: '',
      successMessage: ''
    }
  },
  computed: {
    user() {
      return this.authStore.user
    },
    roleDisplay() {
      return this.authStore.userRoleDisplay
    },
    statusDisplay() {
      const statusMap = {
        'ACTIVE': '正常',
        'DISABLED': '已禁用',
        'LOCKED': '已锁定'
      }
      return statusMap[this.user?.status] || '未知'
    },
    statusClass() {
      const classMap = {
        'ACTIVE': 'status-active',
        'DISABLED': 'status-disabled',
        'LOCKED': 'status-locked'
      }
      return classMap[this.user?.status] || ''
    }
  },
  async mounted() {
    await this.loadUserProfile()
  },
  methods: {
    async loadUserProfile() {
      this.loading = true
      try {
        await this.authStore.fetchUserProfile()
        if (this.user) {
          this.formData.username = this.user.username || ''
          this.formData.email = this.user.email || ''
        }
      } catch (error) {
        this.errorMessage = '加载用户信息失败'
      } finally {
        this.loading = false
      }
    },

    async handleUpdate() {
      this.errorMessage = ''
      this.successMessage = ''

      try {
        const response = await updateUserProfile(this.formData)
        if (response.success) {
          this.authStore.updateUser(response.data)
          this.successMessage = '保存成功'
        } else {
          this.errorMessage = response.error || '保存失败'
        }
      } catch (error) {
        this.errorMessage = error.error || '保存失败'
      }
    },

    goToChangePassword() {
      this.$router.push('/change-password')
    },

    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN')
    }
  }
}
</script>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 40px auto;
  padding: 0 20px;
}

.profile-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.profile-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 30px;
}

.profile-header h2 {
  margin: 0;
  font-size: 20px;
}

.loading {
  padding: 40px;
  text-align: center;
  color: #999;
}

.profile-content {
  padding: 30px;
}

.info-item {
  margin-bottom: 20px;
}

.info-item label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.info-value {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 5px;
  font-size: 14px;
  color: #333;
}

.info-item input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  box-sizing: border-box;
}

.info-item input:focus {
  outline: none;
  border-color: #667eea;
}

.role-badge {
  display: inline-block;
  padding: 6px 12px;
  background: #ecf5ff;
  color: #409eff;
  border-radius: 4px;
  font-weight: 500;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-active {
  background: #f0f9ff;
  color: #67c23a;
}

.status-disabled {
  background: #fef0f0;
  color: #f56c6c;
}

.status-locked {
  background: #fdf6ec;
  color: #e6a23c;
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

.save-button,
.secondary-button {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.3s;
}

.save-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.secondary-button {
  background: #f5f7fa;
  color: #606266;
}

.save-button:hover,
.secondary-button:hover {
  opacity: 0.9;
}
</style>
