import { useMemo } from 'react'
import type { DeviceScene, FormItemProps } from '../../types/adapter'
import type { FormConfig, FormFieldSchema } from '../../types/schema'

export interface UseFormItemPropsArgs {
  field: FormFieldSchema
  formConfig: FormConfig
  isRequired: boolean
  errorMsg: string | undefined
  errors: string[] | undefined
  scene: DeviceScene
}

/**
 * FormItem props 组装 Hook
 *
 * 整合 label / rules / required / validateStatus / help / tooltip 等展示态属性。
 * FieldRenderer 与 NestedField 内部 ContainerPreview 都使用同一份 FormItem 装配逻辑。
 */
export function useFormItemProps({ field, formConfig, isRequired, errorMsg, errors, scene }: UseFormItemPropsArgs): Omit<FormItemProps, 'children'> {
  return useMemo<Omit<FormItemProps, 'children'>>(
    () => ({
      name: field.name,
      label: field.label,
      labelHidden: field.labelHidden,
      rules: field.rules,
      required: isRequired,
      validateStatus: errorMsg ? ('error' as const) : undefined,
      errors,
      help: field.help,
      tooltip: field.tooltip,
      formConfig,
      scene,
    }),
    [field.name, field.label, field.labelHidden, field.rules, field.help, field.tooltip, isRequired, errorMsg, errors, formConfig, scene],
  )
}
