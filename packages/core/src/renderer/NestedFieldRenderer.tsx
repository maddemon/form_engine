import React, { useCallback, useMemo } from 'react'
import { isContainerComponent } from '../components'
import type { FormFieldSchema } from '../types/schema'
import { FieldRenderer } from './FieldRenderer'
import { useFormEngine } from './FormEngineContext'
import { useFormState } from './FormStateContext'
import { useFormConfig } from './FormConfigContext'
import { InsideContainerContext } from './InsideContainerContext'

interface NestedFieldRendererProps {
  field: FormFieldSchema
  onFieldChange: (name: string, value: unknown) => void
}

const NestedFieldRenderer: React.FC<NestedFieldRendererProps> = React.memo(({ field, onFieldChange }) => {
  const { adapter, components, loading } = useFormEngine()
  const { formValues, fieldOptions, fieldErrors, eventContext } = useFormState()
  const formConfig = useFormConfig()

  const isContainer = isContainerComponent(field.type)

  const handleChange = useCallback((val: unknown) => onFieldChange(field.name, val), [field.name, onFieldChange])

  const enhancedField: FormFieldSchema = useMemo(() => {
    if (!isContainer || !field.children.length) return field
    const childNodes = field.children.map((child) => (
      <InsideContainerContext.Provider key={child.id} value={true}>
        <NestedFieldRenderer field={child} onFieldChange={onFieldChange} />
      </InsideContainerContext.Provider>
    ))
    return { ...field, componentProps: { ...field.componentProps, children: childNodes } }
  }, [field, isContainer, onFieldChange])

  return (
    <FieldRenderer
      field={enhancedField}
      value={formValues[field.name]}
      onChange={handleChange}
      options={fieldOptions[field.name] || []}
      disabled={loading || field.disabled === true}
      adapter={adapter}
      components={components}
      eventContext={eventContext}
      errors={fieldErrors[field.name]}
      formConfig={formConfig}
    />
  )
})
NestedFieldRenderer.displayName = 'NestedFieldRenderer'

export { NestedFieldRenderer }