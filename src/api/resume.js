import axiosInstance from './axios'

/**
 * 简历管理 API
 */

/**
 * 上传并解析简历
 * @param {File} file - 简历文件
 * @param {Function} onProgress - 上传进度回调
 * @returns {Promise}
 */
export function parseResume(file, onProgress) {
  const formData = new FormData()
  formData.append('file', file)

  return axiosInstance.post('/resumes/parse', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 300000, // 5分钟超时，适合大文件和AI解析
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(percentCompleted)
      }
    }
  })
}

/**
 * 获取所有简历或我的简历
 * @param {boolean} myOnly - 是否只获取自己的简历
 * @returns {Promise}
 */
export function getResumes(myOnly = false) {
  return axiosInstance.get('/resumes', {
    params: { myOnly }
  })
}

/**
 * 根据ID获取简历详情
 * @param {number} id - 简历ID
 * @returns {Promise}
 */
export function getResumeById(id) {
  return axiosInstance.get(`/resumes/${id}`)
}

/**
 * 更新简历
 * @param {number} id - 简历ID
 * @param {Object} data - 更新的数据
 * @returns {Promise}
 */
export function updateResume(id, data) {
  return axiosInstance.put(`/resumes/${id}`, data)
}

/**
 * 删除简历
 * @param {number} id - 简历ID
 * @returns {Promise}
 */
export function deleteResume(id) {
  return axiosInstance.delete(`/resumes/${id}`)
}

/**
 * 根据邮箱搜索简历
 * @param {string} email - 邮箱地址
 * @returns {Promise}
 */
export function searchByEmail(email) {
  return axiosInstance.get('/resumes/search/email', {
    params: { email }
  })
}

/**
 * 根据电话搜索简历
 * @param {string} phone - 电话号码
 * @returns {Promise}
 */
export function searchByPhone(phone) {
  return axiosInstance.get('/resumes/search/phone', {
    params: { phone }
  })
}

/**
 * 根据姓名模糊搜索简历
 * @param {string} name - 姓名关键词
 * @returns {Promise}
 */
export function searchByName(name) {
  return axiosInstance.get('/resumes/search/name', {
    params: { name }
  })
}

/**
 * 根据技能搜索简历
 * @param {string} skill - 技能关键词
 * @returns {Promise}
 */
export function searchBySkills(skill) {
  return axiosInstance.get('/resumes/search/skills', {
    params: { skill }
  })
}

/**
 * 语义相似度搜索
 * @param {string} query - 搜索查询
 * @param {number} topK - 返回结果数量
 * @returns {Promise}
 */
export function findSimilarResumes(query, topK = 5) {
  return axiosInstance.get('/resumes/search/similar', {
    params: { query, topK }
  })
}

/**
 * 获取有向量嵌入的简历
 * @returns {Promise}
 */
export function getResumesWithEmbeddings() {
  return axiosInstance.get('/resumes/with-embeddings')
}
