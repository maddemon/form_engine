import hljs from 'highlight.js'
import { useEffect, useRef } from 'react'
import { useAppContext } from '../context/AppContext'

export default function CodeBlock(props: { code: string }) {
  const { code } = props
  const { isDark } = useAppContext()
  const codeRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (codeRef.current) {
      hljs.highlightElement(codeRef.current)
    }
  }, [code])

  return (
    <>
      <style>{`
.code-block-theme .hljs { color: ${isDark ? '#c9d1d9' : '#24292e'}; background: none; }
.code-block-theme .hljs-comment,
.code-block-theme .hljs-quote { color: ${isDark ? '#8b949e' : '#6a737d'}; font-style: italic; }
.code-block-theme .hljs-keyword,
.code-block-theme .hljs-selector-tag,
.code-block-theme .hljs-subst { color: ${isDark ? '#ff7b72' : '#d73a49'}; }
.code-block-theme .hljs-string,
.code-block-theme .hljs-doctag { color: ${isDark ? '#a5d6ff' : '#032f62'}; }
.code-block-theme .hljs-number,
.code-block-theme .hljs-literal,
.code-block-theme .hljs-variable { color: ${isDark ? '#79c0ff' : '#005cc5'}; }
.code-block-theme .hljs-title,
.code-block-theme .hljs-section,
.code-block-theme .hljs-selector-id { color: ${isDark ? '#d2a8ff' : '#6f42c1'}; }
.code-block-theme .hljs-built_in { color: ${isDark ? '#ffa657' : '#e36209'}; }
.code-block-theme .hljs-type { color: ${isDark ? '#ffa657' : '#005cc5'}; }
.code-block-theme .hljs-attr { color: ${isDark ? '#79c0ff' : '#005cc5'}; }
.code-block-theme .hljs-attribute { color: ${isDark ? '#ffa657' : '#e36209'}; }
.code-block-theme .hljs-selector-class { color: ${isDark ? '#d2a8ff' : '#6f42c1'}; }
.code-block-theme .hljs-meta { color: ${isDark ? '#8b949e' : '#6a737d'}; }
.code-block-theme .hljs-tag,
.code-block-theme .hljs-name { color: ${isDark ? '#ff7b72' : '#22863a'}; }
.code-block-theme .hljs-symbol,
.code-block-theme .hljs-bullet { color: ${isDark ? '#79c0ff' : '#005cc5'}; }
.code-block-theme .hljs-link { color: ${isDark ? '#a5d6ff' : '#032f62'}; text-decoration: underline; }
.code-block-theme .hljs-regexp { color: ${isDark ? '#a5d6ff' : '#032f62'}; }
.code-block-theme .hljs-deletion { color: ${isDark ? '#ff7b72' : '#b31d28'}; }
.code-block-theme .hljs-addition { color: ${isDark ? '#a5d6ff' : '#22863a'}; }
      `}</style>
      <pre className="code-block-theme"
        style={{
          background: isDark ? '#1a1a1a' : '#f0f0f0',
          border: `1px solid ${isDark ? '#333' : '#ddd'}`,
          padding: 16,
          borderRadius: 6,
          fontSize: 13,
          lineHeight: 1.6,
          overflow: 'auto',
          margin: '12px 0',
        }}
      >
        <code ref={codeRef}>{code}</code>
      </pre>
    </>
  )
}
