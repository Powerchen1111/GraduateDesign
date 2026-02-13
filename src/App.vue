<template>
  <div id="app">
    <header class="topbar">
      <div class="brand" @click="$router.push('/')">
        <span class="logo">AI</span>
        <span class="title">智能招聘平台</span>
      </div>
      <nav class="nav">
        <router-link to="/">首页</router-link>
        <router-link to="/chat">AI 对话</router-link>
        <router-link to="/jobs">浏览职位</router-link>

        <!-- 求职者专属菜单 -->
        <template v-if="authStore.isJobSeeker || authStore.isAdmin">
          <router-link to="/seeker-dashboard">数据统计</router-link>
          <router-link to="/resumes">我的简历</router-link>
          <router-link to="/recommendations">职位推荐</router-link>
          <router-link to="/my-applications">我的投递</router-link>
          <router-link to="/my-favorites">我的收藏</router-link>
        </template>

        <!-- 招聘者专属菜单 -->
        <template v-if="authStore.isRecruiter || authStore.isAdmin">
          <router-link to="/recruiter-dashboard">数据统计</router-link>
          <router-link to="/job-publish">发布职位</router-link>
          <router-link to="/my-jobs">我的职位</router-link>
          <router-link to="/received-applications">收到的简历</router-link>
          <router-link to="/candidate-recommendations">候选人推荐</router-link>
        </template>

        <!-- 管理员专属菜单 -->
        <template v-if="authStore.isAdmin">
          <router-link to="/job-manage">职位管理</router-link>
        </template>

        <!-- 用户信息区域 -->
        <div v-if="authStore.isAuthenticated" class="user-menu">
          <div class="user-info" @click="toggleMenu">
            <span class="user-name">{{ authStore.user?.username || authStore.user?.phone }}</span>
            <span class="user-role">{{ authStore.userRoleDisplay }}</span>
          </div>
          <div v-if="showMenu" class="dropdown-menu">
            <router-link to="/profile" class="menu-item" @click="showMenu = false">
              个人信息
            </router-link>
            <router-link to="/change-password" class="menu-item" @click="showMenu = false">
              修改密码
            </router-link>
            <div class="menu-divider"></div>
            <a class="menu-item logout" @click="handleLogout">
              退出登录
            </a>
          </div>
        </div>

        <!-- 未登录显示登录按钮 -->
        <router-link v-else to="/login" class="login-btn">登录</router-link>
      </nav>
    </header>

    <main class="page">
      <router-view/>
    </main>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'App',
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },
  data() {
    return {
      showMenu: false
    }
  },
  methods: {
    toggleMenu() {
      this.showMenu = !this.showMenu
    },
    handleLogout() {
      this.showMenu = false
      this.authStore.logout()
      this.$router.push('/login')
    }
  },
  mounted() {
    // 点击外部关闭菜单
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.user-menu')) {
        this.showMenu = false
      }
    })
  }
}
</script>

<style>
:root {
  --primary: #42b983;
  --text: #2c3e50;
  --muted: #7b8a8b;
  --bg: #f5f7fb;
}

#app {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: var(--text);
  background: var(--bg);
  min-height: 100vh;
}

.topbar {
  height: 64px;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  box-shadow: 0 1px 6px rgba(0,0,0,0.06);
  position: sticky;
  top: 0;
  z-index: 10;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.logo {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #42b983, #2c8a62);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 15px;
}

.title {
  font-weight: 700;
  font-size: 16px;
}

.nav {
  display: flex;
  gap: 18px;
  align-items: center;
}

.nav a {
  color: var(--muted);
  text-decoration: none;
  font-weight: 600;
  padding: 8px 10px;
  border-radius: 8px;
  transition: all .2s;
}

.nav a.router-link-active {
  color: #fff;
  background: var(--primary);
}

.nav a:hover {
  color: var(--text);
}

.page {
  margin: 0;
  padding: 0;
}

.page > * {
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 24px;
  padding-right: 24px;
}

/* 首页特殊处理 - 允许全宽 */
.page > .home-container {
  max-width: 100%;
  padding: 0;
}

/* 用户菜单样式 */
.user-menu {
  position: relative;
  margin-left: 20px;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background 0.2s;
}

.user-info:hover {
  background: #f5f7fa;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.user-role {
  font-size: 12px;
  color: var(--muted);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 150px;
  overflow: hidden;
  z-index: 100;
}

.menu-item {
  display: block;
  padding: 12px 16px;
  color: var(--text);
  text-decoration: none;
  font-size: 14px;
  transition: background 0.2s;
  cursor: pointer;
}

.menu-item:hover {
  background: #f5f7fa;
}

.menu-item.logout {
  color: #f56c6c;
}

.menu-divider {
  height: 1px;
  background: #e4e7ed;
  margin: 4px 0;
}

.login-btn {
  margin-left: 20px;
  padding: 8px 20px !important;
  background: var(--primary) !important;
  color: white !important;
  border-radius: 20px !important;
}

.login-btn:hover {
  opacity: 0.9;
}
</style>
