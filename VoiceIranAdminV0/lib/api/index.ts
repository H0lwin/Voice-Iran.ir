// API Client exports
// Use this file to switch between mock and real API

import apiClient from './client'

// Default export is the real API client
export default apiClient

// Re-export for convenience
export const {
  login,
  logout,
  getCurrentUser,
  getDashboardStats,
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  publishPost,
  rejectPost,
  getMartyrs,
  getMartyr,
  createMartyr,
  updateMartyr,
  deleteMartyr,
  getWeapons,
  getWeapon,
  createWeapon,
  updateWeapon,
  deleteWeapon,
  getDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  getAchievements,
  getAchievement,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  getUsers,
  getUser,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getTags,
  createTag,
  updateTag,
  deleteTag,
} = apiClient
