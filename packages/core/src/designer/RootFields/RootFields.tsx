import { SortableContext, verticalListSortingStrategy, type SortingStrategy } from '@dnd-kit/sortable'
import React, { useMemo } from 'react'
import { FormFieldSchema } from '../../types'
import { useDesignerConfig, useDesignerSelection } from '../DesignerContext'
import type { DragOverState } from '../Dnd/useDndHandlers'
import { DropIndicator } from '../DropIndicator'
import { NestedField } from '../NestedField'

/** 拖到容器上方时不触发同级排序碰撞（transforms 归零） */
const containerAwareStrategy: SortingStrategy = (args) => {
  const overId = (args as unknown as { over?: { id: string } }).over?.id
  if (overId && (overId.endsWith('__container') || overId.includes('__region_'))) {
    return { x: 0, y: 0, scaleX: 1, scaleY: 1 }
  }
  return verticalListSortingStrategy(args)
}

interface RootFieldsProps {
  fields: FormFieldSchema[]
  dragOverState?: DragOverState | null
}

/** 根级字段列表：在此处统一调用 Context hook，将值通过 props 下发给 NestedField */
export const RootFields: React.FC<RootFieldsProps> = ({ fields, dragOverState }) => {
  const { selectedFieldId } = useDesignerSelection()
  const { formConfig, adapter } = useDesignerConfig()

  const fieldIds = useMemo(() => fields.map((f) => f.id), [fields])

  const showIndicator = dragOverState != null && dragOverState.parentId === undefined && dragOverState.source === 'palette'

  if (fields.length === 0) return null

  return (
    <SortableContext items={fieldIds} strategy={containerAwareStrategy}>
      {showIndicator && dragOverState!.index === 0 && <DropIndicator />}
      {fields.map((field, index) => (
        <React.Fragment key={field.id}>
          <NestedField field={field} selectedFieldId={selectedFieldId} formConfig={formConfig} adapter={adapter} />
          {showIndicator && dragOverState!.index === index + 1 && <DropIndicator />}
        </React.Fragment>
      ))}
    </SortableContext>
  )
}
