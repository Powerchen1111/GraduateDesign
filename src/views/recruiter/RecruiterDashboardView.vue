<template>
  <div class="dashboard-container">
    <div class="header">
      <h1>📊 招聘数据统计</h1>
      <p class="subtitle">实时查看您的招聘数据和分析报告</p>
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
          <div class="stat-icon">💼</div>
          <div class="stat-content">
            <h3>{{ stats.totalJobs || 0 }}</h3>
            <p>发布职位总数</p>
          </div>
        </div>

        <div class="stat-card success">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <h3>{{ stats.activeJobs || 0 }}</h3>
            <p>招聘中职位</p>
          </div>
        </div>

        <div class="stat-card info">
          <div class="stat-icon">📝</div>
          <div class="stat-content">
            <h3>{{ stats.totalApplications || 0 }}</h3>
            <p>收到简历总数</p>
          </div>
        </div>

        <div class="stat-card warning">
          <div class="stat-icon">👁️</div>
          <div class="stat-content">
            <h3>{{ stats.totalViews || 0 }}</h3>
            <p>职位浏览总量</p>
          </div>
        </div>
      </div>

      <!-- 职位详细统计表格 -->
      <div class="jobs-stats-section">
        <h2>职位详细统计</h2>
        <div class="table-container">
          <table class="stats-table">
            <thead>
              <tr>
                <th>职位名称</th>
                <th>公司</th>
                <th>状态</th>
                <th>浏览量</th>
                <th>投递量</th>
                <th>投递率</th>
                <th>发布时间</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="job in jobsWithStats" :key="job.id" @click="viewJobDetail(job.id)" class="clickable-row">
                <td class="job-title">{{ job.title }}</td>
                <td>{{ job.companyName }}</td>
                <td>
                  <span class="status-badge" :class="getStatusClass(job.status)">
                    {{ getStatusText(job.status) }}
                  </span>
                </td>
                <td class="number">{{ job.viewCount || 0 }}</td>
                <td class="number">{{ job.applicationCount || 0 }}</td>
                <td class="number">
                  <span :class="getConversionClass(job.conversionRate)">
                    {{ job.conversionRate }}%
                  </span>
                </td>
                <td class="date">{{ formatDate(job.createdAt) }}</td>
              </tr>
              <tr v-if="jobsWithStats.length === 0">
                <td colspan="7" class="empty-row">暂无职位数据</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 图表分析 -->
      <div class="charts-section">
        <div class="chart-card">
          <h3>投递趋势分析</h3>
          <div class="chart-placeholder">
            <div class="trend-chart">
              <div v-for="(item, index) in trendData" :key="index" class="trend-bar">
                <div class="bar" :style="{ height: item.height + '%' }"></div>
                <span class="label">{{ item.label }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="chart-card">
          <h3>职位状态分布</h3>
          <div class="chart-placeholder">
            <div class="pie-chart">
              <div class="pie-item" v-for="(item, index) in statusDistribution" :key="index">
                <div class="pie-color" :style="{ background: item.color }"></div>
                <span class="pie-label">{{ item.label }}: {{ item.value }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 热门职位排行 -->
      <div class="ranking-section">
        <h2>热门职位排行</h2>
        <div class="ranking-cards">
          <div v-for="(job, index) in topJobs" :key="job.id" class="ranking-card" @click="viewJobDetail(job.id)">
            <div class="rank-badge" :class="getRankClass(index)">
              {{ index + 1 }}
            </div>
            <div class="ranking-content">
              <h4>{{ job.title }}</h4>
              <p class="company">{{ job.companyName }}</p>
              <div class="ranking-stats">
                <span>👁️ {{ job.viewCount || 0 }} 浏览</span>
                <span>📝 {{ job.applicationCount || 0 }} 投递</span>
              </div>
            </div>
          </div>
          <div v-if="topJobs.length === 0" class="empty-ranking">
            暂无数据
          </div>
        </div>
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
import { getPublisherJobs } from '@/api/job'
import { getRecruiterApplications } from '@/api/application'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'RecruiterDashboardView',
  data() {
    return {
      loading: false,
      errorMessage: '',
      stats: {
        totalJobs: 0,
        activeJobs: 0,
        totalApplications: 0,
        totalViews: 0
      },
      jobsWithStats: [],
      topJobs: [],
      trendData: [],
      statusDistribution: []
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
        // 加载职位数据
        const jobsResponse = await getPublisherJobs(this.authStore.user.id)
        const jobs = jobsResponse.jobs || []

        // 加载投递数据
        const applicationsResponse = await getRecruiterApplications(this.authStore.user.id)
        const applications = applicationsResponse.applications || []

        // 计算统计数据
        this.calculateStats(jobs, applications)

        // 处理职位统计
        this.processJobsStats(jobs, applications)

        // 生成趋势数据
        this.generateTrendData(applications)

        // 生成状态分布
        this.generateStatusDistribution(jobs)

        // 获取热门职位
        this.getTopJobs(jobs)

      } catch (error) {
        console.error('加载数据失败:', error)
        this.errorMessage = '加载数据失败: ' + (error.message || '未知错误')
      } finally {
        this.loading = false
      }
    },

    calculateStats(jobs, applications) {
      this.stats.totalJobs = jobs.length
      this.stats.activeJobs = jobs.filter(job => job.status === 'active').length
      this.stats.totalApplications = applications.length
      this.stats.totalViews = jobs.reduce((sum, job) => sum + (job.viewCount || 0), 0)
    },

    processJobsStats(jobs, applications) {
      this.jobsWithStats = jobs.map(job => {
        const jobApplications = applications.filter(app => app.jobId === job.id)
        const viewCount = job.viewCount || 0
        const applicationCount = jobApplications.length
        const conversionRate = viewCount > 0 ? ((applicationCount / viewCount) * 100).toFixed(1) : '0.0'

        return {
          ...job,
          applicationCount,
          conversionRate
        }
      }).sort((a, b) => b.viewCount - a.viewCount)
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
        height: (count / maxCount) * 100
      }))
    },

    generateStatusDistribution(jobs) {
      const statusCount = {
        active: 0,
        paused: 0,
        closed: 0
      }

      jobs.forEach(job => {
        const status = job.status.toLowerCase()
        if (statusCount.hasOwnProperty(status)) {
          statusCount[status]++
        }
      })

      this.statusDistribution = [
        { label: '招聘中', value: statusCount.active, color: '#42b983' },
        { label: '已暂停', value: statusCount.paused, color: '#f39c12' },
        { label: '已关闭', value: statusCount.closed, color: '#95a5a6' }
      ]
    },

    getTopJobs(jobs) {
      this.topJobs = [...jobs]
        .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
        .slice(0, 5)
    },

    getStatusClass(status) {
      const statusMap = {
        'active': 'status-active',
        'paused': 'status-paused',
        'closed': 'status-closed'
      }
      return statusMap[status.toLowerCase()] || ''
    },

    getStatusText(status) {
      const textMap = {
        'active': '招聘中',
        'paused': '已暂停',
        'closed': '已关闭'
      }
      return textMap[status.toLowerCase()] || status
    },

    getConversionClass(rate) {
      const numRate = parseFloat(rate)
      if (numRate >= 5) return 'high-conversion'
      if (numRate >= 2) return 'medium-conversion'
      return 'low-conversion'
    },

    getRankClass(index) {
      if (index === 0) return 'rank-gold'
      if (index === 1) return 'rank-silver'
      if (index === 2) return 'rank-bronze'
      return ''
    },

    formatDate(dateStr) {
      if (!dateStr) return '-'
      const date = new Date(dateStr)
      return date.toLocaleDateString('zh-CN')
    },

    viewJobDetail(jobId) {
      this.$router.push(`/jobs/${jobId}`)
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  max-width: 1400px;
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
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
.stat-card.info { border-left: 4px solid #9b59b6; }
.stat-card.warning { border-left: 4px solid #f39c12; }

.jobs-stats-section {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 32px;
}

.jobs-stats-section h2 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 20px;
}

.table-container {
  overflow-x: auto;
}

.stats-table {
  width: 100%;
  border-collapse: collapse;
}

.stats-table th {
  background: #f8f9fa;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #e0e0e0;
}

.stats-table td {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.clickable-row {
  cursor: pointer;
  transition: background 0.2s;
}

.clickable-row:hover {
  background: #f8f9fa;
}

.job-title {
  font-weight: 500;
  color: #2c3e50;
}

.number {
  text-align: center;
  font-weight: 500;
}

.date {
  color: #7f8c8d;
  font-size: 14px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-active {
  background: #d4edda;
  color: #155724;
}

.status-paused {
  background: #fff3cd;
  color: #856404;
}

.status-closed {
  background: #f8d7da;
  color: #721c24;
}

.high-conversion { color: #27ae60; font-weight: 600; }
.medium-conversion { color: #f39c12; font-weight: 600; }
.low-conversion { color: #95a5a6; }

.empty-row {
  text-align: center;
  color: #999;
  padding: 40px !important;
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.chart-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.chart-card h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 18px;
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
  width: 40px;
  background: linear-gradient(180deg, #42b983 0%, #35a06f 100%);
  border-radius: 4px 4px 0 0;
  min-height: 4px;
  transition: height 0.3s;
}

.trend-bar .label {
  margin-top: 8px;
  font-size: 12px;
  color: #7f8c8d;
}

.pie-chart {
  padding: 20px;
}

.pie-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.pie-color {
  width: 20px;
  height: 20px;
  border-radius: 4px;
}

.pie-label {
  font-size: 14px;
  color: #2c3e50;
}

.ranking-section {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.ranking-section h2 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 20px;
}

.ranking-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ranking-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.ranking-card:hover {
  border-color: #42b983;
  box-shadow: 0 2px 8px rgba(66, 185, 131, 0.2);
}

.rank-badge {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
  background: #e0e0e0;
  color: white;
}

.rank-gold { background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); }
.rank-silver { background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%); }
.rank-bronze { background: linear-gradient(135deg, #cd7f32 0%, #e8a87c 100%); }

.ranking-content {
  flex: 1;
}

.ranking-content h4 {
  margin: 0 0 4px 0;
  color: #2c3e50;
  font-size: 16px;
}

.company {
  margin: 0 0 8px 0;
  color: #7f8c8d;
  font-size: 14px;
}

.ranking-stats {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #666;
}

.empty-ranking {
  text-align: center;
  color: #999;
  padding: 40px;
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

  .charts-section {
    grid-template-columns: 1fr;
  }
}
</style>
