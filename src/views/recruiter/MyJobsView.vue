<template>
  <div class="my-jobs-container">
    <div class="page-header">
      <h2>我的职位</h2>
      <button class="primary-btn" @click="goToPublish">
        + 发布新职位
      </button>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">{{ totalJobs }}</div>
        <div class="stat-label">全部职位</div>
      </div>
      <div class="stat-card active">
        <div class="stat-value">{{ activeJobs }}</div>
        <div class="stat-label">招聘中</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ totalApplications }}</div>
        <div class="stat-label">收到简历</div>
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

    <!-- 职位列表 -->
    <div v-else-if="filteredJobs.length > 0" class="jobs-list">
      <div v-for="job in filteredJobs" :key="job.id" class="job-card">
        <div class="job-main">
          <div class="job-info">
            <h3>{{ job.title }}</h3>
            <div class="job-meta">
              <span>📍 {{ job.location }}</span>
              <span>💰 {{ getSalaryRange(job) }}</span>
              <span>👁️ {{ job.viewCount || 0 }} 浏览</span>
              <span>📝 {{ job.applicationCount || 0 }} 投递</span>
            </div>
            <div class="job-time">
              发布于 {{ formatTime(job.publishTime) }}
            </div>
          </div>

          <div class="job-status">
            <span :class="['status-badge', getStatusClass(job.status)]">
              {{ getStatusText(job.status) }}
            </span>
          </div>
        </div>

        <div class="job-actions">
          <button class="action-btn" @click="viewJob(job.id)">
            查看详情
          </button>
          <button class="action-btn" @click="editJob(job.id)">
            编辑
          </button>
          <button
            v-if="job.status === 'ACTIVE'"
            class="action-btn"
            @click="pauseJob(job.id)"
          >
            暂停招聘
          </button>
          <button
            v-else-if="job.status === 'PAUSED'"
            class="action-btn"
            @click="activateJob(job.id)"
          >
            恢复招聘
          </button>
          <button class="action-btn danger" @click="confirmDelete(job)">
            删除
          </button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-icon">📋</div>
      <h3>还没有发布职位</h3>
      <p>发布您的第一个职位，开始招聘优秀人才</p>
      <button class="primary-btn" @click="goToPublish">
        发布职位
      </button>
    </div>

    <!-- 删除确认对话框 -->
    <div v-if="showDeleteDialog" class="dialog-overlay" @click="showDeleteDialog = false">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h3>确认删除</h3>
        </div>
        <div class="dialog-body">
          <p>确定要删除职位"{{ jobToDelete?.title }}"吗？</p>
          <p class="warning-text">此操作不可恢复</p>
        </div>
        <div class="dialog-footer">
          <button class="secondary-btn" @click="showDeleteDialog = false">
            取消
          </button>
          <button class="danger-btn" @click="deleteJob" :disabled="deleting">
            {{ deleting ? '删除中...' : '确认删除' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getPublisherJobs, updateJobStatus, deleteJob as deleteJobApi } from '@/api/jobManagement'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'MyJobsView',
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },
  data() {
    return {
      jobs: [],
      loading: false,
      currentStatus: 'ALL',
      statusOptions: [
        { label: '全部', value: 'ALL' },
        { label: '招聘中', value: 'ACTIVE' },
        { label: '已暂停', value: 'PAUSED' },
        { label: '已关闭', value: 'CLOSED' }
      ],
      showDeleteDialog: false,
      jobToDelete: null,
      deleting: false
    }
  },
  computed: {
    filteredJobs() {
      if (this.currentStatus === 'ALL') {
        return this.jobs
      }
      return this.jobs.filter(job => job.status === this.currentStatus)
    },
    totalJobs() {
      return this.jobs.length
    },
    activeJobs() {
      return this.jobs.filter(job => job.status === 'ACTIVE').length
    },
    totalApplications() {
      return this.jobs.reduce((sum, job) => sum + (job.applicationCount || 0), 0)
    }
  },
  mounted() {
    this.loadJobs()
  },
  methods: {
    async loadJobs() {
      this.loading = true
      try {
        const response = await getPublisherJobs(this.authStore.user.id)
        console.log('职位列表响应:', response)
        this.jobs = response.jobs || []
      } catch (error) {
        console.error('加载职位列表失败:', error)
        this.jobs = []
      } finally {
        this.loading = false
      }
    },

    getSalaryRange(job) {
      if (!job.salaryMin && !job.salaryMax) return '面议'
      if (job.salaryMin && job.salaryMax) {
        return `${job.salaryMin}-${job.salaryMax}元/月`
      }
      if (job.salaryMin) return `${job.salaryMin}元/月以上`
      return `${job.salaryMax}元/月以下`
    },

    getStatusClass(status) {
      const map = {
        'ACTIVE': 'active',
        'PAUSED': 'paused',
        'CLOSED': 'closed'
      }
      return map[status] || ''
    },

    getStatusText(status) {
      const map = {
        'ACTIVE': '招聘中',
        'PAUSED': '已暂停',
        'CLOSED': '已关闭'
      }
      return map[status] || status
    },

    formatTime(timestamp) {
      if (!timestamp) return '未知'
      const date = new Date(timestamp)
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 0) return '今天'
      if (diffDays === 1) return '昨天'
      if (diffDays < 7) return `${diffDays}天前`
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`
      return date.toLocaleDateString('zh-CN')
    },

    viewJob(jobId) {
      this.$router.push(`/jobs/${jobId}`)
    },

    // eslint-disable-next-line no-unused-vars
    editJob(jobId) {
      // TODO: 实现编辑功能
      alert('编辑功能开发中')
    },

    async pauseJob(jobId) {
      try {
        await updateJobStatus(jobId, 'PAUSED', this.authStore.user.id)
        alert('职位已暂停')
        this.loadJobs()
      } catch (error) {
        console.error('暂停失败:', error)
        alert('暂停失败')
      }
    },

    async activateJob(jobId) {
      try {
        await updateJobStatus(jobId, 'ACTIVE', this.authStore.user.id)
        alert('职位已恢复招聘')
        this.loadJobs()
      } catch (error) {
        console.error('恢复失败:', error)
        alert('恢复失败')
      }
    },

    confirmDelete(job) {
      this.jobToDelete = job
      this.showDeleteDialog = true
    },

    async deleteJob() {
      if (!this.jobToDelete) return

      this.deleting = true
      try {
        await deleteJobApi(this.jobToDelete.id, this.authStore.user.id)
        alert('职位已删除')
        this.showDeleteDialog = false
        this.jobToDelete = null
        this.loadJobs()
      } catch (error) {
        console.error('删除失败:', error)
        alert('删除失败')
      } finally {
        this.deleting = false
      }
    },

    goToPublish() {
      this.$router.push('/job-publish')
    }
  }
}
</script>

<style scoped>
.my-jobs-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.page-header h2 {
  font-size: 28px;
  color: #2c3e50;
  margin: 0;
}

.primary-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.stat-card.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  background: #667eea;
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
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.jobs-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.job-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s;
}

.job-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.job-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.job-info h3 {
  font-size: 20px;
  color: #2c3e50;
  margin: 0 0 12px 0;
}

.job-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.job-time {
  font-size: 13px;
  color: #999;
}

.job-status {
  flex-shrink: 0;
}

.status-badge {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.status-badge.active {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-badge.paused {
  background: #fff3e0;
  color: #f57c00;
}

.status-badge.closed {
  background: #f5f5f5;
  color: #999;
}

.job-actions {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.action-btn {
  padding: 8px 16px;
  background: white;
  color: #667eea;
  border: 1px solid #667eea;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #667eea;
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
  margin: 0 0 12px 0;
  color: #666;
}

.warning-text {
  color: #f56c6c;
  font-size: 13px;
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

  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .job-main {
    flex-direction: column;
    gap: 12px;
  }

  .job-actions {
    flex-wrap: wrap;
  }

  .action-btn {
    flex: 1;
    min-width: 80px;
  }
}
</style>
