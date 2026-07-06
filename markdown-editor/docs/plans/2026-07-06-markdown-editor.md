# Markdown 编辑器 Implementation Plan

**Goal:** 构建一个浏览器端 Markdown 编辑器，支持实时预览、亮暗主题切换

**架构:** Vite + Vanilla JS 项目，marked 解析 Markdown，KaTeX 渲染公式，CSS 变量实现主题

**Tech Stack:** Vite, marked v15, highlight.js, KaTeX, CSS Custom Properties

## Global Constraints
- 纯客户端，无后端服务
- 无文件系统访问
- 所有依赖通过 npm 管理，通过 CDN fallback 零外部请求
- 亮/暗主题通过 `data-theme` 属性 + LocalStorage 持久化
- 布局：左右分栏，主题按钮在右上角

---

### Task 1: 项目骨架

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`

**Interfaces:**
- Consumes: 无
- Produces: HTML 入口结构，为后续 JS/CSS 提供挂载点

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "markdown-editor",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "marked": "^15.0.0",
    "marked-highlight": "^2.2.0",
    "highlight.js": "^11.10.0",
    "katex": "^0.16.11"
  },
  "devDependencies": {
    "vite": "^6.0.0"
  }
}
```

- [ ] **Step 2: 创建 vite.config.js**

```js
import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
  },
})
```

- [ ] **Step 3: 创建 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown 编辑器</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js@11.10.0/styles/github.min.css" id="hljs-theme">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
  <link rel="stylesheet" href="/src/style.css">
</head>
<body>
  <div id="app">
    <div id="toolbar">
      <h1>Markdown 编辑器</h1>
      <button id="theme-toggle" title="切换主题">🌙</button>
    </div>
    <div id="container">
      <div class="panel" id="editor-panel">
        <div class="panel-header">编辑</div>
        <textarea id="editor" spellcheck="false"></textarea>
      </div>
      <div class="panel" id="preview-panel">
        <div class="panel-header">预览</div>
        <div id="preview"></div>
      </div>
    </div>
  </div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

- [ ] **Step 4: 验证文件结构**

```bash
dir
```
预期：package.json, vite.config.js, index.html 存在

- [ ] **Step 5: Commit**

```bash
git add package.json vite.config.js index.html
git commit -m "feat: project scaffold with Vite + HTML entry"
```

---

### Task 2: Markdown 解析模块

**Files:**
- Create: `src/markdown.js`

**Interfaces:**
- Produces: `renderMarkdown(raw: string): string` — 将 Markdown 字符串渲染为 HTML

- [ ] **Step 1: 创建 src/markdown.js**

```js
import { Marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js'
import katex from 'katex'

const marked = new Marked(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value
      }
      return code
    }
  })
)

// 自定义渲染器：支持脚注
const renderer = {
  text(text) {
    // 行内公式 $...$
    text = text.replace(/\$(.+?)\$/g, (_, formula) => {
      try {
        return katex.renderToString(formula, { throwOnError: false })
      } catch {
        return `$${formula}$`
      }
    })
    return text
  }
}

marked.use({ renderer })

export function renderMarkdown(raw) {
  const html = marked.parse(raw)
  const withMath = html.replace(/\$\$(.+?)\$\$/gs, (_, formula) => {
    try {
      return katex.renderToString(formula.trim(), { displayMode: true, throwOnError: false })
    } catch {
      return `$$${formula}$$`
    }
  })
  return withMath
}
```

- [ ] **Step 2: 验证模块可加载**

```bash
node -e "import('./src/markdown.js').then(m => console.log(typeof m.renderMarkdown))"
```
预期: "function"

- [ ] **Step 3: Commit**

```bash
git add src/markdown.js
git commit -m "feat: add markdown render module with marked + KaTeX"
```

---

### Task 3: 样式系统

**Files:**
- Create: `src/style.css`

- [ ] **Step 1: 创建 src/style.css**

```css
/* Light theme (default) */
:root,
[data-theme="light"] {
  --bg: #ffffff;
  --text: #1a1a2e;
  --panel-bg: #f8f9fa;
  --border: #e2e8f0;
  --accent: #3b82f6;
  --code-bg: #f1f5f9;
  --preview-bg: #ffffff;
  --toolbar-bg: #f8f9fa;
  --panel-header-bg: #f1f3f5;
}

[data-theme="dark"] {
  --bg: #0f172a;
  --text: #e2e8f0;
  --panel-bg: #1e293b;
  --border: #334155;
  --accent: #60a5fa;
  --code-bg: #1e293b;
  --preview-bg: #0f172a;
  --toolbar-bg: #1e293b;
  --panel-header-bg: #334155;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg);
  color: var(--text);
  height: 100vh;
  overflow: hidden;
}

#app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

#toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: var(--toolbar-bg);
  border-bottom: 1px solid var(--border);
}

#toolbar h1 {
  font-size: 18px;
  font-weight: 600;
}

#theme-toggle {
  background: none;
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 18px;
  color: var(--text);
  transition: background 0.2s;
}

#theme-toggle:hover {
  background: var(--panel-header-bg);
}

#container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border);
}

.panel:last-child {
  border-right: none;
}

.panel-header {
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
  background: var(--panel-header-bg);
  border-bottom: 1px solid var(--border);
  opacity: 0.7;
}

#editor {
  flex: 1;
  padding: 16px;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  font-size: 14px;
  line-height: 1.6;
  border: none;
  outline: none;
  resize: none;
  background: var(--panel-bg);
  color: var(--text);
}

#preview {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background: var(--preview-bg);
  line-height: 1.7;
  font-size: 15px;
}

/* Preview typography */
#preview h1 { font-size: 28px; margin: 0 0 16px; padding-bottom: 8px; border-bottom: 1px solid var(--border); }
#preview h2 { font-size: 22px; margin: 24px 0 12px; }
#preview h3 { font-size: 18px; margin: 20px 0 8px; }
#preview p { margin: 0 0 12px; }
#preview ul, #preview ol { margin: 0 0 12px; padding-left: 24px; }
#preview li { margin: 4px 0; }
#preview code {
  background: var(--code-bg);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 13px;
  font-family: 'JetBrains Mono', monospace;
}
#preview pre {
  background: var(--code-bg);
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 0 0 16px;
}
#preview pre code {
  background: none;
  padding: 0;
}
#preview blockquote {
  border-left: 4px solid var(--accent);
  padding: 8px 16px;
  margin: 0 0 16px;
  background: var(--panel-bg);
  border-radius: 0 8px 8px 0;
}
#preview table {
  border-collapse: collapse;
  width: 100%;
  margin: 0 0 16px;
}
#preview th, #preview td {
  border: 1px solid var(--border);
  padding: 8px 12px;
  text-align: left;
}
#preview th {
  background: var(--panel-header-bg);
  font-weight: 600;
}
#preview img {
  max-width: 100%;
  border-radius: 8px;
}
#preview a {
  color: var(--accent);
}
#preview input[type="checkbox"] {
  margin-right: 6px;
}

/* KaTeX */
.katex-display {
  margin: 16px 0;
  overflow-x: auto;
  overflow-y: hidden;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/style.css
git commit -m "feat: add theme system and layout styles"
```

---

### Task 4: 主逻辑

**Files:**
- Create: `src/main.js`

**Interfaces:**
- Consumes: `renderMarkdown()` from `src/markdown.js`
- Produces: 完整的编辑器交互

- [ ] **Step 1: 创建 src/main.js**

```js
import { renderMarkdown } from './markdown.js'

const DEFAULT_MD = `# 欢迎使用 Markdown 编辑器

这是一个 **实时预览** 的 Markdown 编辑器，支持完整语法。

## 基本语法

**粗体** *斜体* ~~删除线~~ \`行内代码\`

- 无序列表项
- 嵌套列表项
  - 子项一
  - 子项二

1. 有序列表项
2. 有序列表项

> 引用块：这是一段引用的文字

## 链接与图片

[打开百度](https://www.baidu.com)

## 表格

| 序号 | 名称 | 描述 |
|------|------|------|
| 1 | Markdown | 轻量级标记语言 |
| 2 | KaTeX | 数学公式渲染 |

## 任务列表

- [x] 已完成任务
- [ ] 未完成任务

## 代码块

\`\`\`javascript
function hello() {
  console.log("Hello, world!")
}
\`\`\`

## 数学公式

行内公式：$E = mc^2$

块级公式：

$$
\\sum_{k=1}^{n} k = \\frac{n(n+1)}{2}
$$

## 脚注

这里有一个脚注[^1]。

[^1]: 这是脚注的内容
`

const editor = document.getElementById('editor')
const preview = document.getElementById('preview')
const themeToggle = document.getElementById('theme-toggle')

function updatePreview() {
  preview.innerHTML = renderMarkdown(editor.value)
}

editor.value = DEFAULT_MD
updatePreview()

editor.addEventListener('input', updatePreview)

// 快捷键: Tab 插入空格
editor.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    e.preventDefault()
    const start = editor.selectionStart
    editor.value = editor.value.substring(0, start) + '  ' + editor.value.substring(editor.selectionEnd)
    editor.selectionStart = editor.selectionEnd = start + 2
    updatePreview()
  }
})

// 主题切换
function initTheme() {
  const saved = localStorage.getItem('theme')
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved)
    themeToggle.textContent = saved === 'dark' ? '☀️' : '🌙'
  }
}

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme')
  const next = current === 'dark' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', next)
  localStorage.setItem('theme', next)
  themeToggle.textContent = next === 'dark' ? '☀️' : '🌙'
})

initTheme()
```

- [ ] **Step 2: 验证集成**

```bash
cd C:\Users\admin\Desktop\test\markdown-editor && npm install 2>&1 | tail -5
```
预期: 依赖安装成功

```bash
npx vite build 2>&1
```
预期: 构建成功，dist 目录生成

- [ ] **Step 3: Commit**

```bash
git add src/main.js
git commit -m "feat: add editor logic with theme toggle and default content"
```

---

### Task 5: 最终验证

- [ ] **Step 1: 运行 dev server 并验证**

```bash
npx vite --host 2>&1
```
预期: Vite dev server 启动，在浏览器打开可看到编辑器

- [ ] **Step 2: 验证功能清单**
- [ ] 初始显示默认 Markdown 内容
- [ ] 编辑内容时预览实时更新
- [ ] 亮/暗主题切换生效
- [ ] 主题偏好被 LocalStorage 记住
- [ ] 表格 / 任务列表 / 代码高亮 / 数学公式 / 脚注均正确渲染
- [ ] 主题切换按钮在右上角

- [ ] **Step 3: 构建生产版本**

```bash
npx vite build
```
预期: dist/ 目录包含 index.html + 打包资源

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: complete markdown editor v1"
```
