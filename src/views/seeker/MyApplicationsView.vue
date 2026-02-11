<template>
  <div class="my-applications-container">
    <div class="page-header">
      <h2>我的投递</h2>
      <p>查看您的所有简历投递记录</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">{{ totalApplications }}</div>
        <div class="stat-label">全部投递</div>
      </div>
      <div class="stat-card pending">
        <div class="stat-value">{{ pendingCount }}</div>
        <div class="stat-label">待处理</div>
      </div>
      <div class="stat-card interview">
        <div class="stat-value">{{ interviewCount }}</div>
        <div class="stat-label">面试邀请</div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <div class="filter-tabs">
        <button
          v-for="status in statusOptions"
          :key="status.value"
          :class="['tab', { active: currentStatus === status.value }]"
          @click="currentStatus = status.value"
        >
          {{ status.label }}
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 投递列表 -->
    <div v-else-if="filteredApplications.length > 0" class="applications-list">
      <div v-for="app in filteredApplications" :key="app.id" class="application-card">
        <div class="app-main">
          <div class="app-info">
            <h3>{{ app.jobTitle }}</h3>
            <div class="app-meta">
              <span>🏢 {{ app.companyName }}</span>
              <span>📍 {{ app.location }}</span>
              <span>💰 {{ app.salaryRange }}</span>
            </div>
            <div class="app-time">
              投递于 {{ formatTime(app.applyTime) }}
            </div>
          </div>

          <div class="app-status">
            <span :class="['status-badge', getStatusClass(app.status)]">
              {{ getStatusText(app.status) }}
            </span>
          </div>
        </div>

        <div v-if="app.note" class="app-note">
          <strong>备注：</strong>{{ app.note }}
        </div>

        <div class="app-actions">
          <button class="action-btn" @click="viewJob(app.jobId)">
            查看职位
          </button>
          <button
            v-if="app.status === 'PENDING'"
            class="action-btn danger"
            @click="confirmWithdraw(app)"
          >
            撤回投递
          </button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-icon">📝</div>
      <h3>还没有投递记录</h3>
      <p>浏览职位并投递简历，开始您的求职之旅</p>
      <button class="primary-btn" @click="goToJobs">
        浏览职位
      </button>
    </div>

    <!-- 撤回确认对话框 -->
    <div v-if="showWithdrawDialog" class="dialog-overlay" @click="showWithdrawDialog = false">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h3>确认撤回</h3>
        </div>
        <div class="dialog-body">
          <p>确定要撤回对"{{ appToWithdraw?.jobTitle }}"的投递吗？</p>
        </div>
        <div class="dialog-footer">
          <button class="secondary-btn" @click="showWithdrawDialog = false">
            取消
          </button>
          <button class="danger-btn" @click="withdrawApplication" :disabled="withdrawing">
            {{ withdrawing ? '撤回中...' : '确认撤回' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getSeekerApplications, deleteApplication } from '@/api/application'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'MyApplicationsView',
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },
  data() {
    return {
      applications: [],
      loading: false,
      currentStatus: 'ALL',
      statusOptions: [
        { label: '全部', value: 'ALL' },
        { label: '待处理', value: 'PENDING' },
        { label: '已查看', value: 'VIEWED' },
        { label: '面试', value: 'INTERVIEW' },
        { label: '已拒绝', value: 'REJECTED' },
        { label: '已录用', value: 'ACCEPTED' }
      ],
      showWithdrawDialog: false,
      appToWithdraw: null,
      withdrawing: false
    }
  },
  computed: {
    filteredApplications() {
      if (this.currentStatus === 'ALL') {
        return this.applications
      }
      return this.applications.filter(app => app.status === this.currentStatus)
    },
    totalApplications() {
      return this.applications.length
    },
    pendingCount() {
      return this.applications.filter(app => app.status === 'PENDING').length
    },
    interviewCount() {
      return this.applications.filter(app => app.status === 'INTERVIEW').length
    }
  },
  mounted() {
    this.loadApplications()
  },
  methods: {
    async loadApplications() {
      this.loading = true
      try {
        const response = await getSeekerApplications(this.authStore.user.id)
        console.log('投递记录响应:', response)
        this.applications = response.applications || []
      } catch (error) {
        console.error('加载投递记录失败:', error)
        this.applications = []
      } finally {
        this.loading = false
      }
    },

    getStatusClass(status) {
      const map = {
        'PENDING': 'pending',
        'VIEWED': 'viewed',
        'INTERVIEW': 'interview',
        'REJECTED': 'rejected',
        'ACCEPTED': 'accepted'
      }
      return map[status] || ''
    },

    getStatusText(status) {
      const map = {
        'PENDING': '待处理',
        'VIEWED': '已查看',
        'INTERVIEW': '面试邀请',
        'REJECTED': '已拒绝',
        'ACCEPTED': '已录用'
      }
      return map[status] || status
    },

    formatTime(timestamp) {
      if (!timestamp) return '未知'
      const date = new Date(timestamp)
      return date.toLocaleString('zh-CN')
    },

    viewJob(jobId) {
      this.$router.push(`/jobs/${jobId}`)
    },

    confirmWithdraw(app) {
      this.appToWithdraw = app
      this.showWithdrawDialog = true
    },

    async withdrawApplication() {
      if (!this.appToWithdraw) return

      this.withdrawing = true
      try {
        await deleteApplication(this.appToWithdraw.id, this.authStore.user.id)
        alert('投递已撤回')
        this.showWithdrawDialog = false
        this.appToWithdraw = null
        this.loadApplications()
      } catch (error) {
        console.error('撤回失败:', error)
        alert('撤回失败')
      } finally {
        this.withdrawing = false
      }
    },

    goToJobs() {
      this.$router.push('/jobs')
    }
  }
}
</script>

<style scoped>
.my-applications-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h2 {
  font-size: 28px;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.page-header p {
  color: #666;
  margin: 0;
}

.primary-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #42b983 0%, #35495e 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: transform 0.2s;
}

.primary-btn:hover {
  transform: translateY(-2px);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  text-align: center;
}

.stat-card.pending {
  background: linear-gradient(135deg, #ffa726 0%, #fb8c00 100%);
  color: white;
}

.stat-card.interview {
  background: linear-gradient(135deg, #42b983 0%, #35495e 100%);
  color: white;
}

.stat-value {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.8;
}

.filter-bar {
  background: white;
  padding: 16px 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tab {
  padding: 8px 20px;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: all 0.2s;
}

.tab:hover {
  background: #f5f5f5;
}

.tab.active {
  background: #42b983;
  color: white;
}

.loading {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  margin: 0 auto 16px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #42b983;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.applications-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.application-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.app-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.app-info h3 {
  font-size: 20px;
  color: #2c3e50;
  margin: 0 0 12px 0;
}

.app-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.app-time {
  font-size: 13px;
  color: #999;
}

.app-status {
  flex-shrink: 0;
}

.status-badge {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.status-badge.pending {
  background: #fff3e0;
  color: #f57c00;
}

.status-badge.viewed {
  background: #e3f2fd;
  color: #1976d2;
}

.status-badge.interview {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-badge.rejected {
  background: #ffebee;
  color: #c62828;
}

.status-badge.accepted {
  background: #e8f5e9;
  color: #2e7d32;
}

.app-note {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
}

.app-actions {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.action-btn {
  padding: 8px 16px;
  background: white;
  color: #42b983;
  border: 1px solid #42b983;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #42b983;
  color: white;
}

.action-btn.danger {
  color: #f56c6c;
  border-color: #f56c6c;
}

.action-btn.danger:hover {
  background: #f56c6c;
  color: white;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-state h3 {
  color: #2c3e50;
  margin: 0 0 12px 0;
  font-size: 20px;
}

.empty-state p {
  color: #999;
  margin: 0 0 24px 0;
  font-size: 14px;
}

/* 对话框样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.dialog-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  color: #2c3e50;
}

.dialog-body {
  padding: 24px;
}

.dialog-body p {
  margin: 0;
  color: #666;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e0e0e0;
}

.secondary-btn {
  padding: 10px 20px;
  background: white;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.danger-btn {
  padding: 10px 20px;
  background: #f56c6c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.danger-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .app-main {
    flex-direction: column;
    gap: 12px;
  }

  .app-actions {
    flex-wrap: wrap;
  }

  .action-btn {
    flex: 1;
  }
}
</style>
