<template>
  <div class="home-container">
    <!-- Hero 区域 -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">AI 智能招聘平台</h1>
        <p class="hero-subtitle">让每一次求职都精准匹配，让每一个岗位都找到合适的人才</p>

        <!-- 搜索框 -->
        <div class="search-box">
          <div class="search-input-group">
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="搜索职位、公司"
              class="search-input"
              @keyup.enter="handleSearch"
            />
            <input
              v-model="searchLocation"
              type="text"
              placeholder="工作地点"
              class="search-input location-input"
              @keyup.enter="handleSearch"
            />
            <button class="search-btn" @click="handleSearch">
              🔍 搜索职位
            </button>
          </div>

          <!-- 热门搜索 -->
          <div class="hot-keywords">
            <span class="hot-label">热门搜索：</span>
            <span
              v-for="keyword in hotKeywords"
              :key="keyword"
              class="hot-keyword"
              @click="searchByKeyword(keyword)"
            >
              {{ keyword }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- 平台数据统计 -->
    <section class="stats-section">
      <div class="stats-container">
        <div class="stat-item">
          <div class="stat-number">{{ formatNumber(statistics.totalJobs) }}+</div>
          <div class="stat-label">在招职位</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ formatNumber(statistics.totalCompanies) }}+</div>
          <div class="stat-label">合作企业</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ formatNumber(statistics.totalResumes) }}+</div>
          <div class="stat-label">注册用户</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ formatNumber(statistics.totalApplications) }}+</div>
          <div class="stat-label">成功匹配</div>
        </div>
      </div>
    </section>

    <!-- 热门职位 -->
    <section class="hot-jobs-section">
      <div class="section-header">
        <h2>热门职位推荐</h2>
        <router-link to="/jobs" class="more-link">查看更多 →</router-link>
      </div>

      <div v-if="loadingJobs" class="loading">
        <div class="spinner"></div>
      </div>

      <div v-else class="jobs-grid">
        <div
          v-for="job in hotJobs"
          :key="job.id"
          class="job-card"
          @click="viewJob(job.id)"
        >
          <div class="job-header">
            <h3 class="job-title">{{ job.title }}</h3>
            <div class="job-salary">{{ formatSalary(job) }}</div>
          </div>
          <div class="job-company">
            <span class="company-icon">🏢</span>
            {{ job.companyName }}
          </div>
          <div class="job-meta">
            <span class="meta-item">📍 {{ job.location }}</span>
            <span class="meta-item" v-if="job.experienceRequirement">
              💼 {{ job.experienceRequirement }}
            </span>
            <span class="meta-item" v-if="job.educationRequirement">
              🎓 {{ job.educationRequirement }}
            </span>
          </div>
          <div v-if="job.keywords" class="job-tags">
            <span
              v-for="(tag, index) in getKeywordArray(job.keywords).slice(0, 3)"
              :key="index"
              class="tag"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- 热门公司 -->
    <section class="hot-companies-section">
      <div class="section-header">
        <h2>热门企业</h2>
      </div>

      <div class="companies-grid">
        <div
          v-for="company in hotCompanies"
          :key="company.name"
          class="company-card"
          @click="searchByCompany(company.name)"
        >
          <div class="company-logo">{{ company.name.charAt(0) }}</div>
          <div class="company-info">
            <h4 class="company-name">{{ company.name }}</h4>
            <p class="company-jobs">{{ company.jobCount }} 个在招职位</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 平台特色 -->
    <section class="features-section">
      <div class="section-header">
        <h2>平台特色</h2>
      </div>

      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">🤖</div>
          <h3>AI 智能匹配</h3>
          <p>基于深度学习的智能推荐算法，精准匹配职位与简历</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📊</div>
          <h3>数据分析</h3>
          <p>实时统计求职数据，帮助求职者和招聘者做出更好的决策</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">💬</div>
          <h3>AI 对话助手</h3>
          <p>智能对话系统，快速解答求职疑问，提供职业建议</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">⚡</div>
          <h3>快速投递</h3>
          <p>一键投递简历，实时查看投递状态和反馈</p>
        </div>
      </div>
    </section>

    <!-- CTA 区域 -->
    <section class="cta-section">
      <div class="cta-content">
        <h2>开启你的职业新篇章</h2>
        <p>立即注册，获取 AI 智能推荐的职位</p>
        <div class="cta-buttons">
          <router-link v-if="!authStore.isAuthenticated" to="/register" class="cta-btn primary">
            立即注册
          </router-link>
          <router-link v-if="!authStore.isAuthenticated" to="/login" class="cta-btn secondary">
            登录账号
          </router-link>
          <router-link v-if="authStore.isJobSeeker" to="/recommendations" class="cta-btn primary">
            查看推荐职位
          </router-link>
          <router-link v-if="authStore.isRecruiter" to="/job-publish" class="cta-btn primary">
            发布职位
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { getJobs } from '@/api/job'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'

export default {
  name: 'HomeView',
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },
  data() {
    return {
      searchKeyword: '',
      searchLocation: '',
      hotKeywords: ['Java开发', 'Python', '前端工程师', '产品经理', '数据分析', 'UI设计'],
      statistics: {
        totalJobs: 0,
        totalCompanies: 0,
        totalResumes: 0,
        totalApplications: 0
      },
      hotJobs: [],
      loadingJobs: false,
      hotCompanies: []
    }
  },
  mounted() {
    this.loadStatistics()
    this.loadHotJobs()
    this.loadHotCompanies()
  },
  methods: {
    async loadStatistics() {
      try {
        const response = await axios.get('http://localhost:8080/api/jobs/statistics')
        this.statistics = {
          totalJobs: response.data.totalJobs || 0,
          totalCompanies: this.extractCompanyCount(response.data),
          totalResumes: response.data.totalResumes || 1200,
          totalApplications: response.data.totalApplications || 5000
        }
      } catch (error) {
        console.error('加载统计数据失败:', error)
        this.statistics = {
          totalJobs: 1500,
          totalCompanies: 300,
          totalResumes: 1200,
          totalApplications: 5000
        }
      }
    },

    extractCompanyCount(data) {
      return data.totalCompanies || 300
    },

    async loadHotJobs() {
      this.loadingJobs = true
      try {
        const response = await getJobs({ page: 0, size: 8 })
        this.hotJobs = response.jobs || response.slice(0, 8) || []
      } catch (error) {
        console.error('加载热门职位失败:', error)
        this.hotJobs = []
      } finally {
        this.loadingJobs = false
      }
    },

    async loadHotCompanies() {
      try {
        const response = await getJobs({ page: 0, size: 50 })
        const jobs = response.jobs || response || []

        const companyMap = new Map()
        jobs.forEach(job => {
          if (job.companyName) {
            if (companyMap.has(job.companyName)) {
              companyMap.get(job.companyName).jobCount++
            } else {
              companyMap.set(job.companyName, {
                name: job.companyName,
                jobCount: 1
              })
            }
          }
        })

        this.hotCompanies = Array.from(companyMap.values())
          .sort((a, b) => b.jobCount - a.jobCount)
          .slice(0, 8)
      } catch (error) {
        console.error('加载热门公司失败:', error)
        this.hotCompanies = []
      }
    },

    handleSearch() {
      const query = {}
      if (this.searchKeyword) query.keyword = this.searchKeyword
      if (this.searchLocation) query.location = this.searchLocation

      this.$router.push({
        path: '/jobs',
        query
      })
    },

    searchByKeyword(keyword) {
      this.searchKeyword = keyword
      this.handleSearch()
    },

    searchByCompany(companyName) {
      this.$router.push({
        path: '/jobs',
        query: { keyword: companyName }
      })
    },

    viewJob(jobId) {
      this.$router.push(`/jobs/${jobId}`)
    },

    formatNumber(num) {
      if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万'
      }
      return num.toString()
    },

    formatSalary(job) {
      if (job.salaryRange) return job.salaryRange

      const { salaryMin, salaryMax } = job
      if (!salaryMin && !salaryMax) return '薪资面议'
      if (salaryMin && salaryMax) {
        return `${(salaryMin / 1000).toFixed(0)}-${(salaryMax / 1000).toFixed(0)}K`
      }
      if (salaryMin) return `${(salaryMin / 1000).toFixed(0)}K+`
      return `${(salaryMax / 1000).toFixed(0)}K以下`
    },

    getKeywordArray(keywords) {
      if (!keywords) return []
      return keywords.split(/[,，、;；]/).map(k => k.trim()).filter(k => k)
    }
  }
}
</script>

<style scoped>
.home-container {
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 0;
}

/* Hero 区域 */
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 80px 20px;
  text-align: center;
  color: white;
}

.hero-content {
  max-width: 900px;
  margin: 0 auto;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  margin: 0 0 16px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.hero-subtitle {
  font-size: 18px;
  margin: 0 0 40px 0;
  opacity: 0.95;
}

/* 搜索框 */
.search-box {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.search-input-group {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.search-input {
  flex: 1;
  padding: 14px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
}

.location-input {
  flex: 0.6;
}

.search-btn {
  padding: 14px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.search-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.hot-keywords {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.hot-label {
  color: #666;
  font-size: 14px;
}

.hot-keyword {
  padding: 6px 14px;
  background: #f5f5f5;
  color: #666;
  border-radius: 16px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.hot-keyword:hover {
  background: #667eea;
  color: white;
}

/* 统计区域 */
.stats-section {
  padding: 60px 20px;
  background: white;
}

.stats-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 40px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 42px;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 16px;
  color: #666;
}

/* 通用区域样式 */
.hot-jobs-section,
.hot-companies-section,
.features-section {
  padding: 60px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.hot-jobs-section {
  background: #f8f9fa;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.section-header h2 {
  font-size: 32px;
  color: #2c3e50;
  margin: 0;
}

.more-link {
  color: #667eea;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  transition: color 0.3s;
}

.more-link:hover {
  color: #764ba2;
}

/* 职位卡片 */
.jobs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.job-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #e0e0e0;
}

.job-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.job-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  flex: 1;
}

.job-salary {
  font-size: 16px;
  font-weight: 700;
  color: #f56c6c;
  white-space: nowrap;
  margin-left: 12px;
}

.job-company {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 14px;
  margin-bottom: 12px;
}

.company-icon {
  font-size: 16px;
}

.job-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}

.meta-item {
  font-size: 13px;
  color: #999;
}

.job-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 4px 10px;
  background: #e8f4f8;
  color: #409eff;
  border-radius: 4px;
  font-size: 12px;
}

/* 公司卡片 */
.companies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.company-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.company-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.company-logo {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  font-weight: 700;
  flex-shrink: 0;
}

.company-info {
  flex: 1;
}

.company-name {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 6px 0;
}

.company-jobs {
  font-size: 13px;
  color: #999;
  margin: 0;
}

/* 特色功能 */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.feature-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 32px 24px;
  text-align: center;
  transition: all 0.3s;
}

.feature-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.feature-card h3 {
  font-size: 20px;
  color: #2c3e50;
  margin: 0 0 12px 0;
}

.feature-card p {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0;
}

/* CTA 区域 */
.cta-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 80px 20px;
  text-align: center;
  color: white;
}

.cta-content h2 {
  font-size: 36px;
  margin: 0 0 16px 0;
}

.cta-content p {
  font-size: 18px;
  margin: 0 0 32px 0;
  opacity: 0.95;
}

.cta-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.cta-btn {
  padding: 14px 32px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s;
  display: inline-block;
}

.cta-btn.primary {
  background: white;
  color: #667eea;
}

.cta-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
}

.cta-btn.secondary {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.cta-btn.secondary:hover {
  background: white;
  color: #667eea;
}

/* 加载状态 */
.loading {
  text-align: center;
  padding: 40px;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-title {
    font-size: 32px;
  }

  .hero-subtitle {
    font-size: 16px;
  }

  .search-input-group {
    flex-direction: column;
  }

  .location-input {
    flex: 1;
  }

  .stats-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }

  .stat-number {
    font-size: 32px;
  }

  .section-header h2 {
    font-size: 24px;
  }

  .jobs-grid,
  .companies-grid {
    grid-template-columns: 1fr;
  }

  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }

  .cta-btn {
    width: 100%;
    max-width: 300px;
  }
}
</style>
