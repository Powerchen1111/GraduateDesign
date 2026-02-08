import axiosInstance from './axios'

/**
 * 职位管理 API
 */

/**
 * 获取职位列表（支持分页和筛选）
 *
 * @param {Object} params - 查询参数
 * @param {string} params.keyword - 搜索关键词
 * @param {string} params.title - 职位标题
 * @param {string} params.company - 公司名称
 * @param {string} params.location - 工作地点
 * @param {string} params.industry - 行业
 * @param {number} params.minSalary - 最低薪资
 * @param {string} params.jobType - 工作类型
 * @param {number} params.page - 页码（从0开始）
 * @param {number} params.size - 每页数量
 * @returns {Promise}
 */
export function getJobs(params = {}) {
  return axiosInstance.get('/jobs', { params })
}

/**
 * 获取职位详情
 *
 * @param {number} id - 职位ID
 * @returns {Promise}
 */
export function getJobById(id) {
  return axiosInstance.get(`/jobs/${id}`)
}

/**
 * 搜索职位（关键词搜索）
 *
 * @param {string} keyword - 搜索关键词
 * @param {number} page - 页码
 * @param {number} size - 每页数量
 * @returns {Promise}
 */
export function searchJobs(keyword, page = 0, size = 20) {
  return axiosInstance.get('/jobs/search', {
    params: { keyword, page, size }
  })
}

/**
 * 高级搜索职位（多条件筛选）
 *
 * @param {Object} filters - 筛选条件
 * @param {number} page - 页码
 * @param {number} size - 每页数量
 * @returns {Promise}
 */
export function advancedSearchJobs(filters, page = 0, size = 20) {
  return axiosInstance.get('/jobs/advanced-search', {
    params: { ...filters, page, size }
  })
}

/**
 * 获取职位统计信息
 *
 * @returns {Promise}
 */
export function getJobStatistics() {
  return axiosInstance.get('/jobs/statistics')
}

/**
 * 获取最新职位
 *
 * @param {number} size - 数量
 * @returns {Promise}
 */
export function getLatestJobs(size = 10) {
  return axiosInstance.get('/jobs/latest', {
    params: { size }
  })
}

/**
 * 按行业统计职位数量
 *
 * @returns {Promise}
 */
export function getJobsByIndustry() {
  return axiosInstance.get('/jobs/by-industry')
}

/**
 * 按地区统计职位数量
 *
 * @returns {Promise}
 */
export function getJobsByLocation() {
  return axiosInstance.get('/jobs/by-location')
}
