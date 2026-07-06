import { describe, it, expect } from 'vitest'
import { renderMarkdown } from '../src/markdown.js'

describe('renderMarkdown - 单元测试', () => {

  it('渲染标题', () => {
    const html = renderMarkdown('# 标题一\n## 标题二')
    expect(html).toContain('<h1')
    expect(html).toContain('<h2')
  })

  it('渲染粗体和斜体', () => {
    const html = renderMarkdown('**粗体** *斜体*')
    expect(html).toContain('<strong>')
    expect(html).toContain('<em>')
  })

  it('渲染列表', () => {
    const html = renderMarkdown('- 项一\n- 项二')
    expect(html).toContain('<li>')
    expect(html).toContain('<ul>')
  })

  it('渲染链接', () => {
    const html = renderMarkdown('[百度](https://baidu.com)')
    expect(html).toContain('href="https://baidu.com"')
    expect(html).toContain('>百度<')
  })

  it('渲染代码块', () => {
    const html = renderMarkdown('```js\nconst x = 1\n```')
    expect(html).toContain('hljs')
    expect(html).toContain('<code class')
  })

  it('渲染表格', () => {
    const html = renderMarkdown('| A | B |\n|---|---|\n| 1 | 2 |')
    expect(html).toContain('<table>')
    expect(html).toContain('<td>')
  })

  it('渲染任务列表', () => {
    const html = renderMarkdown('- [x] 已完成\n- [ ] 未完成')
    expect(html).toContain('checkbox')
    expect(html).toContain('checked')
  })

  it('渲染行内数学公式', () => {
    const html = renderMarkdown('行内公式 $E=mc^2$')
    expect(html).toContain('katex')
  })

  it('渲染块级数学公式', () => {
    const html = renderMarkdown('$$\n\\sum_{k=1}^n k\n$$')
    expect(html).toContain('katex-display')
  })

  it('渲染脚注', () => {
    const html = renderMarkdown('文字[^1]\n\n[^1]: 注释')
    // marked v15 脚注渲染为链接
    expect(html).toContain('href')
    expect(html).toContain('文字')
  })

  it('渲染引用块', () => {
    const html = renderMarkdown('> 引用文字')
    expect(html).toContain('<blockquote>')
  })

  it('空输入返回空字符串', () => {
    const html = renderMarkdown('')
    expect(html).toBe('')
  })

})
