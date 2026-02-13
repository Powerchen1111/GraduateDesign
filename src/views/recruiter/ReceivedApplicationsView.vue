<template>
  <div class="received-applications-container">
    <div class="header">
      <h1>收到的简历</h1>
      <p class="subtitle">管理求职者投递的简历</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📨</div>
        <div class="stat-info">
          <div class="stat-value">{{ totalCount }}</div>
          <div class="stat-label">总投递数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">👀</div>
        <div class="stat-info">
          <div class="stat-value">{{ pendingCount }}</div>
          <div class="stat-label">待查看</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <div class="stat-value">{{ viewedCount }}</div>
          <div class="stat-label">已查看</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📞</div>
        <div class="stat-info">
          <div class="stat-value">{{ interviewCount }}</div>
          <div class="stat-label">面试邀请</div>
        </div>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="filter-section">
      <div class="filter-tabs">
        <button
          v-for="tab in statusTabs"
          :key="tab.value"
          :class="['tab-btn', { active: currentStatus === tab.value }]"
          @click="currentStatus = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 简历列表 -->
    <div v-else-if="filteredApplications.length > 0" class="applications-list">
      <div
        v-for="app in filteredApplications"
        :key="app.id"
        class="application-card"
      >
        <div class="application-header">
          <div class="candidate-info">
            <h3>{{ app.resumeName || '未知姓名' }}</h3>
            <div class="contact-info">
              <span v-if="app.resumePhone">📱 {{ app.resumePhone }}</span>
              <span v-if="app.resumeEmail">📧 {{ app.resumeEmail }}</span>
            </div>
          </div>
          <div class="status-badge" :class="getStatusClass(app.status)">
            {{ getStatusText(app.status) }}
          </div>
        </div>

        <div class="application-body">
          <div class="info-row">
            <span class="label">投递职位:</span>
            <span class="value">{{ app.jobTitle }}</span>
          </div>
          <div class="info-row">
            <span class="label">投递时间:</span>
            <span class="value">{{ formatTime(app.applyTime) }}</span>
          </div>
          <div class="info-row" v-if="app.resumeSkills">
            <span class="label">技能:</span>
            <span class="value">{{ app.resumeSkills.substring(0, 100) }}{{ app.resumeSkills.length > 100 ? '...' : '' }}</span>
          </div>
          <div class="info-row" v-if="app.resumeEducation">
            <span class="label">学历:</span>
            <span class="value">{{ app.resumeEducation }}</span>
          </div>
          <div class="info-row" v-if="app.note">
            <span class="label">备注:</span>
            <span class="value note-text">{{ app.note }}</span>
          </div>
        </div>

        <div class="application-actions">
          <button class="action-btn primary" @click="viewResume(app)">
            查看简历
          </button>
          <button
            v-if="app.status === 'PENDING'"
            class="action-btn"
            @click="updateApplicationStatus(app.id, 'VIEWED')"
          >
            标记已查看
          </button>
          <button
            v-if="app.status === 'VIEWED'"
            class="action-btn success"
            @click="updateApplicationStatus(app.id, 'INTERVIEW')"
          >
            邀请面试
          </button>
          <button
            class="action-btn"
            @click="showNoteDialog(app)"
          >
            添加备注
          </button>
          <button
            v-if="app.status !== 'REJECTED'"
            class="action-btn danger"
            @click="updateApplicationStatus(app.id, 'REJECTED')"
          >
            拒绝
          </button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-icon">📭</div>
      <h3>暂无简历</h3>
      <p>{{ getEmptyMessage() }}</p>
    </div>

    <!-- 备注对话框 -->
    <div v-if="showDialog" class="dialog-overlay" @click="closeDialog">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h3>添加备注</h3>
          <button class="close-btn" @click="closeDialog">×</button>
        </div>
        <div class="dialog-body">
          <textarea
            v-model="noteText"
            placeholder="请输入备注信息..."
            class="note-textarea"
            rows="5"
          ></textarea>
        </div>
        <div class="dialog-footer">
          <button class="secondary-btn" @click="closeDialog">取消</button>
          <button class="primary-btn" @click="saveNote">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'

export default {
  name: 'ReceivedApplicationsView',
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },
  data() {
    return {
      applications: [],
      loading: false,
      currentStatus: 'ALL',
      statusTabs: [
        { label: '全部', value: 'ALL' },
        { label: '待查看', value: 'PENDING' },
        { label: '已查看', value: 'VIEWED' },
        { label: '面试邀请', value: 'INTERVIEW' },
        { label: '已拒绝', value: 'REJECTED' }
      ],
      showDialog: false,
      currentApplication: null,
      noteText: ''
    }
  },
  computed: {
    filteredApplications() {
      if (this.currentStatus === 'ALL') {
        return this.applications
      }
      return this.applications.filter(app => app.status === this.currentStatus)
    },
    totalCount() {
      return this.applications.length
    },
    pendingCount() {
      return this.applications.filter(app => app.status === 'PENDING').length
    },
    viewedCount() {
      return this.applications.filter(app => app.status === 'VIEWED').length
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
        const response = await axios.get(
          `http://localhost:8080/api/applications/recruiter/${this.authStore.user.id}`
        )
        this.applications = response.data.applications || []
      } catch (error) {
        console.error('加载简历失败:', error)
        alert('加载简历失败')
      } finally {
        this.loading = false
      }
    },
    async updateApplicationStatus(applicationId, status) {
      try {
        await axios.put(
          `http://localhost:8080/api/applications/${applicationId}/status`,
          { status }
        )
        alert('状态更新成功')
        this.loadApplications()
      } catch (error) {
        console.error('更新状态失败:', error)
        alert('更新状态失败')
      }
    },
    showNoteDialog(app) {
      this.currentApplication = app
      this.noteText = app.note || ''
      this.showDialog = true
    },
    closeDialog() {
      this.showDialog = false
      this.currentApplication = null
      this.noteText = ''
    },
    async saveNote() {
      if (!this.currentApplication) return

      try {
        await axios.put(
          `http://localhost:8080/api/applications/${this.currentApplication.id}/status`,
          {
            status: this.currentApplication.status,
            note: this.noteText
          }
        )
        alert('备注保存成功')
        this.closeDialog()
        this.loadApplications()
      } catch (error) {
        console.error('保存备注失败:', error)
        alert('保存备注失败')
      }
    },
    viewResume(app) {
      // 跳转到简历详情页
      this.$router.push(`/resumes/${app.resumeId}`)
    },
    getStatusClass(status) {
      const classMap = {
        'PENDING': 'status-pending',
        'VIEWED': 'status-viewed',
        'INTERVIEW': 'status-interview',
        'REJECTED': 'status-rejected'
      }
      return classMap[status] || ''
    },
    getStatusText(status) {
      const textMap = {
        'PENDING': '待查看',
        'VIEWED': '已查看',
        'INTERVIEW': '面试邀请',
        'REJECTED': '已拒绝'
      }
      return textMap[status] || status
    },
    getEmptyMessage() {
      if (this.currentStatus === 'ALL') {
        return '还没有收到任何简历投递'
      }
      return `暂无${this.statusTabs.find(t => t.value === this.currentStatus)?.label}的简历`
    },
    formatTime(timestamp) {
      if (!timestamp) return '未知'
      const date = new Date(timestamp)
      return date.toLocaleString('zh-CN')
    }
  }
}
</script>

<style scoped>
.received-applications-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.header {
  margin-bottom: 32px;
}

.header h1 {
  font-size: 28px;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.subtitle {
  color: #7b8a8b;
  font-size: 14px;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  font-size: 32px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
}

.stat-label {
  font-size: 14px;
  color: #7b8a8b;
  margin-top: 4px;
}

.filter-section {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
}

.filter-tabs {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 8px 20px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  transition: all 0.2s;
}

.tab-btn:hover {
  border-color: #42b983;
  color: #42b983;
}

.tab-btn.active {
  background: #42b983;
  border-color: #42b983;
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
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.2s;
}

.application-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.application-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.candidate-info h3 {
  font-size: 20px;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.contact-info {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #666;
}

.status-badge {
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-viewed {
  background: #d1ecf1;
  color: #0c5460;
}

.status-interview {
  background: #d4edda;
  color: #155724;
}

.status-rejected {
  background: #f8d7da;
  color: #721c24;
}

.application-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  gap: 12px;
  font-size: 14px;
}

.info-row .label {
  color: #7b8a8b;
  min-width: 80px;
  flex-shrink: 0;
}

.info-row .value {
  color: #2c3e50;
  flex: 1;
}

.note-text {
  color: #666;
  font-style: italic;
}

.application-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f5f5f5;
}

.action-btn.primary {
  background: #42b983;
  color: white;
  border-color: #42b983;
}

.action-btn.primary:hover {
  background: #35495e;
  border-color: #35495e;
}

.action-btn.success {
  background: #28a745;
  color: white;
  border-color: #28a745;
}

.action-btn.success:hover {
  background: #218838;
}

.action-btn.danger {
  color: #dc3545;
  border-color: #dc3545;
}

.action-btn.danger:hover {
  background: #dc3545;
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
  margin: 0;
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
  max-width: 500px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #f5f5f5;
}

.dialog-body {
  padding: 24px;
}

.note-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
}

.note-textarea:focus {
  outline: none;
  border-color: #42b983;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e0e0e0;
}

.primary-btn {
  padding: 10px 24px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.primary-btn:hover {
  background: #35495e;
}

.secondary-btn {
  padding: 10px 24px;
  background: white;
  color: #666;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.secondary-btn:hover {
  background: #f5f5f5;
}
</style>
