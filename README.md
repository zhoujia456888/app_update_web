# App Update Web

`App Update Web` 是一个基于 Nuxt 4 的 APK 发布与管理后台，面向团队内部的应用分发场景，提供登录鉴权、APK 上传、渠道管理、版本发布、下载页展示和操作日志查看能力。

它更适合企业内部或测试环境使用，不是通用型应用商店。

## 功能概览

- 用户注册、登录、登录态校验
- Axios 自动携带 Token
- Token 失效后的刷新与跳转处理
- APK 上传与基础信息解析
- App 列表、详情、删除、下载页展示
- 渠道的新增、编辑、删除、分页查询
- 首页最近操作日志展示
- 下载页二维码与直接下载入口

## 技术栈

- Nuxt 4
- Vue 3
- TypeScript
- `@nuxt/ui`
- Axios
- Tailwind CSS 4

## 运行模式

项目当前以纯前端渲染模式运行，在 [nuxt.config.ts](/D:/CodeRepository/VueProject/app_update_web/nuxt.config.ts:1) 中配置了 `ssr: false`。

这意味着：

- 页面在浏览器侧渲染
- 登录信息保存在浏览器本地存储
- 鉴权主要依赖前端路由中间件和 Axios 拦截器

## 环境要求

- Node.js 18+
- npm 9+
- 可用的后端服务，需提供用户、渠道、App、上传、下载等接口

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发环境

```bash
npm run dev
```

默认访问地址：

```text
http://localhost:3000
```

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 可用脚本

```bash
npm run dev
npm run build
npm run preview
npm run generate
npm run clean
npm run rebuild
```

- `dev`：启动开发服务器
- `build`：构建生产版本
- `preview`：预览构建产物
- `generate`：生成静态站点
- `clean`：清理 `.nuxt` 与 `.nitro` 缓存目录
- `rebuild`：清理缓存后重新执行 `nuxt prepare`

## 开发配置

### 后端地址与代理

当前配置位于 [nuxt.config.ts](/D:/CodeRepository/VueProject/app_update_web/nuxt.config.ts:1)。

运行时公开配置：

```ts
runtimeConfig: {
  public: {
    apiBase: 'http://localhost:5800'
  }
}
```

开发代理配置：

```ts
nitro: {
  devProxy: {
    '/api': {
      target: 'http://localhost:5800/api',
      changeOrigin: true
    }
  }
}
```

如果后端地址变更，通常需要同步修改：

- `runtimeConfig.public.apiBase`
- `nitro.devProxy['/api'].target`

### 全局样式

- 全局样式入口：[app/assets/css/main.css](/D:/CodeRepository/VueProject/app_update_web/app/assets/css/main.css:1)
- UI 组件库：`@nuxt/ui`

## 登录态与鉴权

### 本地存储字段

- `access_token`
- `refresh_token`
- `user_info`

### 路由守卫

全局路由中间件位于 [app/middleware/auth.global.ts](/D:/CodeRepository/VueProject/app_update_web/app/middleware/auth.global.ts:1)。

- 未登录时，访问非 `/login`、`/register` 页面会跳转到 `/login`
- 已登录时，再访问 `/login`、`/register` 会跳转到首页

### Axios 拦截器

Axios 插件位于 [app/plugins/axios.ts](/D:/CodeRepository/VueProject/app_update_web/app/plugins/axios.ts:1)。

- 自动附加 `Authorization: Bearer <access_token>`
- 网络异常时统一提示
- `401` 且属于 `access_token` 缺失、失效、过期、撤销等情况时，会尝试使用 `refresh_token` 刷新 Token 并重试原请求
- `401` 且属于 `refresh_token` 无效、刷新请求本身失败或无法再次重试时，会清理登录态并跳转登录页
- `403` 时不会刷新 Token，而是提示当前账号没有权限执行该操作

## 页面路由

- `/login`：登录页
- `/register`：注册页
- `/`：首页，展示最近操作日志
- `/app_list`：App 列表页
- `/app_upload`：APK 上传页
- `/app_update_complete`：补充发布信息页
- `/app_channels`：渠道管理页
- `/app_download`：App 下载页
- `/profile`：个人信息页
- `/settings`：设置页

对应页面文件位于 [app/pages](/D:/CodeRepository/VueProject/app_update_web/app/pages:1)。

## 典型业务流程

### 发布流程

1. 登录系统
2. 创建至少一个渠道
3. 进入上传页选择 APK 文件
4. 上传后获取 APK 基础信息
5. 选择渠道并填写更新日志
6. 提交发布
7. 返回 App 列表或进入下载页

### 下载流程

1. 进入 App 下载页
2. 查看应用信息、更新日志和二维码
3. 扫码或点击按钮下载 APK

## 目录结构

```text
app/
├─ assets/css/           # 全局样式
├─ middleware/           # 路由中间件
├─ pages/                # 页面路由
└─ plugins/              # 插件，如 Axios
public/                  # 静态资源
nuxt.config.ts           # Nuxt 配置
package.json             # 脚本与依赖
```

## 说明

- 当前仓库是前端项目，业务能力依赖后端接口实现
- 开发阶段主要通过 `/api` 代理转发到本地后端
- 如果你准备部署到生产环境，建议额外补充环境变量与部署说明
