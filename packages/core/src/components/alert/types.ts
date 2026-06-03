import type { BaseComponentProps } from '../../types/component-props'
import type { EventDeclaration } from '../../types/events'

/** Alert 警告提示 */
export interface AlertProps extends BaseComponentProps {
  /** 类型 */
  type?: 'primary' | 'info' | 'success' | 'warning' | 'error'
  /** 标题（antd 中对应 message） */
  title?: string
  /** 内容（antd 中对应 description） */
  content: string
  /** 是否显示图标 */
  showIcon?: boolean
  /** 是否可关闭 */
  closable?: boolean
  /** 自定义图标（icons/iconMap 已注册名） */
  icon?: string
}

export const alertEventDeclarations: EventDeclaration[] = [
  { name: 'onClose', label: '关闭', description: '点击关闭按钮时触发' },
]
