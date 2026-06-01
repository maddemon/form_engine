import type { ComponentPalette } from '../../types/palette'
import { Layout } from '../icons'
export const palette: ComponentPalette = {
  label: '弹性布局',
  category: 'container',
  icon: <Layout />,
  defaultProps: { componentProps: { direction: 'horizontal', gap: 16 } },
}