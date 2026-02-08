<template>
  <div class="job-recommendation-container">
    <div class="header">
      <h1>🎯 智能职位推荐</h1>
      <p class="subtitle">基于 AI 语义分析的智能匹配</p>
    </div>

    <!-- 简历选择器 -->
    <div class="resume-selector-card">
      <h3>选择简历</h3>
      <select v-model="selectedResumeId" @change="loadRecommendations" class="resume-select">
        <option value="">选择一份简历...</option>
        <option v-for="resume in myResumes" :key="resume.id" :value="resume.id">
          {{ resume.personalInfo?.name || '未命名简历' }} - {{ resume.fileName }}
        </option>
      </select>
      <button @click="loadAllRecommendations" class="load-all-btn">
        🌟 查看所有推荐
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>AI 正在分析匹配度...</p>
    </div>

    <!-- 推荐结果 -->
    <div v-else-if="recommendations.length > 0" class="recommendations-section">
      <div class="results-header">
        <h2>为您推荐 {{ recommendations.length }} 个职位</h2>
        <div class="sort-controls">
          <label>排序:</label>
          <select v-model="sortBy" @change="sortRecommendations">
            <option value="score">匹配度</option>
            <option value="salary">薪资</option>
          </select>
        </div>
      </div>

      <div class="job-cards-grid">
        <div
          v-for="job in recommendations"
          :key="job.jobId"
          class="job-card"
          @click="viewJobDetails(job.jobId)"
        >
          <!-- 匹配分数标签 -->
          <div class="match-badge" :class="getMatchBadgeClass(job.totalScore)">
            {{ Math.round(job.totalScore) }}%
          </div>

          <!-- 职位信息 -->
          <div class="job-header">
            <h3>{{ job.title }}</h3>
            <p class="company">🏢 {{ job.companyName }}</p>
          </div>

          <div class="job-info">
            <div class="info-row">
              <span class="icon">📍</span>
              <span>{{ job.location || '地点未知' }}</span>
            </div>
            <div class="info-row">
              <span class="icon">💰</span>
              <span>{{ job.salaryRange || '薪资面议' }}</span>
            </div>
          </div>

          <!-- 匹配详情 -->
          <div class="match-details">
            <div class="score-bars">
              <div class="score-item">
                <span class="score-label">语义匹配</span>
                <div class="score-bar">
                  <div
                    class="score-fill"
                    :style="{ width: job.scoreDetails.embeddingSimilarityScore + '%' }"
                  ></div>
                </div>
                <span class="score-value">{{ Math.round(job.scoreDetails.embeddingSimilarityScore) }}%</span>
              </div>
              <div class="score-item">
                <span class="score-label">技能匹配</span>
                <div class="score-bar">
                  <div
                    class="score-fill skill"
                    :style="{ width: job.scoreDetails.skillMatchScore + '%' }"
                  ></div>
                </div>
                <span class="score-value">{{ Math.round(job.scoreDetails.skillMatchScore) }}%</span>
              </div>
              <div class="score-item">
                <span class="score-label">硬性条件</span>
                <div class="score-bar">
                  <div
                    class="score-fill requirement"
                    :style="{ width: job.scoreDetails.hardRequirementScore + '%' }"
                  ></div>
                </div>
                <span class="score-value">{{ Math.round(job.scoreDetails.hardRequirementScore) }}%</span>
              </div>
            </div>
          </div>

          <!-- 匹配原因 -->
          <div class="match-reasons" v-if="job.matchReasons && job.matchReasons.length > 0">
            <h4>匹配原因</h4>
            <div class="reason-tags">
              <span
                v-for="(reason, index) in job.matchReasons.slice(0, 3)"
                :key="index"
                class="reason-tag"
              >
                {{ reason }}
              </span>
              <span v-if="job.matchReasons.length > 3" class="more-tag">
                +{{ job.matchReasons.length - 3 }} 更多
              </span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="job-actions" @click.stop>
            <button @click="viewJobDetails(job.jobId)" class="action-btn view-btn">
              查看详情
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="!loading && selectedResumeId" class="empty-state">
      <div class="empty-icon">🔍</div>
      <h3>暂无推荐职位</h3>
      <p>该简历暂时没有匹配的职位，请稍后再试</p>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">📄</div>
      <h3>请选择简历</h3>
      <p>选择一份简历来获取智能职位推荐</p>
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
import { getJobRecommendations, getMyRecommendations } from '@/api/matching'
import { getResumes } from '@/api/resume'

export default {
  name: 'JobRecommendationView',
  data() {
    return {
      myResumes: [],
      selectedResumeId: '',
      recommendations: [],
      loading: false,
      errorMessage: '',
      sortBy: 'score'
    }
  },
  mounted() {
    this.loadMyResumes()
  },
  methods: {
    async loadMyResumes() {
      try {
        const response = await getResumes(true)
        console.log('我的简历:', response)
        this.myResumes = Array.isArray(response) ? response : []

        // 自动选择第一份简历
        if (this.myResumes.length > 0) {
          this.selectedResumeId = this.myResumes[0].id
          this.loadRecommendations()
        }
      } catch (error) {
        console.error('加载简历列表失败:', error)
        this.errorMessage = '加载简历列表失败'
      }
    },

    async loadRecommendations() {
      if (!this.selectedResumeId) {
        return
      }

      console.log('为简历推荐职位，简历ID:', this.selectedResumeId)
      this.loading = true
      this.errorMessage = ''

      try {
        const response = await getJobRecommendations(this.selectedResumeId, 20)
        console.log('推荐结果:', response)

        this.recommendations = Array.isArray(response) ? response : []
        this.sortRecommendations()

        if (this.recommendations.length === 0) {
          this.errorMessage = '暂无推荐职位，请稍后再试'
        }
      } catch (error) {
        console.error('加载推荐失败:', error)
        this.errorMessage = '加载推荐失败: ' + (error.message || '未知错误')
        this.recommendations = []
      } finally {
        this.loading = false
      }
    },

    async loadAllRecommendations() {
      console.log('加载所有简历的推荐')
      this.loading = true
      this.errorMessage = ''

      try {
        const response = await getMyRecommendations(20)
        console.log('所有推荐结果:', response)

        this.recommendations = Array.isArray(response) ? response : []
        this.sortRecommendations()

        if (this.recommendations.length === 0) {
          this.errorMessage = '暂无推荐职位，请稍后再试'
        }
      } catch (error) {
        console.error('加载推荐失败:', error)
        this.errorMessage = '加载推荐失败: ' + (error.message || '未知错误')
        this.recommendations = []
      } finally {
        this.loading = false
      }
    },

    sortRecommendations() {
      if (this.sortBy === 'score') {
        this.recommendations.sort((a, b) => b.totalScore - a.totalScore)
      } else if (this.sortBy === 'salary') {
        // 简化处理：假设薪资范围格式为 "10000-20000"
        this.recommendations.sort((a, b) => {
          const getSalaryAvg = (range) => {
            if (!range || range === '面议') return 0
            const match = range.match(/(\d+)-(\d+)/)
            if (match) {
              return (parseInt(match[1]) + parseInt(match[2])) / 2
            }
            return 0
          }
          return getSalaryAvg(b.salaryRange) - getSalaryAvg(a.salaryRange)
        })
      }
    },

    getMatchBadgeClass(score) {
      if (score >= 85) return 'excellent'
      if (score >= 70) return 'good'
      if (score >= 55) return 'fair'
      return 'low'
    },

    viewJobDetails(jobId) {
      // 跳转到职位详情页
      console.log('查看职位详情:', jobId)
      this.$router.push(`/jobs/${jobId}`)
    }
  }
}
</script>

<style scoped>
.job-recommendation-container {
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

.resume-selector-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.resume-selector-card h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 16px;
  min-width: 80px;
}

.resume-select {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.load-all-btn {
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

.load-all-btn:hover {
  transform: translateY(-2px);
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

.recommendations-section {
  margin-top: 24px;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.results-header h2 {
  color: #2c3e50;
  font-size: 22px;
  margin: 0;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sort-controls label {
  color: #7f8c8d;
  font-size: 14px;
}

.sort-controls select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.job-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 20px;
}

.job-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: relative;
}

.job-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: #42b983;
}

.match-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 14px;
}

.match-badge.excellent {
  background: #d4edda;
  color: #155724;
}

.match-badge.good {
  background: #d1ecf1;
  color: #0c5460;
}

.match-badge.fair {
  background: #fff3cd;
  color: #856404;
}

.match-badge.low {
  background: #f8d7da;
  color: #721c24;
}

.job-header {
  margin-bottom: 16px;
  padding-right: 80px;
}

.job-header h3 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 18px;
}

.company {
  margin: 0;
  color: #7f8c8d;
  font-size: 14px;
}

.job-info {
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
}

.icon {
  font-size: 16px;
}

.match-details {
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.score-bars {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.score-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.score-label {
  font-size: 12px;
  color: #666;
  min-width: 60px;
}

.score-bar {
  flex: 1;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  background: linear-gradient(90deg, #42b983 0%, #35495e 100%);
  transition: width 0.3s;
}

.score-fill.skill {
  background: linear-gradient(90deg, #3498db 0%, #2980b9 100%);
}

.score-fill.requirement {
  background: linear-gradient(90deg, #f39c12 0%, #e67e22 100%);
}

.score-value {
  font-size: 12px;
  color: #2c3e50;
  font-weight: 500;
  min-width: 35px;
  text-align: right;
}

.match-reasons {
  margin-bottom: 16px;
}

.match-reasons h4 {
  font-size: 13px;
  color: #666;
  margin: 0 0 8px 0;
}

.reason-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.reason-tag {
  padding: 4px 10px;
  background: #e8f5e9;
  color: #2e7d32;
  border-radius: 12px;
  font-size: 12px;
}

.more-tag {
  padding: 4px 10px;
  background: #f5f5f5;
  color: #666;
  border-radius: 12px;
  font-size: 12px;
}

.job-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.view-btn {
  background: #42b983;
  color: white;
}

.view-btn:hover {
  background: #35a06f;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
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
  .job-cards-grid {
    grid-template-columns: 1fr;
  }

  .resume-selector-card {
    flex-direction: column;
    align-items: stretch;
  }

  .resume-selector-card h3 {
    min-width: auto;
  }

  .results-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
