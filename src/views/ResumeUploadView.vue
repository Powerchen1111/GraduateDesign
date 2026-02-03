<template>
  <div class="resume-upload-container">
    <div class="header">
      <h1>📤 上传简历</h1>
      <p class="subtitle">支持 PDF、Word、图片格式，AI 智能解析</p>
    </div>

    <div class="upload-card">
      <!-- 上传区域 -->
      <div
        class="upload-area"
        :class="{ 'drag-over': isDragOver }"
        @dragover.prevent="isDragOver = true"
        @dragleave.prevent="isDragOver = false"
        @drop.prevent="handleDrop"
      >
        <input
          type="file"
          ref="fileInput"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          class="file-input"
          @change="handleFileSelect"
        />

        <div v-if="!selectedFile" class="upload-placeholder">
          <div class="upload-icon">📄</div>
          <h3>拖拽文件到此处，或点击选择</h3>
          <p class="hint">支持 PDF、Word (.doc/.docx)、图片 (.jpg/.png)</p>
          <button class="select-btn" @click="$refs.fileInput.click()">
            选择文件
          </button>
        </div>

        <div v-else class="file-preview">
          <div class="file-icon">
            {{ getFileIcon(selectedFile.name) }}
          </div>
          <div class="file-info">
            <h3>{{ selectedFile.name }}</h3>
            <p>{{ formatSize(selectedFile.size) }}</p>
          </div>
          <button class="remove-btn" @click="removeFile">
            ✕
          </button>
        </div>
      </div>

      <!-- 上传按钮 -->
      <div class="actions">
        <button
          class="primary-btn"
          :disabled="!selectedFile || uploading"
          @click="uploadResume"
        >
          <span v-if="!uploading">🚀 开始解析</span>
          <span v-else>
            <span class="spinner-small"></span>
            解析中... {{ uploadProgress }}%
          </span>
        </button>
        <button
          class="secondary-btn"
          :disabled="uploading"
          @click="goBack"
        >
          取消
        </button>
      </div>

      <!-- 解析进度 -->
      <div v-if="uploading" class="progress-section">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
        </div>
        <p class="progress-text">{{ progressMessage }}</p>
      </div>

      <!-- 解析结果 -->
      <div v-if="parseResult" class="result-section">
        <div class="result-header">
          <h3>✅ 解析成功</h3>
          <button @click="viewResume" class="view-btn">
            查看详情 →
          </button>
        </div>

        <div class="result-preview">
          <div class="preview-item" v-if="parseResult.personalInfo?.name">
            <span class="label">姓名:</span>
            <span class="value">{{ parseResult.personalInfo.name }}</span>
          </div>
          <div class="preview-item" v-if="parseResult.personalInfo?.phone">
            <span class="label">电话:</span>
            <span class="value">{{ parseResult.personalInfo.phone }}</span>
          </div>
          <div class="preview-item" v-if="parseResult.personalInfo?.email">
            <span class="label">邮箱:</span>
            <span class="value">{{ parseResult.personalInfo.email }}</span>
          </div>
          <div class="preview-item" v-if="parseResult.education?.length">
            <span class="label">教育:</span>
            <span class="value">{{ parseResult.education.length }} 条记录</span>
          </div>
          <div class="preview-item" v-if="parseResult.workExperience?.length">
            <span class="label">工作:</span>
            <span class="value">{{ parseResult.workExperience.length }} 条记录</span>
          </div>
          <div class="preview-item" v-if="parseResult.projects?.length">
            <span class="label">项目:</span>
            <span class="value">{{ parseResult.projects.length }} 条记录</span>
          </div>
        </div>

        <div class="result-actions">
          <button @click="uploadAnother" class="secondary-btn">
            上传另一份简历
          </button>
        </div>
      </div>

      <!-- 使用说明 -->
      <div class="tips-section">
        <h4>💡 使用提示</h4>
        <ul>
          <li>支持中英文简历，AI 会自动识别语言</li>
          <li>图片简历请确保文字清晰可见</li>
          <li>PDF 和 Word 格式解析效果最佳</li>
          <li>文件大小建议不超过 10MB</li>
          <li>解析通常需要 10-30 秒，请耐心等待</li>
        </ul>
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
import { parseResume } from '@/api/resume'

export default {
  name: 'ResumeUploadView',
  data() {
    return {
      selectedFile: null,
      uploading: false,
      uploadProgress: 0,
      progressMessage: '准备上传...',
      parseResult: null,
      isDragOver: false,
      errorMessage: ''
    }
  },
  methods: {
    handleDrop(e) {
      this.isDragOver = false
      const file = e.dataTransfer.files[0]
      if (file) this.validateAndSetFile(file)
    },

    handleFileSelect(e) {
      const file = e.target.files[0]
      if (file) this.validateAndSetFile(file)
    },

    validateAndSetFile(file) {
      // 验证文件类型
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/jpg',
        'image/png'
      ]

      const validExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']
      const fileName = file.name.toLowerCase()
      const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext))

      if (!validTypes.includes(file.type) && !hasValidExtension) {
        this.errorMessage = '不支持的文件格式，请上传 PDF、Word 或图片文件'
        return
      }

      // 验证文件大小 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.errorMessage = '文件大小不能超过 10MB'
        return
      }

      this.selectedFile = file
      this.errorMessage = ''
      this.parseResult = null
    },

    removeFile() {
      this.selectedFile = null
      this.parseResult = null
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }
    },

    async uploadResume() {
      if (!this.selectedFile) {
        this.errorMessage = '请先选择文件'
        return
      }

      this.uploading = true
      this.uploadProgress = 0
      this.progressMessage = '正在上传文件...'
      this.errorMessage = ''
      this.parseResult = null

      try {
        // 使用真实的上传进度回调
        const response = await parseResume(this.selectedFile, (progress) => {
          this.uploadProgress = Math.min(progress, 95) // 上传进度最多到95%

          if (progress < 30) {
            this.progressMessage = '正在上传文件...'
          } else if (progress < 60) {
            this.progressMessage = 'AI 正在解析简历内容...'
          } else if (progress < 95) {
            this.progressMessage = '正在提取结构化信息...'
          } else {
            this.progressMessage = '即将完成...'
          }
        })

        this.uploadProgress = 100
        this.progressMessage = '解析完成！'

        // 延迟显示结果，让用户看到 100% 完成
        setTimeout(() => {
          this.parseResult = response
          this.uploading = false
        }, 500)

      } catch (error) {
        console.error('上传失败:', error)
        this.errorMessage = error.response?.data?.message || '解析失败，请检查文件格式或稍后重试'
        this.uploading = false
        this.uploadProgress = 0
      }
    },

    uploadAnother() {
      this.selectedFile = null
      this.parseResult = null
      this.uploadProgress = 0
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }
    },

    viewResume() {
      if (this.parseResult && this.parseResult.id) {
        this.$router.push(`/resumes/${this.parseResult.id}`)
      }
    },

    goBack() {
      this.$router.push('/resumes')
    },

    formatSize(size) {
      if (!size) return ''
      if (size < 1024) return size + ' B'
      if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB'
      return (size / 1024 / 1024).toFixed(2) + ' MB'
    },

    getFileIcon(fileName) {
      const ext = fileName.toLowerCase().split('.').pop()
      const iconMap = {
        pdf: '📕',
        doc: '📘',
        docx: '📘',
        jpg: '🖼️',
        jpeg: '🖼️',
        png: '🖼️'
      }
      return iconMap[ext] || '📄'
    }
  }
}
</script>

<style scoped>
.resume-upload-container {
  max-width: 800px;
  margin: 24px auto 40px;
  padding: 0 20px;
}

.header {
  text-align: center;
  margin-bottom: 32px;
}

.header h1 {
  color: #2c3e50;
  font-size: 28px;
  margin: 0 0 8px 0;
}

.subtitle {
  color: #7a8793;
  font-size: 14px;
  margin: 0;
}

.upload-card {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.upload-area {
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  padding: 48px 24px;
  text-align: center;
  position: relative;
  transition: all 0.3s;
  background: #fafafa;
}

.upload-area.drag-over {
  border-color: #42b983;
  background: #f0fdf4;
}

.file-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.upload-placeholder {
  pointer-events: none;
}

.upload-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.upload-placeholder h3 {
  color: #2c3e50;
  font-size: 18px;
  margin: 0 0 8px 0;
}

.hint {
  color: #999;
  font-size: 14px;
  margin: 0 0 20px 0;
}

.select-btn {
  padding: 12px 32px;
  background: linear-gradient(135deg, #42b983 0%, #35495e 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  pointer-events: auto;
  transition: transform 0.2s, box-shadow 0.2s;
}

.select-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.3);
}

.file-preview {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.file-icon {
  font-size: 48px;
}

.file-info {
  flex: 1;
  text-align: left;
}

.file-info h3 {
  margin: 0 0 4px 0;
  color: #2c3e50;
  font-size: 16px;
  word-break: break-all;
}

.file-info p {
  margin: 0;
  color: #999;
  font-size: 14px;
}

.remove-btn {
  width: 32px;
  height: 32px;
  background: #ffebee;
  color: #c62828;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: #c62828;
  color: white;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.primary-btn {
  flex: 1;
  padding: 14px 24px;
  background: linear-gradient(135deg, #42b983 0%, #35495e 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.primary-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.3);
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.secondary-btn {
  padding: 14px 24px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.3s;
}

.secondary-btn:hover:not(:disabled) {
  background: #e0e0e0;
}

.secondary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner-small {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.progress-section {
  margin-top: 24px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #42b983 0%, #35495e 100%);
  transition: width 0.3s ease;
  border-radius: 4px;
}

.progress-text {
  text-align: center;
  color: #666;
  font-size: 14px;
  margin: 0;
}

.result-section {
  margin-top: 24px;
  padding: 24px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.result-header h3 {
  margin: 0;
  color: #166534;
  font-size: 18px;
}

.view-btn {
  padding: 8px 16px;
  background: #166534;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.view-btn:hover {
  background: #14532d;
}

.result-preview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.preview-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.preview-item .label {
  font-size: 13px;
  color: #166534;
  font-weight: 500;
}

.preview-item .value {
  font-size: 14px;
  color: #2c3e50;
}

.result-actions {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.tips-section {
  margin-top: 32px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
}

.tips-section h4 {
  margin: 0 0 12px 0;
  color: #2c3e50;
  font-size: 16px;
}

.tips-section ul {
  margin: 0;
  padding-left: 20px;
  color: #666;
}

.tips-section li {
  margin: 8px 0;
  line-height: 1.6;
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
  .upload-card {
    padding: 20px;
  }

  .upload-area {
    padding: 32px 16px;
  }

  .actions {
    flex-direction: column;
  }

  .result-preview {
    grid-template-columns: 1fr;
  }

  .result-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>
