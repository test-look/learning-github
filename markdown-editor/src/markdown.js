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

const renderer = {
  text({ text }) {
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
