import type { FormConfig } from '../../types/schema'
import type { FormEngineAdapter } from '../../types/adapter'
import type { FormFieldSchema } from '../../types/schema'

export interface SortableFieldProps {
  field: FormFieldSchema
  selectedFieldId: string | null
  formConfig: FormConfig
  adapter: FormEngineAdapter
}
