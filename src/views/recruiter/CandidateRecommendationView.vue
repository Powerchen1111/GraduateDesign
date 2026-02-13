<template>
  <div class="candidate-recommendation-container">
    <div class="header">
      <h1>🎯 智能候选人推荐</h1>
      <p class="subtitle">基于 AI 语义分析为您的职位推荐最合适的候选人</p>
    </div>

    <!-- 职位选择 -->
    <div class="job-selector-card">
      <h3>选择职位</h3>
      <select v-model="selectedJobId" @change="loadRecommendations" class="job-select">
        <option value="">选择一个职位...</option>
        <option v-for="job in myJobs" :key="job.id" :value="job.id">
          {{ job.title }} - {{ job.companyName }}
        </option>
      </select>
      <div class="job-info" v-if="selectedJob">
        <span class="info-item">📍 {{ selectedJob.location }}</span>
        <span class="info-item">💰 {{ selectedJob.salaryRange }}</span>
        <span class="info-item">👥 {{ selectedJob.status === 'active' ? '招聘中' : '已关闭' }}</span>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>AI 正在分析候选人匹配度...</p>
    </div>

    <!-- 推荐结果 -->
    <div v-else-if="recommendations.length > 0" class="recommendations-section">
      <div class="results-header">
        <h2>为您推荐 {{ recommendations.length }} 位候选人</h2>
        <div class="sort-controls">
          <label>排序:</label>
          <select v-model="sortBy" @change="sortRecommendations">
            <option value="score">匹配度</option>
            <option value="education">学历</option>
          </select>
        </div>
      </div>

      <div class="candidate-cards-grid">
        <div
          v-for="candidate in recommendations"
          :key="candidate.resumeId"
          class="candidate-card"
          @click="viewResumeDetails(candidate.resumeId)"
        >
          <!-- 匹配分数标签 -->
          <div class="match-badge" :class="getMatchBadgeClass(candidate.totalScore)">
            {{ Math.round(candidate.totalScore) }}%
          </div>

          <!-- 候选人信息 -->
          <div class="candidate-header">
            <h3>{{ candidate.candidateName || '匿名候选人' }}</h3>
            <p class="contact-info">
              <span v-if="candidate.phone">📱 {{ candidate.phone }}</span>
              <span v-if="candidate.email">📧 {{ candidate.email }}</span>
            </p>
          </div>

          <div class="candidate-info">
            <div class="info-row" v-if="candidate.education">
              <span class="icon">🎓</span>
              <span>{{ candidate.education }}</span>
            </div>
            <div class="info-row" v-if="candidate.experience">
              <span class="icon">💼</span>
              <span>{{ candidate.experience }}</span>
            </div>
            <div class="info-row" v-if="candidate.skills">
              <span class="icon">🔧</span>
              <span class="skills-preview">{{ getSkillsPreview(candidate.skills) }}</span>
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
                    :style="{ width: candidate.scoreDetails.embeddingSimilarityScore + '%' }"
                  ></div>
                </div>
                <span class="score-value">{{ Math.round(candidate.scoreDetails.embeddingSimilarityScore) }}%</span>
              </div>
              <div class="score-item">
                <span class="score-label">技能匹配</span>
                <div class="score-bar">
                  <div
                    class="score-fill skill"
                    :style="{ width: candidate.scoreDetails.skillMatchScore + '%' }"
                  ></div>
                </div>
                <span class="score-value">{{ Math.round(candidate.scoreDetails.skillMatchScore) }}%</span>
              </div>
              <div class="score-item">
                <span class="score-label">硬性条件</span>
                <div class="score-bar">
                  <div
                    class="score-fill requirement"
                    :style="{ width: candidate.scoreDetails.hardRequirementScore + '%' }"
                  ></div>
                </div>
                <span class="score-value">{{ Math.round(candidate.scoreDetails.hardRequirementScore) }}%</span>
              </div>
            </div>
          </div>

          <!-- 匹配原因 -->
          <div class="match-reasons" v-if="candidate.matchReasons && candidate.matchReasons.length > 0">
            <h4>匹配原因</h4>
            <div class="reason-tags">
              <span
                v-for="(reason, index) in candidate.matchReasons.slice(0, 3)"
                :key="index"
                class="reason-tag"
              >
                {{ reason }}
              </span>
              <span v-if="candidate.matchReasons.length > 3" class="more-tag">
                +{{ candidate.matchReasons.length - 3 }} 更多
              </span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="candidate-actions" @click.stop>
            <button @click="viewResumeDetails(candidate.resumeId)" class="action-btn view-btn">
              查看简历
            </button>
            <button @click="contactCandidate(candidate)" class="action-btn contact-btn">
              联系候选人
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="!loading && selectedJobId" class="empty-state">
      <div class="empty-icon">🔍</div>
      <h3>暂无推荐候选人</h3>
      <p>该职位暂时没有匹配的候选人，请稍后再试</p>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">💼</div>
      <h3>请选择职位</h3>
      <p>选择一个职位来获取智能候选人推荐</p>
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
import { getResumeRecommendations } from '@/api/matching'
import { getPublisherJobs } from '@/api/job'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'CandidateRecommendationView',
  data() {
    return {
      myJobs: [],
      selectedJobId: '',
      selectedJob: null,
      recommendations: [],
      loading: false,
      errorMessage: '',
      sortBy: 'score'
    }
  },
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },
  mounted() {
    this.loadMyJobs()
  },
  methods: {
    async loadMyJobs() {
      try {
        const response = await getPublisherJobs(this.authStore.user.id)
        this.myJobs = response.jobs || []

        // 自动选择第一个职位
        if (this.myJobs.length > 0) {
          this.selectedJobId = this.myJobs[0].id
          this.selectedJob = this.myJobs[0]
          this.loadRecommendations()
        }
      } catch (error) {
        console.error('加载职位列表失败:', error)
        this.errorMessage = '加载职位列表失败'
      }
    },

    async loadRecommendations() {
      if (!this.selectedJobId) {
        return
      }

      // 更新选中的职位信息
      this.selectedJob = this.myJobs.find(job => job.id === this.selectedJobId)

      console.log('为职位推荐候选人，职位ID:', this.selectedJobId)
      this.loading = true
      this.errorMessage = ''

      try {
        const response = await getResumeRecommendations(this.selectedJobId, 20)
        console.log('推荐结果:', response)

        this.recommendations = Array.isArray(response) ? response : []
        this.sortRecommendations()

        if (this.recommendations.length === 0) {
          this.errorMessage = '暂无推荐候选人，请稍后再试'
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
      } else if (this.sortBy === 'education') {
        const eduLevels = { '博士': 5, '硕士': 4, '本科': 3, '大专': 2, '高中': 1 }
        this.recommendations.sort((a, b) => {
          const getEduLevel = (edu) => {
            if (!edu) return 0
            for (const [key, value] of Object.entries(eduLevels)) {
              if (edu.includes(key)) return value
            }
            return 0
          }
          return getEduLevel(b.education) - getEduLevel(a.education)
        })
      }
    },

    getMatchBadgeClass(score) {
      if (score >= 85) return 'excellent'
      if (score >= 70) return 'good'
      if (score >= 55) return 'fair'
      return 'low'
    },

    getSkillsPreview(skills) {
      if (!skills) return '暂无'
      if (typeof skills === 'string') {
        return skills.length > 50 ? skills.substring(0, 50) + '...' : skills
      }
      return skills
    },

    viewResumeDetails(resumeId) {
      console.log('查看简历详情:', resumeId)
      this.$router.push(`/resumes/${resumeId}`)
    },

    contactCandidate(candidate) {
      if (candidate.phone) {
        alert(`候选人联系方式：\n电话：${candidate.phone}\n邮箱：${candidate.email || '未提供'}`)
      } else {
        alert('该候选人未提供联系方式')
      }
    }
  }
}
</script>

<style scoped>
.candidate-recommendation-container {
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

.job-selector-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
}

.job-selector-card h3 {
  margin: 0 0 12px 0;
  color: #2c3e50;
  font-size: 16px;
}

.job-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  margin-bottom: 12px;
}

.job-info {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.info-item {
  font-size: 14px;
  color: #666;
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

.candidate-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 20px;
}

.candidate-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: relative;
}

.candidate-card:hover {
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

.candidate-header {
  margin-bottom: 16px;
  padding-right: 80px;
}

.candidate-header h3 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 18px;
}

.contact-info {
  margin: 0;
  color: #7f8c8d;
  font-size: 13px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.candidate-info {
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
}

.icon {
  font-size: 16px;
  flex-shrink: 0;
}

.skills-preview {
  flex: 1;
  word-break: break-word;
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

.candidate-actions {
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

.contact-btn {
  background: #3498db;
  color: white;
}

.contact-btn:hover {
  background: #2980b9;
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
  .candidate-cards-grid {
    grid-template-columns: 1fr;
  }

  .results-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
