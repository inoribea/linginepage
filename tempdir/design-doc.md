# Lingine Investor Demo 设计（仿 im.qq.com 动效版）

> 更新时间：2025-12-04 · 面向投资人即时呈现引擎实力

## 0. 目标与约束
- 目标：30 秒内让投资人看到“自然语言 → 智能路由 → 引擎脚本 → 资产闭环 → 商业指标”全链路，并以 im.qq.com 式动效传递引擎的实时感与高级感。
- 约束：不新增重量级依赖，继续沿用现有 `surface/panel/layer-card` 体系与 `window.lingineComponentHost` 挂载机制；KISS/YAGNI，优先 CSS + 原生 JS/Canvas。
- 关键输出：Hero 入场动画、滚动驱动的分屏转场、交互微动效、双语/主题联动、可实际跑通的演示流程。

## 1. 信息架构与叙事路径
- 顶部导航：保持五段 `hero / creative / intelligence / pipeline / business`，点击或滚动驱动 `screen` 显隐，导航状态与滚动百分比联动。
- Hero（概览）：左侧价值主张 + CTA，右侧三层卡片（Routing Mesh / Visual Consciousness / Metrics），底部 `workflow-ribbon` 显示 4 阶段。
- Creative：自然语言输入、Prompt 预览、角色卡 JSON，强调“输入即可”。
- Intelligence（链路）：路由时间轴 + Fallback + 资产墙，突出“智能决策”。
- Pipeline（代码）：双栏代码生成（主脚本 + manifest），体现“能落地”。
- Business（数据）：KPI 卡片 + 对比条，讲清“成本/速度/复用率”。

## 2. 视觉语言（对齐 im.qq.com 氛围）
- 背景：暗底径向渐变 + 体积光雾，叠加粒子/星轨（延续 `stellar-map`），色相以电蓝/粉紫为主，亮暗主题切换仅调整亮度与雾度。
- 材质：三层深度（surface→panel→layer-card），顶部高光、底部渐隐阴影，边缘柔和描边；增加“液态光带”作为横向动势。
- 字体与排版：SF Pro / Inter，Hero 大字距 + 次级描述 70% 透明度，按钮高饱和渐变，遵循 8/12 pt 栅格。
- 图形元素：可选 SVG mask 形成弧形截面，保持 QQ 首页的圆润与流线感。

## 3. 动效方案（仿 im.qq.com）
- 入场（首次可视区）：背景雾气淡入→粒子流启动→Hero 卡片 Z 轴弹入→文案分行淡入→CTA 浮起；控制在 1.2s 内完成。
- 滚动驱动：以 `requestAnimationFrame` + 滚动百分比生成 `progress`，驱动以下动画：
  - 导航步进：`nav-steps` 指示条跟随 `progress` 填充。
  - 分屏转场：相邻 `screen` 使用 Y 位移 + 透明度交叉淡入，避免硬切。
  - 液态光带：通过 CSS `background-position` 或 Canvas 曲线横向流动，滚动时略微提速。
- 微交互：
  - Hero 卡片三轴轻微倾斜（pointer move），随主题更新高光色。
  - Ribbon Hover：光晕跟随 hover 并带尾迹。
  - 按钮/Chip：轻弹缩放 + 渐变流动。
- 性能约束：所有动画使用 transform/opacity，避免 layout thrash；粒子数自适应视口，降级到静态渐变。

## 4. 技术实现拆解
- 样式（`src/styles/main.css`）
  - 新增动效 Token：光带渐变、雾度透明度、层级深度。
  - 定义 `.screen` 转场动画（translateY + opacity），`.nav-steps::after` 进度条，`.ribbon-item` 尾迹。
  - Hero 卡片倾斜/悬停状态样式，按钮动态渐变。
- 组件与动效（`src/scripts/components.js`）
  - 扩展 `componentFactories`：`visual-stack` 增加“液态光带”Canvas/SVG；新增 `ribbon-glow` 用于 Ribbon 尾迹；在 `setTheme` 时更新光带色。
  - 粒子场：根据主题调整色值，视口 resize 自适应。
- 页面逻辑（`src/scripts/app.js`）
  - 引入 `animationDriver`：监听 scroll + requestAnimationFrame，产出 0-1 进度，分发到各段动画（导航填充、screen alpha/translate）。
  - Hero 入场：在 `startApp` 首屏触发一次性时间线（可用 `setTimeout`/CSS `animation`），滚动超过阈值后保持静态。
  - Pointer 交互：监听 Hero 区域 pointer move，更新倾斜 transform；离开时缓动归零。
  - 保持现有数据流（输入→prompt→脚本→资产→商业），仅新增动画状态，不改业务逻辑。
- 数据（`src/data/narrative.js`）
  - 文案微调为更高可信度的投资人话术（强调延迟/成本/复用率）；双语保持。

## 5. 交互与可访问性
- 导航：点击/滚动同步高亮，焦点态可用键盘切换；`aria-selected` 与 `role="tab"` 继续使用。
- 主题/语言切换：动画 Token 实时更新，不出现闪烁；文本节点使用现有 `copy-cn/copy-en`。
- 降级：关闭动画或低性能设备时，保留静态渐变与基本位移，不依赖外部库。

## 6. 验收清单
- Hero 入场动画存在且 1.2s 内完成；滚动时导航和分屏平滑过渡。
- 滚动驱动光带与 Ribbon 尾迹可见，GPU 加速，无明显掉帧。
- 主题/语言切换后动画色值与文案一致，无闪屏。
- 交互元素 hover/focus 有反馈，键盘可操作。
- 演示流程完整：输入模板 → Prompt/JSON → 脚本生成 → 资产墙更新 → KPI 呈现。

> 设计遵循 KISS/DRY/YAGNI/SOLID：只引入必要的动效层，复用现有组件与 token，动画均独立封装，避免耦合业务逻辑。***
