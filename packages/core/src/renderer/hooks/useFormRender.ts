import { useCallback, useMemo } from 'react'
import type { FormSchema, OptionItem } from '../../types/schema'
import type { EventContext } from '../../events'
import type { EventCallbacks, $Form } from '../../types/events'
import type { DataSourceResolver } from '../../types/render'
import type { ValidateFn } from '../../types/adapter'
import { validateForm } from '../validate'
import { useFormValues } from './useFormValues'
import { useFormValidation } from './useFormValidation'
import { useDataSource } from './useDataSource'
import { useVisibility } from './useVisibility'

export interface UseFormRenderOptions {
  schema: FormSchema
  initialValues?: Record<string, unknown>
  onSubmit?: (values: Record<string, unknown>) => void
  onChange?: (values: Record<string, unknown>) => void
  dataSourceResolver?: DataSourceResolver
  callbacks?: EventCallbacks
  /** adapter 的校验函数，由 FormRenderInner 传入 resolvedAdapter?.validate */
  adapterValidate?: ValidateFn
  /** 提交前钩子 */
  beforeSubmit?: (values: Record<string, unknown>) => Record<string, unknown> | false | void
  /** 提交后钩子 */
  afterSubmit?: (values: Record<string, unknown>, success: boolean) => void
}

export interface UseFormRenderResult {
  formValues: Record<string, unknown>
  formValuesRef: { current: Record<string, unknown> }
  visibleFields: FormSchema['fields']
  fieldErrors: Record<string, string[]>
  fieldOptions: Record<string, OptionItem[]>
  handleFieldChange: (name: string, value: unknown) => void
  handleSubmit: () => void
  $form: $Form
  eventContext: EventContext
  reset: () => void
  validate: (name?: string) => Promise<boolean>
  setFieldErrors: React.Dispatch<React.SetStateAction<Record<string, string[]>>>
  setFieldOptions: React.Dispatch<React.SetStateAction<Record<string, OptionItem[]>>>
}

export function useFormRender({
  schema, initialValues, onSubmit, onChange,
  dataSourceResolver, callbacks = {},
  adapterValidate, beforeSubmit, afterSubmit,
}: UseFormRenderOptions): UseFormRenderResult {
  const formSchema = useMemo(() => schema, [schema])

  const {
    formValues, formValuesRef, setFormValues,
    setFieldValue, setFieldsValue, getFieldValue,
    reset: resetValues, submit: submitValues, debouncedOnChange,
  } = useFormValues({ initialValues: initialValues ?? {}, onChange })

  const {
    fieldErrors, fieldOptions, setFieldErrors, setFieldOptions,
    validate: validateRaw, clearFieldError, clearAllErrors,
  } = useFormValidation()

  useDataSource({
    formSchema, formValues, formValuesRef,
    setFieldOptions, dataSourceResolver,
  })

  const { visibleFields } = useVisibility(formSchema, formValues)

  const handleFieldChange = useCallback((name: string, value: unknown) => {
    setFormValues((prev) => ({ ...prev, [name]: value }))
    clearFieldError(name)
    debouncedOnChange()
  }, [clearFieldError, debouncedOnChange])

  const reset = useCallback(() => {
    resetValues()
    clearAllErrors()
  }, [resetValues, clearAllErrors])

  const validate = useCallback(
    async (name?: string): Promise<boolean> => {
      const doValidate = adapterValidate ?? validateForm
      const result = await Promise.resolve(doValidate(formSchema.fields, formValues, name))
      if (!result.valid) {
        console.warn('[form-engine] 校验失败:', result.errors)
      }
      return result.valid
    },
    [adapterValidate, formSchema.fields, formValues],
  )

  const handleSubmit = useCallback(() => {
    // 1. beforeSubmit 钩子
    let submitValues_ = formValuesRef.current
    if (beforeSubmit) {
      const result = beforeSubmit(formValuesRef.current)
      if (result === false) return // 阻止提交
      // 返回对象时转换数据（后续校验和提交使用转换后的值）
      if (result && typeof result === 'object') {
        submitValues_ = result
      }
    }

    // 2. 校验（adapter.validate 优先，内置兜底）
    const doValidate = adapterValidate ?? validateForm
    Promise.resolve(doValidate(visibleFields, submitValues_))
      .then((result) => {
        if (!result.valid) {
          setFieldErrors(result.errors)
          afterSubmit?.(submitValues_, false)
          return
        }
        // 3. 校验成功，提交
        setFieldErrors({})
        if (onSubmit) onSubmit(submitValues_)
        afterSubmit?.(submitValues_, true)
      })
      .catch((err) => {
        console.error('[form-engine] 校验异常:', err)
      })
  }, [visibleFields, formValuesRef, setFieldErrors, onSubmit, adapterValidate, beforeSubmit, afterSubmit])

  const $form: $Form = useMemo(() => ({
    get values() { return formValuesRef.current },
    setFieldValue,
    setFieldsValue,
    getFieldValue,
    submit: () => submitValues(onSubmit),
    reset,
    validate,
  }), [setFieldValue, setFieldsValue, getFieldValue, submitValues, reset, validate, onSubmit])

  const eventContext: EventContext = useMemo(
    () => ({ formValues, $form, callbacks }),
    [formValues, $form, callbacks],
  )

  return {
    formValues, formValuesRef, visibleFields,
    fieldErrors, fieldOptions,
    handleFieldChange, handleSubmit,
    $form, eventContext, reset, validate,
    setFieldErrors, setFieldOptions,
  }
}
