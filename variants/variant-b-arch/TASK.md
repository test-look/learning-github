# TASK.md — 变体 B：架构先行

## 策略声明

> **核心理念：好的架构让实现变成填空题。花 30% 的时间设计，省 70% 的返工。**

本变体要求先完成系统架构设计（数据流、组件树、模块接口、状态管理），设计产出经自我审查通过后，再按蓝图施工。代码是设计的自然投影。

---

## 开发流程

### 阶段 0：需求分析与架构设计（先不动手写产品代码）

#### Step 0.1：需求梳理

仔细阅读 `SPEC.md`，用自己的话重述：
1. 核心用户故事（谁 + 想做什么 + 为什么）
2. 功能优先级矩阵（P0 / P1 / P2）
3. 技术约束清单

#### Step 0.2：架构设计（产出 `DESIGN.md`）

在设计文档中明确以下内容，**每个部分都要有**：

**A. 组件树**
```
画出 React 组件树的层级关系，标注每个组件的 props 和职责。

示例格式：
<App>
├── <Header>           — 标题、主题切换按钮
│   props: { isDark, onToggleTheme }
├── <MainPanel>        — 左右分栏容器
│   ├── <Editor>       — 编辑区
│   │   props: { value, onChange, lineCount }
│   └── <Preview>      — 预览区
│       props: { htmlContent, scrollPercentage }
└── <StatusBar>        — 底部状态栏
    props: { charCount, lineCount, onCopyHtml }
```

**B. 数据流图**
```
描述数据如何在组件间流动：

用户输入 → Editor (onChange) → App (state: markdownText)
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
              parseMarkdown()  计数统计         HTML 源码
                    │               │               │
                    ▼               ▼               ▼
              Preview          StatusBar       复制按钮
```

**C. 解析器接口定义**
```javascript
// 主解析函数签名
function parseMarkdown(text: string): string
// 输入：原始 Markdown 文本
// 输出：安全的 HTML 字符串

// 中间表示（IR）设计 — 你是否需要一个 AST？还是直接生成 HTML？
// 如果使用 AST，定义节点类型：
interface ASTNode {
  type: 'heading' | 'paragraph' | 'code_block' | 'list' | 'table' | ...;
  children?: ASTNode[];
  // 各类型专属字段
}
```

**D. 状态管理方案**
```
定义 App 级别的 state 结构：
{
  markdownText: string,        // 编辑区原始文本
  htmlOutput: string,           // 解析后的 HTML（派生状态）
  isDarkMode: boolean,          // 主题
  charCount: number,            // 派生
  lineCount: number,            // 派生
}

哪些是派生状态（不需要 useState）？哪些需要持久化到 localStorage？
```

**E. 解析策略选型**
```
选择你的解析路线并说明理由：

方案 1：正则管线 — 一系列 regex replace，按优先级处理
方案 2：逐行解析 — 按行类型分发（state machine）
方案 3：递归下降 — 手写 parser，构建 AST → HTML

选哪个？为什么？对你的具体场景来说，什么是最优解？
```

**F. 安全架构**
```
列出你的 XSS 防护策略：
1. HTML 转义策略（黑名单还是白名单？）
2. 链接和图片的 URL 校验方案
3. 哪些 HTML 标签允许通过？
```

#### Step 0.3：设计审查（自我审查清单）

在开始编码前，逐一回答：
- [ ] 如果我要新加一个语法（比如脚注 `[^1]`），需要改几个地方？分别是哪些？
- [ ] 如果编辑区从 textarea 换成 CodeMirror/ Monaco，需要改哪些组件？
- [ ] 10000 字符的输入，哪些地方可能成为性能瓶颈？如何预防？
- [ ] 移动端布局切换，是 CSS 层面解决还是 JS 层面？
- [ ] 解析器和 UI 之间的耦合点在哪？能否把解析器独立出来当作一个库用？

**可以用的 Claude Code 技能**：`/plan` — 帮你系统性地设计架构，输出结构化计划

---

### 阶段 1：骨架搭建（按照设计施工）

**目标**：按照 `DESIGN.md` 搭建组件骨架和基本布局。

**任务**：
1. 创建组件框架（空壳组件，先只返回占位 div）
2. 实现布局（Tailwind 的 flex/grid）
3. 实现主题切换（亮/暗）的基础设施
4. 验证组件树和设计文档一致

**验收**：
- [ ] 页面渲染出所有组件占位符
- [ ] 左右两栏比例 50:50
- [ ] 亮/暗切换按钮工作（切换 body class）
- [ ] 移动端（< 768px）切换为上下布局
- [ ] 没有控制台错误

**可以用的 Claude Code 技能**：`/prp-plan` — 生成实现计划，提取代码库模式

---

### 阶段 2：解析器实现（核心逻辑）

**目标**：实现 `parseMarkdown()` 函数及相关工具函数，与 UI 完全解耦。

**实现顺序（按依赖关系）**：
1. **HTML 转义与安全函数** — `escapeHtml()`, `sanitizeUrl()`
2. **块级元素解析** — 段落、标题、代码块、引用块
3. **行内元素解析** — 粗体、斜体、删除线、行内代码、链接、图片
4. **列表解析** — 无序/有序列表、嵌套列表、任务列表
5. **表格解析** — GFM 表格

**每个子步骤的约束**：
- 解析函数必须是纯函数
- 为解析器写清晰的 JSDoc 注释
- 每个规则的处理逻辑至少有一行注释解释正则的含义

**验收**：
- [ ] 传入 SPEC.md 中的验收样本，console.log 输出的 HTML 字符串结构正确
- [ ] `<script>` 标签被转义
- [ ] 嵌套列表正确渲染

**可以用的 Claude Code 技能**：
- `/react-review` — 检查组件架构合理性
- `/security-scan` — 提前扫描安全风险

---

### 阶段 3：UI 实现（视图层）

**目标**：将解析结果渲染到预览区，打磨编辑体验。

**任务**：
1. 实现 `<Editor>` 组件（textarea，行号，Tab 键处理）
2. 实现 `<Preview>` 组件（`dangerouslySetInnerHTML` + 安全 HTML）
3. 实现 `<StatusBar>` 组件（字数、行数统计）
4. 实现代码块复制按钮
5. 实现导出 HTML 到剪贴板
6. 实现同步滚动（尽力而为）

**约束**：
- 使用 `useMemo` 缓存解析结果（只在 `markdownText` 变化时重新解析）
- 使用 `useCallback` 包裹事件处理函数
- 编辑器字体用等宽字体（`font-mono`）

**验收**：
- [ ] 所有 SPEC.md 的 P0、P1 功能正常工作
- [ ] P2 中至少实现行号、字数统计、主题切换
- [ ] 代码块复制按钮可用（视觉反馈：点击后文字变为「已复制」）
- [ ] 性能：10000 字输入无卡顿

**可以用的 Claude Code 技能**：`/react-build` — 遇到编译/渲染问题时的增量修复

---

### 阶段 4：收尾打磨

**任务**：
1. 运行 `/code-review` 自查
2. 运行 `/security-scan` 最终检查
3. 运行 `/simplify` 消除冗余
4. 运行 `/verify` 端到端验证

**最后产出**：
1. `index.html` — 完整的单文件应用
2. `DESIGN.md` — 一份干净的最终架构文档（不是草稿，而是代码的真实反映）
3. `screenshots/` — 亮色/暗色两张截图（可选）

---

## 代码规范

### JavaScript 风格
- 使用 ES6+ 语法（箭头函数、模板字符串、解构、可选链）
- 每个函数/组件上方写一行 JSDoc 描述其职责
- 变量声明用 `const` > `let`，禁用 `var`
- 避免魔法数字，定义有意义的常量

### React 规范
- 函数组件 + Hooks
- `useMemo` 用于缓存解析结果
- `useCallback` 包裹所有传给子组件的事件处理器
- 组件之间通过 props 通信，不引入全局状态（除非有充分理由）

### 架构原则（来自 Clean Architecture / SOLID）
- **单一职责**：解析器只做解析，UI 只做渲染
- **依赖倒置**：UI 依赖解析器接口，不依赖解析器实现细节
- **开放封闭**：新增语法规则 = 新增函数 + 注册到管线，不修改现有函数

### Tailwind 规范
- 使用语义化 utility class
- 暗色模式：用 Tailwind `dark:` 前缀，在最外层 `<div className="dark">` 切换

### 安全规范
- 白名单 HTML 标签：`div`, `span`, `br`, `hr`, `kbd`, `sub`, `sup`, `del`, `ins`, `mark`, `abbr`, `table`, `thead`, `tbody`, `tr`, `th`, `td`, `ul`, `ol`, `li`, `blockquote`, `pre`, `code`, `h1`~`h6`, `p`, `a`, `img`, `input`, `strong`, `em`
- `dangerouslySetInnerHTML` 使用前确保 HTML 已经过安全处理
- 所有 `<a>` 强制 `rel="noopener noreferrer" target="_blank"`
- 所有 `<img>` URL 校验：拒绝 `javascript:` 协议

---

## 推荐使用的 Claude Code 技能（按顺序）

| 阶段 | 技能 | 用途 |
|------|------|------|
| 0（设计） | `/plan` | 系统性架构设计 |
| 0（设计） | `/prp-plan` | 提取代码模式，生成实现计划 |
| 1（骨架） | `/react-review` | 审查组件结构 |
| 2（解析器） | `/security-scan` | 提前发现安全漏洞 |
| 3（UI） | `/react-build` | 修复渲染问题 |
| 3（UI） | `/react-test` | 为关键交互写测试 |
| 4（收尾） | `/code-review` | 整体质量审查 |
| 4（收尾） | `/simplify` | 消除重复代码 |
| 4（收尾） | `/verify` | 端到端验证 |

---

## 评判预期（阶段 3 时将检查）

基于架构先行策略，这个版本的产物预期特点是：
- ✅ 组件结构清晰，模块边界合理
- ✅ DESIGN.md 与代码一致（文档即真相）
- ✅ 新增功能时改动范围可控
- 🟡 可能出现过度设计（架构比需求更复杂）
- 🟡 前期时间投入较大，但后期修改成本低
