# App Update Web

`App Update Web` 是一个基于 Nuxt 4 的 APK 发布与管理后台，用于配合后端服务完成应用账号登录、APK 上传、渠道管理、版本发布、下载页展示和操作日志查看。

它更接近一个内部使用的 App 分发后台，而不是面向公网用户的应用商店。

## 项目定位

这个项目主要服务于以下场景：

- 团队内部测试包分发
- Android APK 版本上传与归档
- 按渠道发布应用版本
- 提供带二维码的下载页
- 记录最近操作日志，便于追踪发布行为

## 功能清单

### 账号与权限

- 用户注册
- 用户登录
- 验证码获取
- 登录态校验
- Token 自动附加
- Token 失效后自动刷新
- 刷新失败自动跳转登录页

### App 管理

- 上传 APK 文件
- 自动读取 APK 基本信息
- 补充发布信息后完成发布
- App 列表分页查询
- App 详情查看
- App 删除
- App 下载页展示

### 渠道管理

- 渠道列表分页查询
- 渠道创建
- 渠道编辑
- 渠道删除

### 其他能力

- 首页展示最近操作日志
- 上传完成后可选择渠道并填写更新日志
- 下载页支持二维码下载

## 技术栈

- Nuxt 4
- Vue 3
- TypeScript
- `@nuxt/ui`
- Axios
- Tailwind CSS 4

## 运行方式

项目使用纯前端渲染模式运行，在 [nuxt.config.ts](/D:/CodeRepository/VueProject/app_update_web/nuxt.config.ts:1) 中配置了：

```ts
ssr: false
```

这意味着：

- 前端页面在浏览器侧渲染
- 登录信息保存在浏览器 `localStorage`
- 路由鉴权逻辑依赖前端中间件

## 环境要求

- Node.js 18 及以上
- npm 9 及以上
- 一个可用的后端 API 服务
- 后端需要支持 APK 上传、用户登录、渠道管理、App 管理等接口

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发环境

```bash
npm run dev
```

默认访问地址：

```text
http://localhost:3000
```

### 3. 构建生产版本

```bash
npm run build
```

### 4. 本地预览生产构建

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

脚本说明：

- `dev`：启动开发服务器
- `build`：构建生产版本
- `preview`：预览生产构建结果
- `generate`：生成静态文件
- `clean`：删除 `.nuxt` 和 `.nitro` 缓存目录
- `rebuild`：清理缓存并重新执行 `nuxt prepare`

## 开发配置

### API 代理

开发环境下，前端通过 `/api` 访问后端，并由 Nuxt 代理到本地服务：

```ts
devProxy: {
  "/api": {
    target: "http://localhost:5800/api",
    changeOrigin: true
  }
}
```

相关配置位于 [nuxt.config.ts](/D:/CodeRepository/VueProject/app_update_web/nuxt.config.ts:1)。

如果你的后端地址不是 `http://localhost:5800`，需要修改：

- `runtimeConfig.public.apiBase`
- `nitro.devProxy["/api"].target`

当前仓库里虽然定义了：

```ts
runtimeConfig: {
  public: {
    apiBase: "http://localhost:5800"
  }
}
```

但实际 Axios 请求目前使用的是相对路径 `/api`，因此开发阶段更关键的是代理配置，而不是 `apiBase`。

### 字体与样式

- 使用 `@nuxt/ui`
- 使用 Tailwind CSS 4
- 全局样式入口位于 [app/assets/css/main.css](/D:/CodeRepository/VueProject/app_update_web/app/assets/css/main.css:1)

## 登录态与鉴权机制

前端鉴权基于浏览器本地存储与 Axios 拦截器。

### 本地存储字段

- `access_token`
- `refresh_token`
- `user_info`

### 路由守卫

全局路由中间件位于 [app/middleware/auth.global.ts](/D:/CodeRepository/VueProject/app_update_web/app/middleware/auth.global.ts:1)，行为如下：

- 未登录时，访问非 `/login`、`/register` 页面会被重定向到 `/login`
- 已登录时，再访问 `/login` 或 `/register` 会被重定向到首页 `/`

### Axios 行为

Axios 插件位于 [app/plugins/axios.ts](/D:/CodeRepository/VueProject/app_update_web/app/plugins/axios.ts:1)，实现了：

- 自动为请求附加 `Authorization: Bearer <access_token>`
- 网络超时错误提示
- `401` 时清理登录态并跳转登录页
- `403` 时尝试使用 `refresh_token` 刷新 token
- 刷新失败时清理本地 token 并跳转登录页

## 业务流程

### 发布流程

1. 登录系统
2. 进入渠道管理页，先创建至少一个渠道
3. 进入上传页，选择或拖拽 `.apk` 文件
4. 上传成功后，系统会返回 APK 解析信息
5. 在发布完成页选择渠道并填写更新日志
6. 提交发布信息
7. 发布完成后跳转到 App 列表页

### 下载流程

1. 在 App 列表中进入下载页
2. 页面展示应用信息、更新日志、二维码和下载链接
3. 用户可以扫码或直接点击按钮下载 APK

## 页面说明

### 页面路由

- `/login`：登录页
- `/register`：注册页
- `/`：首页，显示最近操作日志
- `/app_list`：App 列表页
- `/app_upload`：APK 上传页
- `/app_update_complete`：补充发布信息页
- `/app_channels`：渠道管理页
- `/app_download`：App 下载页
- `/profile`：个人信息页
- `/settings`：设置页

### 关键页面说明

#### 首页

- 展示最近操作日志
- 展示总日志数、最近一次操作和最近时间

对应文件：

- [app/pages/index.vue](/D:/CodeRepository/VueProject/app_update_web/app/pages/index.vue:1)

#### 上传页

- 仅支持 `.apk` 文件
- 支持点击选择与拖拽上传
- 如果没有渠道，会提示先创建渠道
- 上传过程中显示进度

对应文件：

- [app/pages/app_upload.vue](/D:/CodeRepository/VueProject/app_update_web/app/pages/app_upload.vue:1)

#### 发布完成页

- 展示 APK 解析出的应用名称、包名、版本号、文件大小等
- 需要选择渠道
- 必须填写更新日志
- 提交后才会真正完成发布

对应文件：

- [app/pages/app_update_complete.vue](/D:/CodeRepository/VueProject/app_update_web/app/pages/app_update_complete.vue:1)

#### App 列表页

- 支持分页
- 支持搜索
- 支持查看详情、下载和删除

对应文件：

- [app/pages/app_list.vue](/D:/CodeRepository/VueProject/app_update_web/app/pages/app_list.vue:1)

#### 渠道管理页

- 支持分页与搜索
- 支持新增、编辑、删除渠道

对应文件：

- [app/pages/app_channels.vue](/D:/CodeRepository/VueProject/app_update_web/app/pages/app_channels.vue:1)

#### 下载页

- 展示应用信息与更新日志
- 自动生成二维码
- 支持直接下载 APK

对应文件：

- [app/pages/app_download.vue](/D:/CodeRepository/VueProject/app_update_web/app/pages/app_download.vue:1)

## 接口模块说明

项目将接口按业务拆分在 `app/api` 目录中。

### 用户接口

文件：[app/api/user_api.ts](/D:/CodeRepository/VueProject/app_update_web/app/api/user_api.ts:1)

主要包含：

- `POST /public/users/register`
- `POST /public/users/login`
- `POST /public/users/get_auth_captcha`
- `POST /users/get_users_info`

### App 管理接口

文件：[app/api/app_manage_api.ts](/D:/CodeRepository/VueProject/app_update_web/app/api/app_manage_api.ts:1)

主要包含：

- `POST /app_manage/upload_app_file`
- `POST /app_manage/upload_app_file_complete`
- `POST /app_manage/get_app_list_by_page`
- `POST /public/app_manage/get_app_info`
- `POST /app_manage/delete_app`

### 渠道接口

文件：[app/api/app_channel_api.ts](/D:/CodeRepository/VueProject/app_update_web/app/api/app_channel_api.ts:1)

主要包含：

- `POST /app_channel/create_app_channel`
- `POST /app_channel/get_app_channel_list_by_page`
- `POST /app_channel/update_app_channel`
- `POST /app_channel/delete_app_channel`

### 操作日志接口

文件：[app/api/operation_log.ts](/D:/CodeRepository/VueProject/app_update_web/app/api/operation_log.ts:1)

主要包含：

- `POST /operation_log/get_recent_operation_logs`

## 数据结构约定

后端统一响应结构定义在 [app/types/base_response.ts](/D:/CodeRepository/VueProject/app_update_web/app/types/base_response.ts:1)：

```ts
export type BaseResp<T> = {
  data: T
  code: number
  msg: string
}
```

也就是前端默认按下面的结构处理接口：

- `code`：业务状态码
- `msg`：提示消息
- `data`：业务数据

## 上传与发布数据说明

### APK 上传成功后，前端会暂存以下信息

- `file_path`
- `file_name`
- `app_name`
- `package_name`
- `app_icon_path`
- `version_name`
- `version_code`
- `file_size`
- `upload_file_info`

类型定义见：

- [app/types/app_manage.ts](/D:/CodeRepository/VueProject/app_update_web/app/types/app_manage.ts:1)

### 完成发布时，还需要补充以下信息

- `channel_id`
- `channel_name`
- `update_log`

这意味着“上传 APK”与“完成发布”是两个连续步骤，而不是一次请求完成。

## 项目结构

```text
app/
  api/           接口请求封装
  assets/        全局样式与静态样式资源
  composables/   可复用状态与逻辑
  layouts/       页面布局
  middleware/    全局路由中间件
  pages/         页面路由组件
  plugins/       Nuxt 插件
  types/         TypeScript 类型定义
  utils/         业务工具函数
public/          静态资源
.nuxt/           Nuxt 开发产物
.output/         构建产物
nuxt.config.ts   Nuxt 配置
package.json     依赖与脚本
README.md        项目说明
```

## 目录中的关键文件

- [nuxt.config.ts](/D:/CodeRepository/VueProject/app_update_web/nuxt.config.ts:1)：Nuxt 配置、代理与运行模式
- [package.json](/D:/CodeRepository/VueProject/app_update_web/package.json:1)：依赖和脚本
- [app/plugins/axios.ts](/D:/CodeRepository/VueProject/app_update_web/app/plugins/axios.ts:1)：请求封装与 token 刷新
- [app/middleware/auth.global.ts](/D:/CodeRepository/VueProject/app_update_web/app/middleware/auth.global.ts:1)：登录态守卫
- [app/composables/app_shared_state.ts](/D:/CodeRepository/VueProject/app_update_web/app/composables/app_shared_state.ts:1)：上传流程共享状态
- [app/utils/app_file_info_utils.ts](/D:/CodeRepository/VueProject/app_update_web/app/utils/app_file_info_utils.ts:1)：文件与图标相关工具
- [app/utils/http_error.ts](/D:/CodeRepository/VueProject/app_update_web/app/utils/http_error.ts:1)：HTTP 错误处理

## 开发建议

### 本地联调建议

- 先确认后端服务可访问
- 再确认后端允许文件上传
- 确认 `/api` 代理是否已指向正确后端
- 登录、刷新 token、上传 APK 这三条链路优先联调

### 修改后端地址时建议检查

- `nuxt.config.ts` 中的代理地址
- 后端静态文件访问路径是否正确
- 下载页中的 APK 地址是否为可公网访问地址
- App 图标地址是否能被前端页面直接访问

### 上传文件相关注意事项

- 当前前端只接受 `.apk` 文件
- 上传接口超时时间设置为 `10 分钟`
- 大文件上传时更依赖后端与反向代理配置是否允许大体积请求

## 部署说明

这个项目是 Nuxt 前端项目，常见部署方式有两种。

### 方式一：作为 Node 服务运行

```bash
npm install
npm run build
npm run preview
```

正式环境通常会使用：

- PM2
- Docker
- systemd
- Nginx 反向代理

### 方式二：构建后交给静态托管

如果后端、下载资源、接口跨域策略都已处理，也可以尝试：

```bash
npm run generate
```

但要注意：

- 当前项目依赖登录态和运行时接口
- 下载页和资源 URL 需要可访问
- 如果静态部署环境与接口域名不同，要处理跨域和资源地址问题

### Nginx 反向代理建议

如果前端和后端分开部署，通常需要：

- 将前端静态资源或 Nuxt 服务暴露给用户
- 将 `/api` 反向代理到后端
- 为 APK 文件与图标资源提供可访问路径

## 常见问题

### 1. 页面一直跳回登录页

检查以下内容：

- 是否成功写入了 `access_token`
- `refresh_token` 是否存在
- 后端是否错误返回了 `401` 或 `403`
- 本地时间是否异常导致 token 校验失效

### 2. 上传成功后无法完成发布

通常需要检查：

- 是否已经创建渠道
- 是否选择了渠道
- 是否填写了更新日志
- 后端 `upload_app_file_complete` 接口是否正常

### 3. 图片或 APK 下载地址打不开

通常是以下原因：

- 后端返回的是本地文件路径而不是可访问 URL
- 静态资源服务没有正确暴露目录
- 反向代理没有转发资源路径

### 4. 本地开发请求不到后端

重点检查：

- 后端是否运行在 `http://localhost:5800`
- Nuxt 代理配置是否正确
- 是否存在跨域或网关拦截

## 当前已知特点

- 项目是中文后台管理界面
- 前端使用 `localStorage` 保存登录态
- 上传与完成发布拆成两步
- 下载页更偏展示和分发场景
- 当前仓库没有看到前端测试配置

