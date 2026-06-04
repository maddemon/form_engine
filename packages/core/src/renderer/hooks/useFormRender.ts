import { useCallback, useMemo } from 'react'
import type { FormSchema, OptionItem } from '../../types/schema'
import type { EventContext } from '../../events'
import type { EventCallbacks, $Form } from '../../types/events'
import type { DataSourceResolver } from '../../types/render'
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
      return validateRaw(formSchema.fields, formValues, name)
    },
    [validateRaw, formSchema.fields, formValues],
  )

  const handleSubmit = useCallback(() => {
    const result = validateForm(visibleFields, formValuesRef.current)
    if (!result.valid) {
      setFieldErrors(result.errors)
      return
    }
    setFieldErrors({})
    submitValues(onSubmit)
  }, [visibleFields, formValuesRef, setFieldErrors, submitValues, onSubmit])

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
