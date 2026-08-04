# Windup 前端

React + Vite + TypeScript。

## 开发

```bash
npm ci
npm run dev
```

## 检查

```bash
npm run format:check   # 格式
npm run lint           # 静态检查
npm run typecheck      # 类型
npm run test           # 测试
npm run build          # 构建
```

CI 按上面顺序全跑一遍。

## 结构

模块划分、依赖规则与命名约定见仓库根目录 `frontend-architecture-v3.md`。

`shared/api` 提供公共 HTTP 请求能力，`ProjectApis` 与 `CharacterApis` 负责业务 DTO 映射。项目中心、项目工作区、资产库与角色详情已接入 PR #75 的真实接口；测试数据只存在于测试环境的 HTTP 替身中。

页面自己决定宽度与留白，`AppShell` 只提供顶栏，不再统一夹一个居中容器。

运行项目前需要配置 `VITE_API_BASE_URL`。Bearer token 由登录模块取得后，通过 `registerApiAccessTokenProvider` 注册读取函数；Project、Character 请求统一从该边界读取。本轮不定义 token 的保存方式。

后端契约、合并顺序与未提供能力见 `API_CONTRACT.md`。
