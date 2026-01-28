<template>
  <div class="resume-detail-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 简历详情 -->
    <div v-else-if="resume" class="resume-content">
      <!-- 头部操作 -->
      <div class="header-actions">
        <button @click="goBack" class="back-btn">
          ← 返回列表
        </button>
        <button @click="deleteResume" class="delete-btn">
          🗑️ 删除简历
        </button>
      </div>

      <!-- 个人信息 -->
      <div class="section">
        <h2 class="section-title">👤 个人信息</h2>
        <div class="info-grid" v-if="resume.personalInfo">
          <div class="info-item" v-if="resume.personalInfo.name">
            <span class="label">姓名:</span>
            <span class="value">{{ resume.personalInfo.name }}</span>
          </div>
          <div class="info-item" v-if="resume.personalInfo.gender">
            <span class="label">性别:</span>
            <span class="value">{{ resume.personalInfo.gender }}</span>
          </div>
          <div class="info-item" v-if="resume.personalInfo.birthDate">
            <span class="label">出生日期:</span>
            <span class="value">{{ resume.personalInfo.birthDate }}</span>
          </div>
          <div class="info-item" v-if="resume.personalInfo.phone">
            <span class="label">电话:</span>
            <span class="value">{{ resume.personalInfo.phone }}</span>
          </div>
          <div class="info-item" v-if="resume.personalInfo.email">
            <span class="label">邮箱:</span>
            <span class="value">{{ resume.personalInfo.email }}</span>
          </div>
          <div class="info-item" v-if="resume.personalInfo.location">
            <span class="label">所在地:</span>
            <span class="value">{{ resume.personalInfo.location }}</span>
          </div>
        </div>
        <div v-if="resume.personalInfo?.summary" class="summary">
          <p>{{ resume.personalInfo.summary }}</p>
        </div>
      </div>

      <!-- 教育背景 -->
      <div class="section" v-if="resume.education && resume.education.length > 0">
        <h2 class="section-title">🎓 教育背景</h2>
        <div class="timeline">
          <div v-for="(edu, index) in resume.education" :key="index" class="timeline-item">
            <div class="timeline-header">
              <h3>{{ edu.school }}</h3>
              <span class="timeline-date">{{ edu.startDate }} - {{ edu.endDate || '至今' }}</span>
            </div>
            <div class="timeline-content">
              <p><strong>专业:</strong> {{ edu.major }}</p>
              <p v-if="edu.degree"><strong>学位:</strong> {{ edu.degree }}</p>
              <p v-if="edu.gpa"><strong>GPA:</strong> {{ edu.gpa }}</p>
              <p v-if="edu.description">{{ edu.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 工作经验 -->
      <div class="section" v-if="resume.workExperience && resume.workExperience.length > 0">
        <h2 class="section-title">💼 工作经验</h2>
        <div class="timeline">
          <div v-for="(work, index) in resume.workExperience" :key="index" class="timeline-item">
            <div class="timeline-header">
              <h3>{{ work.company }}</h3>
              <span class="timeline-date">{{ work.startDate }} - {{ work.endDate || '至今' }}</span>
            </div>
            <div class="timeline-content">
              <p><strong>职位:</strong> {{ work.position }}</p>
              <ul v-if="work.responsibilities && work.responsibilities.length > 0">
                <li v-for="(resp, idx) in work.responsibilities" :key="idx">{{ resp }}</li>
              </ul>
              <p v-if="work.description">{{ work.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 项目经验 -->
      <div class="section" v-if="resume.projects && resume.projects.length > 0">
        <h2 class="section-title">🚀 项目经验</h2>
        <div class="timeline">
          <div v-for="(project, index) in resume.projects" :key="index" class="timeline-item">
            <div class="timeline-header">
              <h3>{{ project.name }}</h3>
              <span class="timeline-date" v-if="project.startDate">
                {{ project.startDate }} - {{ project.endDate || '至今' }}
              </span>
            </div>
            <div class="timeline-content">
              <p v-if="project.role"><strong>角色:</strong> {{ project.role }}</p>
              <div v-if="project.technologies && project.technologies.length > 0" class="tags">
                <span class="tag" v-for="(tech, idx) in project.technologies" :key="idx">
                  {{ tech }}
                </span>
              </div>
              <p v-if="project.description">{{ project.description }}</p>
              <p v-if="project.award" class="award">🏆 {{ project.award }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 技能 -->
      <div class="section" v-if="resume.skills">
        <h2 class="section-title">🛠️ 技能</h2>
        <div class="skills-grid">
          <div class="skill-category" v-if="hasSkills(resume.skills.programmingLanguages)">
            <h4>编程语言</h4>
            <div class="tags">
              <span class="tag" v-for="(skill, idx) in resume.skills.programmingLanguages" :key="idx">
                {{ getSkillName(skill) }}
              </span>
            </div>
          </div>
          <div class="skill-category" v-if="hasSkills(resume.skills.frameworks)">
            <h4>框架</h4>
            <div class="tags">
              <span class="tag" v-for="(skill, idx) in resume.skills.frameworks" :key="idx">
                {{ getSkillName(skill) }}
              </span>
            </div>
          </div>
          <div class="skill-category" v-if="hasSkills(resume.skills.databases)">
            <h4>数据库</h4>
            <div class="tags">
              <span class="tag" v-for="(skill, idx) in resume.skills.databases" :key="idx">
                {{ getSkillName(skill) }}
              </span>
            </div>
          </div>
          <div class="skill-category" v-if="hasSkills(resume.skills.tools)">
            <h4>工具</h4>
            <div class="tags">
              <span class="tag" v-for="(skill, idx) in resume.skills.tools" :key="idx">
                {{ getSkillName(skill) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 证书 -->
      <div class="section" v-if="resume.certificates && resume.certificates.length > 0">
        <h2 class="section-title">📜 证书</h2>
        <div class="certificate-list">
          <div v-for="(cert, index) in resume.certificates" :key="index" class="certificate-item">
            <h4>{{ cert.name }}</h4>
            <p v-if="cert.issuingOrganization">发证机构: {{ cert.issuingOrganization }}</p>
            <p v-if="cert.issueDate">发证日期: {{ cert.issueDate }}</p>
            <p v-if="cert.description">{{ cert.description }}</p>
          </div>
        </div>
      </div>

      <!-- 语言能力 -->
      <div class="section" v-if="resume.languages && resume.languages.length > 0">
        <h2 class="section-title">🌐 语言能力</h2>
        <div class="language-list">
          <div v-for="(lang, index) in resume.languages" :key="index" class="language-item">
            <span class="lang-name">{{ lang.language }}</span>
            <span class="lang-level">{{ lang.proficiency }}</span>
          </div>
        </div>
      </div>

      <!-- 文件信息 -->
      <div class="section file-meta">
        <h2 class="section-title">📎 文件信息</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">文件名:</span>
            <span class="value">{{ resume.fileName }}</span>
          </div>
          <div class="info-item">
            <span class="label">上传时间:</span>
            <span class="value">{{ formatTime(resume.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else class="error-state">
      <div class="error-icon">😕</div>
      <h3>简历不存在</h3>
      <p>无法找到该简历，可能已被删除</p>
      <button @click="goBack" class="primary-btn">返回列表</button>
    </div>
  </div>
</template>

<script>
import { getResumeById, deleteResume as deleteResumeAPI } from '@/api/resume'

export default {
  name: 'ResumeDetailView',
  data() {
    return {
      resume: null,
      loading: false
    }
  },
  mounted() {
    this.loadResume()
  },
  methods: {
    async loadResume() {
      const id = this.$route.params.id
      if (!id) {
        this.$router.push('/resumes')
        return
      }

      this.loading = true

      try {
        const response = await getResumeById(id)
        this.resume = response.data
      } catch (error) {
        console.error('加载简历失败:', error)
        this.resume = null
      } finally {
        this.loading = false
      }
    },

    async deleteResume() {
      if (!confirm('确定要删除这份简历吗？此操作不可恢复。')) {
        return
      }

      try {
        await deleteResumeAPI(this.resume.id)
        alert('删除成功')
        this.$router.push('/resumes')
      } catch (error) {
        console.error('删除失败:', error)
        alert('删除失败，请稍后重试')
      }
    },

    goBack() {
      this.$router.push('/resumes')
    },

    formatTime(timestamp) {
      if (!timestamp) return ''
      const date = new Date(timestamp)
      return date.toLocaleString('zh-CN')
    },

    hasSkills(skills) {
      return skills && skills.length > 0
    },

    getSkillName(skill) {
      if (typeof skill === 'string') {
        return skill
      }
      return skill.name || skill
    }
  }
}
</script>

<style scoped>
.resume-detail-container {
  max-width: 900px;
  margin: 24px auto 40px;
  padding: 0 20px;
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

.resume-content {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.header-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
}

.back-btn, .delete-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.back-btn {
  background: #f5f5f5;
  color: #2c3e50;
}

.back-btn:hover {
  background: #e0e0e0;
}

.delete-btn {
  background: #ffebee;
  color: #c62828;
}

.delete-btn:hover {
  background: #c62828;
  color: white;
}

.section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.section:last-child {
  border-bottom: none;
}

.section-title {
  color: #2c3e50;
  font-size: 20px;
  margin: 0 0 20px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #42b983;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item .label {
  font-size: 13px;
  color: #999;
  font-weight: 500;
}

.info-item .value {
  font-size: 15px;
  color: #2c3e50;
}

.summary {
  margin-top: 16px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  line-height: 1.6;
  color: #666;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.timeline-item {
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  border-left: 4px solid #42b983;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.timeline-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
}

.timeline-date {
  font-size: 13px;
  color: #999;
  white-space: nowrap;
}

.timeline-content p {
  margin: 8px 0;
  color: #666;
  line-height: 1.6;
}

.timeline-content ul {
  margin: 8px 0;
  padding-left: 20px;
  color: #666;
}

.timeline-content li {
  margin: 4px 0;
  line-height: 1.6;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 12px 0;
}

.tag {
  display: inline-block;
  padding: 6px 12px;
  background: #e8f5e9;
  color: #2e7d32;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
}

.award {
  color: #f57c00;
  font-weight: 500;
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.skill-category h4 {
  margin: 0 0 12px 0;
  color: #2c3e50;
  font-size: 16px;
}

.certificate-list, .language-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.certificate-item {
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
}

.certificate-item h4 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 16px;
}

.certificate-item p {
  margin: 4px 0;
  color: #666;
  font-size: 14px;
}

.language-list {
  flex-direction: row;
  flex-wrap: wrap;
}

.language-item {
  padding: 12px 20px;
  background: #f9f9f9;
  border-radius: 8px;
  display: flex;
  gap: 12px;
  align-items: center;
}

.lang-name {
  font-weight: 500;
  color: #2c3e50;
}

.lang-level {
  color: #666;
  font-size: 14px;
}

.file-meta {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
}

.error-state {
  text-align: center;
  padding: 80px 20px;
}

.error-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.error-state h3 {
  color: #2c3e50;
  margin: 0 0 12px 0;
  font-size: 20px;
}

.error-state p {
  color: #999;
  margin: 0 0 24px 0;
  font-size: 14px;
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

@media (max-width: 768px) {
  .resume-content {
    padding: 20px;
  }

  .header-actions {
    flex-direction: column;
    gap: 12px;
  }

  .back-btn, .delete-btn {
    width: 100%;
  }

  .timeline-header {
    flex-direction: column;
    gap: 8px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .skills-grid {
    grid-template-columns: 1fr;
  }
}
</style>
