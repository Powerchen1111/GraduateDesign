<template>
  <div class="job-manage-container">
    <div class="header">
      <h1>💼 职位数据管理</h1>
      <p class="subtitle">职位信息采集与导入</p>
    </div>

    <!-- Tab 切换 -->
    <div class="tabs">
      <button
        :class="['tab-btn', { active: activeTab === 'browse' }]"
        @click="activeTab = 'browse'"
      >
        📋 职位浏览
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'collection' }]"
        @click="activeTab = 'collection'"
      >
        🔍 网络采集
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'import' }]"
        @click="activeTab = 'import'"
      >
        📥 Excel导入
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'statistics' }]"
        @click="activeTab = 'statistics'"
      >
        📊 数据统计
      </button>
    </div>

    <!-- 职位浏览 Tab -->
    <div v-show="activeTab === 'browse'" class="tab-content">
      <div class="panel-card">
        <h2>职位筛选</h2>

        <!-- 筛选表单 -->
        <div class="filter-section">
          <div class="filter-row">
            <div class="filter-item">
              <label>关键词</label>
              <input
                v-model="filters.keyword"
                placeholder="搜索职位标题、公司名称..."
                class="form-input"
                @keyup.enter="searchJobs"
              />
            </div>
            <div class="filter-item">
              <label>工作地点</label>
              <input
                v-model="filters.location"
                placeholder="如：北京、上海"
                class="form-input"
              />
            </div>
          </div>

          <div class="filter-row">
            <div class="filter-item">
              <label>薪资范围</label>
              <div class="salary-range">
                <input
                  v-model.number="filters.salaryMin"
                  type="number"
                  placeholder="最低"
                  class="form-input"
                />
                <span class="range-separator">-</span>
                <input
                  v-model.number="filters.salaryMax"
                  type="number"
                  placeholder="最高"
                  class="form-input"
                />
              </div>
            </div>
            <div class="filter-item">
              <label>所属行业</label>
              <select v-model="filters.industry" class="form-input">
                <option value="">不限</option>
                <option v-for="ind in industries" :key="ind" :value="ind">{{ ind }}</option>
              </select>
            </div>
          </div>

          <div class="filter-row">
            <div class="filter-item">
              <label>工作类型</label>
              <select v-model="filters.jobType" class="form-input">
                <option value="">不限</option>
                <option v-for="type in jobTypes" :key="type" :value="type">{{ type }}</option>
              </select>
            </div>
            <div class="filter-item">
              <label>学历要求</label>
              <select v-model="filters.educationRequirement" class="form-input">
                <option value="">不限</option>
                <option v-for="edu in educationLevels" :key="edu" :value="edu">{{ edu }}</option>
              </select>
            </div>
            <div class="filter-item">
              <label>经验要求</label>
              <select v-model="filters.experienceRequirement" class="form-input">
                <option value="">不限</option>
                <option v-for="exp in experienceLevels" :key="exp" :value="exp">{{ exp }}</option>
              </select>
            </div>
          </div>

          <div class="filter-actions">
            <button @click="searchJobs" class="primary-btn">🔍 搜索</button>
            <button @click="resetFilters" class="secondary-btn">重置</button>
          </div>
        </div>
      </div>

      <!-- 职位列表 -->
      <div v-if="jobsLoading" class="loading">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>

      <div v-else-if="jobs.length > 0" class="jobs-section">
        <div class="results-header">
          <h3>找到 {{ jobs.length }} 个职位</h3>
        </div>

        <div class="job-cards-grid">
          <div
            v-for="job in jobs"
            :key="job.id"
            class="job-card"
            @click="viewJobDetail(job.id)"
          >
            <div class="job-header">
              <h4>{{ job.title }}</h4>
              <span class="company">🏢 {{ job.companyName }}</span>
            </div>

            <div class="job-info">
              <div class="info-row">
                <span class="icon">📍</span>
                <span>{{ job.location || '地点未知' }}</span>
              </div>
              <div class="info-row">
                <span class="icon">💰</span>
                <span>{{ formatSalary(job) }}</span>
              </div>
              <div class="info-row" v-if="job.educationRequirement">
                <span class="icon">🎓</span>
                <span>{{ job.educationRequirement }}</span>
              </div>
              <div class="info-row" v-if="job.experienceRequirement">
                <span class="icon">💼</span>
                <span>{{ job.experienceRequirement }}</span>
              </div>
            </div>

            <div v-if="job.keywords" class="job-tags">
              <span
                v-for="(keyword, index) in getKeywordArray(job.keywords).slice(0, 4)"
                :key="index"
                class="tag"
              >
                {{ keyword }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>暂无职位数据</h3>
        <p>请调整筛选条件或使用采集功能获取职位数据</p>
      </div>
    </div>

    <!-- 网络采集 Tab -->
    <div v-show="activeTab === 'collection'" class="tab-content">
      <div class="panel-card">
        <h2>采集配置</h2>

        <div class="form-section">
          <div class="form-item">
            <label>招聘网站</label>
            <select v-model="collectionForm.website" class="form-input">
              <option value="智联招聘">智联招聘</option>
              <option value="前程无忧">前程无忧</option>
              <option value="BOSS直聘">BOSS直聘</option>
              <option value="拉勾网">拉勾网</option>
            </select>
          </div>

          <div class="form-item">
            <label>搜索关键词</label>
            <input
              type="text"
              v-model="collectionForm.keyword"
              placeholder="如：Java开发、产品经理"
              class="form-input"
            />
          </div>

          <div class="form-item">
            <label>工作地点</label>
            <input
              type="text"
              v-model="collectionForm.location"
              placeholder="如：北京、上海"
              class="form-input"
            />
          </div>

          <div class="form-item">
            <label>采集页数</label>
            <input
              type="number"
              v-model.number="collectionForm.maxPages"
              min="1"
              max="10"
              class="form-input"
            />
            <span class="form-hint">每页约10个职位</span>
          </div>

          <button
            @click="startCollection"
            :disabled="isCollecting"
            class="primary-btn"
          >
            <span v-if="!isCollecting">🚀 开始采集</span>
            <span v-else>⏳ 采集中...</span>
          </button>
        </div>

        <div v-if="collectionResult" class="result-section">
          <h3>采集结果</h3>
          <div class="result-stats">
            <div class="stat-item success">
              <div class="stat-value">{{ collectionResult.totalCollected }}</div>
              <div class="stat-label">新增职位</div>
            </div>
            <div class="stat-item warning">
              <div class="stat-value">{{ collectionResult.duplicatesSkipped }}</div>
              <div class="stat-label">重复跳过</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Excel导入 Tab -->
    <div v-show="activeTab === 'import'" class="tab-content">
      <div class="panel-card">
        <h2>Excel 文件导入</h2>

        <div
          class="upload-area"
          @dragover.prevent
          @drop.prevent="handleDrop"
        >
          <input
            type="file"
            ref="fileInput"
            accept=".xls,.xlsx"
            class="file-input"
            @change="handleFileSelect"
          />
          <div class="upload-tip">
            <p>拖拽Excel到此处，或</p>
            <button class="primary-btn" @click="$refs.fileInput.click()">选择文件</button>
          </div>
          <div v-if="selectedFile" class="file-info">
            <strong>{{ selectedFile.name }}</strong>
            <span>{{ formatSize(selectedFile.size) }}</span>
          </div>
        </div>

        <div class="actions">
          <button
            class="primary-btn"
            :disabled="!selectedFile || uploading"
            @click="uploadFile"
          >
            {{ uploading ? '上传中...' : '开始上传' }}
          </button>
          <button
            class="secondary-btn"
            :disabled="uploading"
            @click="resetUpload"
          >
            重置
          </button>
        </div>

        <div v-if="importResult" class="result-section">
          <h3>导入结果</h3>
          <div class="result-stats">
            <div class="stat-item"><span>总行数</span><strong>{{ importResult.totalRows }}</strong></div>
            <div class="stat-item success"><span>成功</span><strong>{{ importResult.successCount }}</strong></div>
            <div class="stat-item warning"><span>重复</span><strong>{{ importResult.duplicateCount }}</strong></div>
            <div class="stat-item error"><span>失败</span><strong>{{ importResult.failCount }}</strong></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据统计 Tab -->
    <div v-show="activeTab === 'statistics'" class="tab-content">
      <div class="panel-card">
        <div class="card-header">
          <h2>数据统计</h2>
          <button @click="loadStatistics" class="refresh-btn" :disabled="loadingStats">
            {{ loadingStats ? '加载中...' : '🔄 刷新' }}
          </button>
        </div>

        <div v-if="statistics" class="statistics-content">
          <div class="stat-row">
            <span class="stat-name">总职位数：</span>
            <span class="stat-value">{{ statistics.totalJobs || 0 }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-name">有效职位：</span>
            <span class="stat-value">{{ statistics.activeJobs || 0 }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-name">已向量化：</span>
            <span class="stat-value">{{ statistics.jobsWithEmbeddings || 0 }}</span>
          </div>
        </div>

        <div class="maintenance-section">
          <h3>数据维护</h3>
          <button
            @click="performCleanup"
            :disabled="isCleaning"
            class="warning-btn"
          >
            {{ isCleaning ? '清理中...' : '🧹 执行去重清理' }}
          </button>
          <p class="hint">清理重复的职位数据，保留最新的一条</p>
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
import axios from 'axios';
import { getJobs, advancedSearchJobs } from '@/api/job';

const API_BASE_URL = 'http://localhost:8080/api/jobs';

export default {
  name: 'JobManageView',
  data() {
    return {
      activeTab: 'browse',

      // 职位浏览和筛选
      jobs: [],
      jobsLoading: false,
      filters: {
        keyword: '',
        location: '',
        salaryMin: null,
        salaryMax: null,
        industry: '',
        jobType: '',
        educationRequirement: '',
        experienceRequirement: ''
      },
      industries: [
        '互联网', '金融', '教育', '医疗', '电子商务',
        '制造业', '房地产', '交通物流', '文化传媒',
        '游戏', '人工智能', '新能源', '服务业', '其他'
      ],
      jobTypes: ['全职', '兼职', '实习', '远程'],
      educationLevels: ['不限', '大专', '本科', '硕士', '博士'],
      experienceLevels: ['不限', '应届生', '1年以下', '1-3年', '3-5年', '5-10年', '10年以上'],

      // 采集相关
      collectionForm: {
        website: '智联招聘',
        keyword: 'Java开发',
        location: '北京',
        maxPages: 3
      },
      isCollecting: false,
      collectionResult: null,

      // 导入相关
      selectedFile: null,
      uploading: false,
      importResult: null,

      // 统计相关
      statistics: null,
      loadingStats: false,
      isCleaning: false,

      errorMessage: ''
    };
  },
  mounted() {
    this.loadStatistics();
    this.loadJobs();
  },
  methods: {
    // ========== 职位浏览 ==========
    async loadJobs() {
      this.jobsLoading = true;
      this.errorMessage = '';

      try {
        const response = await getJobs();
        console.log('加载职位列表:', response);
        this.jobs = Array.isArray(response) ? response : [];
      } catch (error) {
        console.error('加载职位列表失败:', error);
        this.errorMessage = '加载职位列表失败';
        this.jobs = [];
      } finally {
        this.jobsLoading = false;
      }
    },

    async searchJobs() {
      this.jobsLoading = true;
      this.errorMessage = '';

      try {
        // 构建筛选参数
        const params = {};

        if (this.filters.keyword) params.keyword = this.filters.keyword;
        if (this.filters.location) params.location = this.filters.location;
        if (this.filters.salaryMin) params.minSalary = this.filters.salaryMin;
        if (this.filters.salaryMax) params.maxSalary = this.filters.salaryMax;
        if (this.filters.industry) params.industry = this.filters.industry;
        if (this.filters.jobType) params.jobType = this.filters.jobType;
        if (this.filters.educationRequirement) params.education = this.filters.educationRequirement;
        if (this.filters.experienceRequirement) params.experience = this.filters.experienceRequirement;

        console.log('筛选参数:', params);

        // 如果没有任何筛选条件，加载全部
        if (Object.keys(params).length === 0) {
          await this.loadJobs();
          return;
        }

        const response = await advancedSearchJobs(params);
        console.log('筛选结果:', response);
        this.jobs = Array.isArray(response) ? response : [];

        if (this.jobs.length === 0) {
          this.errorMessage = '没有找到符合条件的职位';
        }
      } catch (error) {
        console.error('搜索职位失败:', error);
        this.errorMessage = '搜索职位失败';
        this.jobs = [];
      } finally {
        this.jobsLoading = false;
      }
    },

    resetFilters() {
      this.filters = {
        keyword: '',
        location: '',
        salaryMin: null,
        salaryMax: null,
        industry: '',
        jobType: '',
        educationRequirement: '',
        experienceRequirement: ''
      };
      this.loadJobs();
    },

    viewJobDetail(jobId) {
      this.$router.push(`/jobs/${jobId}`);
    },

    formatSalary(job) {
      if (job.salaryRange) {
        return job.salaryRange;
      }

      const { salaryMin, salaryMax, salaryCurrency } = job;
      const currency = salaryCurrency || '元/月';

      if (!salaryMin && !salaryMax) return '薪资面议';
      if (salaryMin && salaryMax) return `${salaryMin}-${salaryMax}${currency}`;
      if (salaryMin) return `${salaryMin}${currency}以上`;
      return `${salaryMax}${currency}以下`;
    },

    getKeywordArray(keywords) {
      if (!keywords) return [];
      return keywords.split(/[,，、;；]/).map(k => k.trim()).filter(k => k);
    },

    // ========== 网络采集 ==========
    async startCollection() {
      if (!this.collectionForm.keyword || !this.collectionForm.location) {
        this.errorMessage = '请填写关键词和工作地点';
        return;
      }

      this.isCollecting = true;
      this.collectionResult = null;
      this.errorMessage = '';

      try {
        const response = await axios.post(API_BASE_URL + '/collect', null, {
          params: {
            website: this.collectionForm.website,
            keyword: this.collectionForm.keyword,
            location: this.collectionForm.location,
            maxPages: this.collectionForm.maxPages
          }
        });

        this.collectionResult = response.data;
        await this.loadStatistics();

      } catch (error) {
        console.error('采集失败:', error);
        this.errorMessage = error.response?.data?.error || '采集失败，请稍后重试';
      } finally {
        this.isCollecting = false;
      }
    },

    // ========== Excel导入 ==========
    handleDrop(e) {
      const file = e.dataTransfer.files[0];
      if (file) this.validateAndSet(file);
    },

    handleFileSelect(e) {
      const file = e.target.files[0];
      if (file) this.validateAndSet(file);
    },

    validateAndSet(file) {
      const ext = file.name.toLowerCase();
      if (!ext.endsWith('.xls') && !ext.endsWith('.xlsx')) {
        this.errorMessage = '仅支持 .xls 或 .xlsx 格式';
        return;
      }
      this.selectedFile = file;
      this.errorMessage = '';
    },

    formatSize(size) {
      if (!size) return '';
      const mb = size / 1024 / 1024;
      return mb.toFixed(2) + ' MB';
    },

    resetUpload() {
      this.selectedFile = null;
      this.importResult = null;
      this.errorMessage = '';
      if (this.$refs.fileInput) this.$refs.fileInput.value = '';
    },

    async uploadFile() {
      if (!this.selectedFile) {
        this.errorMessage = '请先选择文件';
        return;
      }

      this.uploading = true;
      this.importResult = null;
      this.errorMessage = '';

      try {
        const formData = new FormData();
        formData.append('file', this.selectedFile);
        const resp = await axios.post(`${API_BASE_URL}/import`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 600000
        });
        this.importResult = resp.data;
        await this.loadStatistics();
      } catch (err) {
        console.error(err);
        this.errorMessage = err.response?.data?.error || '上传失败，请稍后重试';
      } finally {
        this.uploading = false;
      }
    },

    // ========== 数据统计 ==========
    async loadStatistics() {
      this.loadingStats = true;
      try {
        const response = await axios.get(API_BASE_URL + '/statistics');
        this.statistics = response.data;
      } catch (error) {
        console.error('加载统计信息失败:', error);
        this.errorMessage = '加载统计信息失败';
      } finally {
        this.loadingStats = false;
      }
    },

    async performCleanup() {
      if (!confirm('确定要执行去重清理吗？这将删除重复的职位数据。')) {
        return;
      }

      this.isCleaning = true;
      this.errorMessage = '';

      try {
        await axios.post(API_BASE_URL + '/cleanup');
        await this.loadStatistics();
        alert('清理完成！');
      } catch (error) {
        console.error('清理失败:', error);
        this.errorMessage = error.response?.data?.error || '清理失败，请稍后重试';
      } finally {
        this.isCleaning = false;
      }
    }
  }
};
</script>

<style scoped>
.job-manage-container {
  max-width: 1200px;
  margin: 24px auto 40px;
  padding: 0 20px;
}

.header {
  text-align: center;
  margin-bottom: 24px;
}

.header h1 {
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 28px;
}

.subtitle {
  color: #7a8793;
  font-size: 14px;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
}

.tab-btn {
  padding: 12px 24px;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 15px;
  color: #666;
  transition: all 0.3s;
}

.tab-btn:hover {
  color: #42b983;
}

.tab-btn.active {
  color: #42b983;
  border-bottom-color: #42b983;
  font-weight: 500;
}

.tab-content {
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.panel-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.panel-card h2, .panel-card h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 18px;
  border-bottom: 2px solid #42b983;
  padding-bottom: 10px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-header h2 {
  margin: 0;
  border: none;
  padding: 0;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-item label {
  font-size: 14px;
  color: #2c3e50;
  font-weight: 500;
}

.form-input {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #42b983;
}

.form-hint {
  font-size: 12px;
  color: #999;
}

.primary-btn {
  padding: 12px 24px;
  font-size: 16px;
  background: linear-gradient(135deg, #42b983 0%, #35495e 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: transform 0.2s, box-shadow 0.2s;
  margin-top: 10px;
}

.primary-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.3);
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.secondary-btn {
  padding: 10px 20px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
}

.secondary-btn:hover:not(:disabled) {
  background: #e0e0e0;
}

.warning-btn {
  padding: 10px 20px;
  font-size: 14px;
  background: #ff9800;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
}

.warning-btn:hover:not(:disabled) {
  background: #f57c00;
}

.refresh-btn {
  padding: 6px 12px;
  font-size: 12px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.upload-area {
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  padding: 40px 24px;
  text-align: center;
  position: relative;
  margin-bottom: 16px;
  transition: border-color 0.3s;
}

.upload-area:hover {
  border-color: #42b983;
}

.file-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.upload-tip p {
  margin: 0 0 12px 0;
  color: #475569;
  font-size: 14px;
}

.file-info {
  margin-top: 16px;
  color: #475569;
  display: flex;
  justify-content: center;
  gap: 12px;
  font-size: 14px;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.result-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.result-section h3 {
  font-size: 16px;
  margin-bottom: 16px;
}

.result-stats {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.stat-item {
  flex: 1;
  min-width: 120px;
  text-align: center;
  padding: 16px;
  border-radius: 8px;
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
}

.stat-item.success {
  background: #e8f5e9;
  border-color: #81c784;
}

.stat-item.warning {
  background: #fff3e0;
  border-color: #ffb74d;
}

.stat-item.error {
  background: #ffebee;
  border-color: #e57373;
}

.stat-item span {
  display: block;
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}

.stat-item strong {
  font-size: 20px;
  color: #2c3e50;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

.statistics-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.stat-name {
  color: #666;
  font-size: 14px;
}

.stat-value {
  font-weight: bold;
  color: #2c3e50;
  font-size: 14px;
}

.maintenance-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
  text-align: center;
}

.maintenance-section h3 {
  font-size: 16px;
  margin-bottom: 16px;
}

.hint {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
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

/* 职位浏览和筛选样式 */
.filter-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-item label {
  font-size: 14px;
  color: #2c3e50;
  font-weight: 500;
}

.salary-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.salary-range .form-input {
  flex: 1;
}

.range-separator {
  color: #666;
  font-weight: 500;
}

.filter-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.jobs-section {
  margin-top: 24px;
}

.results-header {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e0e0e0;
}

.results-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
}

.job-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.job-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.job-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  border-color: #42b983;
}

.job-card .job-header {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.job-card h4 {
  margin: 0 0 6px 0;
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
}

.job-card .company {
  font-size: 13px;
  color: #7f8c8d;
}

.job-card .job-info {
  margin-bottom: 12px;
}

.job-card .info-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  font-size: 13px;
  color: #666;
}

.job-card .icon {
  font-size: 14px;
}

.job-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}

.job-tags .tag {
  padding: 4px 10px;
  background: #e8f5e9;
  color: #2e7d32;
  border-radius: 12px;
  font-size: 12px;
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

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
  margin-top: 24px;
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

@media (max-width: 768px) {
  .filter-row {
    grid-template-columns: 1fr;
  }

  .job-cards-grid {
    grid-template-columns: 1fr;
  }

  .filter-actions {
    flex-direction: column;
  }

  .filter-actions button {
    width: 100%;
  }
}
</style>
