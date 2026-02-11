<template>
  <div class="job-publish-container">
    <div class="publish-card">
      <div class="card-header">
        <h2>发布职位</h2>
        <p>填写职位信息，吸引优秀人才</p>
      </div>

      <form @submit.prevent="handleSubmit" class="publish-form">
        <!-- 基本信息 -->
        <div class="form-section">
          <h3>基本信息</h3>

          <div class="form-item">
            <label>职位名称 <span class="required">*</span></label>
            <input
              v-model="formData.title"
              type="text"
              placeholder="例如：Java后端开发工程师"
              maxlength="100"
            />
            <span v-if="errors.title" class="error-text">{{ errors.title }}</span>
          </div>

          <div class="form-row">
            <div class="form-item">
              <label>工作地点 <span class="required">*</span></label>
              <input
                v-model="formData.location"
                type="text"
                placeholder="例如：北京-朝阳区"
              />
              <span v-if="errors.location" class="error-text">{{ errors.location }}</span>
            </div>

            <div class="form-item">
              <label>所属行业</label>
              <input
                v-model="formData.industry"
                type="text"
                placeholder="例如：互联网"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-item">
              <label>最低薪资 (元/月)</label>
              <input
                v-model.number="formData.salaryMin"
                type="number"
                placeholder="10000"
                min="0"
              />
            </div>

            <div class="form-item">
              <label>最高薪资 (元/月)</label>
              <input
                v-model.number="formData.salaryMax"
                type="number"
                placeholder="20000"
                min="0"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-item">
              <label>学历要求</label>
              <select v-model="formData.educationRequirement">
                <option value="">不限</option>
                <option value="高中">高中</option>
                <option value="大专">大专</option>
                <option value="本科">本科</option>
                <option value="硕士">硕士</option>
                <option value="博士">博士</option>
              </select>
            </div>

            <div class="form-item">
              <label>工作经验</label>
              <select v-model="formData.experienceRequirement">
                <option value="">不限</option>
                <option value="应届生">应届生</option>
                <option value="1年以下">1年以下</option>
                <option value="1-3年">1-3年</option>
                <option value="3-5年">3-5年</option>
                <option value="5-10年">5-10年</option>
                <option value="10年以上">10年以上</option>
              </select>
            </div>
          </div>

          <div class="form-item">
            <label>工作类型</label>
            <select v-model="formData.jobType">
              <option value="全职">全职</option>
              <option value="兼职">兼职</option>
              <option value="实习">实习</option>
              <option value="远程">远程</option>
            </select>
          </div>
        </div>

        <!-- 职位描述 -->
        <div class="form-section">
          <h3>职位描述 <span class="required">*</span></h3>
          <textarea
            v-model="formData.description"
            placeholder="请详细描述职位职责、工作内容等..."
            rows="8"
          ></textarea>
          <span v-if="errors.description" class="error-text">{{ errors.description }}</span>
        </div>

        <!-- 任职要求 -->
        <div class="form-section">
          <h3>任职要求 <span class="required">*</span></h3>
          <textarea
            v-model="formData.requirements"
            placeholder="请详细描述任职要求、技能要求等..."
            rows="8"
          ></textarea>
          <span v-if="errors.requirements" class="error-text">{{ errors.requirements }}</span>
        </div>

        <!-- 关键词 -->
        <div class="form-section">
          <h3>职位关键词</h3>
          <input
            v-model="formData.keywords"
            type="text"
            placeholder="用逗号分隔，例如：Java,Spring Boot,MySQL"
          />
          <p class="hint">关键词有助于求职者搜索到您的职位</p>
        </div>

        <!-- 错误提示 -->
        <div v-if="errorMessage" class="error-banner">
          {{ errorMessage }}
        </div>

        <!-- 提交按钮 -->
        <div class="form-actions">
          <button type="button" class="secondary-btn" @click="goBack">取消</button>
          <button type="submit" class="primary-btn" :disabled="publishing">
            {{ publishing ? '发布中...' : '发布职位' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { publishJob } from '@/api/jobManagement'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'JobPublishView',
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },
  data() {
    return {
      formData: {
        title: '',
        location: '',
        industry: '',
        salaryMin: null,
        salaryMax: null,
        educationRequirement: '',
        experienceRequirement: '',
        jobType: '全职',
        description: '',
        requirements: '',
        keywords: ''
      },
      errors: {},
      errorMessage: '',
      publishing: false
    }
  },
  methods: {
    validateForm() {
      this.errors = {}
      this.errorMessage = ''

      if (!this.formData.title) {
        this.errors.title = '请输入职位名称'
        return false
      }

      if (!this.formData.location) {
        this.errors.location = '请输入工作地点'
        return false
      }

      if (!this.formData.description) {
        this.errors.description = '请输入职位描述'
        return false
      }

      if (!this.formData.requirements) {
        this.errors.requirements = '请输入任职要求'
        return false
      }

      if (this.formData.salaryMin && this.formData.salaryMax) {
        if (this.formData.salaryMin > this.formData.salaryMax) {
          this.errorMessage = '最低薪资不能大于最高薪资'
          return false
        }
      }

      return true
    },

    async handleSubmit() {
      if (!this.validateForm()) {
        return
      }

      if (!this.authStore.isRecruiter && !this.authStore.isAdmin) {
        this.errorMessage = '只有招聘者可以发布职位'
        return
      }

      this.publishing = true
      this.errorMessage = ''

      try {
        // 准备提交数据
        const jobData = {
          ...this.formData,
          companyName: this.authStore.user.company || '未知公司',
          status: 'ACTIVE'
        }

        const response = await publishJob(jobData, this.authStore.user.id)
        console.log('发布响应:', response)

        if (response.success) {
          alert('职位发布成功！')
          this.$router.push('/my-jobs')
        } else {
          this.errorMessage = response.error || '发布失败'
        }
      } catch (error) {
        console.error('发布失败:', error)
        this.errorMessage = error.error || '发布失败，请稍后重试'
      } finally {
        this.publishing = false
      }
    },

    goBack() {
      this.$router.back()
    }
  }
}
</script>

<style scoped>
.job-publish-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}

.publish-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 32px;
  text-align: center;
}

.card-header h2 {
  margin: 0 0 8px 0;
  font-size: 28px;
}

.card-header p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.publish-form {
  padding: 32px;
}

.form-section {
  margin-bottom: 32px;
}

.form-section h3 {
  font-size: 18px;
  color: #2c3e50;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}

.form-item {
  margin-bottom: 20px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.required {
  color: #f56c6c;
}

.form-item input,
.form-item select,
.form-item textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.3s;
}

.form-item input:focus,
.form-item select:focus,
.form-item textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-item textarea {
  resize: vertical;
  font-family: inherit;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.error-text {
  display: block;
  margin-top: 5px;
  font-size: 12px;
  color: #f56c6c;
}

.hint {
  margin-top: 5px;
  font-size: 12px;
  color: #999;
}

.error-banner {
  padding: 12px;
  background: #fef0f0;
  border: 1px solid #fde2e2;
  border-radius: 6px;
  color: #f56c6c;
  font-size: 14px;
  margin-bottom: 20px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 2px solid #f0f0f0;
}

.primary-btn {
  padding: 12px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: transform 0.2s;
}

.primary-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.secondary-btn {
  padding: 12px 32px;
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s;
}

.secondary-btn:hover {
  background: #667eea;
  color: white;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .form-actions button {
    width: 100%;
  }
}
</style>
