import type { ComponentPalette } from '../../types/palette'
import { GridIcon, TableIcon } from '../icons'
export const palette: ComponentPalette = {
  label: '表格',
  category: 'container',
  icon: <TableIcon />,
  defaultProps: {
    componentProps: {
      columns: [
        { label: '列1', width: 50, minWidth: 20 },
        { label: '列2', width: 50, minWidth: 20 },
      ],
      rowMode: 'dynamic',
    },
  },
}