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
  {
    path: '/resume-parse',
    name: 'resume-parse',
    component: () => import(/* webpackChunkName: "resume-parse" */ '../views/ResumeParseView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/chat-resume',
    name: 'chat-resume',
    component: () => import(/* webpackChunkName: "chat-resume" */ '../views/ChatResumeView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/job-collection',
    name: 'job-collection',
    component: () => import(/* webpackChunkName: "job-collection" */ '../views/JobCollectionView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/job-import',
    name: 'job-import',
    component: () => import(/* webpackChunkName: "job-import" */ '../views/JobImportView.vue'),
    meta: { requiresAuth: false }
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
  if (authStore.token && !authStore.user) {
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
    // 无权限，跳转到首页
    next({ name: 'home' })
    return
  }

  next()
})

export default router
