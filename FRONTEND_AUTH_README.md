# 前端认证模块 - 使用说明

## ✅ 实现完成

前端用户认证与管理模块已全部实现完成！

## 已实现功能

### 核心功能
- ✅ 用户登录
- ✅ 用户注册（支持求职者和招聘方角色）
- ✅ 用户信息查看和编辑
- ✅ 修改密码
- ✅ 用户登出
- ✅ Token 自动管理
- ✅ 路由守卫（自动跳转登录）
- ✅ 导航栏用户信息显示

### 技术实现
- ✅ Pinia 状态管理
- ✅ Axios 请求拦截器
- ✅ Vue Router 路由守卫
- ✅ LocalStorage 持久化
- ✅ 表单验证
- ✅ 错误处理

## 项目结构

```
src/
├── api/
│   ├── axios.js          # Axios 配置和拦截器
│   └── auth.js           # 认证相关 API
├── stores/
│   └── auth.js           # Pinia 认证状态管理
├── utils/
│   ├── storage.js        # LocalStorage 封装
│   └── validators.js     # 表单验证工具
├── views/
│   ├── auth/
│   │   ├── LoginView.vue      # 登录页面
│   │   └── RegisterView.vue   # 注册页面
│   └── user/
│       ├── ProfileView.vue         # 个人信息页面
│       └── ChangePasswordView.vue  # 修改密码页面
├── router/
│   └── index.js          # 路由配置（含路由守卫）
├── App.vue               # 主应用（含用户菜单）
└── main.js               # 入口文件（已配置 Pinia）
```

## 启动项目

### 1. 安装依赖（如果还没安装）

```bash
cd C:\Users\王晨宇.MSI\Desktop\GraduateVue\project
npm install
```

### 2. 启动开发服务器

```bash
npm run serve
```

项目将在 `http://localhost:8081` 启动

### 3. 确保后端服务运行

后端服务需要在 `http://localhost:8080` 运行

```bash
cd C:\Users\王晨宇.MSI\IdeaProjects\GraduateDesign
mvn spring-boot:run
```

## 使用流程

### 1. 用户注册

1. 访问 `http://localhost:8081/#/register`
2. 填写注册信息：
   - 手机号（必填，11位）
   - 密码（必填，至少6位）
   - 确认密码（必填）
   - 用户名（可选）
   - 邮箱（可选）
   - 用户角色（必选：求职者或招聘方）
3. 点击"注册"按钮
4. 注册成功后自动跳转到登录页

### 2. 用户登录

1. 访问 `http://localhost:8081/#/login`
2. 输入手机号和密码
3. 点击"登录"按钮
4. 登录成功后跳转到首页
5. 导航栏右侧显示用户信息

### 3. 查看个人信息

1. 点击导航栏右侧的用户名
2. 在下拉菜单中选择"个人信息"
3. 可以查看和编辑：
   - 用户名
   - 邮箱
   - 查看角色和状态

### 4. 修改密码

1. 点击导航栏右侧的用户名
2. 在下拉菜单中选择"修改密码"
3. 输入旧密码和新密码
4. 点击"确认修改"

### 5. 退出登录

1. 点击导航栏右侧的用户名
2. 在下拉菜单中选择"退出登录"
3. 自动清除登录状态并跳转到登录页

## 路由说明

### 公开路由（无需登录）
- `/` - 首页
- `/login` - 登录页
- `/register` - 注册页
- `/chat` - AI 对话
- `/resume-parse` - 简历解析
- `/chat-resume` - 智能简历分析
- `/job-collection` - 职位采集
- `/job-import` - 职位导入

### 需要登录的路由
- `/profile` - 个人信息
- `/change-password` - 修改密码

## 状态管理

### Auth Store (stores/auth.js)

**State:**
- `token` - JWT token
- `user` - 用户信息对象
- `isAuthenticated` - 是否已认证
- `loading` - 加载状态

**Getters:**
- `isAdmin` - 是否是管理员
- `isRecruiter` - 是否是招聘方
- `isJobSeeker` - 是否是求职者
- `userRole` - 用户角色
- `userRoleDisplay` - 角色显示名称

**Actions:**
- `login(phone, password)` - 登录
- `register(userData)` - 注册
- `fetchUserProfile()` - 获取用户信息
- `logout()` - 登出
- `initAuth()` - 初始化认证状态
- `updateUser(userData)` - 更新用户信息

## API 调用示例

### 在组件中使用

```vue
<script>
import { useAuthStore } from '@/stores/auth'

export default {
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },
  methods: {
    async handleLogin() {
      const result = await this.authStore.login(phone, password)
      if (result.success) {
        // 登录成功
        this.$router.push('/')
      } else {
        // 显示错误
        alert(result.error)
      }
    }
  }
}
</script>
```

### 直接调用 API

```javascript
import { login, register, getUserProfile } from '@/api/auth'

// 登录
const response = await login({ phone, password })

// 注册
const response = await register({
  phone,
  password,
  username,
  role,
  email
})

// 获取用户信息
const response = await getUserProfile()
```

## 路由守卫

路由守卫会自动处理以下情况：

1. **未登录访问需要认证的页面** → 跳转到登录页
2. **已登录访问登录/注册页** → 跳转到首页
3. **Token 过期** → 自动清除并跳转登录页
4. **无权限访问** → 跳转到首页

## 表单验证

### 手机号验证
- 必填
- 格式：1开头的11位数字

### 密码验证
- 必填
- 长度：6-20位

### 邮箱验证
- 可选
- 格式：标准邮箱格式

## 错误处理

### HTTP 状态码处理

- **401 Unauthorized** - 自动清除 token 并跳转登录
- **403 Forbidden** - 显示无权限提示
- **409 Conflict** - 显示资源冲突错误（如手机号已存在）
- **500 Server Error** - 显示服务器错误提示

### 错误显示

所有错误都会在页面上以红色横幅显示，用户友好。

## 样式说明

### 主题色
- 主色调：渐变紫色 (#667eea → #764ba2)
- 成功色：绿色 (#67c23a)
- 错误色：红色 (#f56c6c)
- 警告色：橙色 (#e6a23c)

### 响应式设计
- 所有页面都支持响应式布局
- 移动端友好

## 测试账号

### 默认管理员账号
- 手机号：13800000000
- 密码：admin123

### 测试招聘方账号
- 手机号：13900000001
- 密码：recruiter123

### 测试求职者账号
- 手机号：13900000002
- 密码：jobseeker123

## 常见问题

### Q: 登录后刷新页面会退出登录吗？
A: 不会。Token 保存在 localStorage 中，刷新页面会自动恢复登录状态。

### Q: Token 什么时候过期？
A: Token 有效期为 24 小时，过期后需要重新登录。

### Q: 如何修改后端 API 地址？
A: 修改 `src/api/axios.js` 中的 `baseURL` 配置。

### Q: 如何添加新的用户角色？
A: 需要同时修改后端的 `UserRole` 枚举和前端的注册页面选项。

### Q: 如何自定义路由守卫规则？
A: 修改 `src/router/index.js` 中的 `router.beforeEach` 函数。

## 下一步扩展

可以考虑添加以下功能：

- [ ] 记住登录（Refresh Token）
- [ ] 第三方登录（微信、QQ）
- [ ] 邮箱验证
- [ ] 找回密码
- [ ] 用户头像上传
- [ ] 登录历史记录
- [ ] 多设备管理

## 技术栈

- Vue 3.2.13
- Pinia 2.x
- Vue Router 4.0.3
- Axios 1.13.2
- Vue DevUI 1.6.35

## 开发建议

1. **状态管理**：所有认证相关的状态都通过 Pinia store 管理
2. **API 调用**：统一使用 `src/api/` 下的函数，不要直接使用 axios
3. **路由跳转**：使用 `this.$router.push()` 而不是 `window.location`
4. **错误处理**：所有 API 调用都应该有 try-catch 处理
5. **表单验证**：使用 `src/utils/validators.js` 中的验证函数

## 联系方式

如有问题，请查看项目文档或联系开发团队。
