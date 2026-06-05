import type { PaletteGroup, PaletteItem } from '../../types/designer'
import type { FieldType, FormFieldSchema } from '../../types'

export interface FieldListProps {
  groups?: PaletteGroup[]
  excludeTypes?: string[]
  width?: number | string
  sidePanelTabs?: import('../../types/designer').SidePanelTab[]
  fields?: FormFieldSchema[]
  selectedFieldId?: string | null
  dispatch?: React.Dispatch<import('../../types/designer').DesignerAction>
}

export interface PaletteItemCardProps {
  item: PaletteItem
}

export const MIN_PALETTE_WIDTH = 160
export const COMPONENT_LIB_TAB_KEY = '__component-lib__'
