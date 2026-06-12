import { EyeIcon, EyeOffIcon } from '../../components/icons'
import { useLocale } from '../../locale'
import { FieldItem } from '../../propRenders'
import type { DesignerWidgets } from '../../types/adapter'
import type { DesignerAction } from '../../types/designer'
import type { FormFieldSchema } from '../../types/schema'
import { WidgetButton } from '../../widgets/Button'
import { Space } from '../../widgets/Space'
import { useDebouncedFieldUpdate } from '../hooks/useDebouncedFieldUpdate'

interface FieldLabelEditorProps {
  field: FormFieldSchema
  w: DesignerWidgets
  dispatch: React.Dispatch<DesignerAction>
}

/** 字段标签编辑器：含显示/隐藏切换 */
export function FieldLabelEditor({ field, w, dispatch }: FieldLabelEditorProps) {
  const { locale } = useLocale()
  const lp = locale.designer.propertyPanel

  const [labelValue, handleLabelChange] = useDebouncedFieldUpdate<string | number>(
    dispatch,
    field.id,
    'label',
    field.label || '',
    { transform: (v) => String(v) || undefined },
  )

  return (
    <FieldItem label={lp.fieldLabel}>
      <Space gap="xs" style={{ flex: 1 }}>
        <w.Input value={labelValue} onChange={handleLabelChange} placeholder={lp.fieldLabelPlaceholder} style={{ flex: 1 }} />
        <WidgetButton
          type="text"
          size="sm"
          onClick={() =>
            dispatch({ type: 'UPDATE_FIELD', fieldId: field.id, patch: { labelHidden: !field.labelHidden } })
          }
          label={field.labelHidden ? lp.showLabel : lp.hideLabel}
          style={{ color: field.labelHidden ? 'var(--fe-text-tertiary)' : 'var(--fe-primary)', flexShrink: 0, padding: '0 2px' }}
        >
          {field.labelHidden ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
        </WidgetButton>
      </Space>
    </FieldItem>
  )
}
