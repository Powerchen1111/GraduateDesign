/**
 * 简历投递相关 API
 */

import axios from './axios'

/**
 * 投递简历
 * @param {Object} data - 投递数据
 * @param {number} data.resumeId - 简历ID
 * @param {number} data.jobId - 职位ID
 * @param {number} data.seekerId - 求职者ID
 */
export const applyJob = (data) => {
  return axios.post('/applications/apply', data)
}

/**
 * 获取求职者的投递记录
 * @param {number} seekerId - 求职者ID
 */
export const getSeekerApplications = (seekerId) => {
  return axios.get(`/applications/seeker/${seekerId}`)
}

/**
 * 获取招聘者收到的简历
 * @param {number} recruiterId - 招聘者ID
 */
export const getRecruiterApplications = (recruiterId) => {
  return axios.get(`/applications/recruiter/${recruiterId}`)
}

/**
 * 获取某个职位的投递记录
 * @param {number} jobId - 职位ID
 */
export const getJobApplications = (jobId) => {
  return axios.get(`/applications/job/${jobId}`)
}

/**
 * 更新投递状态
 * @param {number} applicationId - 投递记录ID
 * @param {Object} data - 更新数据
 * @param {string} data.status - 新状态 (PENDING/VIEWED/INTERVIEW/REJECTED/ACCEPTED)
 * @param {string} data.note - 备注
 */
export const updateApplicationStatus = (applicationId, data) => {
  return axios.put(`/applications/${applicationId}/status`, data)
}

/**
 * 撤回投递
 * @param {number} applicationId - 投递记录ID
 * @param {number} seekerId - 求职者ID
 */
export const deleteApplication = (applicationId, seekerId) => {
  return axios.delete(`/applications/${applicationId}`, {
    params: { seekerId }
  })
}

/**
 * 统计求职者的投递数量
 * @param {number} seekerId - 求职者ID
 */
export const countSeekerApplications = (seekerId) => {
  return axios.get(`/applications/seeker/${seekerId}/count`)
}

/**
 * 统计招聘者收到的简历数量
 * @param {number} recruiterId - 招聘者ID
 */
export const countRecruiterApplications = (recruiterId) => {
  return axios.get(`/applications/recruiter/${recruiterId}/count`)
}
