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
    <router-link to="/resume-parse">简历解析</router-link>
        <router-link to="/chat-resume">智能简历分析</router-link>
        <router-link to="/job-collection">职位采集</router-link>
        <router-link to="/job-import">职位导入</router-link>
  </nav>
    </header>

    <main class="page">
  <router-view/>
    </main>
  </div>
</template>

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
  max-width: 1280px;
  margin: 24px auto 40px;
  padding: 0 24px;
}
</style>
