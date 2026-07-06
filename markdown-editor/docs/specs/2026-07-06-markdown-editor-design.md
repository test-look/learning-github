# Markdown 编辑器设计文档

## 概述
一个浏览器端 Markdown 编辑器，支持实时预览，无需后端服务。

## 技术栈
- Vite (vanilla JS 模板)
- marked (Markdown 解析)
- highlight.js + marked-highlight (代码高亮)
- KaTeX (数学公式)
- 原生 CSS + CSS 自定义属性 (主题)
- 原生 ES Module

## 功能需求
1. 文本编辑区：textarea 接受用户输入
2. 实时预览区：左右分栏，随输入实时更新
3. 完整 Markdown 语法：标题/粗体/斜体/列表/链接/图片/代码块/表格/任务列表/脚注/数学公式
4. 亮色/暗色主题切换，按钮在右上角，LocalStorage 记住偏好
5. 默认显示一段示例 Markdown 作为引导

## 项目结构
```
markdown-editor/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.js          # 编辑器逻辑、主题切换、入口
│   ├── markdown.js      # marked 配置 + KaTeX 后处理
│   └── style.css        # CSS 变量 + 布局 + 亮/暗主题
└── docs/
    └── specs/
        └── 2026-07-06-markdown-editor-design.md
```

## 数据流
```
textarea oninput → marked.parse(md)
  → 处理 KaTeX 公式 ($...$ / $$...$$)
  → 设置 preview.innerHTML
```

## 主题方案
- CSS 变量: --bg, --text, --border, --preview-bg, --accent
- 通过 <html data-theme="dark|light"> 切换
- LocalStorage('theme') 持久化

## 非功能需求
- 纯静态，无后端
- 无外部请求（除 initial CDN 加载外）
- 响应式布局
