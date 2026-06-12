import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import React, { useMemo } from 'react'
import { isContainerComponent, isFormComponent } from '../../components'
import { mergeJsxScope } from '../../renderer'
import { DefaultFormItem, FieldRenderer } from '../../renderer/FieldRenderer'
import type { FormItemProps } from '../../types/adapter-form'
import type { FormFieldSchema } from '../../types/schema'
import { useDesignerAdapters, useDesignerFormConfig, useDesignerSelection } from '../DesignerContext'
import { FieldItem, type FieldItemProps } from '../FieldItem'
import { ContainerPreview } from './ContainerPreview'
import { SELF_RENDERED_CONTAINERS } from './types'

interface NestedFieldProps {
  field: FormFieldSchema
  parentContainerId?: string
  childIndex?: number
}

export const NestedField: React.FC<NestedFieldProps> = React.memo(({ field, parentContainerId, childIndex }) => {
  const { selectedFieldId } = useDesignerSelection()
  const formConfig = useDesignerFormConfig()
  const { adapter, desktopAdapter } = useDesignerAdapters()

  const designerJsxScope = useMemo(
    () => mergeJsxScope(desktopAdapter, adapter, adapter.scene),
    [desktopAdapter, adapter],
  )

  const isContainer = isContainerComponent(field.type)
  const isRootMode = parentContainerId === undefined && childIndex === undefined

  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
    data: { source: 'canvas', fieldId: field.id },
    disabled: isRootMode ? false : parentContainerId === undefined || childIndex === undefined,
  })

  // 缓存子内容：拖拽中不变化，避免 FieldRenderer/ContainerPreview 连锁重渲染
  const content = useMemo(
    () =>
      isContainer ? (
        <ContainerPreview field={field} />
      ) : (
        <FieldRenderer
          field={field}
          value={undefined}
          onChange={() => {}}
          options={[]}
          disabled={false}
          adapter={adapter}
          formConfig={formConfig}
          jsxScope={designerJsxScope}
        />
      ),
    [field, adapter, formConfig, designerJsxScope, isContainer],
  )

  // 排序时由 SortableContext 自动计算 transform 偏移，配合 transition 实现丝滑碰撞
  const dragStyle = useMemo(
    () => ({
      transform: isDragging ? undefined : CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0 : 1,
    }),
    [transform, transition, isDragging],
  )

  const needsLabel = isContainer && !SELF_RENDERED_CONTAINERS.has(field.type)
  const isFormLike = isFormComponent(field.type)
  const containerLabelProps: FormItemProps = {
    label: field.label,
    labelHidden: field.labelHidden,
    required: isFormLike ? field.rules?.some((r) => r.required) : undefined,
    formConfig,
    scene: adapter.scene,
    children: content,
  }

  return (
    <FieldItem
      field={field}
      isSelected={selectedFieldId === field.id}
      dragListeners={listeners as FieldItemProps['dragListeners']}
      dragAttributes={attributes as unknown as Record<string, unknown>}
      dragActivatorRef={setActivatorNodeRef}
      dragNodeRef={setNodeRef}
      dragStyle={dragStyle}
    >
      {needsLabel ? React.createElement(adapter.FormItem ?? DefaultFormItem, containerLabelProps) : content}
    </FieldItem>
  )
})
NestedField.displayName = 'NestedField'
