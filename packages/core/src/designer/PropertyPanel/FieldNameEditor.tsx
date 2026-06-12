import { useCallback } from 'react'
import { useLocale } from '../../locale'
import { FieldItem } from '../../propRenders'
import type { DesignerWidgets } from '../../types/adapter-designer'
import type { DesignerAction } from '../../types/designer'
import type { FormFieldSchema } from '../../types/schema'
import { Space } from '../../widgets/Space'
import { useDebouncedFieldUpdate } from '../hooks/useDebouncedFieldUpdate'
import { useFieldNameValidation } from '../hooks/useFieldNameValidation'
import { ErrorMessage } from '../../shared/UIPrimitives'

interface FieldNameEditorProps {
  field: FormFieldSchema
  w: DesignerWidgets
  dispatch: React.Dispatch<DesignerAction>
  allFields: FormFieldSchema[]
}

/** 字段名编辑器：含重复校验 + 防抖 */
export function FieldNameEditor({ field, w, dispatch, allFields }: FieldNameEditorProps) {
  const { locale } = useLocale()
  const lp = locale.designer.propertyPanel
  const { setNameDirty, nameError, existingNames } = useFieldNameValidation(allFields, field.id, field.name)

  const [nameValue, handleNameChangeRaw] = useDebouncedFieldUpdate<string | number>(
    dispatch,
    field.id,
    'name',
    field.name,
    {
      transform: (v) => String(v),
      skip: (v) => {
        const newName = String(v)
        return !newName || existingNames.has(newName)
      },
    },
  )

  const handleNameChange = useCallback(
    (v: string | number) => {
      setNameDirty(true)
      handleNameChangeRaw(v)
    },
    [setNameDirty, handleNameChangeRaw],
  )

  return (
    <FieldItem label={lp.fieldName}>
      <Space direction="vertical" gap="xs" style={{ flex: 1 }}>
        <w.Input value={nameValue} onChange={handleNameChange} />
        {nameError && <ErrorMessage>{nameError}</ErrorMessage>}
      </Space>
    </FieldItem>
  )
}
