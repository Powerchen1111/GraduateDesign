<template>
  <McLayout class="container">
    <McHeader :title="'智能简历分析平台'">
      <template #operationArea>
        <div class="operations">
          <i class="icon-helping"></i>
        </div>
      </template>
    </McHeader>
    
    <!-- 左侧：简历解析区域 -->
    <div class="left-panel">
      <div class="panel-header">
        <h2>📄 简历解析</h2>
      </div>
      
      <div class="upload-section">
        <input 
          type="file" 
          ref="fileInput" 
          accept=".pdf,.docx,.doc,.jpg,.jpeg,.png" 
          style="display: none" 
          @change="handleFileChange"
        />
        <button @click="$refs.fileInput.click()" class="upload-btn" :disabled="isParsing">
          <span class="upload-icon">📁</span> 
          {{ selectedFile ? '重新选择文件' : '选择简历文件' }}
        </button>
        <div v-if="selectedFile" class="file-info">
          <div class="file-name">{{ selectedFile.name }}</div>
          <div class="file-size">{{ formatFileSize(selectedFile.size) }}</div>
        </div>
      </div>
      
      <div class="parse-section" v-if="selectedFile">
        <button @click="parseResume" :disabled="isParsing" class="parse-btn">
          {{ isParsing ? '解析中...' : '开始解析' }}
        </button>
      </div>
      
      <div class="parse-result-section" v-if="parseResult">
        <div class="result-header">
          <h3>✅ 解析成功</h3>
          <button @click="showResumeDetail = !showResumeDetail" class="toggle-btn">
            {{ showResumeDetail ? '收起' : '展开' }}详情
          </button>
        </div>
        <div v-if="showResumeDetail" class="result-content">
          <div class="info-item" v-if="parseResult.personalInfo">
            <strong>姓名：</strong>{{ parseResult.personalInfo.name || '未识别' }}
          </div>
          <div class="info-item" v-if="parseResult.personalInfo">
            <strong>电话：</strong>{{ parseResult.personalInfo.phone || '未识别' }}
          </div>
          <div class="info-item" v-if="parseResult.personalInfo">
            <strong>邮箱：</strong>{{ parseResult.personalInfo.email || '未识别' }}
          </div>
          <div class="info-item" v-if="parseResult.skills">
            <strong>技能：</strong>
            <span v-if="parseResult.skills.programmingLanguages && parseResult.skills.programmingLanguages.length">
              {{ parseResult.skills.programmingLanguages.map(s => s.name || s).join(', ') }}
            </span>
            <span v-else>未识别</span>
          </div>
        </div>
      </div>
      
      <div class="error-section" v-if="errorMessage">
        <div class="error-message">
          <span class="error-icon">⚠️</span> {{ errorMessage }}
        </div>
      </div>
    </div>
    
    <!-- 右侧：对话区域 -->
    <div class="right-panel">
    <McLayoutContent
      v-if="startPage && !parseResult"
      class="hero"
    >
        <McIntroduction
          :title="'AI 简历助手'"
          :subTitle="'Hi，欢迎使用智能简历分析平台'"
          :description="description"
        ></McIntroduction>
        <McPrompt
          :list="introPrompt.list"
          :direction="introPrompt.direction"
          class="intro-prompt"
          @itemClick="onSubmit($event.label)"
        ></McPrompt>
      </McLayoutContent>
      
    <McLayoutContent class="content-container" v-else>
        <template v-for="(msg, idx) in messages" :key="idx">
          <McBubble
            v-if="msg.type === 'user'"
            :content="msg.content"
            :align="'right'"
            :avatar="userAvatar"
          ></McBubble>
          <McBubble 
            v-else 
            :content="msg.content" 
            :avatar="aiAvatar" 
            :loading="msg.loading" 
          ></McBubble>
        </template>
        <McBubble
          v-if="isStreaming"
          :content="streamingContent + '...'"
          :avatar="aiAvatar"
          :loading="true"
        ></McBubble>
      </McLayoutContent>
      
      <div class="shortcut" style="display: flex; align-items: center; gap: 8px">
        <McPrompt
          v-if="!startPage || parseResult"
          :list="simplePrompt"
          :direction="'horizontal'"
          style="flex: 1"
          @itemClick="onSubmit($event.label)"
        ></McPrompt>
      </div>
      
      <McLayoutSender>
        <McInput 
          v-model="inputMessage" 
          :maxLength="2000" 
          @change="(e) => (inputMessage = e)" 
          @submit="sendMessage"
          :disabled="isStreaming"
        >
        </McInput>
      </McLayoutSender>
    </div>
  </McLayout>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ChatResumeView',
  data() {
    return {
      // 解析相关
      selectedFile: null,
      isParsing: false,
      parseResult: null,
      errorMessage: '',
      showResumeDetail: false,
      
      // 对话相关
      messages: [],
      inputMessage: '',
      isStreaming: false,
      streamingContent: '',
      startPage: true,
      userAvatar: 'https://picsum.photos/id/1005/40/40',
      aiAvatar: 'https://picsum.photos/id/1012/40/40',
      description: [
        '智能简历分析平台可以帮您解析简历、提取关键信息、进行智能匹配和推荐。',
        '上传简历后，您可以与AI助手对话，询问简历相关问题或获取职位推荐建议。',
      ],
      introPrompt: {
        direction: 'horizontal',
        list: [
          {
            value: 'analyzeResume',
            label: '分析我的简历',
            iconConfig: { name: 'icon-info-o', color: '#5e7ce0' },
            desc: '让AI分析已上传的简历',
          },
          {
            value: 'jobRecommend',
            label: '推荐适合的职位',
            iconConfig: { name: 'icon-star', color: 'rgb(255, 215, 0)' },
            desc: '基于简历推荐匹配职位',
          },
          {
            value: 'skillAnalysis',
            label: '技能分析',
            iconConfig: { name: 'icon-priority', color: '#3ac295' },
            desc: '分析简历中的技能点',
          },
        ],
      },
      simplePrompt: [
        {
          value: 'analyzeResume',
          iconConfig: { name: 'icon-info-o', color: '#5e7ce0' },
          label: '分析简历',
        },
        {
          value: 'jobRecommend',
          iconConfig: { name: 'icon-star', color: 'rgb(255, 215, 0)' },
          label: '职位推荐',
        },
      ]
    };
  },
  methods: {
    handleFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        const allowedTypes = [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/msword',
          'image/jpeg',
          'image/jpg',
          'image/png'
        ];
        
        if (allowedTypes.includes(file.type)) {
          this.selectedFile = file;
          this.errorMessage = '';
          this.parseResult = null;
        } else {
          this.errorMessage = '请选择PDF、DOCX、DOC或图片格式的文件';
          this.selectedFile = null;
        }
      }
    },
    
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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
        this.showResumeDetail = true;
        
        // 解析成功后，自动发送欢迎消息
        if (this.startPage) {
          this.startPage = false;
          this.messages.push({
            type: 'ai',
            content: `简历解析成功！我已经为您解析了简历，姓名：${this.parseResult.personalInfo?.name || '未识别'}。您可以问我关于简历的任何问题，比如"分析我的技能"、"推荐适合的职位"等。`,
            loading: false
          });
        }
      } catch (error) {
        console.error('解析失败:', error);
        this.errorMessage = error.response?.data?.message || '解析失败，请检查文件格式是否正确或稍后重试';
      } finally {
        this.isParsing = false;
      }
    },
    
    async sendMessage() {
      if (!this.inputMessage.trim() || this.isStreaming) return;
      
      const userMessage = this.inputMessage.trim();
      this.messages.push({ type: 'user', content: userMessage, loading: false });
      this.inputMessage = '';
      this.isStreaming = true;
      this.streamingContent = '';
      this.startPage = false;
      
      try {
        // 如果有解析结果，在消息中添加上下文
        let messageWithContext = userMessage;
        if (this.parseResult) {
          messageWithContext = `用户已上传简历，解析结果：姓名${this.parseResult.personalInfo?.name || '未知'}，技能：${JSON.stringify(this.parseResult.skills || {})}。用户问题：${userMessage}`;
        }
        
        const response = await axios.post('http://localhost:8080/api/chat', `"${messageWithContext}"`, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        this.messages.push({ type: 'ai', content: response.data, loading: false });
      } catch (error) {
        console.error('聊天请求失败:', error);
        this.messages.push({ type: 'ai', content: '抱歉，聊天请求失败，请稍后重试。', loading: false });
      } finally {
        this.isStreaming = false;
        this.streamingContent = '';
      }
    },
    
    async onSubmit(content) {
      if (content === 'analyzeResume') {
        if (!this.parseResult) {
          this.messages.push({ 
            type: 'ai', 
            content: '请先上传并解析简历文件。', 
            loading: false 
          });
          return;
        }
        this.inputMessage = '请分析我的简历，包括技能、经验、教育背景等';
      } else if (content === 'jobRecommend') {
        if (!this.parseResult) {
          this.messages.push({ 
            type: 'ai', 
            content: '请先上传并解析简历文件。', 
            loading: false 
          });
          return;
        }
        this.inputMessage = '基于我的简历，推荐适合的职位';
      } else if (content === 'skillAnalysis') {
        if (!this.parseResult) {
          this.messages.push({ 
            type: 'ai', 
            content: '请先上传并解析简历文件。', 
            loading: false 
          });
          return;
        }
        this.inputMessage = '分析我简历中的技能点，包括技术栈和熟练程度';
      } else {
        this.inputMessage = content;
      }
      await this.sendMessage();
    }
  }
};
</script>

<style scoped>
.container {
  width: 100%;
  max-width: 1280px;
  margin: 24px auto 36px;
  min-height: 75vh;
  padding: 20px;
  gap: 16px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  display: flex;
  flex-direction: row;
  box-shadow: 0 6px 18px rgba(0,0,0,0.06);
}

.left-panel {
  width: 400px;
  min-width: 380px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-right: 1px solid #eee;
  padding-right: 16px;
  overflow-y: auto;
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.panel-header {
  padding-bottom: 12px;
  border-bottom: 2px solid #eee;
}

.panel-header h2 {
  margin: 0;
  font-size: 18px;
  color: #2c3e50;
}

.upload-section {
  text-align: center;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 10px;
  border: 1px solid #eef0f3;
}

.upload-btn {
  width: 100%;
  padding: 12px 24px;
  font-size: 14px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background-color 0.3s;
}

.upload-btn:hover:not(:disabled) {
  background-color: #35495e;
}

.upload-btn:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.file-info {
  margin-top: 12px;
  text-align: left;
}

.file-name {
  font-size: 13px;
  color: #2c3e50;
  font-weight: 500;
  word-break: break-all;
}

.file-size {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.parse-section {
  text-align: center;
}

.parse-btn {
  width: 100%;
  padding: 10px 20px;
  font-size: 14px;
  background-color: #35495e;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.parse-btn:hover:not(:disabled) {
  background-color: #2c3e50;
}

.parse-btn:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.parse-result-section {
  margin-top: 12px;
  border: 1px solid #e6e9ed;
  border-radius: 10px;
  padding: 16px;
  background-color: #f9fafc;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.result-header h3 {
  margin: 0;
  font-size: 16px;
  color: #42b983;
}

.toggle-btn {
  padding: 4px 12px;
  font-size: 12px;
  background-color: #e0e0e0;
  color: #666;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.result-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  font-size: 13px;
  color: #2c3e50;
  line-height: 1.6;
}

.info-item strong {
  color: #35495e;
}

.error-section {
  margin-top: 12px;
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
  font-size: 13px;
}

.content-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: auto;
  padding: 20px;
  background-color: #f5f7fb;
  border: 1px solid #eef0f3;
  border-radius: 12px;
  flex: 1;
}
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px 20px;
}

:deep(.mc-bubble) {
  margin-bottom: 15px;
}

.intro-prompt {
  margin-top: 20px;
}
</style>

