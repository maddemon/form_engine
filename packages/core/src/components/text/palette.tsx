import type { ComponentPalette } from '../../types/palette'
import { Type } from '../icons'
export const palette: ComponentPalette = {
  label: '文本展示',
  category: 'display',
  icon: <Type />,
  defaultProps: { componentProps: { content: '文本内容' } },
}