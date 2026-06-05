import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import React, { useMemo } from 'react'
import { FormFieldSchema } from '../../types'
import { useDesignerConfig, useDesignerSelection } from '../DesignerContext'
import { SortableField } from './SortableField'

interface RootFieldsProps {
  fields: FormFieldSchema[]
}

/** 根级字段列表：在此处统一调用 Context hook，将值通过 props 下发给 SortableField */
export const RootFields: React.FC<RootFieldsProps> = ({ fields }) => {
  const { selectedFieldId } = useDesignerSelection()
  const { formConfig, adapter } = useDesignerConfig()

  const fieldIds = useMemo(() => fields.map((f) => f.id), [fields])

  if (fields.length === 0) return null

  return (
    <SortableContext items={fieldIds} strategy={verticalListSortingStrategy}>
      {fields.map((field) => (
        <SortableField key={field.id} field={field} selectedFieldId={selectedFieldId} formConfig={formConfig} adapter={adapter} />
      ))}
    </SortableContext>
  )
}
