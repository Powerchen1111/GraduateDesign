<template>
  <div class="resume-parse-container">
    <h1>简历解析</h1>
    
    <div class="upload-section">
      <input 
        type="file" 
        ref="fileInput" 
        accept=".pdf,.docx" 
        style="display: none" 
        @change="handleFileChange"
      />
      <button @click="$refs.fileInput.click()" class="upload-btn">
        <span class="upload-icon">📁</span> 选择PDF或DOCX文件
      </button>
      <div v-if="selectedFile" class="file-info">
        已选择文件: {{ selectedFile.name }}
      </div>
    </div>
    
    <div class="parse-section" v-if="selectedFile">
      <button @click="parseResume" :disabled="isParsing" class="parse-btn">
        {{ isParsing ? '解析中...' : '开始解析' }}
      </button>
    </div>
    
    <div class="result-section" v-if="parseResult">
      <h2>解析结果</h2>
      <div class="result-content">
        <pre>{{ JSON.stringify(parseResult, null, 2) }}</pre>
      </div>
    </div>
    
    <div class="error-section" v-if="errorMessage">
      <div class="error-message">
        <span class="error-icon">⚠️</span> {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ResumeParseView',
  data() {
    return {
      selectedFile: null,
      isParsing: false,
      parseResult: null,
      errorMessage: ''
    };
  },
  methods: {
    handleFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        if (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          this.selectedFile = file;
          this.errorMessage = '';
          this.parseResult = null;
        } else {
          this.errorMessage = '请选择PDF或DOCX格式的文件';
          this.selectedFile = null;
        }
      }
    },
    async parseResume() {
      if (!this.selectedFile) return;
      
      this.isParsing = true;
      this.errorMessage = '';
      this.parseResult = null;
      
      try {
        const formData = new FormData();
        formData.append('file', this.selectedFile);
        
        const response = await axios.post('http://localhost:8080/api/resume/parse', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        this.parseResult = response.data;
      } catch (error) {
        console.error('解析失败:', error);
        this.errorMessage = '解析失败，请检查文件格式是否正确或稍后重试';
      } finally {
        this.isParsing = false;
      }
    }
  }
};
</script>

<style scoped>
.resume-parse-container {
  width: 1000px;
  margin: 20px auto;
  padding: 20px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 16px;
  font-family: Avenir, Helvetica, Arial, sans-serif;
}

h1 {
  color: #2c3e50;
  text-align: center;
  margin-bottom: 30px;
}

h2 {
  color: #2c3e50;
  margin-top: 30px;
  margin-bottom: 15px;
}

.upload-section {
  text-align: center;
  margin-bottom: 20px;
}

.upload-btn {
  padding: 12px 24px;
  font-size: 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 0 auto;
  transition: background-color 0.3s;
}

.upload-btn:hover {
  background-color: #35495e;
}

.file-info {
  margin-top: 15px;
  color: #666;
  font-size: 14px;
}

.parse-section {
  text-align: center;
  margin-bottom: 30px;
}

.parse-btn {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #35495e;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.parse-btn:hover {
  background-color: #2c3e50;
}

.parse-btn:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.result-section {
  margin-top: 30px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  background-color: #f9f9f9;
}

.result-content {
  max-height: 500px;
  overflow-y: auto;
  background-color: #fff;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 15px;
}

.error-section {
  margin-top: 20px;
}

.error-message {
  padding: 12px;
  background-color: #ffebee;
  border: 1px solid #ffcdd2;
  border-radius: 8px;
  color: #c62828;
  display: flex;
  align-items: center;
  gap: 8px;
}

.upload-icon,
.error-icon {
  font-size: 18px;
}
</style>