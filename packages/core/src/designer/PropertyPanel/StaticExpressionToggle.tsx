import { useEffect, useState } from 'react'
import { useStyle } from '../../styles'
import { useLocale } from '../../locale'
import type { DesignerWidgets } from '../../types/adapter'
import type { DesignerAction } from '../../types/designer'
import type { FormFieldSchema } from '../../types/schema'
import { WidgetButton } from '../../widgets/Button'
import { FieldItem } from '../../propRenders'
import { useDebouncedInput } from '../useDebouncedInput'

interface StaticExpressionToggleProps {
  /** 字段 schema */
  field: FormFieldSchema
  /** 属性键名（如 'disabled'、'readOnly'、'hidden'） */
  propKey: 'disabled' | 'readOnly' | 'hidden'
  /** 属性面板标签 */
  label: string
  /** 表达式编辑器占位文本 */
  placeholder?: string
  /** Widget 实例 */
  w: DesignerWidgets
  /** dispatch 函数 */
  dispatch: React.Dispatch<DesignerAction>
  /** 表达式编辑器 slot 组件 */
  ExpressionEditorSlot: React.ComponentType<any>
  /** 所有字段名列表 */
  fieldNames: string[]
}

export const StaticExpressionToggle: React.FC<StaticExpressionToggleProps> = ({
  field,
  propKey,
  label,
  placeholder = "如：form.status === 'locked'",
  w,
  dispatch,
  ExpressionEditorSlot,
  fieldNames,
}) => {
  const { token } = useStyle()
  const { locale } = useLocale()
  const se = locale.designer.staticExpressionToggle
  const currentValue = field[propKey]

  const [mode, setMode] = useState<'static' | 'expression'>(
    typeof currentValue === 'string' ? 'expression' : 'static',
  )

  // 同步外部状态变更（如 undo/redo）
  useEffect(() => {
    setMode(typeof currentValue === 'string' ? 'expression' : 'static')
  }, [currentValue])

  const [exprValue, handleExprChange] = useDebouncedInput<string | number>(
    typeof currentValue === 'string' ? currentValue : '',
    (v) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id, patch: { [propKey]: (v as string) || false } }),
  )

  return (
    <FieldItem label={label}>
      <div style={{ display: 'flex', alignItems: 'center', gap: token('spacingXs'), flex: 1 }}>
        {mode === 'static' ? (
          <w.Switch
            checked={!!currentValue}
            onChange={(v: boolean) =>
              dispatch({ type: 'UPDATE_FIELD', fieldId: field.id, patch: { [propKey]: v } })
            }
          />
        ) : (
          <ExpressionEditorSlot
            value={exprValue}
            onChange={handleExprChange}
            field={field}
            fieldNames={fieldNames}
            placeholder={placeholder}
          />
        )}
        <WidgetButton
          type="text"
          color="primary"
          size="sm"
          onClick={() => {
            if (mode === 'static') {
              setMode('expression')
              dispatch({ type: 'UPDATE_FIELD', fieldId: field.id, patch: { [propKey]: '' } })
            } else {
              setMode('static')
              dispatch({ type: 'UPDATE_FIELD', fieldId: field.id, patch: { [propKey]: false } })
            }
          }}
          label={mode === 'static' ? se.switchToExpression : se.switchToStatic}
          style={{ fontSize: token('fontSizeXs') as string, flexShrink: 0, whiteSpace: 'nowrap' }}
        >
          {mode === 'static' ? se.funcIcon : se.staticIcon}
        </WidgetButton>
      </div>
    </FieldItem>
  )
}
