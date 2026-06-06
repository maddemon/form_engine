import React from 'react'
import { FieldRenderer } from '../../renderer/FieldRenderer'
import type { FormEngineAdapter } from '../../types/adapter'
import type { FormConfig, FormFieldSchema } from '../../types/schema'

interface SelfRenderedContainerProps {
  field: FormFieldSchema
  children: React.ReactNode
  adapter: FormEngineAdapter
  formConfig: FormConfig
}

/**
 * 自渲染容器：将 children 注入 field.componentProps.children，
 * 然后用 FieldRenderer 渲染，外层包 pointerEvents: 'auto'。
 *
 * Card/Collapse/Tabs 三种容器共享此模式。
 */
export const SelfRenderedContainer: React.FC<SelfRenderedContainerProps> = React.memo(({ field, children, adapter, formConfig }) => {
  const enhancedField: FormFieldSchema = {
    ...field,
    componentProps: { ...field.componentProps, children },
  }

  return (
    <div style={{ pointerEvents: 'auto' }}>
      <FieldRenderer
        field={enhancedField}
        value={undefined}
        onChange={() => {}}
        options={[]}
        disabled={false}
        adapter={adapter}
        formConfig={formConfig}
      />
    </div>
  )
})
SelfRenderedContainer.displayName = 'SelfRenderedContainer'
