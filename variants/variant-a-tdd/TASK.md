# TASK.md — 变体 A：TDD 测试驱动

## 策略声明

> **核心理念：测试是规范的可执行形式。先定义「什么是对的」，再实现「怎么做到对的」。**

本变体要求按照 **红 → 绿 → 重构** 的节奏开发 MarkView：
1. 为一个功能特性编写测试用例（红）
2. 实现最小代码使测试通过（绿）
3. 审查代码质量并重构（重构）

---

## 开发流程

### 第一阶段：基础设施搭建（Red-Green-Refactor × 1）

**目标**：一个可运行的空白页面骨架。

**测试要求**：
```javascript
// 你得自己写测试。以下是指引，不是现成代码。

describe('MarkView App', () => {
  it('should render the app container with editor and preview panels')
  it('should render the title "MarkView" in the header')
  it('should render with two-column layout on desktop viewport')
})
```

**实现约束**：
- 单文件 `index.html`，CDN 引入 React 18 + Tailwind + Babel Standalone
- Markdown 解析逻辑独立为一个模块/函数，不嵌入 JSX

**验收**：
- [ ] 页面可打开，看到标题、空白编辑区、空白预览区
- [ ] 没有控制台错误
- [ ] 所有测试通过

**可用的 Claude Code 技能**：`/react-test` — 帮你搭建测试脚手架并 enforce test-first 工作流

---

### 第二阶段：逐特性推进（每个特性 Red-Green-Refactor）

按以下顺序逐个实现，**每个特性至少 2 个测试用例**（一个正常输入 + 一个边界情况）：

| 序号 | 特性 | 最少测试数 | 边界情况提示 |
|------|------|-----------|-------------|
| 1 | **解析器核心**：纯文本 → 段落 `<p>` | 2 | 空字符串？单行？多行空行分段？ |
| 2 | **标题**：`#` ~ `######` | 3 | 7 个 `#` 不是标题；`#` 后无空格不是标题；标题内含 `#`？ |
| 3 | **粗体/斜体/删除线** | 3 | `***` 三重嵌套？`**` 跨越段落？`~~` 内部含代码？ |
| 4 | **行内代码 + 代码块** | 3 | 代码块内含 Markdown 语法字符？反引号转义？语言标注提取？ |
| 5 | **链接和图片** | 3 | 链接文本含括号？URL 含空格？`![alt](url)` 与 `[text](url)` 混排？ |
| 6 | **无序/有序列表** | 3 | 嵌套列表缩进；有序列表编号自动递增？列表后接段落？ |
| 7 | **引用块 + 分割线** | 2 | 嵌套引用；`---` vs `- - -`？ |
| 8 | **表格** | 3 | 对齐冒号；单元格内含管道符？空单元格？ |
| 9 | **任务列表** | 2 | `- [x]` 和 `- [ ]` 渲染为 checkbox |
| 10 | **HTML 渲染 + XSS 防护** | 2 | `<script>` 不应执行；合法 `<div>` 应渲染 |
| 11 | **UI 功能**：主题切换、复制按钮、行号、字数统计、导出 HTML | 各 1 | |

**实现约束**：
- 每完成一个特性，运行全部已有测试，确保没有回归
- 解析器必须与 UI 分离（纯函数，输入 Markdown 字符串，输出 HTML 字符串或 React 元素数组）

**可用的 Claude Code 技能**：
- `/react-test`：为每个组件/功能块先写测试
- `/test-coverage`：运行后分析覆盖率缺口
- `/security-scan`：完成后扫描 XSS 风险

---

### 第三阶段：集成验证

**任务**：
1. 用 SPEC.md 中的验收样本跑一遍，截图对比
2. 处理 `/verify` 检查端到端行为
3. 处理 `/simplify` 找出可以复用或简化的代码
4. 处理 `/code-review` 自查一遍

**最终验收**：
- [ ] SPEC.md 中列出的所有 P0 功能通过测试
- [ ] SPEC.md 中列出的所有 P1 功能通过测试
- [ ] P2 功能中至少实现 F19（行号）、F22（字数统计）
- [ ] 10000 字符输入无性能问题
- [ ] XSS 注入不弹窗
- [ ] 测试总数 ≥ 25 个，全部通过
- [ ] 移动端布局切换正常

---

## 代码规范

### JavaScript 风格
- 使用 ES6+ 语法（箭头函数、模板字符串、解构、可选链）
- 函数命名清晰，一个函数做一件事
- 变量声明用 `const` > `let`，禁用 `var`

### React 规范
- 使用函数组件 + Hooks（`useState`、`useEffect`、`useCallback`、`useMemo`）
- 组件拆分为：`<App>` → `<Editor>` + `<Preview>` + `<StatusBar>` + `<Toolbar>`
- 每个组件职责单一
- 避免不必要的 re-render（善用 `React.memo` 和 `useCallback`）

### Tailwind 规范
- 使用语义化的 utility class
- 避免内联 style（除非是动态计算的值）
- 暗色模式用 Tailwind 的 `dark:` 前缀（搭配 `class` 切换）

### 文件结构（单文件内）
```javascript
// ==== Markdown Parser (纯函数, 无依赖) ====
function parseMarkdown(markdownText) { ... }

// ==== 工具函数 ====
function escapeHtml(str) { ... }

// ==== React 组件 ====
function Editor({ value, onChange }) { ... }
function Preview({ html }) { ... }
function StatusBar({ charCount, lineCount }) { ... }
function Toolbar({ onCopy, onToggleTheme, isDark }) { ... }
function App() { ... }

// ==== 挂载 ====
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
```

### 安全规范
- 所有渲染到预览区的用户输入必须经过 HTML 转义
- 白名单允许通过的 HTML 标签：`div`, `span`, `br`, `hr`, `kbd`, `sub`, `sup`, `del`, `ins`, `mark`, `abbr`
- `<a>` 标签强制添加 `rel="noopener noreferrer" target="_blank"`
- `<img>` 标签 `src` 校验为非 `javascript:` 协议

---

## 完成后输出

完成后请在你的工作目录输出：
1. `index.html` — 完整的单文件应用
2. `test-report.md` — 列出所有测试用例及其通过状态
3. `screenshots/` — 亮色/暗色两张截图（可选，如果你用的 AI 不能截图则跳过）

---

## 推荐使用的 Claude Code 技能（按顺序）

| 阶段 | 技能 | 用途 |
|------|------|------|
| 每个特性 | `/react-test` | 先写测试，再写实现 |
| 每完成 3 个特性 | `/test-coverage` | 检查覆盖率缺口 |
| 全部完成后 | `/security-scan` | XSS 安全扫描 |
| 全部完成后 | `/simplify` | 简化重复代码 |
| 全部完成后 | `/code-review` | 最终代码审查 |
| 全部完成后 | `/verify` | 端到端行为验证 |

---

## 评判预期（阶段 3 时将检查）

基于 TDD 策略，这个版本的产物预期特点是：
- ✅ 解析器边界情况处理最完善
- ✅ 回归 bug 最少（因为有测试保护）
- 🟡 UI 可能比较朴素（测试不容易驱动视觉细节）
- 🟡 开发速度可能最慢（但质量最高）
