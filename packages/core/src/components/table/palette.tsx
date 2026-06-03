import type { ComponentPalette } from '../../types/palette'
import { TableIcon } from '../icons'
export const palette: ComponentPalette = {
  label: '表格',
  category: 'container',
  icon: <TableIcon />,
  defaultProps: {
    componentProps: {
      columns: [
        { id: 'col_1', label: '列1', width: 120 },
        { id: 'col_2', label: '列2', width: 120 },
      ],
      rowMode: 'dynamic',
    },
  },
}