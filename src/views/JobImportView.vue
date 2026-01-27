<template>
  <div class="import-container">
    <div class="header">
      <h1>📥 职位数据导入（Excel）</h1>
      <p class="subtitle">支持 .xls / .xlsx，自动去重并生成向量嵌入</p>
    </div>

    <div class="card">
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
          <button class="primary" @click="$refs.fileInput.click()">选择文件</button>
        </div>
        <div v-if="selectedFile" class="file-info">
          <strong>{{ selectedFile.name }}</strong>
          <span>{{ formatSize(selectedFile.size) }}</span>
        </div>
      </div>

      <div class="actions">
        <button
          class="primary"
          :disabled="!selectedFile || uploading"
          @click="upload"
        >
          {{ uploading ? '上传中...' : '开始上传' }}
        </button>
        <button
          class="ghost"
          :disabled="uploading"
          @click="reset"
        >
          重置
        </button>
      </div>

      <div v-if="result" class="result">
        <h3>结果</h3>
        <div class="stats">
          <div class="stat"><span>总行数</span><strong>{{ result.totalRows }}</strong></div>
          <div class="stat success"><span>成功</span><strong>{{ result.successCount }}</strong></div>
          <div class="stat warning"><span>重复</span><strong>{{ result.duplicateCount }}</strong></div>
          <div class="stat error"><span>失败</span><strong>{{ result.failCount }}</strong></div>
        </div>
        <p class="message">{{ result.message }}</p>
        <div v-if="result.errors && result.errors.length" class="errors">
          <h4>错误详情（前 {{ result.errors.length }} 条）</h4>
          <ul>
            <li v-for="(err, idx) in result.errors" :key="idx">{{ err }}</li>
          </ul>
        </div>
      </div>

      <div v-if="errorMessage" class="error-banner">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

const API_BASE = 'http://localhost:8080/api/jobs';

export default {
  name: 'JobImportView',
  data() {
    return {
      selectedFile: null,
      uploading: false,
      result: null,
      errorMessage: ''
    };
  },
  methods: {
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
        this.errorMessage = '仅支持 .xls 或 .xlsx';
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
    reset() {
      this.selectedFile = null;
      this.result = null;
      this.errorMessage = '';
      if (this.$refs.fileInput) this.$refs.fileInput.value = '';
    },
    async upload() {
      if (!this.selectedFile) {
        this.errorMessage = '请先选择文件';
        return;
      }
      this.uploading = true;
      this.result = null;
      this.errorMessage = '';
      try {
        const formData = new FormData();
        formData.append('file', this.selectedFile);
        const resp = await axios.post(`${API_BASE}/import`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 600000 // 10 分钟
        });
        this.result = resp.data;
      } catch (err) {
        console.error(err);
        this.errorMessage = err.response?.data?.error || '上传失败，请稍后重试';
      } finally {
        this.uploading = false;
      }
    }
  }
};
</script>

<style scoped>
.import-container {
  max-width: 960px;
  margin: 28px auto 48px;
  padding: 0 16px 16px;
}
.header {
  text-align: center;
  margin-bottom: 18px;
}
.subtitle {
  color: #7a8793;
  font-size: 14px;
}
.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.06);
}
.upload-area {
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  position: relative;
}
.file-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}
.upload-tip p {
  margin: 0 0 8px 0;
  color: #475569;
}
.primary {
  background: linear-gradient(135deg, #42b983, #2c8a62);
  border: none;
  color: #fff;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
}
.ghost {
  background: #f5f5f5;
  border: 1px solid #e5e7eb;
  color: #374151;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
}
.actions {
  margin-top: 16px;
  display: flex;
  gap: 12px;
}
.file-info {
  margin-top: 12px;
  color: #475569;
  display: flex;
  justify-content: center;
  gap: 8px;
}
.result {
  margin-top: 20px;
}
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin: 12px 0;
}
.stat {
  padding: 12px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
}
.stat.success { background: #ecfdf3; border-color: #bbf7d0; color: #166534; }
.stat.warning { background: #fff7ed; border-color: #fed7aa; color: #c2410c; }
.stat.error { background: #fef2f2; border-color: #fecdd3; color: #b91c1c; }
.stat span { display: block; font-size: 13px; color: #6b7280; }
.stat strong { font-size: 18px; }
.message { color: #374151; }
.errors ul { margin: 8px 0 0; padding-left: 18px; color: #b91c1c; }
.error-banner {
  margin-top: 12px;
  padding: 12px;
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecdd3;
  border-radius: 8px;
}
</style>

