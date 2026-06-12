import React from 'react'

interface FormErrorBoundaryProps {
  children: React.ReactNode
}

interface FormErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * 顶层 Error Boundary — 包裹整个 FormRender 组件树。
 * 捕获非字段级异常（如 StyleProvider 初始化失败、dataSource 解析崩溃），
 * 避免整棵树白屏。
 *
 * 使用 CSS 变量引用主题 token（class component 无法使用 hooks）。
 */
export class FormErrorBoundary extends React.Component<FormErrorBoundaryProps, FormErrorBoundaryState> {
  constructor(props: FormErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): FormErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('[form-engine] FormRender error:', error, errorInfo)
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: 'var(--fe-spacing-md)',
            borderRadius: 'var(--fe-border-radius-md)',
            border: '1px solid var(--fe-error)',
            background: 'var(--fe-error-bg)',
            color: 'var(--fe-error)',
            fontSize: 'var(--fe-font-size-sm)',
          }}
        >
          <div style={{ fontWeight: 500, marginBottom: 'var(--fe-spacing-xs)' }}>
            Form render error
          </div>
          <div style={{ color: 'var(--fe-text-tertiary)', wordBreak: 'break-all' }}>
            {this.state.error?.message ?? 'Unknown error'}
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
