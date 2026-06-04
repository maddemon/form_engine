import React, { useCallback, useRef, useState } from 'react'
import { useStyle } from '../styles'
import { BASE_STYLE, FOCUS_STYLE } from './shared'

/** 表达式编辑弹窗 */
function ExpressionModal({
  open,
  value,
  fieldNames,
  onConfirm,
  onCancel,
}: {
  open: boolean
  value: string
  fieldNames: string[]
  onConfirm: (v: string) => void
  onCancel: () => void
}) {
  const { token } = useStyle()
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const prevOpenRef = useRef(false)

  // 仅在 open 从 false→true 时同步 value
  React.useEffect(() => {
    if (open && !prevOpenRef.current) {
      setText(value)
    }
    prevOpenRef.current = open
  }, [open, value])

  if (!open) return null

  const insertFieldName = (name: string) => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    setText(prev => {
      const before = prev.slice(0, start)
      const after = prev.slice(end)
      const newText = before + name + after
      // 恢复光标位置到插入内容之后
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + name.length
        textarea.focus()
      })
      return newText
    })
  }

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'var(--fe-bg-mask)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  }

  const modalStyle: React.CSSProperties = {
    background: 'var(--fe-bg-primary)',
    borderRadius: token('borderRadiusLg'),
    boxShadow: token('shadowLg'),
    width: token('modalWidthMd'),
    maxWidth: '90vw',
    padding: token('spacingLg'),
  }

  return (
    <div style={overlayStyle} onClick={onCancel}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: token('fontSizeMd'), fontWeight: 500, marginBottom: token('spacingSm') }}>
          编辑表达式
        </div>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value)}
          rows={8}
          style={{
            width: '100%',
            padding: token('spacingXs'),
            border: `1px solid var(--fe-border-primary)`,
            borderRadius: token('borderRadiusSm'),
            fontSize: token('fontSizeSm'),
            fontFamily: 'monospace',
            lineHeight: 1.5,
            resize: 'vertical',
            outline: 'none',
            boxSizing: 'border-box',
            background: 'var(--fe-bg-primary)',
            color: 'var(--fe-text-primary)',
          }}
        />

        {fieldNames.length > 0 && (
          <div style={{ marginTop: token('spacingSm') }}>
            <div style={{ fontSize: token('fontSizeXs'), color: 'var(--fe-text-tertiary)', marginBottom: token('spacingXs') }}>
              可用字段（点击插入）
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: token('spacingXs'), maxHeight: 120, overflow: 'auto' }}>
              {fieldNames.map(name => (
                <button
                  key={name}
                  type="button"
                  onClick={() => insertFieldName(name)}
                  style={{
                    padding: '1px 6px',
                    border: `1px solid var(--fe-border-primary)`,
                    borderRadius: token('borderRadiusSm'),
                    background: 'var(--fe-bg-tertiary)',
                    cursor: 'pointer',
                    fontSize: token('fontSizeXs'),
                    fontFamily: 'monospace',
                    color: 'var(--fe-primary)',
                    lineHeight: '18px',
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: token('spacingSm'), marginTop: token('spacingMd') }}>
          <button
            onClick={onCancel}
            style={{
              padding: '4px 12px',
              border: `1px solid var(--fe-border-primary)`,
              borderRadius: token('borderRadiusSm'),
              background: 'var(--fe-bg-primary)',
              cursor: 'pointer',
              fontSize: token('fontSizeSm'),
              color: 'var(--fe-text-primary)',
            }}
          >
            取消
          </button>
          <button
            onClick={() => onConfirm(text)}
            style={{
              padding: '4px 12px',
              border: `1px solid var(--fe-primary)`,
              borderRadius: token('borderRadiusSm'),
              background: 'var(--fe-primary)',
              cursor: 'pointer',
              fontSize: token('fontSizeSm'),
              color: 'var(--fe-bg-primary)',
            }}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  )
}

export const WidgetExpressionInput: React.FC<{
  value?: string
  onChange?: (v: string) => void
  placeholder?: string
  disabled?: boolean
  /** 已存在的字段名称列表，弹窗中点击可插入光标位置 */
  fieldNames?: string[]
  style?: React.CSSProperties
}> = ({ value, onChange, placeholder, disabled, fieldNames = [], style }) => {
  const { token } = useStyle()
  const [focused, setFocused] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  const handleModalConfirm = useCallback((v: string) => {
    onChange?.(v)
    setModalOpen(false)
  }, [onChange])

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', position: 'relative', ...style }}>
        <input
          type="text"
          value={value ?? ''}
          onChange={e => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            ...BASE_STYLE,
            ...(focused ? FOCUS_STYLE : {}),
            opacity: disabled ? 0.5 : 1,
            cursor: disabled ? 'not-allowed' : 'text',
            paddingRight: token('spacingLg'),
            width: '100%',
          }}
        />
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          onMouseDown={e => e.preventDefault()}
          disabled={disabled}
          title="编辑表达式"
          style={{
            position: 'absolute',
            right: 1,
            top: '50%',
            transform: 'translateY(-50%)',
            border: 'none',
            background: 'transparent',
            cursor: disabled ? 'not-allowed' : 'pointer',
            color: focused ? 'var(--fe-primary)' : 'var(--fe-text-tertiary)',
            fontSize: token('fontSizeSm'),
            padding: `0 ${token('spacingXs')}`,
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          ƒ
        </button>
      </div>

      <ExpressionModal
        open={modalOpen}
        value={value ?? ''}
        fieldNames={fieldNames}
        onConfirm={handleModalConfirm}
        onCancel={() => setModalOpen(false)}
      />
    </>
  )
}
