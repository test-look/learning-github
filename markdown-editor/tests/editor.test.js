import { describe, it, expect, beforeEach } from 'vitest'
import { renderMarkdown } from '../src/markdown.js'

const DEFAULT_MD = `# 欢迎使用 Markdown 编辑器

这是一个 **实时预览** 的 Markdown 编辑器。

## 数学公式

行内公式 $E = mc^2$

$$
\\sum_{k=1}^{n} k = \\frac{n(n+1)}{2}
$$

## 表格

| 序号 | 名称 |
|------|------|
| 1 | Markdown |
`

describe('编辑器集成测试', () => {

  let editorEl, previewEl

  beforeEach(() => {
    document.body.innerHTML = `
      <textarea id="editor"></textarea>
      <div id="preview"></div>
    `
    editorEl = document.getElementById('editor')
    previewEl = document.getElementById('preview')
  })

  it('设置内容后预览更新', () => {
    editorEl.value = '## 测试标题'
    previewEl.innerHTML = renderMarkdown(editorEl.value)
    expect(previewEl.querySelector('h2')).toBeTruthy()
    expect(previewEl.querySelector('h2').textContent).toContain('测试标题')
  })

  it('在已有内容后追加内容，预览同步', () => {
    editorEl.value = DEFAULT_MD
    previewEl.innerHTML = renderMarkdown(editorEl.value)

    editorEl.value += '\n## 追加内容'
    previewEl.innerHTML = renderMarkdown(editorEl.value)

    const h2s = previewEl.querySelectorAll('h2')
    const texts = Array.from(h2s).map(h => h.textContent)
    expect(texts).toContain('追加内容')
  })

  it('清空编辑器后预览为空', () => {
    editorEl.value = DEFAULT_MD
    previewEl.innerHTML = renderMarkdown(editorEl.value)

    editorEl.value = ''
    previewEl.innerHTML = renderMarkdown(editorEl.value)

    expect(previewEl.innerHTML.trim()).toBe('')
  })

  it('完整 HTML 标记完整性', () => {
    editorEl.value = '# h1\n## h2\n**bold**\n- list\n> quote\n```js\nx\n```'
    previewEl.innerHTML = renderMarkdown(editorEl.value)

    expect(previewEl.querySelector('h1')).toBeTruthy()
    expect(previewEl.querySelector('h2')).toBeTruthy()
    expect(previewEl.querySelector('strong')).toBeTruthy()
    expect(previewEl.querySelector('ul')).toBeTruthy()
    expect(previewEl.querySelector('blockquote')).toBeTruthy()
    expect(previewEl.querySelector('pre')).toBeTruthy()
  })

  it('原始 HTML 被保留（marked 默认不转义原始 HTML）', () => {
    editorEl.value = '<div class="custom">自定义内容</div>'
    previewEl.innerHTML = renderMarkdown(editorEl.value)
    expect(previewEl.innerHTML).toContain('custom')
  })

  it('大内容性能：1000 行不崩溃', () => {
    const lines = []
    for (let i = 0; i < 1000; i++) {
      lines.push(`- 列表项第 ${i} 行`)
    }
    editorEl.value = lines.join('\n')
    const start = performance.now()
    previewEl.innerHTML = renderMarkdown(editorEl.value)
    const elapsed = performance.now() - start

    expect(previewEl.querySelectorAll('li').length).toBe(1000)
    expect(elapsed).toBeLessThan(2000)
  })

})
