import React from 'react'
import type { FormWrapperProps } from '../types/adapter-form'

/** 内置默认 Form 容器 — 使用原生 <form> 元素 */
const DefaultFormWrapper: React.FC<FormWrapperProps> = ({ onSubmit, children, className, style }) => (
  <form
    onSubmit={(e) => {
      e.preventDefault()
      onSubmit?.()
    }}
    onKeyDown={(e) => {
      if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') {
        e.preventDefault()
      }
    }}
    className={className}
    style={style}
  >
    {children}
  </form>
)

export { DefaultFormWrapper }