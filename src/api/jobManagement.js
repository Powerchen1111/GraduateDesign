/**
 * 职位管理相关 API（招聘者专用）
 */

import axios from './axios'

/**
 * 发布新职位
 * @param {Object} data - 职位数据
 * @param {number} publisherId - 发布者ID
 */
export const publishJob = (data, publisherId) => {
  return axios.post('/jobs/manage/publish', data, {
    params: { publisherId }
  })
}

/**
 * 更新职位信息
 * @param {number} jobId - 职位ID
 * @param {Object} data - 更新数据
 * @param {number} publisherId - 发布者ID
 */
export const updateJob = (jobId, data, publisherId) => {
  return axios.put(`/jobs/manage/${jobId}`, data, {
    params: { publisherId }
  })
}

/**
 * 删除职位
 * @param {number} jobId - 职位ID
 * @param {number} publisherId - 发布者ID
 */
export const deleteJob = (jobId, publisherId) => {
  return axios.delete(`/jobs/manage/${jobId}`, {
    params: { publisherId }
  })
}

/**
 * 更新职位状态
 * @param {number} jobId - 职位ID
 * @param {string} status - 新状态 (ACTIVE/PAUSED/CLOSED)
 * @param {number} publisherId - 发布者ID
 */
export const updateJobStatus = (jobId, status, publisherId) => {
  return axios.put(`/jobs/manage/${jobId}/status`, null, {
    params: { status, publisherId }
  })
}

/**
 * 获取招聘者发布的所有职位
 * @param {number} publisherId - 发布者ID
 */
export const getPublisherJobs = (publisherId) => {
  return axios.get(`/jobs/manage/publisher/${publisherId}`)
}

/**
 * 按状态获取职位
 * @param {number} publisherId - 发布者ID
 * @param {string} status - 职位状态
 */
export const getPublisherJobsByStatus = (publisherId, status) => {
  return axios.get(`/jobs/manage/publisher/${publisherId}/status/${status}`)
}

/**
 * 获取职位详情
 * @param {number} jobId - 职位ID
 * @param {number} publisherId - 发布者ID
 */
export const getJobDetail = (jobId, publisherId) => {
  return axios.get(`/jobs/manage/${jobId}`, {
    params: { publisherId }
  })
}

/**
 * 统计职位数量
 * @param {number} publisherId - 发布者ID
 */
export const countPublisherJobs = (publisherId) => {
  return axios.get(`/jobs/manage/publisher/${publisherId}/count`)
}
