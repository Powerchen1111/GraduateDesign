# 角色页面开发计划

## 📋 页面权限矩阵

| 页面 | 路径 | 求职者 | 招聘者 | 管理员 | 状态 |
|------|------|--------|--------|--------|------|
| 首页 | `/` | ✅ | ✅ | ✅ | ✅ 已存在 |
| 登录 | `/login` | ✅ | ✅ | ✅ | ✅ 已完成 |
| 注册 | `/register` | ✅ | ✅ | ✅ | ✅ 已完成 |
| 个人资料 | `/profile` | ✅ | ✅ | ✅ | ✅ 已存在 |
| 修改密码 | `/change-password` | ✅ | ✅ | ✅ | ✅ 已存在 |
| **简历管理** |
| 简历列表 | `/resumes` | ✅ | ✅ | ✅ | ✅ 已存在 |
| 简历上传 | `/resumes/upload` | ✅ | ❌ | ✅ | ✅ 已存在 |
| 简历详情 | `/resumes/:id` | ✅ | ✅ | ✅ | ✅ 已存在 |
| **职位管理** |
| 职位列表 | `/jobs` | ✅ | ✅ | ✅ | ✅ 已存在 |
| 职位详情 | `/jobs/:id` | ✅ | ✅ | ✅ | ✅ 已存在（需添加投递按钮） |
| 职位发布 | `/job-publish` | ❌ | ✅ | ✅ | ⏳ 待创建 |
| 我的职位 | `/my-jobs` | ❌ | ✅ | ✅ | ⏳ 待创建 |
| **投递管理** |
| 我的投递 | `/my-applications` | ✅ | ❌ | ✅ | ⏳ 待创建 |
| 收到的简历 | `/received-applications` | ❌ | ✅ | ✅ | ⏳ 待创建 |
| **智能推荐** |
| 职位推荐 | `/recommendations` | ✅ | ❌ | ✅ | ✅ 已存在 |
| 候选人推荐 | `/candidate-recommendations` | ❌ | ✅ | ✅ | ⏳ 待创建 |

---

## 🎯 开发优先级

### 第一阶段：核心功能（高优先级）

#### 1. 职位详情页 - 添加投递按钮
**文件**: `src/views/JobDetailView.vue`
**功能**:
- 求职者可见"投递简历"按钮
- 点击弹出简历选择对话框
- 选择简历后调用投递API
- 显示投递成功/失败提示

#### 2. 招聘者职位发布页面
**文件**: `src/views/recruiter/JobPublishView.vue`
**功能**:
- 职位发布表单（标题、公司、地点、薪资、描述等）
- 表单验证
- 调用发布API
- 发布成功后跳转到"我的职位"

#### 3. 招聘者职位管理页面
**文件**: `src/views/recruiter/MyJobsView.vue`
**功能**:
- 显示已发布的职位列表
- 职位状态管理（招聘中/已暂停/已关闭）
- 编辑/删除职位
- 查看每个职位的投递数量

#### 4. 求职者投递记录页面
**文件**: `src/views/seeker/MyApplicationsView.vue`
**功能**:
- 显示所有投递记录
- 按状态筛选（待处理/已查看/面试/拒绝/录用）
- 显示职位信息和投递时间
- 撤回投递（仅待处理状态）

#### 5. 招聘者简历管理页面
**文件**: `src/views/recruiter/ReceivedApplicationsView.vue`
**功能**:
- 显示收到的所有简历投递
- 按职位筛选
- 按状态筛选
- 查看简历详情
- 更新投递状态（查看/面试/拒绝/录用）
- 添加备注

---

### 第二阶段：增强功能（中优先级）

#### 6. 候选人推荐页面
**文件**: `src/views/recruiter/CandidateRecommendationsView.vue`
**功能**:
- 选择职位
- 显示推荐的候选人列表
- 显示匹配度和匹配原因
- 查看候选人简历
- 邀请候选人投递

---

## 📝 路由配置更新

需要在 `src/router/index.js` 中添加以下路由：

```javascript
// 招聘者专属路由
{
  path: '/job-publish',
  name: 'JobPublish',
  component: () => import('@/views/recruiter/JobPublishView.vue'),
  meta: { requiresAuth: true, requiresRole: 'RECRUITER' }
},
{
  path: '/my-jobs',
  name: 'MyJobs',
  component: () => import('@/views/recruiter/MyJobsView.vue'),
  meta: { requiresAuth: true, requiresRole: 'RECRUITER' }
},
{
  path: '/received-applications',
  name: 'ReceivedApplications',
  component: () => import('@/views/recruiter/ReceivedApplicationsView.vue'),
  meta: { requiresAuth: true, requiresRole: 'RECRUITER' }
},
{
  path: '/candidate-recommendations',
  name: 'CandidateRecommendations',
  component: () => import('@/views/recruiter/CandidateRecommendationsView.vue'),
  meta: { requiresAuth: true, requiresRole: 'RECRUITER' }
},

// 求职者专属路由
{
  path: '/my-applications',
  name: 'MyApplications',
  component: () => import('@/views/seeker/MyApplicationsView.vue'),
  meta: { requiresAuth: true, requiresRole: 'JOB_SEEKER' }
}
```

---

## 🎨 导航菜单更新

需要根据用户角色动态显示菜单项：

### 求职者菜单
- 首页
- 职位推荐
- 职位列表
- 我的简历
- 我的投递
- 个人资料

### 招聘者菜单
- 首页
- 发布职位
- 我的职位
- 收到的简历
- 候选人推荐
- 简历搜索
- 个人资料

### 管理员菜单
- 所有功能

---

## 🔧 实施步骤

### Step 1: 更新路由守卫
修改 `router/index.js`，添加角色检查：
```javascript
if (to.meta.requiresRole) {
  const authStore = useAuthStore()
  if (authStore.userRole !== to.meta.requiresRole && authStore.userRole !== 'ADMIN') {
    next({ name: 'home' })
    return
  }
}
```

### Step 2: 创建页面目录结构
```
src/views/
├── recruiter/
│   ├── JobPublishView.vue
│   ├── MyJobsView.vue
│   ├── ReceivedApplicationsView.vue
│   └── CandidateRecommendationsView.vue
└── seeker/
    └── MyApplicationsView.vue
```

### Step 3: 依次开发各页面
按照优先级顺序开发，每个页面完成后进行测试。

### Step 4: 更新导航组件
根据用户角色动态显示菜单项。

---

## ✅ 完成标准

每个页面需要满足：
1. ✅ UI美观，响应式设计
2. ✅ 表单验证完善
3. ✅ 错误处理友好
4. ✅ 加载状态提示
5. ✅ 成功/失败消息提示
6. ✅ 权限控制正确
7. ✅ API调用正确

---

**版本**: v1.0
**更新时间**: 2026-02-11
**状态**: 规划完成，准备开发
