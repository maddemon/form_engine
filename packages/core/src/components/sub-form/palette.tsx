import type { ComponentPalette } from '../../types/palette'
import { SubFormIcon } from '../icons'
export const palette: ComponentPalette = {
  label: '子表单',
  category: 'form',
  icon: <SubFormIcon />,
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
