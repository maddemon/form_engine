import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import React, { useMemo } from 'react'
import { FieldRenderer, DefaultFormItem } from '../../renderer/FieldRenderer'
import { isContainerComponent, isFormComponent } from '../../components'
import type { FormEngineAdapter } from '../../types/adapter'
import type { FormItemProps } from '../../types/adapter'
import type { FormConfig, FormFieldSchema } from '../../types/schema'
import { mergeJsxScope } from '../../renderer'
import { ContainerPreview } from '.'
import { FieldItem, type FieldItemProps } from '../FieldItem'
import { useDesignerConfig, useDesignerSelection } from '../DesignerContext'

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
  const { formConfig: formConfigCtx, adapter: adapterCtx, desktopAdapter: desktopAdapterCtx } = useDesignerConfig()

  const selectedFieldId = selectedFieldIdProp ?? selectedFieldIdCtx
  const formConfig = formConfigProp ?? formConfigCtx
  const adapter = adapterProp ?? adapterCtx

  const designerJsxScope = useMemo(
    () => mergeJsxScope(desktopAdapterCtx, adapter, adapter.scene),
    [desktopAdapterCtx, adapter],
  )

  const isContainer = isContainerComponent(field.type)
  const isRootMode = parentContainerId === undefined && childIndex === undefined

  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
    data: { source: 'canvas', fieldId: field.id },
    disabled: isRootMode ? false : (parentContainerId === undefined || childIndex === undefined),
  })

  // 缓存子内容：拖拽中不变化，避免 FieldRenderer/ContainerPreview 连锁重渲染
  const content = useMemo(
    () => (isContainer ? (
      <ContainerPreview field={field} />
    ) : (
      <FieldRenderer field={field} value={undefined} onChange={() => {}} options={[]} disabled={false} adapter={adapter} formConfig={formConfig} jsxScope={designerJsxScope} />
    )),
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

  const needsLabel = isContainer && !SELF_RENDERED.has(field.type)
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
      dragAttributes={attributes as unknown as FieldItemProps['dragAttributes']}
      dragActivatorRef={setActivatorNodeRef}
      dragNodeRef={setNodeRef}
      dragStyle={dragStyle}
    >
      {needsLabel ? React.createElement(adapter.FormItem ?? DefaultFormItem, containerLabelProps) : content}
    </FieldItem>
  )
})
NestedField.displayName = 'NestedField'
