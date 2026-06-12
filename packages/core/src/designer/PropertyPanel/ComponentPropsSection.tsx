import CustomPropsRender from '../../propRenders/CustomPropsRender'
import type { PropsRenderProps } from '../../propRenders/types'
import { useStyle } from '../../styles'
import type { DesignerWidgets } from '../../types/adapter'
import type { CustomComponentConfig } from '../../types/custom-component'
import type { DesignerAction } from '../../types/designer'
import type { PropertySlots } from '../../types/property-slot'
import type { FieldDataSource, FormFieldSchema } from '../../types/schema'
import { Divider } from '../../widgets/Divider'
import { useDebouncedObjectMap } from '../hooks/useDebouncedInput'

interface ComponentPropsSectionProps {
  field: FormFieldSchema
  w: DesignerWidgets
  dispatch: React.Dispatch<DesignerAction>
  ComponentPropsRender: React.ComponentType<PropsRenderProps> | undefined
  customConfig: CustomComponentConfig | null
  slots?: PropertySlots
}

/** 组件属性编辑区：含防抖逻辑 */
export function ComponentPropsSection({
  field,
  w,
  dispatch,
  ComponentPropsRender,
  customConfig,
  slots,
}: ComponentPropsSectionProps) {
  const { token } = useStyle()

  const [localComponentProps, handleComponentPropsChange] = useDebouncedObjectMap(
    field.componentProps || {},
    (next) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id, patch: { componentProps: next } }),
  )

  if (!ComponentPropsRender && !customConfig?.propertyConfig?.length) {
    return null
  }

  return (
    <>
      <Divider style={{ marginTop: token('spacingSm') }} />
      {ComponentPropsRender ? (
        <ComponentPropsRender
          widgets={w}
          values={localComponentProps}
          onChange={handleComponentPropsChange}
          dataSource={field.dataSource}
          onDataSourceChange={(ds: FieldDataSource) => {
            dispatch({ type: 'UPDATE_FIELD', fieldId: field.id, patch: { dataSource: ds } })
          }}
          slots={slots}
        />
      ) : customConfig?.propertyConfig ? (
        <CustomPropsRender
          configs={customConfig.propertyConfig}
          widgets={w}
          values={localComponentProps}
          onChange={handleComponentPropsChange}
          slots={slots}
        />
      ) : null}
    </>
  )
}
