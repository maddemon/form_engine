import { useCallback, useState } from 'react'
import type { FormFieldSchema, OptionItem } from '../../types/schema'
import { validateForm } from '../validate'
import type { ValidateResult } from '../validate'

export interface UseFormValidationResult {
  fieldErrors: Record<string, string[]>
  fieldOptions: Record<string, OptionItem[]>
  setFieldErrors: React.Dispatch<React.SetStateAction<Record<string, string[]>>>
  setFieldOptions: React.Dispatch<React.SetStateAction<Record<string, OptionItem[]>>>
  validate: (fields: FormFieldSchema[], formValues: Record<string, unknown>, name?: string) => Promise<boolean>
  validateRaw: (fields: FormFieldSchema[], formValues: Record<string, unknown>, name?: string) => Promise<ValidateResult>
  clearFieldError: (name: string) => void
  clearAllErrors: () => void
}

export function useFormValidation(): UseFormValidationResult {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [fieldOptions, setFieldOptions] = useState<Record<string, OptionItem[]>>({})

  const validateRaw = useCallback(
    async (fields: FormFieldSchema[], formValues: Record<string, unknown>, name?: string): Promise<ValidateResult> => {
      const result = validateForm(fields, formValues, name)
      if (!result.valid) {
        console.warn('[form-engine] 校验失败:', result.errors)
      }
      return result
    },
    [],
  )

  const validate = useCallback(
    async (fields: FormFieldSchema[], formValues: Record<string, unknown>, name?: string): Promise<boolean> => {
      const result = validateForm(fields, formValues, name)
      if (!result.valid) {
        console.warn('[form-engine] 校验失败:', result.errors)
      }
      return result.valid
    },
    [],
  )

  const clearFieldError = useCallback((name: string) => {
    setFieldErrors((prev) => {
      if (!prev[name]) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
  }, [])

  const clearAllErrors = useCallback(() => setFieldErrors({}), [])

  return {
    fieldErrors, fieldOptions, setFieldErrors, setFieldOptions,
    validate, validateRaw, clearFieldError, clearAllErrors,
  }
}
