import type { ComponentPalette } from '../../types/palette'
import { Type } from '../icons'
export const palette: ComponentPalette = {
  label: '标题',
  category: 'display',
  icon: <Type />,
  defaultProps: { componentProps: { level: 1, content: '标题内容' } },
}