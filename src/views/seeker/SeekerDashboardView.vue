<template>
  <div class="dashboard-container">
    <div class="header">
      <h1>📊 求职数据统计</h1>
      <p class="subtitle">查看您的求职进度和数据分析</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>加载数据中...</p>
    </div>

    <!-- 统计卡片 -->
    <div v-else class="stats-section">
      <!-- 总览卡片 -->
      <div class="stats-cards">
        <div class="stat-card primary">
          <div class="stat-icon">📝</div>
          <div class="stat-content">
            <h3>{{ stats.totalApplications || 0 }}</h3>
            <p>投递总数</p>
          </div>
        </div>

        <div class="stat-card success">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <h3>{{ stats.acceptedApplications || 0 }}</h3>
            <p>已通过</p>
          </div>
        </div>

        <div class="stat-card warning">
          <div class="stat-icon">⏳</div>
          <div class="stat-content">
            <h3>{{ stats.pendingApplications || 0 }}</h3>
            <p>待处理</p>
          </div>
        </div>

        <div class="stat-card info">
          <div class="stat-icon">⭐</div>
          <div class="stat-content">
            <h3>{{ stats.totalFavorites || 0 }}</h3>
            <p>收藏职位</p>
          </div>
        </div>
      </div>

      <!-- 成功率卡片 -->
      <div class="success-rate-card">
        <h2>投递成功率</h2>
        <div class="rate-content">
          <div class="rate-circle">
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#e0e0e0" stroke-width="8"/>
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#42b983"
                stroke-width="8"
                :stroke-dasharray="`${successRate * 2.827} 282.7`"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div class="rate-text">
              <span class="rate-number">{{ successRate }}%</span>
              <span class="rate-label">成功率</span>
            </div>
          </div>
          <div class="rate-details">
            <div class="detail-item">
              <span class="label">投递总数:</span>
              <span class="value">{{ stats.totalApplications }}</span>
            </div>
            <div class="detail-item">
              <span class="label">已通过:</span>
              <span class="value success">{{ stats.acceptedApplications }}</span>
            </div>
            <div class="detail-item">
              <span class="label">已拒绝:</span>
              <span class="value danger">{{ stats.rejectedApplications }}</span>
            </div>
            <div class="detail-item">
              <span class="label">待处理:</span>
              <span class="value warning">{{ stats.pendingApplications }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 投递趋势 -->
      <div class="trend-card">
        <h2>投递趋势（最近7天）</h2>
        <div class="trend-chart">
          <div v-for="(item, index) in trendData" :key="index" class="trend-bar">
            <div class="bar" :style="{ height: item.height + '%' }">
              <span class="bar-value">{{ item.count }}</span>
            </div>
            <span class="label">{{ item.label }}</span>
          </div>
        </div>
      </div>

      <!-- 最近投递 -->
      <div class="recent-applications-card">
        <h2>最近投递</h2>
        <div class="applications-list">
          <div
            v-for="app in recentApplications"
            :key="app.id"
            class="application-item"
            @click="viewJobDetail(app.jobId)"
          >
            <div class="app-info">
              <h4>{{ app.jobTitle }}</h4>
              <p class="company">{{ app.companyName }}</p>
              <p class="time">{{ formatDate(app.applicationTime) }}</p>
            </div>
            <div class="app-status">
              <span class="status-badge" :class="getStatusClass(app.status)">
                {{ getStatusText(app.status) }}
              </span>
            </div>
          </div>
          <div v-if="recentApplications.length === 0" class="empty-state">
            暂无投递记录
          </div>
        </div>
      </div>

      <!-- 推荐职位 -->
      <div class="recommendations-card">
        <h2>为您推荐</h2>
        <p class="hint">基于您的简历和求职偏好</p>
        <button @click="goToRecommendations" class="recommend-btn">
          查看职位推荐 →
        </button>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="error-toast">
      <span class="error-icon">⚠️</span>
      {{ errorMessage }}
      <button @click="errorMessage = ''" class="close-btn">×</button>
    </div>
  </div>
</template>

<script>
import { getSeekerApplications } from '@/api/application'
import { getUserFavorites } from '@/api/favorite'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'SeekerDashboardView',
  data() {
    return {
      loading: false,
      errorMessage: '',
      stats: {
        totalApplications: 0,
        acceptedApplications: 0,
        rejectedApplications: 0,
        pendingApplications: 0,
        totalFavorites: 0
      },
      successRate: 0,
      trendData: [],
      recentApplications: []
    }
  },
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },
  mounted() {
    this.loadDashboardData()
  },
  methods: {
    async loadDashboardData() {
      this.loading = true
      this.errorMessage = ''

      try {
        // 加载投递数据
        const applicationsResponse = await getSeekerApplications(this.authStore.user.id)
        const applications = applicationsResponse.applications || []

        // 加载收藏数据
        const favoritesResponse = await getUserFavorites()
        const favorites = favoritesResponse.favorites || []

        // 计算统计数据
        this.calculateStats(applications, favorites)

        // 生成趋势数据
        this.generateTrendData(applications)

        // 获取最近投递
        this.getRecentApplications(applications)

      } catch (error) {
        console.error('加载数据失败:', error)
        this.errorMessage = '加载数据失败: ' + (error.message || '未知错误')
      } finally {
        this.loading = false
      }
    },

    calculateStats(applications, favorites) {
      this.stats.totalApplications = applications.length
      this.stats.acceptedApplications = applications.filter(app => app.status === 'accepted').length
      this.stats.rejectedApplications = applications.filter(app => app.status === 'rejected').length
      this.stats.pendingApplications = applications.filter(app => app.status === 'pending').length
      this.stats.totalFavorites = favorites.length

      // 计算成功率
      if (this.stats.totalApplications > 0) {
        this.successRate = Math.round((this.stats.acceptedApplications / this.stats.totalApplications) * 100)
      } else {
        this.successRate = 0
      }
    },

    generateTrendData(applications) {
      // 按日期统计投递量（最近7天）
      const today = new Date()
      const trendMap = {}

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateStr = date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
        trendMap[dateStr] = 0
      }

      applications.forEach(app => {
        const appDate = new Date(app.applicationTime)
        const dateStr = appDate.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
        if (trendMap.hasOwnProperty(dateStr)) {
          trendMap[dateStr]++
        }
      })

      const maxCount = Math.max(...Object.values(trendMap), 1)
      this.trendData = Object.entries(trendMap).map(([label, count]) => ({
        label,
        count,
        height: (count / maxCount) * 100
      }))
    },

    getRecentApplications(applications) {
      this.recentApplications = [...applications]
        .sort((a, b) => new Date(b.applicationTime) - new Date(a.applicationTime))
        .slice(0, 5)
    },

    getStatusClass(status) {
      const statusMap = {
        'pending': 'status-pending',
        'accepted': 'status-accepted',
        'rejected': 'status-rejected'
      }
      return statusMap[status.toLowerCase()] || ''
    },

    getStatusText(status) {
      const textMap = {
        'pending': '待处理',
        'accepted': '已通过',
        'rejected': '已拒绝'
      }
      return textMap[status.toLowerCase()] || status
    },

    formatDate(dateStr) {
      if (!dateStr) return '-'
      const date = new Date(dateStr)
      const now = new Date()
      const diff = now - date
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))

      if (days === 0) return '今天'
      if (days === 1) return '昨天'
      if (days < 7) return `${days}天前`
      return date.toLocaleDateString('zh-CN')
    },

    viewJobDetail(jobId) {
      this.$router.push(`/jobs/${jobId}`)
    },

    goToRecommendations() {
      this.$router.push('/recommendations')
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  max-width: 1200px;
  margin: 24px auto 40px;
  padding: 0 20px;
}

.header {
  text-align: center;
  margin-bottom: 32px;
}

.header h1 {
  color: #2c3e50;
  font-size: 32px;
  margin: 0 0 8px 0;
}

.subtitle {
  color: #7f8c8d;
  font-size: 16px;
  margin: 0;
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

.stats-section {
  margin-top: 24px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 48px;
  opacity: 0.9;
}

.stat-content h3 {
  font-size: 32px;
  margin: 0 0 4px 0;
  color: #2c3e50;
}

.stat-content p {
  margin: 0;
  color: #7f8c8d;
  font-size: 14px;
}

.stat-card.primary { border-left: 4px solid #3498db; }
.stat-card.success { border-left: 4px solid #42b983; }
.stat-card.warning { border-left: 4px solid #f39c12; }
.stat-card.info { border-left: 4px solid #9b59b6; }

.success-rate-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
}

.success-rate-card h2 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 20px;
}

.rate-content {
  display: flex;
  align-items: center;
  gap: 40px;
}

.rate-circle {
  position: relative;
  width: 150px;
  height: 150px;
}

.rate-circle svg {
  width: 100%;
  height: 100%;
}

.rate-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.rate-number {
  display: block;
  font-size: 32px;
  font-weight: bold;
  color: #42b983;
}

.rate-label {
  display: block;
  font-size: 14px;
  color: #7f8c8d;
  margin-top: 4px;
}

.rate-details {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.detail-item .label {
  color: #7f8c8d;
  font-size: 14px;
}

.detail-item .value {
  font-weight: 600;
  font-size: 16px;
  color: #2c3e50;
}

.detail-item .value.success { color: #42b983; }
.detail-item .value.danger { color: #e74c3c; }
.detail-item .value.warning { color: #f39c12; }

.trend-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
}

.trend-card h2 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 20px;
}

.trend-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 200px;
  padding: 20px 0;
}

.trend-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.bar {
  width: 60px;
  background: linear-gradient(180deg, #42b983 0%, #35a06f 100%);
  border-radius: 4px 4px 0 0;
  min-height: 4px;
  transition: height 0.3s;
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 8px;
}

.bar-value {
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.trend-bar .label {
  margin-top: 8px;
  font-size: 12px;
  color: #7f8c8d;
}

.recent-applications-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
}

.recent-applications-card h2 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 20px;
}

.applications-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.application-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.application-item:hover {
  border-color: #42b983;
  box-shadow: 0 2px 8px rgba(66, 185, 131, 0.2);
}

.app-info h4 {
  margin: 0 0 4px 0;
  color: #2c3e50;
  font-size: 16px;
}

.company {
  margin: 0 0 4px 0;
  color: #7f8c8d;
  font-size: 14px;
}

.time {
  margin: 0;
  color: #95a5a6;
  font-size: 12px;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-accepted {
  background: #d4edda;
  color: #155724;
}

.status-rejected {
  background: #f8d7da;
  color: #721c24;
}

.empty-state {
  text-align: center;
  color: #999;
  padding: 40px;
}

.recommendations-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  color: white;
}

.recommendations-card h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
}

.hint {
  margin: 0 0 20px 0;
  opacity: 0.9;
  font-size: 14px;
}

.recommend-btn {
  padding: 12px 32px;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.recommend-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.error-toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 16px 20px;
  background: #ffebee;
  border: 1px solid #ffcdd2;
  border-radius: 8px;
  color: #c62828;
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: slideIn 0.3s;
}

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.error-icon {
  font-size: 20px;
}

.close-btn {
  margin-left: auto;
  background: none;
  border: none;
  font-size: 20px;
  color: #c62828;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.close-btn:hover {
  background: rgba(198, 40, 40, 0.1);
}

@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }

  .rate-content {
    flex-direction: column;
    gap: 20px;
  }

  .rate-details {
    grid-template-columns: 1fr;
  }
}
</style>
