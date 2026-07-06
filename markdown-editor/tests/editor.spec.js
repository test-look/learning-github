import { test, expect } from '@playwright/test'

test.describe('Markdown Editor E2E', () => {

  test('页面加载后显示默认内容和预览', async ({ page }) => {
    await page.goto('/')

    const editor = page.locator('#editor')
    const preview = page.locator('#preview')

    await expect(editor).not.toBeEmpty()
    await expect(preview).not.toBeEmpty()
    await expect(preview.locator('h1')).toContainText('Markdown 编辑器')
  })

  test('编辑内容时预览实时更新', async ({ page }) => {
    await page.goto('/')

    const editor = page.locator('#editor')
    const preview = page.locator('#preview')

    await editor.fill('')
    await editor.type('## 新标题', { delay: 10 })

    await expect(preview.locator('h2')).toContainText('新标题')
  })

  test('表格渲染正确', async ({ page }) => {
    await page.goto('/')

    const editor = page.locator('#editor')
    const preview = page.locator('#preview')

    await editor.fill('')
    await editor.type('| A | B |\n|---|---|\n| 1 | 2 |', { delay: 5 })

    await expect(preview.locator('table')).toBeVisible()
    await expect(preview.locator('table tbody tr')).toHaveCount(1)
  })

  test('代码块带语法高亮', async ({ page }) => {
    await page.goto('/')

    const editor = page.locator('#editor')
    const preview = page.locator('#preview')

    await editor.fill('')
    await editor.type('```js\nconst x = 1\n```', { delay: 5 })

    await expect(preview.locator('pre code.hljs')).toBeVisible()
  })

  test('主题切换按钮切换亮暗模式', async ({ page }) => {
    await page.goto('/')

    const toggle = page.locator('#theme-toggle')

    const initialTheme = await page.evaluate(() =>
      document.documentElement.getAttribute('data-theme')
    )

    await toggle.click()

    const afterClick = await page.evaluate(() =>
      document.documentElement.getAttribute('data-theme')
    )

    expect(afterClick).not.toBe(initialTheme)
  })

  test('主题偏好被 LocalStorage 记住', async ({ page }) => {
    await page.goto('/')

    const toggle = page.locator('#theme-toggle')
    await toggle.click()

    const saved = await page.evaluate(() => localStorage.getItem('theme'))
    const currentTheme = await page.evaluate(() =>
      document.documentElement.getAttribute('data-theme')
    )

    expect(saved).toBe(currentTheme)
  })

  test('数学公式正确渲染', async ({ page }) => {
    await page.goto('/')

    const preview = page.locator('#preview')

    await expect(preview.locator('.katex').first()).toBeVisible()
  })

})
