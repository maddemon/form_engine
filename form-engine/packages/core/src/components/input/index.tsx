import React from 'react'
import type { InputProps } from './types'
import { useStyle } from '../../styles/useStyle'

/**
 * HTML Input 组件（默认实现）
 *
 * 使用主题 Token，支持通过 CSS 变量或 StyleProvider 自定义样式
 */
export const Input = (props: { value?: string; onChange?: (v: any) => void; placeholder?: string; disabled?: boolean; readOnly?: boolean; type?: string; maxLength?: number; allowClear?: boolean; style?: React.CSSProperties; className?: string; id?: string } & Record<string, any>) => {
  const {
    value,
    onChange,
    placeholder,
    disabled,
    readOnly,
    type = 'text',
    maxLength,
    allowClear,
    style: propsStyle,
    className,
    id,
    ...rest
  } = props

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value)
  }

  const handleClear = () => {
    onChange?.('')
  }

  const { token } = useStyle()

  const spacingMd = token('spacingMd') as number

  // 输入框样式 - 使用主题 Token
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: token('inputPadding') as string,
    paddingRight: allowClear && value ? `calc(${spacingMd * 2 + 8}px)` : undefined,
    background: disabled ? token('disabledBg') as string : token('inputBg') as string,
    border: token('inputBorder') as string,
    borderRadius: token('inputBorderRadius') as string,
    color: token('textPrimary') as string,
    fontSize: token('fontSizeMd') as number,
    cursor: disabled ? 'not-allowed' : readOnly ? 'default' : 'text',
    opacity: disabled ? 0.5 : 1,
    outline: 'none',
    transition: String(token('transitionAll')),
    boxSizing: 'border-box',
    ...propsStyle,
  }

  // 清除按钮样式
  const clearButtonStyle: React.CSSProperties = {
    position: 'absolute',
    right: spacingMd,
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    color: token('textQuaternary') as string,
    fontSize: token('fontSizeLg') as number,
    lineHeight: 1,
    userSelect: 'none',
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        type={type === 'password' ? 'password' : 'text'}
        value={(value as string) || ''}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        maxLength={maxLength}
        id={id}
        className={className}
        style={inputStyle}
        {...rest}
      />
      {allowClear && value && (
        <span
          onClick={handleClear}
          style={clearButtonStyle}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleClear()
            }
          }}
        >
          ×
        </span>
      )}
    </div>
  )
}

/**
 * HTML Password 组件（复用 Input）
 */
export const Password: React.FC<InputProps> = (props) => {
  return <Input {...props} type="password" />
}
