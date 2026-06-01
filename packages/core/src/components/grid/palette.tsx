import type { ComponentPalette } from '../../types/palette'
import { GridIcon } from '../icons'
export const palette: ComponentPalette = {
  label: '栅格布局',
  category: 'container',
  icon: <GridIcon />,
  defaultProps: { componentProps: { columns: 2, gap: 16 } },
}