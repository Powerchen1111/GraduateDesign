<template>
  <div class="job-detail-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 职位详情 -->
    <div v-else-if="job" class="job-detail">
      <!-- 返回按钮 -->
      <button @click="goBack" class="back-btn">
        ← 返回
      </button>

      <!-- 职位头部 -->
      <div class="job-header">
        <div class="job-title-section">
          <h1>{{ job.title }}</h1>
          <div class="job-meta">
            <span class="company">🏢 {{ job.companyName }}</span>
            <span class="location">📍 {{ job.location }}</span>
            <span class="salary">💰 {{ job.salaryRange || getSalaryRange() }}</span>
          </div>
        </div>
        <div class="job-actions">
          <button class="primary-btn">立即申请</button>
          <button class="secondary-btn">收藏职位</button>
        </div>
      </div>

      <!-- 职位信息卡片 -->
      <div class="info-grid">
        <div class="info-card">
          <h3>基本信息</h3>
          <div class="info-items">
            <div class="info-item">
              <span class="label">学历要求:</span>
              <span class="value">{{ job.educationRequirement || '不限' }}</span>
            </div>
            <div class="info-item">
              <span class="label">工作经验:</span>
              <span class="value">{{ job.experienceRequirement || '不限' }}</span>
            </div>
            <div class="info-item">
              <span class="label">工作类型:</span>
              <span class="value">{{ job.jobType || '全职' }}</span>
            </div>
            <div class="info-item">
              <span class="label">所属行业:</span>
              <span class="value">{{ job.industry || '未分类' }}</span>
            </div>
            <div class="info-item">
              <span class="label">发布时间:</span>
              <span class="value">{{ formatTime(job.publishTime) }}</span>
            </div>
            <div class="info-item">
              <span class="label">浏览次数:</span>
              <span class="value">{{ job.viewCount || 0 }} 次</span>
            </div>
          </div>
        </div>

        <div class="info-card">
          <h3>公司信息</h3>
          <div class="info-items">
            <div class="info-item">
              <span class="label">公司名称:</span>
              <span class="value">{{ job.companyName }}</span>
            </div>
            <div class="info-item" v-if="job.companySize">
              <span class="label">公司规模:</span>
              <span class="value">{{ job.companySize }}</span>
            </div>
            <div class="info-item" v-if="job.companyType">
              <span class="label">公司类型:</span>
              <span class="value">{{ job.companyType }}</span>
            </div>
            <div class="info-item" v-if="job.sourceWebsite">
              <span class="label">信息来源:</span>
              <span class="value">{{ job.sourceWebsite }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 职位描述 -->
      <div class="detail-card">
        <h3>职位描述</h3>
        <div class="content" v-html="formatContent(job.description)"></div>
      </div>

      <!-- 任职要求 -->
      <div class="detail-card">
        <h3>任职要求</h3>
        <div class="content" v-html="formatContent(job.requirements)"></div>
      </div>

      <!-- 关键词标签 -->
      <div class="detail-card" v-if="job.keywords">
        <h3>职位标签</h3>
        <div class="tags">
          <span v-for="(keyword, index) in getKeywords()" :key="index" class="tag">
            {{ keyword }}
          </span>
        </div>
      </div>

      <!-- 底部操作栏 -->
      <div class="bottom-actions">
        <button class="primary-btn large">立即申请</button>
        <button class="secondary-btn large">分享职位</button>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>职位不存在</h3>
      <p>该职位可能已被删除或不存在</p>
      <button @click="goBack" class="primary-btn">返回</button>
    </div>
  </div>
</template>

<script>
import { getJobById } from '@/api/job'

export default {
  name: 'JobDetailView',
  data() {
    return {
      job: null,
      loading: false,
      errorMessage: ''
    }
  },
  mounted() {
    this.loadJobDetail()
  },
  methods: {
    async loadJobDetail() {
      const jobId = this.$route.params.id
      console.log('加载职位详情，ID:', jobId)

      this.loading = true
      this.errorMessage = ''

      try {
        const response = await getJobById(jobId)
        console.log('职位详情响应:', response)

        this.job = response
      } catch (error) {
        console.error('加载职位详情失败:', error)
        this.errorMessage = '加载职位详情失败'
      } finally {
        this.loading = false
      }
    },

    getSalaryRange() {
      if (!this.job) return '面议'

      const { salaryMin, salaryMax, salaryCurrency } = this.job

      if (!salaryMin && !salaryMax) return '面议'

      if (salaryMin && salaryMax) {
        return `${salaryMin}-${salaryMax}${salaryCurrency || '元/月'}`
      }

      if (salaryMin) {
        return `${salaryMin}${salaryCurrency || '元/月'}以上`
      }

      return `${salaryMax}${salaryCurrency || '元/月'}以下`
    },

    getKeywords() {
      if (!this.job || !this.job.keywords) return []

      return this.job.keywords.split(/[,，、;；]/).map(k => k.trim()).filter(k => k)
    },

    formatContent(content) {
      if (!content) return '<p>暂无信息</p>'

      // 将换行符转换为 <br>
      // 将数字开头的行转换为列表项
      return content
        .split('\n')
        .map(line => {
          line = line.trim()
          if (!line) return ''

          // 检测是否为列表项（以数字、符号等开头）
          if (/^[\d\-\*\•]/.test(line)) {
            return `<li>${line.replace(/^[\d\-\*\•\.\)]\s*/, '')}</li>`
          }

          return `<p>${line}</p>`
        })
        .join('')
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
      if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`

      return date.toLocaleDateString('zh-CN')
    },

    goBack() {
      this.$router.back()
    }
  }
}
</script>

<style scoped>
.job-detail-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
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

.back-btn {
  padding: 8px 16px;
  background: #f5f5f5;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  margin-bottom: 24px;
  transition: background 0.2s;
}

.back-btn:hover {
  background: #e0e0e0;
}

.job-detail {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 24px;
  border-bottom: 2px solid #f0f0f0;
  margin-bottom: 32px;
}

.job-title-section h1 {
  font-size: 28px;
  color: #2c3e50;
  margin: 0 0 16px 0;
}

.job-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  font-size: 15px;
  color: #666;
}

.job-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.company {
  font-weight: 600;
  color: #2c3e50;
}

.salary {
  color: #f56c6c;
  font-weight: 600;
}

.job-actions {
  display: flex;
  gap: 12px;
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

.primary-btn.large {
  padding: 14px 32px;
  font-size: 16px;
}

.secondary-btn {
  padding: 12px 24px;
  background: white;
  color: #42b983;
  border: 2px solid #42b983;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.secondary-btn:hover {
  background: #42b983;
  color: white;
}

.secondary-btn.large {
  padding: 14px 32px;
  font-size: 16px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.info-card {
  background: #f8f9fa;
  padding: 24px;
  border-radius: 10px;
}

.info-card h3 {
  font-size: 18px;
  color: #2c3e50;
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #e0e0e0;
}

.info-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-item .label {
  color: #666;
  font-size: 14px;
  min-width: 100px;
}

.info-item .value {
  color: #2c3e50;
  font-size: 14px;
  font-weight: 500;
  text-align: right;
}

.detail-card {
  background: white;
  padding: 24px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  margin-bottom: 20px;
}

.detail-card h3 {
  font-size: 18px;
  color: #2c3e50;
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}

.content {
  color: #666;
  font-size: 15px;
  line-height: 1.8;
}

.content p {
  margin: 12px 0;
}

.content li {
  margin: 8px 0;
  padding-left: 20px;
  position: relative;
}

.content li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: #42b983;
  font-weight: bold;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag {
  padding: 6px 14px;
  background: #e8f5e9;
  color: #2e7d32;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
}

.bottom-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 40px;
  padding-top: 32px;
  border-top: 2px solid #f0f0f0;
}

.error-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
}

.error-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.error-state h3 {
  color: #2c3e50;
  margin: 0 0 12px 0;
  font-size: 20px;
}

.error-state p {
  color: #999;
  margin: 0 0 24px 0;
  font-size: 14px;
}

@media (max-width: 768px) {
  .job-header {
    flex-direction: column;
    gap: 20px;
  }

  .job-actions {
    width: 100%;
  }

  .job-actions button {
    flex: 1;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .bottom-actions {
    flex-direction: column;
  }

  .bottom-actions button {
    width: 100%;
  }
}
</style>
