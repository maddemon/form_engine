/**
 * FallbackCodeEditor
 *
 * 代码编辑器的核心兜底实现：
 * - 触发按钮显示语言 + 行数
 * - 模态框内联编辑器（带行号、全屏、可选编译校验）
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useLocale } from '../../../locale'
import type { PropertySlotProps } from '../../../types/property-slot'
import { WidgetButton, WidgetModal } from '../../../widgets'

// ── 内部样式 / 工具（仅本组件使用） ──

const LINE_NUMBERS: React.CSSProperties = {
  padding: '10px 0',
  minWidth: 36,
  textAlign: 'right',
  color: 'var(--fe-text-tertiary)',
  fontFamily: "'Menlo','Consolas',monospace",
  fontSize: 13,
  lineHeight: 1.6,
  background: 'var(--fe-bg-secondary)',
  userSelect: 'none',
  overflow: 'hidden',
  flexShrink: 0,
}

const TEXTAREA_CODE: React.CSSProperties = {
  width: '100%',
  minHeight: 200,
  padding: '10px 14px',
  border: 'none',
  outline: 'none',
  resize: 'vertical',
  fontFamily: "'Menlo','Consolas',monospace",
  fontSize: 13,
  lineHeight: 1.6,
  tabSize: 2,
  background: 'var(--fe-bg-primary)',
  color: 'var(--fe-text-primary)',
  boxSizing: 'border-box',
}

const BUTTON_BAR: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
}

function countLines(code: string): number {
  if (!code) return 0
  return code.split('\n').length
}

/** 获取默认代码示例 */
function getDefaultCode(language?: string): string {
  switch (language) {
    case 'html':
      return '<div>\n  <h1>Hello World</h1>\n  <p>Welcome to my page!</p>\n  <ul>\n    <li>Item 1</li>\n    <li>Item 2</li>\n  </ul>\n</div>'
    case 'jsx':
      return 'function Hello() {\n  const [count, setCount] = React.useState(0);\n  const [text, setText] = React.useState("");\n  return (\n    <div style={{ padding: 16 }}>\n      <h1>Hello World</h1>\n      <AntCard title="State Demo">\n        <p>Count: {count}</p>\n        <AntButton onClick={() => setCount(c => c + 1)}>\n          Increment\n        </AntButton>\n      </AntCard>\n      <input value={text} onChange={e => setText(e.target.value)} placeholder="Type here..." />\n      <p>You typed: {text}</p>\n    </div>\n  );\n}'
    default:
      return ''
  }
}

const FallbackCodeEditor: React.FC<PropertySlotProps> = ({ value, onChange, context, placeholder }) => {
  const { locale } = useLocale()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<string>('')
  const [fullscreen, setFullscreen] = useState(false)
  const [compiling, setCompiling] = useState(false)
  const [compileStatus, setCompileStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [compileError, setCompileError] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const language = (context?.language as string) ?? 'html'
  const onCompile = context?.onCompile as ((code: string) => Promise<{ success: boolean; error?: string }>) | undefined
  const strValue = typeof value === 'string' ? value : ''
  const lineCount = countLines(strValue)
  const c = locale.widget.codeEditor

  const handleOpen = useCallback(() => {
    setDraft(strValue || getDefaultCode(language))
    setFullscreen(false)
    setCompileStatus('idle')
    setCompileError('')
    setOpen(true)
  }, [strValue, language])

  const handleClose = useCallback(() => {
    setOpen(false)
  }, [])

  const doCompile = useCallback(async () => {
    if (!onCompile || !draft.trim()) return
    setCompiling(true)
    setCompileStatus('idle')
    setCompileError('')
    try {
      const result = await onCompile(draft)
      setCompileStatus(result.success ? 'success' : 'error')
      if (!result.success) {
        setCompileError(result.error || c?.compileError || 'Compile failed')
      }
    } catch {
      setCompileStatus('error')
      setCompileError(c?.compileError || 'Compile failed')
    } finally {
      setCompiling(false)
    }
  }, [onCompile, draft, c])

  const handleConfirm = useCallback(async () => {
    if (onCompile) {
      setCompiling(true)
      setCompileStatus('idle')
      setCompileError('')
      try {
        const result = await onCompile(draft)
        if (!result.success) {
          setCompileStatus('error')
          setCompileError(result.error || c?.compileError || 'Compile failed')
          setCompiling(false)
          return
        }
        setCompileStatus('success')
      } catch {
        setCompileStatus('error')
        setCompileError(c?.compileError || 'Compile failed')
        setCompiling(false)
        return
      } finally {
        // compiling 已在上方 return 分支中 setCompiling(false)
      }
      setCompiling(false)
    }
    onChange(draft)
    setOpen(false)
  }, [onCompile, draft, onChange, c])

  // Auto-resize textarea
  useEffect(() => {
    if (open && textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [open, draft])

  // Line numbers
  const lines = draft ? draft.split('\n') : ['']

  const statusText = compileStatus === 'success' ? c?.compileSuccess : compileStatus === 'error' ? c?.compileError : ''

  return (
    <>
      <div style={BUTTON_BAR}>
        <WidgetButton type="dashed" color="primary" size="sm" onClick={handleOpen}>
          {language.toUpperCase()} ({lineCount} {c?.lines || 'lines'})
        </WidgetButton>
      </div>
      <WidgetModal
        open={open}
        title={c?.title || 'Code Editor'}
        width={fullscreen ? 'fullscreen' : 'md'}
        onCancel={handleClose}
        onConfirm={handleConfirm}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--fe-text-secondary)' }}>{language.toUpperCase()}</span>
          {onCompile && (
            <WidgetButton type="default" size="sm" onClick={doCompile} disabled={compiling}>
              {compiling ? c?.compiling || 'Compiling...' : c?.compile || 'Compile'}
            </WidgetButton>
          )}
          {statusText && (
            <span
              style={{
                fontSize: 12,
                color: compileStatus === 'success' ? 'var(--fe-success)' : 'var(--fe-error)',
              }}
            >
              {statusText}
            </span>
          )}
          <WidgetButton
            type="default"
            size="sm"
            onClick={() => setFullscreen((v) => !v)}
            style={{ marginLeft: 'auto' }}
          >
            {fullscreen ? c?.exitFullscreen || 'Exit' : c?.fullscreen || 'Fullscreen'}
          </WidgetButton>
        </div>
        <div
          style={{
            display: 'flex',
            border: '1px solid var(--fe-border-primary)',
            borderRadius: 'var(--fe-border-radius-sm)',
            overflow: 'hidden',
            flex: fullscreen ? 1 : undefined,
          }}
        >
          <div style={LINE_NUMBERS}>
            {lines.map((_, i) => (
              <div key={i} style={{ paddingRight: 8 }}>
                {i + 1}
              </div>
            ))}
          </div>
          <div style={{ flex: 1, overflow: 'auto' }}>
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              style={{ ...TEXTAREA_CODE, ...(fullscreen ? { minHeight: '50vh', resize: 'none' } : {}) }}
              placeholder={placeholder}
              spellCheck={false}
              autoFocus
            />
          </div>
        </div>
        {compileError && (
          <div
            style={{
              marginTop: 8,
              padding: '8px 12px',
              fontSize: 12,
              lineHeight: 1.5,
              fontFamily: "'Menlo','Consolas',monospace",
              background: 'var(--fe-error-bg)',
              border: '1px solid var(--fe-error)',
              borderRadius: 'var(--fe-border-radius-sm)',
              color: 'var(--fe-error)',
              whiteSpace: 'pre-wrap',
              overflow: 'auto',
              maxHeight: 150,
            }}
          >
            {compileError}
          </div>
        )}
      </WidgetModal>
    </>
  )
}

export default FallbackCodeEditor
