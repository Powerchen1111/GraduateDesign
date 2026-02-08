import axiosInstance from './axios'

/**
 * 简历-职位匹配推荐 API
 *
 * 提供智能匹配推荐相关的接口调用
 */

/**
 * 为指定简历推荐最匹配的职位
 *
 * @param {number} resumeId - 简历ID
 * @param {number} topK - 返回前 K 个最匹配的职位（默认 10）
 * @returns {Promise} 职位匹配结果列表
 */
export function getJobRecommendations(resumeId, topK = 10) {
  return axiosInstance.get(`/matching/recommend-jobs/${resumeId}`, {
    params: { topK }
  })
}

/**
 * 为当前登录用户的所有简历推荐职位
 *
 * @param {number} topK - 返回前 K 个最匹配的职位（默认 20）
 * @returns {Promise} 职位匹配结果列表
 */
export function getMyRecommendations(topK = 20) {
  return axiosInstance.get('/matching/my-recommendations', {
    params: { topK }
  })
}

/**
 * 为指定职位推荐最合适的简历（HR 视角）
 *
 * @param {number} jobId - 职位ID
 * @param {number} topK - 返回前 K 个最匹配的简历（默认 10）
 * @returns {Promise} 简历匹配结果列表
 */
export function getResumeRecommendations(jobId, topK = 10) {
  return axiosInstance.get(`/matching/recommend-resumes/${jobId}`, {
    params: { topK }
  })
}
