<template>
  <div class="job-collection-container">
    <div class="header">
      <h1>🔍 职位信息采集</h1>
      <p class="subtitle">从各大招聘网站采集职位信息，支持自动去重和向量化存储</p>
    </div>

    <div class="main-content">
      <!-- 左侧：采集配置区域 -->
      <div class="left-panel">
        <div class="panel-card">
          <h2>📋 采集配置</h2>
          
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
              class="collect-btn"
            >
              <span v-if="!isCollecting">🚀 开始采集</span>
              <span v-else>⏳ 采集中...</span>
            </button>
          </div>
        </div>

        <!-- 采集结果 -->
        <div class="panel-card" v-if="collectionResult">
          <h2>📊 采集结果</h2>
          <div class="result-stats">
            <div class="stat-item success">
              <div class="stat-value">{{ collectionResult.totalCollected }}</div>
              <div class="stat-label">新增职位</div>
            </div>
            <div class="stat-item warning">
              <div class="stat-value">{{ collectionResult.duplicatesSkipped }}</div>
              <div class="stat-label">重复跳过</div>
            </div>
            <div class="stat-item error" v-if="collectionResult.errors > 0">
              <div class="stat-value">{{ collectionResult.errors }}</div>
              <div class="stat-label">错误数量</div>
            </div>
          </div>
          <div class="result-time">
            采集时间：{{ formatTime(collectionResult.timestamp) }}
          </div>
        </div>
      </div>

      <!-- 右侧：统计信息和操作 -->
      <div class="right-panel">
        <!-- 统计信息 -->
        <div class="panel-card">
          <div class="card-header">
            <h2>📈 数据统计</h2>
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
            <div class="stat-row">
              <span class="stat-name">向量生成率：</span>
              <span class="stat-value">{{ statistics.embeddingRate ? statistics.embeddingRate.toFixed(1) + '%' : '0%' }}</span>
            </div>
            <div class="stat-row" v-if="statistics.recentJobs24h !== undefined">
              <span class="stat-name">24小时内新增：</span>
              <span class="stat-value highlight">{{ statistics.recentJobs24h }}</span>
            </div>

            <div class="divider"></div>

            <div class="stat-section" v-if="statistics.byWebsite">
              <h3>📌 按网站统计</h3>
              <div class="stat-item-small" v-for="([website, count], idx) in pageItems(websiteList, pagination.website)" :key="website + idx">
                <span>{{ website }}：</span>
                <strong>{{ count }}</strong>
              </div>
              <div class="pager" v-if="pageCount(websiteList) > 1">
                <button :disabled="pagination.website === 1" @click="changePage('website', -1)">上一页</button>
                <span>{{ pagination.website }} / {{ pageCount(websiteList) }}</span>
                <button :disabled="pagination.website === pageCount(websiteList)" @click="changePage('website', 1)">下一页</button>
              </div>
            </div>

            <div class="stat-section" v-if="statistics.byIndustry">
              <h3>🏢 按行业统计 (Top 10)</h3>
              <div class="stat-item-small" v-for="([industry, count], idx) in pageItems(industryList, pagination.industry)" :key="industry + idx">
                <span>{{ industry || '未分类' }}：</span>
                <strong>{{ count }}</strong>
              </div>
              <div class="pager" v-if="pageCount(industryList) > 1">
                <button :disabled="pagination.industry === 1" @click="changePage('industry', -1)">上一页</button>
                <span>{{ pagination.industry }} / {{ pageCount(industryList) }}</span>
                <button :disabled="pagination.industry === pageCount(industryList)" @click="changePage('industry', 1)">下一页</button>
              </div>
            </div>

            <div class="stat-section" v-if="statistics.byLocation">
              <h3>📍 按地区统计 (Top 15)</h3>
              <div class="stat-item-small" v-for="([location, count], idx) in pageItems(locationList, pagination.location)" :key="location + idx">
                <span>{{ location || '未指定' }}：</span>
                <strong>{{ count }}</strong>
              </div>
              <div class="pager" v-if="pageCount(locationList) > 1">
                <button :disabled="pagination.location === 1" @click="changePage('location', -1)">上一页</button>
                <span>{{ pagination.location }} / {{ pageCount(locationList) }}</span>
                <button :disabled="pagination.location === pageCount(locationList)" @click="changePage('location', 1)">下一页</button>
              </div>
            </div>

            <div class="stat-section" v-if="statistics.bySalaryRange">
              <h3>💰 薪资范围分布</h3>
              <div class="stat-item-small" v-for="([range, count], idx) in pageItems(salaryRangeList, pagination.salaryRange)" :key="range + idx">
                <span>{{ range }}：</span>
                <strong>{{ count }}</strong>
              </div>
              <div class="pager" v-if="pageCount(salaryRangeList) > 1">
                <button :disabled="pagination.salaryRange === 1" @click="changePage('salaryRange', -1)">上一页</button>
                <span>{{ pagination.salaryRange }} / {{ pageCount(salaryRangeList) }}</span>
                <button :disabled="pagination.salaryRange === pageCount(salaryRangeList)" @click="changePage('salaryRange', 1)">下一页</button>
              </div>
            </div>

            <div class="stat-section" v-if="statistics.byJobType">
              <h3>📋 工作类型分布</h3>
              <div class="stat-item-small" v-for="([type, count], idx) in jobTypeList" :key="type + idx">
                <span>{{ type }}：</span>
                <strong>{{ count }}</strong>
              </div>
            </div>

            <div class="stat-section" v-if="statistics.byEducation">
              <h3>🎓 学历要求分布</h3>
              <div class="stat-item-small" v-for="([education, count], idx) in educationList" :key="education + idx">
                <span>{{ education }}：</span>
                <strong>{{ count }}</strong>
              </div>
            </div>

            <div class="stat-section" v-if="statistics.dataQuality">
              <h3>✅ 数据质量统计</h3>
              <div class="stat-item-small" v-for="([metric, count], idx) in dataQualityList" :key="metric + idx">
                <span>{{ metric }}：</span>
                <strong>{{ count }}</strong>
                <span class="quality-percentage">
                  ({{ statistics.totalJobs ? ((count / statistics.totalJobs) * 100).toFixed(1) : '0' }}%)
                </span>
              </div>
            </div>
          </div>

          <div v-else-if="loadingStats" class="loading">
            加载中...
          </div>
        </div>

        <!-- 数据维护 -->
        <div class="panel-card">
          <h2>🔧 数据维护</h2>
          <div class="maintenance-section">
            <button 
              @click="performCleanup" 
              :disabled="isCleaning"
              class="cleanup-btn"
            >
              {{ isCleaning ? '清理中...' : '🧹 执行去重清理' }}
            </button>
            <p class="hint">清理重复的职位数据，保留最新的一条</p>
          </div>
          
          <div v-if="cleanupResult" class="cleanup-result">
            <div class="success-message">
              ✅ 清理完成！删除了 {{ cleanupResult.duplicatesRemoved || 0 }} 条重复数据
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="error-message">
      <span class="error-icon">⚠️</span>
      {{ errorMessage }}
      <button @click="errorMessage = ''" class="close-btn">×</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/jobs';

export default {
  name: 'JobCollectionView',
  data() {
    return {
      collectionForm: {
        website: '智联招聘',
        keyword: 'Java开发',
        location: '北京',
        maxPages: 3
      },
      isCollecting: false,
      collectionResult: null,
      statistics: null,
      loadingStats: false,
      isCleaning: false,
      cleanupResult: null,
      errorMessage: '',
      pagination: {
        website: 1,
        industry: 1,
        location: 1,
        salaryRange: 1
      }
    };
  },
  mounted() {
    this.loadStatistics();
  },
  methods: {
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
        
        // 采集完成后刷新统计信息
        await this.loadStatistics();
        
      } catch (error) {
        console.error('采集失败:', error);
        this.errorMessage = error.response?.data?.error || '采集失败，请稍后重试';
      } finally {
        this.isCollecting = false;
      }
    },

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
      this.cleanupResult = null;
      this.errorMessage = '';

      try {
        const response = await axios.post(API_BASE_URL + '/cleanup');
        this.cleanupResult = response.data;
        
        // 清理完成后刷新统计信息
        await this.loadStatistics();
        
      } catch (error) {
        console.error('清理失败:', error);
        this.errorMessage = error.response?.data?.error || '清理失败，请稍后重试';
      } finally {
        this.isCleaning = false;
      }
    },

    formatTime(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return date.toLocaleString('zh-CN');
    },

    pageItems(list, page) {
      const start = (page - 1) * 10;
      return list.slice(start, start + 10);
    },
    pageCount(list) {
      if (!list || list.length === 0) return 1;
      return Math.ceil(list.length / 10);
    },
    changePage(type, delta) {
      const mapping = {
        website: this.websiteList,
        industry: this.industryList,
        location: this.locationList,
        salaryRange: this.salaryRangeList
      };
      const list = mapping[type] || [];
      const max = this.pageCount(list);
      const next = Math.min(Math.max(1, this.pagination[type] + delta), max);
      this.pagination[type] = next;
    }
  },
  computed: {
    websiteList() {
      if (!this.statistics || !this.statistics.byWebsite) return [];
      return Object.entries(this.statistics.byWebsite);
    },
    industryList() {
      if (!this.statistics || !this.statistics.byIndustry) return [];
      return Object.entries(this.statistics.byIndustry);
    },
    locationList() {
      if (!this.statistics || !this.statistics.byLocation) return [];
      return Object.entries(this.statistics.byLocation);
    },
    salaryRangeList() {
      if (!this.statistics || !this.statistics.bySalaryRange) return [];
      // 按薪资范围顺序排列
      const order = ['0-5K', '5-10K', '10-15K', '15-20K', '20-30K', '30K+', '未知'];
      return order
        .filter(range => this.statistics.bySalaryRange[range] !== undefined)
        .map(range => [range, this.statistics.bySalaryRange[range]]);
    },
    jobTypeList() {
      if (!this.statistics || !this.statistics.byJobType) return [];
      return Object.entries(this.statistics.byJobType);
    },
    educationList() {
      if (!this.statistics || !this.statistics.byEducation) return [];
      // 按学历等级排序
      const order = ['博士', '硕士', '本科', '大专', '不限'];
      return order
        .filter(edu => this.statistics.byEducation[edu] !== undefined)
        .map(edu => [edu, this.statistics.byEducation[edu]]);
    },
    dataQualityList() {
      if (!this.statistics || !this.statistics.dataQuality) return [];
      return Object.entries(this.statistics.dataQuality);
    }
  }
};
</script>

<style scoped>
.job-collection-container {
  max-width: 1280px;
  margin: 24px auto 40px;
  padding: 0 20px 20px;
}

.header {
  text-align: center;
  margin-bottom: 18px;
}

.header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 28px;
}

.subtitle {
  color: #7a8793;
  font-size: 14px;
}

.main-content {
  display: flex;
  gap: 20px;
  margin-top: 10px;
}

.left-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.right-panel {
  width: 400px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.panel-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 22px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
}

.panel-card h2 {
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

.refresh-btn {
  padding: 6px 12px;
  font-size: 12px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.refresh-btn:hover:not(:disabled) {
  background: #e0e0e0;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

.collect-btn {
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

.collect-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.3);
}

.collect-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.result-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.stat-item {
  flex: 1;
  text-align: center;
  padding: 16px;
  border-radius: 8px;
  background: #f9f9f9;
}

.stat-item.success {
  background: #e8f5e9;
}

.stat-item.warning {
  background: #fff3e0;
}

.stat-item.error {
  background: #ffebee;
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

.result-time {
  font-size: 12px;
  color: #999;
  text-align: center;
}

.statistics-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
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

.stat-value.highlight {
  color: #42b983;
  font-weight: bold;
}

.quality-percentage {
  font-size: 12px;
  color: #999;
  margin-left: 4px;
}

.divider {
  height: 1px;
  background: #e0e0e0;
  margin: 8px 0;
}

.stat-section {
  margin-top: 12px;
}

.stat-section h3 {
  font-size: 14px;
  color: #2c3e50;
  margin-bottom: 8px;
}

.pager {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.pager button {
  padding: 4px 10px;
  font-size: 12px;
  border: 1px solid #ddd;
  background: #f7f7f7;
  border-radius: 6px;
  cursor: pointer;
}

.pager button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pager span {
  font-size: 12px;
  color: #666;
}

.stat-item-small {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 13px;
  color: #666;
}

.stat-item-small strong {
  color: #2c3e50;
}

.maintenance-section {
  text-align: center;
}

.cleanup-btn {
  padding: 10px 20px;
  font-size: 14px;
  background: #ff9800;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
  margin-bottom: 10px;
}

.cleanup-btn:hover:not(:disabled) {
  background: #f57c00;
}

.cleanup-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.hint {
  font-size: 12px;
  color: #999;
  margin: 0;
}

.cleanup-result {
  margin-top: 16px;
  padding: 12px;
  background: #e8f5e9;
  border-radius: 6px;
}

.success-message {
  color: #2e7d32;
  font-size: 14px;
}

.error-message {
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
}

.close-btn:hover {
  background: rgba(198, 40, 40, 0.1);
  border-radius: 50%;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #999;
}

@media (max-width: 1200px) {
  .main-content {
    flex-direction: column;
  }
  
  .right-panel {
    width: 100%;
  }
}
</style>

