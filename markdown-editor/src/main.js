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
const hljsLight = document.getElementById('hljs-light')
const hljsDark = document.getElementById('hljs-dark')

function updatePreview() {
  preview.innerHTML = renderMarkdown(editor.value)
}

editor.value = DEFAULT_MD
updatePreview()

editor.addEventListener('input', updatePreview)

editor.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    e.preventDefault()
    const start = editor.selectionStart
    editor.value = editor.value.substring(0, start) + '  ' + editor.value.substring(editor.selectionEnd)
    editor.selectionStart = editor.selectionEnd = start + 2
    updatePreview()
  }
})

function setHLJSTheme(dark) {
  hljsLight.disabled = dark
  hljsDark.disabled = !dark
}

function initTheme() {
  const saved = localStorage.getItem('theme')
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved)
    themeToggle.textContent = saved === 'dark' ? '☀️' : '🌙'
    setHLJSTheme(saved === 'dark')
  }
}

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme')
  const next = current === 'dark' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', next)
  localStorage.setItem('theme', next)
  themeToggle.textContent = next === 'dark' ? '☀️' : '🌙'
  setHLJSTheme(next === 'dark')
})

initTheme()
