/**
 * Property Slot 注册表
 *
 * 管理属性编辑器 Slot 的注册、查询和兜底。
 * 优先级链：运行时注入 > 全局注册 > Widget 兜底 > 核心兜底
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useLocale } from '../locale'
import { FieldDataSource } from '../types'
import type { DesignerWidgets } from '../types/adapter'
import type { PropertySlotProps, PropertySlots, SlotName } from '../types/property-slot'
import { WidgetButton, WidgetModal } from '../widgets'

/**
 * Slot 注册表（全局单例）
 */
export class PropertySlotRegistry {
  private slots = new Map<SlotName, React.ComponentType<PropertySlotProps>>()

  register(name: SlotName, component: React.ComponentType<PropertySlotProps>): void {
    this.slots.set(name, component)
  }

  get(name: SlotName): React.ComponentType<PropertySlotProps> | undefined {
    return this.slots.get(name)
  }

  has(name: SlotName): boolean {
    return this.slots.has(name)
  }

  unregister(name: SlotName): void {
    this.slots.delete(name)
  }

  clear(): void {
    this.slots.clear()
  }
}

export const propertySlotRegistry = new PropertySlotRegistry()

// ── Widget 适配器：将 DesignerWidgets 中的组件适配为 PropertySlotProps ──

/** 缓存适配后的组件，避免每次渲染创建新组件类型导致 React 卸载/重挂载 */
const expressionInputCache = new WeakMap<React.ComponentType<any>, React.ComponentType<PropertySlotProps>>()
const dataSourceEditorCache = new WeakMap<React.ComponentType<any>, React.ComponentType<PropertySlotProps>>()

/** 将 w.ExpressionInput 适配为 PropertySlotProps */
function adaptExpressionInput(w: DesignerWidgets): React.ComponentType<PropertySlotProps> | null {
  if (!w.ExpressionInput) return null
  const cached = expressionInputCache.get(w.ExpressionInput)
  if (cached) return cached
  const ExpressionInput = w.ExpressionInput
  const Adapted: React.FC<PropertySlotProps> = ({ value, onChange, placeholder, fieldNames }) => (
    <ExpressionInput
      value={typeof value === 'string' ? value : ''}
      onChange={onChange}
      placeholder={placeholder}
      fieldNames={fieldNames}
    />
  )
  Adapted.displayName = 'AdaptedExpressionInput'
  expressionInputCache.set(w.ExpressionInput, Adapted)
  return Adapted
}

/** 将 w.DataSourceEditor 适配为 PropertySlotProps */
function adaptDataSourceEditor(w: DesignerWidgets): React.ComponentType<PropertySlotProps> | null {
  if (!w.DataSourceEditor) return null
  const cached = dataSourceEditorCache.get(w.DataSourceEditor)
  if (cached) return cached
  const DataSourceEditor = w.DataSourceEditor
  const Adapted: React.FC<PropertySlotProps> = ({ value, onChange, context }) => (
    <DataSourceEditor
      value={value as FieldDataSource | undefined}
      onChange={(v) => onChange(v)}
      optionsType={(context?.optionsType as 'flat' | 'tree') ?? 'flat'}
    />
  )
  Adapted.displayName = 'AdaptedDataSourceEditor'
  dataSourceEditorCache.set(w.DataSourceEditor, Adapted)
  return Adapted
}

/**
 * 从 DesignerWidgets 中获取 Widget 层 fallback
 */
function getWidgetFallback(name: SlotName, widgets?: DesignerWidgets): React.ComponentType<PropertySlotProps> | null {
  if (!widgets) return null
  switch (name) {
    case 'expressionEditor':
      return adaptExpressionInput(widgets)
    case 'dataSourceEditor':
      return adaptDataSourceEditor(widgets)
    default:
      return null
  }
}

// ── 核心 fallback 组件（最简实现，不依赖任何 UI 库） ──

/** fallback textarea 公共样式：复用主题变量，响应暗色主题 */
const FALLBACK_TEXTAREA_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '1px 6px',
  borderRadius: 'var(--fe-border-radius-sm)',
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: 'var(--fe-border-primary)',
  fontSize: 'var(--fe-font-size-sm)',
  lineHeight: '18px',
  outline: 'none',
  boxSizing: 'border-box',
  background: 'var(--fe-bg-primary)',
  color: 'var(--fe-text-primary)',
  fontFamily: 'monospace',
  resize: 'vertical',
}

const FallbackExpressionEditor: React.FC<PropertySlotProps> = ({ value, onChange }) => {
  const { locale } = useLocale()
  return (
    <textarea
      value={typeof value === 'string' ? value : ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={locale.designer.propertyPanel.expressionPlaceholder}
      rows={2}
      style={FALLBACK_TEXTAREA_STYLE}
    />
  )
}

const FallbackJsonEditor: React.FC<PropertySlotProps> = ({ value, onChange }) => {
  const { locale } = useLocale()
  return (
    <textarea
      value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
      onChange={(e) => {
        try {
          onChange(JSON.parse(e.target.value))
        } catch {
          onChange(e.target.value)
        }
      }}
      placeholder={locale.designer.propertyPanel.jsonPlaceholder}
      rows={4}
      style={FALLBACK_TEXTAREA_STYLE}
    />
  )
}

function countLines(code: string): number {
  if (!code) return 0
  return code.split('\n').length
}

// ── 编辑器样式 ──

const LINE_NUMBERS: React.CSSProperties = {
  padding: '10px 0',
  minWidth: 36,
  textAlign: 'right',
  color: '#999',
  fontFamily: "'Menlo','Consolas',monospace",
  fontSize: 13,
  lineHeight: 1.6,
  background: 'var(--fe-bg-secondary, #f6f8fa)',
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
  background: 'var(--fe-bg-primary, #fff)',
  color: 'var(--fe-text-primary, #333)',
  boxSizing: 'border-box',
}

const BUTTON_BAR: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
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
          <span style={{ fontSize: 12, color: 'var(--fe-text-secondary, #666)' }}>{language.toUpperCase()}</span>
          {onCompile && (
            <WidgetButton type="default" size="sm" onClick={doCompile} disabled={compiling}>
              {compiling ? c?.compiling || 'Compiling...' : c?.compile || 'Compile'}
            </WidgetButton>
          )}
          {statusText && (
            <span
              style={{
                fontSize: 12,
                color: compileStatus === 'success' ? 'var(--fe-success, #52c41a)' : 'var(--fe-error, #ff4d4f)',
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
            border: '1px solid var(--fe-border-primary, #e8e8e8)',
            borderRadius: 4,
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
              background: '#fff2f0',
              border: '1px solid #ffccc7',
              borderRadius: 4,
              color: '#cf1322',
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

const FallbackDataSourceEditor: React.FC<PropertySlotProps> = ({ value, onChange }) => (
  <textarea
    value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
    onChange={(e) => {
      try {
        onChange(JSON.parse(e.target.value))
      } catch {
        onChange(e.target.value)
      }
    }}
    placeholder="数据源配置（JSON）"
    rows={4}
    style={FALLBACK_TEXTAREA_STYLE}
  />
)

/**
 * 核心 fallback 映射
 */
export const defaultSlotFallbacks: Record<SlotName, React.ComponentType<PropertySlotProps>> = {
  expressionEditor: FallbackExpressionEditor,
  dataSourceEditor: FallbackDataSourceEditor,
  jsonEditor: FallbackJsonEditor,
  codeEditor: FallbackCodeEditor,
}

/**
 * 解析 Slot 组件
 *
 * 按优先级链查找：
 * 1. 运行时注入（propsRenderProps.slots.xxx）
 * 2. 全局注册（propertySlotRegistry.get('xxx')）
 * 3. Widget 兜底（w.ExpressionInput / w.DataSourceEditor 等）
 * 4. 核心兜底（defaultSlotFallbacks.xxx）
 */
export function resolveSlot(
  name: SlotName,
  slots?: PropertySlots,
  widgets?: DesignerWidgets,
): React.ComponentType<PropertySlotProps> {
  return (
    slots?.[name] ?? propertySlotRegistry.get(name) ?? getWidgetFallback(name, widgets) ?? defaultSlotFallbacks[name]
  )
}
