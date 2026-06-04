import { useCallback, useEffect, useRef, useState } from 'react'

export interface UseFormValuesOptions {
  initialValues: Record<string, unknown>
  onChange?: (values: Record<string, unknown>) => void
}

export interface UseFormValuesResult {
  formValues: Record<string, unknown>
  formValuesRef: { current: Record<string, unknown> }
  setFormValues: React.Dispatch<React.SetStateAction<Record<string, unknown>>>
  setFieldValue: (name: string, value: unknown) => void
  setFieldsValue: (patch: Record<string, unknown>) => void
  getFieldValue: (name: string) => unknown
  reset: () => void
  submit: (onSubmit?: (values: Record<string, unknown>) => void) => void
  debouncedOnChange: () => void
}

export function useFormValues({ initialValues, onChange }: UseFormValuesOptions): UseFormValuesResult {
  const [formValues, setFormValues] = useState<Record<string, unknown>>(initialValues)
  const formValuesRef = useRef(formValues)
  formValuesRef.current = formValues

  const onChangeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const debouncedOnChange = useCallback(() => {
    if (onChangeTimerRef.current) clearTimeout(onChangeTimerRef.current)
    onChangeTimerRef.current = setTimeout(() => {
      onChangeRef.current?.(formValuesRef.current)
    }, 300)
  }, [])

  useEffect(() => {
    return () => {
      if (onChangeTimerRef.current) clearTimeout(onChangeTimerRef.current)
    }
  }, [])

  const setFieldValue = useCallback((name: string, value: unknown) => {
    setFormValues((prev) => ({ ...prev, [name]: value }))
    debouncedOnChange()
  }, [debouncedOnChange])

  const setFieldsValue = useCallback((patch: Record<string, unknown>) => {
    setFormValues((prev) => {
      const next = { ...prev, ...patch }
      onChangeRef.current?.(next)
      return next
    })
  }, [])

  const getFieldValue = useCallback((name: string): unknown => formValues[name], [formValues])

  const reset = useCallback(() => {
    setFormValues(initialValues)
    onChangeRef.current?.(initialValues)
  }, [initialValues])

  const submit = useCallback((onSubmitCb?: (values: Record<string, unknown>) => void) => {
    onSubmitCb?.(formValuesRef.current)
  }, [])

  return {
    formValues, formValuesRef, setFormValues,
    setFieldValue, setFieldsValue, getFieldValue,
    reset, submit, debouncedOnChange,
  }
}
