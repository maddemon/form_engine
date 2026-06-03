import type { BaseLayoutComponentProps } from '../../types/component-props'

/** Grid / Row / Col */
export interface GridProps extends BaseLayoutComponentProps {
  /** 列配置。每项 1-24，sum(colSpans) ≤ 24，至少 1 列 */
  colSpans?: Array<{ id: string; span: number }>
  /** 间距 */
  gap?: number | [number, number]
  /** 布局模式 */
  variant?: 'grid' | 'flex'
}