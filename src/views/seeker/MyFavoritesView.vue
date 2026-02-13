<template>
  <div class="my-favorites-container">
    <div class="header">
      <h1>我的收藏</h1>
      <p class="subtitle">管理您收藏的职位</p>
    </div>

    <!-- 统计信息 -->
    <div class="stats-card">
      <div class="stat-icon">⭐</div>
      <div class="stat-info">
        <div class="stat-value">{{ totalCount }}</div>
        <div class="stat-label">收藏职位</div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 收藏列表 -->
    <div v-else-if="favorites.length > 0" class="favorites-list">
      <div
        v-for="fav in favorites"
        :key="fav.id"
        class="favorite-card"
      >
        <div class="favorite-header">
          <div class="job-info">
            <h3 @click="viewJob(fav.jobId)" class="job-title">
              {{ fav.jobTitle }}
            </h3>
            <div class="company-info">
              <span class="company">🏢 {{ fav.companyName }}</span>
              <span class="location">📍 {{ fav.location }}</span>
              <span class="salary">💰 {{ getSalaryRange(fav) }}</span>
            </div>
          </div>
          <div class="favorite-actions-top">
            <button class="icon-btn" @click="removeFavorite(fav)" title="取消收藏">
              ❌
            </button>
          </div>
        </div>

        <div class="favorite-body">
          <div class="info-row">
            <span class="label">收藏时间:</span>
            <span class="value">{{ formatTime(fav.favoriteTime) }}</span>
          </div>
          <div class="info-row" v-if="fav.note">
            <span class="label">备注:</span>
            <span class="value">{{ fav.note }}</span>
          </div>
        </div>

        <div class="favorite-actions">
          <button class="action-btn primary" @click="viewJob(fav.jobId)">
            查看职位
          </button>
          <button class="action-btn" @click="showNoteDialog(fav)">
            {{ fav.note ? '编辑备注' : '添加备注' }}
          </button>
          <button class="action-btn" @click="applyJob(fav.jobId)">
            投递简历
          </button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-icon">⭐</div>
      <h3>还没有收藏职位</h3>
      <p>浏览职位并收藏感兴趣的职位，方便随时查看</p>
      <button class="primary-btn" @click="goToBrowseJobs">
        浏览职位
      </button>
    </div>

    <!-- 备注对话框 -->
    <div v-if="showDialog" class="dialog-overlay" @click="closeDialog">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h3>{{ currentFavorite?.note ? '编辑备注' : '添加备注' }}</h3>
          <button class="close-btn" @click="closeDialog">×</button>
        </div>
        <div class="dialog-body">
          <textarea
            v-model="noteText"
            placeholder="添加备注信息..."
            class="note-textarea"
            rows="4"
          ></textarea>
        </div>
        <div class="dialog-footer">
          <button class="secondary-btn" @click="closeDialog">取消</button>
          <button class="primary-btn" @click="saveNote" :disabled="saving">
            {{ saving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getUserFavorites, removeFavorite as removeFavoriteApi, updateFavoriteNote } from '@/api/favorite'

export default {
  name: 'MyFavoritesView',
  data() {
    return {
      favorites: [],
      loading: false,
      showDialog: false,
      currentFavorite: null,
      noteText: '',
      saving: false
    }
  },
  computed: {
    totalCount() {
      return this.favorites.length
    }
  },
  mounted() {
    this.loadFavorites()
  },
  methods: {
    async loadFavorites() {
      this.loading = true
      try {
        const response = await getUserFavorites()
        console.log('收藏列表响应:', response)
        this.favorites = response.favorites || []
      } catch (error) {
        console.error('加载收藏列表失败:', error)
        alert('加载收藏列表失败')
      } finally {
        this.loading = false
      }
    },

    async removeFavorite(favorite) {
      if (!confirm(`确定要取消收藏"${favorite.jobTitle}"吗？`)) {
        return
      }

      try {
        await removeFavoriteApi(favorite.jobId)
        alert('取消收藏成功')
        this.loadFavorites()
      } catch (error) {
        console.error('取消收藏失败:', error)
        alert('取消收藏失败')
      }
    },

    showNoteDialog(favorite) {
      this.currentFavorite = favorite
      this.noteText = favorite.note || ''
      this.showDialog = true
    },

    closeDialog() {
      this.showDialog = false
      this.currentFavorite = null
      this.noteText = ''
    },

    async saveNote() {
      if (!this.currentFavorite) return

      this.saving = true
      try {
        await updateFavoriteNote(this.currentFavorite.jobId, this.noteText)
        alert('备注保存成功')
        this.closeDialog()
        this.loadFavorites()
      } catch (error) {
        console.error('保存备注失败:', error)
        alert('保存备注失败')
      } finally {
        this.saving = false
      }
    },

    viewJob(jobId) {
      this.$router.push(`/jobs/${jobId}`)
    },

    applyJob(jobId) {
      this.$router.push(`/jobs/${jobId}`)
    },

    goToBrowseJobs() {
      this.$router.push('/jobs')
    },

    getSalaryRange(fav) {
      if (fav.salaryRange) return fav.salaryRange
      if (!fav.salaryMin && !fav.salaryMax) return '面议'
      if (fav.salaryMin && fav.salaryMax) {
        return `${fav.salaryMin}-${fav.salaryMax}元/月`
      }
      if (fav.salaryMin) return `${fav.salaryMin}元/月以上`
      return `${fav.salaryMax}元/月以下`
    },

    formatTime(timestamp) {
      if (!timestamp) return '未知'
      const date = new Date(timestamp)
      return date.toLocaleString('zh-CN')
    }
  }
}
</script>

<style scoped>
.my-favorites-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.header {
  margin-bottom: 32px;
}

.header h1 {
  font-size: 28px;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.subtitle {
  color: #7b8a8b;
  font-size: 14px;
  margin: 0;
}

.stats-card {
  background: linear-gradient(135deg, #ffd700 0%, #ffb700 100%);
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
  color: white;
}

.stat-icon {
  font-size: 48px;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
}

.stat-label {
  font-size: 16px;
  opacity: 0.9;
  margin-top: 4px;
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
  border-top: 4px solid #ffd700;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.favorites-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.favorite-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.2s;
}

.favorite-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.favorite-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.job-info {
  flex: 1;
}

.job-title {
  font-size: 20px;
  color: #2c3e50;
  margin: 0 0 12px 0;
  cursor: pointer;
  transition: color 0.2s;
}

.job-title:hover {
  color: #ffd700;
}

.company-info {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 14px;
  color: #666;
}

.company {
  font-weight: 600;
}

.salary {
  color: #f56c6c;
  font-weight: 600;
}

.favorite-actions-top {
  flex-shrink: 0;
}

.icon-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  transition: transform 0.2s;
}

.icon-btn:hover {
  transform: scale(1.2);
}

.favorite-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  gap: 12px;
  font-size: 14px;
}

.info-row .label {
  color: #7b8a8b;
  min-width: 80px;
  flex-shrink: 0;
}

.info-row .value {
  color: #2c3e50;
  flex: 1;
}

.favorite-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f5f5f5;
}

.action-btn.primary {
  background: #ffd700;
  color: #2c3e50;
  border-color: #ffd700;
  font-weight: 600;
}

.action-btn.primary:hover {
  background: #ffb700;
  border-color: #ffb700;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
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

.primary-btn {
  padding: 12px 32px;
  background: linear-gradient(135deg, #ffd700 0%, #ffb700 100%);
  color: #2c3e50;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: transform 0.2s;
}

.primary-btn:hover {
  transform: translateY(-2px);
}

/* 对话框样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #f5f5f5;
}

.dialog-body {
  padding: 24px;
}

.note-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
}

.note-textarea:focus {
  outline: none;
  border-color: #ffd700;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e0e0e0;
}

.secondary-btn {
  padding: 10px 20px;
  background: white;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .favorite-header {
    flex-direction: column;
    gap: 12px;
  }

  .company-info {
    flex-direction: column;
    gap: 8px;
  }

  .favorite-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }
}
</style>
