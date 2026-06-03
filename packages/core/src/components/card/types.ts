import type { BaseLayoutComponentProps } from '../../types/component-props'

/** Card 卡片 */
export interface CardProps extends BaseLayoutComponentProps {
  /** 卡片标题 */
  title?: string
  /** icons/iconMap 中已注册的图标名（如 'Star' / 'Info'） */
  icon?: string
  /** 是否显示边框 */
  bordered?: boolean
  /** 尺寸 */
  size?: 'default' | 'small'
  /** Body 内边距（px） */
  bodyPadding?: number
  /** Body 间距（px），透传给内部 children 容器 */
  bodyGap?: number
}
