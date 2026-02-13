/**
 * 职位收藏相关 API
 */

import axios from './axios'

/**
 * 添加收藏
 * @param {Object} data - 收藏数据
 * @param {number} data.jobId - 职位ID
 * @param {string} data.note - 备注
 */
export const addFavorite = (data) => {
  return axios.post('/favorites', data)
}

/**
 * 取消收藏
 * @param {number} jobId - 职位ID
 */
export const removeFavorite = (jobId) => {
  return axios.delete(`/favorites/${jobId}`)
}

/**
 * 获取用户的收藏列表
 */
export const getUserFavorites = () => {
  return axios.get('/favorites')
}

/**
 * 检查是否收藏
 * @param {number} jobId - 职位ID
 */
export const checkFavorite = (jobId) => {
  return axios.get(`/favorites/check/${jobId}`)
}

/**
 * 更新收藏备注
 * @param {number} jobId - 职位ID
 * @param {string} note - 备注
 */
export const updateFavoriteNote = (jobId, note) => {
  return axios.put(`/favorites/${jobId}/note`, { note })
}
