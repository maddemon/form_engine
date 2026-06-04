import type { ComponentPalette } from '../../types/palette'
import { Layout } from '../icons'

export const palette: ComponentPalette = {
  label: '卡片',
  category: 'container',
  icon: <Layout />,
  defaultProps: {
    componentProps: {
      title: '卡片标题',
      bodyPadding: 16,
      bodyGap: 8,
      bordered: true,
      size: 'default',
    },
  },
}
