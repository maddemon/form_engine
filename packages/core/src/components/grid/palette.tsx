import type { ComponentPalette } from '../../types/palette'
import { GridIcon } from '../icons'
export const palette: ComponentPalette = {
  label: '栅格布局',
  category: 'container',
  icon: <GridIcon />,
  defaultProps: {
    componentProps: {
      colSpans: [
        { id: 'col_1', span: 12 },
        { id: 'col_2', span: 12 },
      ],
      gap: 16,
    },
  },
}