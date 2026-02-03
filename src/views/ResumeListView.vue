<template>
  <div class="resume-list-container">
    <div class="header">
      <h1>📄 我的简历</h1>
      <div class="header-actions">
        <button class="primary-btn" @click="goToUpload">
          ➕ 上传新简历
        </button>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <select v-model="searchType" class="search-select">
        <option value="name">姓名</option>
        <option value="email">邮箱</option>
        <option value="phone">电话</option>
        <option value="skills">技能</option>
      </select>
      <input
        v-model="searchQuery"
        @keyup.enter="handleSearch"
        type="text"
        class="search-input"
        placeholder="输入搜索关键词..."
      />
      <button @click="handleSearch" class="search-btn">🔍 搜索</button>
      <button @click="handleReset" class="reset-btn">🔄 重置</button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 调试信息 -->
    <div v-if="!loading" style="background: #f0f0f0; padding: 10px; margin-bottom: 10px; border-radius: 5px;">
      <strong>调试信息:</strong><br>
      resumes 数组长度: {{ resumes.length }}<br>
      resumes 是否为数组: {{ Array.isArray(resumes) }}<br>
      loading 状态: {{ loading }}<br>
      <details>
        <summary>点击查看 resumes 数据</summary>
        <pre style="max-height: 200px; overflow: auto;">{{ JSON.stringify(resumes, null, 2) }}</pre>
      </details>
    </div>

    <!-- 简历列表 -->
    <div v-if="!loading && resumes.length > 0" class="resume-grid">
      <div
        v-for="resume in resumes"
        :key="resume.id"
        class="resume-card"
        @click="viewResume(resume.id)"
      >
        <div class="resume-header">
          <h3>{{ resume.personalInfo?.name || '未命名' }}</h3>
          <span class="resume-id">#{{ resume.id }}</span>
        </div>

        <div class="resume-info">
          <div class="info-item" v-if="resume.personalInfo?.phone">
            <span class="label">📱 电话:</span>
            <span>{{ resume.personalInfo.phone }}</span>
          </div>
          <div class="info-item" v-if="resume.personalInfo?.email">
            <span class="label">📧 邮箱:</span>
            <span>{{ resume.personalInfo.email }}</span>
          </div>
          <div class="info-item" v-if="resume.personalInfo?.location">
            <span class="label">📍 地点:</span>
            <span>{{ resume.personalInfo.location }}</span>
          </div>
        </div>

        <div class="resume-meta">
          <span class="file-name">📎 {{ resume.fileName }}</span>
          <span class="upload-time">⏰ {{ formatTime(resume.createdAt) }}</span>
        </div>

        <div class="resume-actions" @click.stop>
          <button @click="viewResume(resume.id)" class="action-btn view-btn">
            👁️ 查看
          </button>
          <button @click="confirmDelete(resume.id)" class="action-btn delete-btn">
            🗑️ 删除
          </button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && resumes.length === 0" class="empty-state">
      <div class="empty-icon">📭</div>
      <h3>还没有简历</h3>
      <p>上传您的第一份简历开始使用</p>
      <button @click="goToUpload" class="primary-btn">上传简历</button>
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
import { getResumes, searchByName, searchByEmail, searchByPhone, searchBySkills, deleteResume } from '@/api/resume'

export default {
  name: 'ResumeListView',
  data() {
    return {
      resumes: [],
      loading: false,
      searchType: 'name',
      searchQuery: '',
      errorMessage: ''
    }
  },
  mounted() {
    this.loadResumes()
  },
  methods: {
    async loadResumes() {
      console.log('========== 前端：开始加载简历列表 ==========')
      this.loading = true
      this.errorMessage = ''

      try {
        console.log('前端：调用 getResumes(true)')
        const response = await getResumes(true) // 只获取我的简历
        console.log('前端：收到响应')
        console.log('前端：响应类型:', typeof response)
        console.log('前端：响应是否为数组:', Array.isArray(response))
        console.log('前端：响应内容:', response)
        console.log('前端：响应长度:', response?.length)

        if (Array.isArray(response)) {
          console.log('前端：响应是数组，长度为', response.length)
          this.resumes = response
          console.log('前端：this.resumes 已更新，长度为', this.resumes.length)
          console.log('前端：this.resumes 内容:', this.resumes)
        } else {
          console.log('前端：响应不是数组，设置为空数组')
          this.resumes = []
        }

        console.log('前端：最终 this.resumes.length =', this.resumes.length)
      } catch (error) {
        console.error('前端：加载简历列表失败')
        console.error('前端：错误对象:', error)
        console.error('前端：错误消息:', error.message)
        console.error('前端：错误堆栈:', error.stack)
        this.errorMessage = '加载简历列表失败'
        this.resumes = []
      } finally {
        this.loading = false
        console.log('========== 前端：加载简历列表完成 ==========')
      }
    },

    async handleSearch() {
      if (!this.searchQuery.trim()) {
        this.loadResumes()
        return
      }

      this.loading = true
      this.errorMessage = ''

      try {
        let response
        switch (this.searchType) {
          case 'name':
            response = await searchByName(this.searchQuery)
            break
          case 'email':
            response = await searchByEmail(this.searchQuery)
            break
          case 'phone':
            response = await searchByPhone(this.searchQuery)
            break
          case 'skills':
            response = await searchBySkills(this.searchQuery)
            break
        }
        console.log('搜索响应:', response) // 调试日志
        this.resumes = Array.isArray(response) ? response : []

        if (this.resumes.length === 0) {
          this.errorMessage = '未找到匹配的简历'
        }
      } catch (error) {
        console.error('搜索失败:', error)
        this.errorMessage = '搜索失败，请稍后重试'
      } finally {
        this.loading = false
      }
    },

    handleReset() {
      this.searchQuery = ''
      this.searchType = 'name'
      this.loadResumes()
    },

    viewResume(id) {
      this.$router.push(`/resumes/${id}`)
    },

    goToUpload() {
      this.$router.push('/resumes/upload')
    },

    async confirmDelete(id) {
      if (!confirm('确定要删除这份简历吗？此操作不可恢复。')) {
        return
      }

      try {
        await deleteResume(id)
        this.errorMessage = '删除成功'
        this.loadResumes() // 重新加载列表
      } catch (error) {
        console.error('删除失败:', error)
        this.errorMessage = error.response?.data || '删除失败，请稍后重试'
      }
    },

    formatTime(timestamp) {
      if (!timestamp) return ''
      const date = new Date(timestamp)
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    }
  }
}
</script>

<style scoped>
.resume-list-container {
  max-width: 1400px;
  margin: 24px auto 40px;
  padding: 0 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header h1 {
  color: #2c3e50;
  font-size: 28px;
  margin: 0;
}

.header-actions {
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
  transition: transform 0.2s, box-shadow 0.2s;
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.3);
}

.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.search-select {
  padding: 10px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  min-width: 100px;
  background: white;
  cursor: pointer;
}

.search-input {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #42b983;
}

.search-btn {
  padding: 10px 20px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.search-btn:hover {
  background: #35a06f;
}

.reset-btn {
  padding: 10px 20px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.reset-btn:hover {
  background: #e0e0e0;
}

.loading {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
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

.resume-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.resume-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.resume-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: #42b983;
}

.resume-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}

.resume-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
}

.resume-id {
  color: #999;
  font-size: 12px;
}

.resume-info {
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
}

.info-item .label {
  font-weight: 500;
  min-width: 80px;
}

.resume-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  font-size: 13px;
  color: #999;
}

.file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.resume-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  flex: 1;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.view-btn {
  background: #e8f5e9;
  color: #2e7d32;
}

.view-btn:hover {
  background: #2e7d32;
  color: white;
}

.delete-btn {
  background: #ffebee;
  color: #c62828;
}

.delete-btn:hover {
  background: #c62828;
  color: white;
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
  margin: 0 0 24px 0;
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
  .resume-grid {
    grid-template-columns: 1fr;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .search-bar {
    flex-direction: column;
  }

  .search-select,
  .search-input,
  .search-btn,
  .reset-btn {
    width: 100%;
  }
}
</style>
