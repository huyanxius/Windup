# Windup · Asset Studio（MS1 演示前端）

把一个角色的「来源 → 母版 → 动作 → 逐帧审核 → 导出 → 进引擎」串成一条**用户全程掌控**的可追溯工作流，用一张策展式节点画布表达。MS1 路演用。

> 纯前端演示：数据为 mock，不接后端、不含任何密钥；生成为占位/模拟，重点验证**交互与流程**，不代表真实生成质量。

## 差异化

别的工具帮你出一张好看的角色图——到出图为止。Windup 接着往下走：**逐帧审过、能循环播放、可直接进 Cocos / 微信·抖音小游戏的动作资产。**（横扫 13 款同类，没有一款做逐帧 accept/reject，没有一款原生进 Cocos 小游戏。）

## 用户工作流（对齐 ms1-workflow）

1. **起点**：文字描述（从零）/ 上传参考图 / 已有资产。
2. **母版**：配置 → 生成 → 多候选 → 母版门禁（视角/朝向达标）→ 选一张 → **锁定身份基准**。
3. **动作**：视角 / 生成模式（整条 8 帧 / 仅修复单帧）/ 帧数 / FPS / 循环 / 提示词 / 模型 + 预估消耗。
4. **逐帧审核** ⭐：播放 / 洋葱皮 / 逐帧通过·退回 → **退回单帧 → 携相邻帧上下文重生成** → 全过才解锁导出。
5. **导出资源包**：目标引擎（Cocos / 微信 / 抖音小游戏）+ 图集 + JSON + 导入说明，交付即用。
6. **进引擎**：WASD 手感验收 → 一键进 Cocos 项目。

## 技术栈

Vite + React + TypeScript + React Flow（`@xyflow/react`）+ Zustand + Motion；自托管 Geist / Geist Mono。

## 运行

```bash
cd apps/asset-studio
npm install
npm run dev      # http://localhost:5173
npm run build
```

演示深链：`/?auto=run`（一键全流程）、`/?auto=review`、`/?auto=export`、`/?auto=play`、`/?select=n_master`。

## 结构

- `src/contracts/` — 产品契约（锁 8FPS / 侧视 / idle+walk）、点灯人 mock、生成设置默认
- `src/store/flowStore.ts` — 画布图 + 生成/候选/审核/门禁/导出 状态与动作
- `src/features/creation-flow/` — 节点画布 hero（三入口、候选+锁定、门禁）
- `src/features/inspector/` — 选中驱动右栏（入口 / 生成设置 / 候选 / 质检 / 导出面板）
- `src/features/frame-review/` — 逐帧检查台（洋葱皮 + 单帧重生成 + 门禁）
- `src/features/export/` — 导出资源包（多引擎）
- `src/features/play/` — WASD 手感预览 → 进引擎

## 说明

- 演示角色（点灯人）为占位素材，可整批替换。
- MS1 范围：单角色 · 单造型 · 单方向 · idle + walk。
- 目录规划对齐上游 `apps/asset-studio/`。
