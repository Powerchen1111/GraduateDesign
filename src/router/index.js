import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: false }
  },
  {
    path: '/about',
    name: 'about',
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/chat',
    name: 'chat',
    component: () => import(/* webpackChunkName: "chat" */ '../views/ChatView.vue'),
    meta: { requiresAuth: false }
  },
  // 简历管理路由
  {
    path: '/resumes',
    name: 'ResumeList',
    component: () => import(/* webpackChunkName: "resume-list" */ '../views/ResumeListView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/resumes/upload',
    name: 'ResumeUpload',
    component: () => import(/* webpackChunkName: "resume-upload" */ '../views/ResumeUploadView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/resumes/:id',
    name: 'ResumeDetail',
    component: () => import(/* webpackChunkName: "resume-detail" */ '../views/ResumeDetailView.vue'),
    meta: { requiresAuth: true }
  },
  // 职位管理路由
  {
    path: '/jobs',
    name: 'JobManage',
    component: () => import(/* webpackChunkName: "job-manage" */ '../views/JobManageView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/jobs/:id',
    name: 'JobDetail',
    component: () => import(/* webpackChunkName: "job-detail" */ '../views/JobDetailView.vue'),
    meta: { requiresAuth: false }
  },
  // 职位推荐路由
  {
    path: '/recommendations',
    name: 'JobRecommendations',
    component: () => import(/* webpackChunkName: "job-recommendations" */ '../views/JobRecommendationView.vue'),
    meta: { requiresAuth: true }
  },
  // 认证相关路由
  {
    path: '/login',
    name: 'Login',
    component: () => import(/* webpackChunkName: "login" */ '../views/auth/LoginView.vue'),
    meta: { requiresAuth: false, hideForAuth: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import(/* webpackChunkName: "register" */ '../views/auth/RegisterView.vue'),
    meta: { requiresAuth: false, hideForAuth: true }
  },
  // 用户管理路由
  {
    path: '/profile',
    name: 'Profile',
    component: () => import(/* webpackChunkName: "profile" */ '../views/user/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/change-password',
    name: 'ChangePassword',
    component: () => import(/* webpackChunkName: "change-password" */ '../views/user/ChangePasswordView.vue'),
    meta: { requiresAuth: true }
  },
  // 招聘者专属路由
  {
    path: '/job-publish',
    name: 'JobPublish',
    component: () => import(/* webpackChunkName: "job-publish" */ '../views/recruiter/JobPublishView.vue'),
    meta: { requiresAuth: true, requiresRole: 'RECRUITER' }
  },
  {
    path: '/my-jobs',
    name: 'MyJobs',
    component: () => import(/* webpackChunkName: "my-jobs" */ '../views/recruiter/MyJobsView.vue'),
    meta: { requiresAuth: true, requiresRole: 'RECRUITER' }
  },
  // 求职者专属路由
  {
    path: '/my-applications',
    name: 'MyApplications',
    component: () => import(/* webpackChunkName: "my-applications" */ '../views/seeker/MyApplicationsView.vue'),
    meta: { requiresAuth: true, requiresRole: 'JOB_SEEKER' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 全局路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 初始化认证状态（仅在首次访问时）
  if (authStore.user && !authStore.isAuthenticated) {
    await authStore.initAuth()
  }

  // 检查是否需要认证
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // 需要认证但未登录，跳转到登录页
    next({
      name: 'Login',
      query: { redirect: to.fullPath }
    })
    return
  }

  // 已登录用户访问登录/注册页，重定向到首页
  if (to.meta.hideForAuth && authStore.isAuthenticated) {
    next({ name: 'home' })
    return
  }

  // 检查角色权限（如果路由有 requiresRole 配置）
  if (to.meta.requiresRole && authStore.userRole !== to.meta.requiresRole) {
    // 管理员可以访问所有页面
    if (authStore.userRole !== 'ADMIN') {
      alert('您没有权限访问该页面')
      next({ name: 'home' })
      return
    }
  }

  next()
})

export default router
