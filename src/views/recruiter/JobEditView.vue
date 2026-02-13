<template>
  <div class="job-edit-container">
    <div class="page-header">
      <h2>编辑职位</h2>
      <button class="back-btn" @click="goBack">
        ← 返回
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>加载职位信息中...</p>
    </div>

    <!-- 编辑表单 -->
    <div v-else-if="job" class="edit-form">
      <div class="form-section">
        <h3>基本信息</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>职位名称 <span class="required">*</span></label>
            <input
              v-model="job.title"
              type="text"
              placeholder="请输入职位名称"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>公司名称 <span class="required">*</span></label>
            <input
              v-model="job.companyName"
              type="text"
              placeholder="请输入公司名称"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>工作地点 <span class="required">*</span></label>
            <input
              v-model="job.location"
              type="text"
              placeholder="例如：北京-朝阳区"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>行业分类</label>
            <input
              v-model="job.industry"
              type="text"
              placeholder="例如：互联网/IT"
              class="form-input"
            />
          </div>
        </div>
      </div>

      <div class="form-section">
        <h3>薪资待遇</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>最低薪资（元/月）</label>
            <input
              v-model.number="job.salaryMin"
              type="number"
              placeholder="例如：10000"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>最高薪资（元/月）</label>
            <input
              v-model.number="job.salaryMax"
              type="number"
              placeholder="例如：20000"
              class="form-input"
            />
          </div>

          <div class="form-group full-width">
            <label>薪资范围描述</label>
            <input
              v-model="job.salaryRange"
              type="text"
              placeholder="例如：10k-20k·13薪"
              class="form-input"
            />
          </div>
        </div>
      </div>

      <div class="form-section">
        <h3>任职要求</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>学历要求</label>
            <select v-model="job.educationRequirement" class="form-select">
              <option value="">不限</option>
              <option value="高中">高中</option>
              <option value="大专">大专</option>
              <option value="本科">本科</option>
              <option value="硕士">硕士</option>
              <option value="博士">博士</option>
            </select>
          </div>

          <div class="form-group">
            <label>经验要求</label>
            <select v-model="job.experienceRequirement" class="form-select">
              <option value="">不限</option>
              <option value="应届生">应届生</option>
              <option value="1年以下">1年以下</option>
              <option value="1-3年">1-3年</option>
              <option value="3-5年">3-5年</option>
              <option value="5-10年">5-10年</option>
              <option value="10年以上">10年以上</option>
            </select>
          </div>

          <div class="form-group">
            <label>工作类型</label>
            <select v-model="job.jobType" class="form-select">
              <option value="全职">全职</option>
              <option value="兼职">兼职</option>
              <option value="实习">实习</option>
              <option value="合同工">合同工</option>
            </select>
          </div>
        </div>
      </div>

      <div class="form-section">
        <h3>职位描述</h3>
        <div class="form-group">
          <label>职位描述 <span class="required">*</span></label>
          <textarea
            v-model="job.description"
            placeholder="请详细描述职位职责、工作内容等"
            class="form-textarea"
            rows="8"
          ></textarea>
        </div>

        <div class="form-group">
          <label>任职要求</label>
          <textarea
            v-model="job.requirements"
            placeholder="请列出任职要求，如技能、经验等"
            class="form-textarea"
            rows="6"
          ></textarea>
        </div>

        <div class="form-group">
          <label>关键词标签</label>
          <input
            v-model="job.keywords"
            type="text"
            placeholder="用逗号分隔，例如：Java,Spring Boot,MySQL"
            class="form-input"
          />
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="form-actions">
        <button class="cancel-btn" @click="goBack">
          取消
        </button>
        <button class="save-btn" @click="saveJob" :disabled="saving">
          {{ saving ? '保存中...' : '保存修改' }}
        </button>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="error-toast">
      <span class="error-icon">⚠️</span>
      {{ errorMessage }}
      <button @click="errorMessage = ''" class="close-btn">×</button>
    </div>

    <!-- 成功提示 -->
    <div v-if="successMessage" class="success-toast">
      <span class="success-icon">✓</span>
      {{ successMessage }}
    </div>
  </div>
</template>

<script>
import { getJobById } from '@/api/job'
import { updateJob } from '@/api/jobManagement'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'JobEditView',
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },
  data() {
    return {
      loading: false,
      saving: false,
      job: null,
      errorMessage: '',
      successMessage: ''
    }
  },
  mounted() {
    this.loadJob()
  },
  methods: {
    async loadJob() {
      const jobId = this.$route.params.id
      if (!jobId) {
        this.errorMessage = '职位ID无效'
        return
      }

      this.loading = true
      try {
        const response = await getJobById(jobId)
        this.job = response
      } catch (error) {
        console.error('加载职位失败:', error)
        this.errorMessage = '加载职位信息失败: ' + (error.message || '未知错误')
      } finally {
        this.loading = false
      }
    },

    async saveJob() {
      // 验证必填字段
      if (!this.job.title || !this.job.companyName || !this.job.location || !this.job.description) {
        this.errorMessage = '请填写所有必填字段'
        return
      }

      this.saving = true
      this.errorMessage = ''

      try {
        await updateJob(
          this.job.id,
          this.job,
          this.authStore.user.id
        )

        this.successMessage = '职位更新成功'
        setTimeout(() => {
          this.$router.push('/my-jobs')
        }, 1500)
      } catch (error) {
        console.error('更新职位失败:', error)
        this.errorMessage = '更新失败: ' + (error.message || '未知错误')
      } finally {
        this.saving = false
      }
    },

    goBack() {
      this.$router.back()
    }
  }
}
</script>

<style scoped>
.job-edit-container {
  max-width: 900px;
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
  margin: 0;
  color: #2c3e50;
  font-size: 28px;
}

.back-btn {
  padding: 10px 20px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: all 0.3s;
}

.back-btn:hover {
  border-color: #42b983;
  color: #42b983;
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

.edit-form {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.form-section {
  margin-bottom: 32px;
  padding-bottom: 32px;
  border-bottom: 1px solid #e0e0e0;
}

.form-section:last-of-type {
  border-bottom: none;
}

.form-section h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 18px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  margin-bottom: 8px;
  color: #2c3e50;
  font-size: 14px;
  font-weight: 500;
}

.required {
  color: #f56c6c;
}

.form-input,
.form-select,
.form-textarea {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #42b983;
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
}

.cancel-btn,
.save-btn {
  padding: 12px 32px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn {
  background: white;
  border: 1px solid #ddd;
  color: #666;
}

.cancel-btn:hover {
  border-color: #999;
  color: #333;
}

.save-btn {
  background: #42b983;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #35a06f;
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-toast,
.success-toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 16px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: slideIn 0.3s;
}

.error-toast {
  background: #ffebee;
  border: 1px solid #ffcdd2;
  color: #c62828;
}

.success-toast {
  background: #e8f5e9;
  border: 1px solid #c8e6c9;
  color: #2e7d32;
}

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.error-icon,
.success-icon {
  font-size: 20px;
}

.close-btn {
  margin-left: auto;
  background: none;
  border: none;
  font-size: 20px;
  color: inherit;
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
  background: rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
