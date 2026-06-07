import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useStyle } from '../styles'
import { WidgetButton } from './Button'
import { InputOverlayButton } from './InputOverlayButton'
import { WidgetModal } from './Modal'
import { BASE_STYLE, FOCUS_STYLE } from './shared'
import { WidgetTextArea } from './TextArea'

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
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setText(value)
    }
    prevOpenRef.current = open
  }, [open, value])

  const insertFieldName = (name: string) => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    setText((prev) => {
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

  return (
    <WidgetModal open={open} title="编辑表达式" width="md" onCancel={onCancel} onConfirm={() => onConfirm(text)}>
      <WidgetTextArea ref={textareaRef} value={text} onChange={setText} rows={8} style={{ fontFamily: 'monospace' }} />

      {fieldNames.length > 0 && (
        <div style={{ marginTop: token('spacingSm') }}>
          <div
            style={{
              fontSize: token('fontSizeXs'),
              color: 'var(--fe-text-tertiary)',
              marginBottom: token('spacingXs'),
            }}
          >
            可用字段（点击插入）
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: token('spacingXs'), maxHeight: 120, overflow: 'auto' }}>
            {fieldNames.map((name) => (
              <WidgetButton key={name} size="sm" onClick={() => insertFieldName(name)}>
                {name}
              </WidgetButton>
            ))}
          </div>
        </div>
      )}
    </WidgetModal>
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
}> = React.memo(({ value, onChange, placeholder, disabled, fieldNames = [], style }) => {
  const { token } = useStyle()
  const [focused, setFocused] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  // 非受控输入：父组件 external value 变化时同步到 input
  // focused 时不覆盖，避免打断用户输入
  useEffect(() => {
    if (inputRef.current && !focused && inputRef.current.value !== (value ?? '')) {
      inputRef.current.value = value ?? ''
    }
  }, [value, focused])

  const handleModalConfirm = useCallback((v: string) => {
    onChangeRef.current?.(v)
    setModalOpen(false)
  }, [])

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', position: 'relative', ...style }}>
        <input
          ref={inputRef}
          type="text"
          defaultValue={value ?? ''}
          onChange={(e) => onChangeRef.current?.(e.target.value)}
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
        <InputOverlayButton
          onClick={() => setModalOpen(true)}
          disabled={disabled}
          title="编辑表达式"
          style={{
            color: focused ? 'var(--fe-primary)' : 'var(--fe-text-tertiary)',
            fontSize: token('fontSizeSm') as string,
          }}
        >
          ƒ
        </InputOverlayButton>
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
})
