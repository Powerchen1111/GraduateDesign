<template>
  <div class="job-recommendation-container">
    <div class="header">
      <h1>🎯 智能职位推荐</h1>
      <p class="subtitle">基于 AI 语义分析的智能匹配</p>
    </div>

    <!-- 推荐模式选择 -->
    <div class="mode-selector">
      <button
        :class="['mode-btn', { active: mode === 'preference' }]"
        @click="mode = 'preference'"
      >
        💡 需求推荐
      </button>
      <button
        :class="['mode-btn', { active: mode === 'resume' }]"
        @click="mode = 'resume'"
      >
        📄 简历推荐
      </button>
    </div>

    <!-- 需求推荐模式 -->
    <div v-if="mode === 'preference'" class="preference-section">
      <div class="preference-card">
        <h3>📝 告诉我们您的求职需求</h3>
        <p class="hint">我们将根据您的需求，使用 AI 为您智能匹配最合适的职位</p>

        <div class="preference-form">
          <div class="form-row">
            <div class="form-group">
              <label>期望职位 <span class="required">*</span></label>
              <input
                v-model="preference.desiredPosition"
                placeholder="如：Java开发工程师、产品经理"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>期望地点</label>
              <input
                v-model="preference.location"
                placeholder="如：北京、上海、深圳"
                class="form-input"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>期望行业</label>
              <select v-model="preference.industry" class="form-input">
                <option value="">不限</option>
                <option>互联网</option>
                <option>金融</option>
                <option>教育</option>
                <option>医疗</option>
                <option>电子商务</option>
                <option>制造业</option>
                <option>房地产</option>
                <option>交通物流</option>
                <option>文化传媒</option>
                <option>游戏</option>
                <option>人工智能</option>
                <option>新能源</option>
                <option>服务业</option>
              </select>
            </div>
            <div class="form-group">
              <label>期望薪资（元/月）</label>
              <div class="salary-range">
                <input
                  v-model.number="preference.salaryMin"
                  type="number"
                  placeholder="最低"
                  class="form-input"
                />
                <span>-</span>
                <input
                  v-model.number="preference.salaryMax"
                  type="number"
                  placeholder="最高"
                  class="form-input"
                />
              </div>
            </div>
          </div>

          <div class="form-group full-width">
            <label>您的技能和经验</label>
            <textarea
              v-model="preference.skills"
              placeholder="请描述您的技能、经验、优势等，如：精通Java、Spring Boot，3年开发经验，熟悉微服务架构..."
              class="form-textarea"
              rows="4"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>工作类型</label>
              <select v-model="preference.jobType" class="form-input">
                <option value="">不限</option>
                <option>全职</option>
                <option>兼职</option>
                <option>实习</option>
                <option>远程</option>
              </select>
            </div>
            <div class="form-group">
              <label>期望数量</label>
              <input
                v-model.number="preference.topK"
                type="number"
                min="5"
                max="50"
                class="form-input"
              />
            </div>
          </div>

          <button
            @click="getRecommendationsByPreference"
            :disabled="loading || !preference.desiredPosition"
            class="recommend-btn"
          >
            <span v-if="!loading">🚀 开始推荐</span>
            <span v-else>⏳ AI 分析中...</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 简历推荐模式（原有功能） -->
    <div v-else class="resume-section">
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
            <div class="info-row" v-if="job.sourceWebsite">
              <span class="icon">🔗</span>
              <span class="source-tag">{{ job.sourceWebsite }}</span>
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
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/api'

export default {
  name: 'JobRecommendationView',
  data() {
    return {
      mode: 'preference',  // 'preference' 或 'resume'
      // 需求推荐相关
      preference: {
        desiredPosition: '',
        location: '',
        industry: '',
        salaryMin: null,
        salaryMax: null,
        skills: '',
        jobType: '',
        topK: 10
      },
      // 简历推荐相关
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
    /**
     * 根据需求推荐职位
     */
    async getRecommendationsByPreference() {
      if (!this.preference.desiredPosition) {
        this.errorMessage = '请填写期望职位'
        return
      }

      this.loading = true
      this.errorMessage = ''
      this.recommendations = []

      try {
        // 构建需求描述文本
        let preferenceText = `期望职位：${this.preference.desiredPosition}。`

        if (this.preference.location) {
          preferenceText += `期望地点：${this.preference.location}。`
        }
        if (this.preference.industry) {
          preferenceText += `期望行业：${this.preference.industry}。`
        }
        if (this.preference.salaryMin || this.preference.salaryMax) {
          preferenceText += `期望薪资：${this.preference.salaryMin || '不限'}-${this.preference.salaryMax || '不限'}元/月。`
        }
        if (this.preference.jobType) {
          preferenceText += `工作类型：${this.preference.jobType}。`
        }
        if (this.preference.skills) {
          preferenceText += `技能和经验：${this.preference.skills}`
        }

        console.log('需求文本:', preferenceText)

        // 调用推荐API
        const response = await axios.post(
          API_BASE_URL + '/matching/recommend-by-preference',
          {
            preferenceText: preferenceText,
            topK: this.preference.topK,
            location: this.preference.location,
            industry: this.preference.industry,
            salaryMin: this.preference.salaryMin,
            salaryMax: this.preference.salaryMax
          }
        )

        console.log('推荐结果:', response.data)
        this.recommendations = Array.isArray(response.data) ? response.data : []

        if (this.recommendations.length === 0) {
          this.errorMessage = '暂无匹配的职位，请尝试调整您的需求'
        }
      } catch (error) {
        console.error('获取推荐失败:', error)
        this.errorMessage = '获取推荐失败，请稍后重试'
        this.recommendations = []
      } finally {
        this.loading = false
      }
    },
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

.source-tag {
  color: #42b983;
  font-weight: 500;
  font-size: 12px;
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

/* 模式选择器样式 */
.mode-selector {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  padding: 8px;
  background: #f5f7fa;
  border-radius: 12px;
}

.mode-btn {
  flex: 1;
  padding: 12px 24px;
  border: 2px solid transparent;
  background: transparent;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  color: #666;
}

.mode-btn.active {
  background: white;
  color: #42b983;
  border-color: #42b983;
  box-shadow: 0 2px 8px rgba(66, 185, 131, 0.2);
}

.mode-btn:hover:not(.active) {
  background: rgba(255, 255, 255, 0.5);
  color: #42b983;
}

/* 需求推荐样式 */
.preference-section {
  margin-bottom: 32px;
}

.preference-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.preference-card h3 {
  color: #2c3e50;
  margin: 0 0 8px 0;
  font-size: 20px;
}

.preference-card .hint {
  color: #999;
  font-size: 14px;
  margin: 0 0 24px 0;
}

.preference-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: 500;
  color: #2c3e50;
  font-size: 14px;
}

.form-group .required {
  color: #f56c6c;
}

.form-input {
  padding: 12px 16px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.1);
}

.form-textarea {
  padding: 12px 16px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: all 0.3s;
}

.form-textarea:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.1);
}

.salary-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.salary-range input {
  flex: 1;
}

.salary-range span {
  color: #999;
  font-weight: 500;
}

.recommend-btn {
  margin-top: 8px;
  padding: 14px 32px;
  background: linear-gradient(135deg, #42b983 0%, #35a06f 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.3);
}

.recommend-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(66, 185, 131, 0.4);
}

.recommend-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 简历推荐样式 */
.resume-section {
  margin-bottom: 32px;
}
</style>
