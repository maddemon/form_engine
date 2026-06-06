import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import React from 'react'
import { FieldRenderer, DefaultFormItem } from '../renderer/FieldRenderer'
import { isContainerComponent } from '../types/component-category'
import type { FormEngineAdapter } from '../types/adapter'
import type { FormItemProps } from '../types/adapter'
import type { FormConfig, FormFieldSchema } from '../types/schema'
import { ContainerPreview } from './ContainerPreview'
import { FieldItem } from './FieldItem'
import { useDesignerConfig, useDesignerSelection } from './DesignerContext'

/** 这些容器的 ContainerContent 内部已自行调用 FieldRenderer，外层无需重复包 label */
const SELF_RENDERED = new Set(['card', 'collapse', 'tabs'])

interface NestedFieldProps {
  field: FormFieldSchema
  parentContainerId?: string
  childIndex?: number
  /** 根级字段模式下通过 props 传入，覆盖 Context */
  selectedFieldId?: string | null
  formConfig?: FormConfig
  adapter?: FormEngineAdapter
}

export const NestedField: React.FC<NestedFieldProps> = React.memo(({ field, parentContainerId, childIndex, selectedFieldId: selectedFieldIdProp, formConfig: formConfigProp, adapter: adapterProp }) => {
  const { selectedFieldId: selectedFieldIdCtx } = useDesignerSelection()
  const { formConfig: formConfigCtx, adapter: adapterCtx } = useDesignerConfig()

  const selectedFieldId = selectedFieldIdProp ?? selectedFieldIdCtx
  const formConfig = formConfigProp ?? formConfigCtx
  const adapter = adapterProp ?? adapterCtx

  const isContainer = isContainerComponent(field.type)

  // 根级字段（无 parentContainerId）始终可排序；嵌套字段需要完整的父级信息才可排序
  const isRootMode = parentContainerId === undefined && childIndex === undefined

  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
    data: { source: 'canvas', fieldId: field.id },
    disabled: isRootMode ? false : (parentContainerId === undefined || childIndex === undefined),
  })

  const content = isContainer ? (
    <ContainerPreview field={field} />
  ) : (
    <FieldRenderer field={field} value={undefined} onChange={() => {}} options={[]} disabled={false} adapter={adapter} formConfig={formConfig} />
  )

  const needsLabel = isContainer && !SELF_RENDERED.has(field.type)
  const containerLabelProps: FormItemProps = {
    label: field.label,
    labelHidden: field.labelHidden,
    formConfig,
    scene: adapter.scene,
    children: content,
  }

  return (
    <FieldItem
      field={field}
      isSelected={selectedFieldId === field.id}
      dragListeners={listeners}
      dragAttributes={attributes}
      dragActivatorRef={setActivatorNodeRef}
      dragNodeRef={setNodeRef}
      dragStyle={{
        transform: isDragging ? undefined : CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1,
      }}
    >
      {needsLabel ? React.createElement(adapter.FormItem ?? DefaultFormItem, containerLabelProps) : content}
    </FieldItem>
  )
})
NestedField.displayName = 'NestedField'
