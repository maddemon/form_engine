import type { ComponentPalette } from '../../types/palette'
import { ImageIcon } from '../icons'
export const palette: ComponentPalette = {
  label: '图片展示',
  category: 'display',
  icon: <ImageIcon />,
  defaultProps: { componentProps: { alt: '图片描述', src: '' } },
}