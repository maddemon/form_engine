import React from 'react'

interface FieldErrorBoundaryProps {
  children: React.ReactNode
  /** 出错时显示的字段名（用于错误提示） */
  fieldName?: string
  /**
   * 重置 keys — 当这些值变化时，自动清除错误状态并重新渲染子组件。
   * 典型用法：传入 field.name 或 field.id，当字段数据变化后自动恢复。
   *
   * @example
   * <FieldErrorBoundary fieldName={field.label} resetKeys={[field.name]}>
   *   <FieldRenderer ... />
   * </FieldErrorBoundary>
   */
  resetKeys?: unknown[]
}

interface FieldErrorBoundaryState {
  hasError: boolean
  error: Error | null
  /** 上一次的 resetKeys，用于检测变化 */
  prevResetKeys: unknown[]
}

/**
 * 字段级 Error Boundary
 *
 * 包裹单个 FieldRenderer，捕获 adapter 组件抛出的渲染异常。
 * 单个字段出错时显示 fallback UI，不影响其他字段正常渲染。
 *
 * 支持 resetKeys：当 resetKeys 变化时自动清除错误状态，
 * 无需父组件通过 key 变更触发重新挂载。
 *
 * 使用 CSS 变量引用主题 token（class component 无法使用 hooks）。
 */
export class FieldErrorBoundary extends React.Component<FieldErrorBoundaryProps, FieldErrorBoundaryState> {
  constructor(props: FieldErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, prevResetKeys: props.resetKeys ?? [] }
  }

  static getDerivedStateFromError(error: Error): FieldErrorBoundaryState {
    return { hasError: true, error, prevResetKeys: [] }
  }

  static getDerivedStateFromProps(
    props: FieldErrorBoundaryProps,
    state: FieldErrorBoundaryState,
  ): Partial<FieldErrorBoundaryState> | null {
    if (state.hasError && props.resetKeys && props.resetKeys.length > 0) {
      const prevKeys = state.prevResetKeys
      const nextKeys = props.resetKeys
      if (prevKeys.length !== nextKeys.length || prevKeys.some((k, i) => k !== nextKeys[i])) {
        return { hasError: false, error: null, prevResetKeys: nextKeys }
      }
    }
    return { prevResetKeys: props.resetKeys ?? [] }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error(`[form-engine] Field "${this.props.fieldName ?? 'unknown'}" render error:`, error, errorInfo)
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: 'var(--fe-spacing-xs) var(--fe-spacing-sm)',
            margin: 'var(--fe-spacing-xs) 0',
            borderRadius: 'var(--fe-border-radius-sm)',
            border: '1px solid var(--fe-error)',
            background: 'var(--fe-error-bg)',
            color: 'var(--fe-error)',
            fontSize: 'var(--fe-font-size-xs)',
          }}
        >
          <div style={{ fontWeight: 500, marginBottom: 'var(--fe-spacing-xs)' }}>
            {this.props.fieldName ? `Field "${this.props.fieldName}" ` : ''}render error
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
