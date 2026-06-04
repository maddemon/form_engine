import { useMemo, useState } from 'react'
import type { FormFieldSchema } from '../types/schema'
import { collectFieldNames } from './reducer'

export interface UseFieldNameValidationResult {
  nameDirty: boolean
  setNameDirty: (v: boolean) => void
  nameError: string | null
  existingNames: Set<string>
}

export function useFieldNameValidation(
  allFields: FormFieldSchema[],
  fieldId: string,
  currentName: string,
): UseFieldNameValidationResult {
  const [nameDirty, setNameDirty] = useState(false)
  const existingNames = useMemo(() => collectFieldNames(allFields, fieldId), [allFields, fieldId])
  const nameError = nameDirty && currentName && existingNames.has(currentName) ? '该字段名已存在' : null

  return { nameDirty, setNameDirty, nameError, existingNames }
}
