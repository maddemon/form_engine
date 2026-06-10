import { useMemo } from 'react'
import { useLocale } from '../../locale'
import { FieldItem } from '../../propRenders/shared'
import type { DesignerWidgets } from '../../types/adapter'
import type { DesignerAction } from '../../types/designer'

interface GlobalFormConfigProps {
  colon: boolean | undefined
  requiredMark: boolean | 'optional' | undefined
  dispatch: React.Dispatch<DesignerAction>
  widgets: DesignerWidgets
}

/**
 * 全局表单配置：冒号、必填标记
 */
export const GlobalFormConfig: React.FC<GlobalFormConfigProps> = ({ colon, requiredMark, dispatch, widgets: w }) => {
  const { locale } = useLocale()
  const fc = locale.designer.formConfig

  const requiredMarkOptions = useMemo(
    () => [
      { label: fc.default, value: 'true' },
      { label: fc.optionalMark, value: 'optional' },
      { label: fc.hidden, value: 'false' },
    ],
    [fc.default, fc.optionalMark, fc.hidden],
  )

  const requiredMarkValue = requiredMark === undefined ? 'true' : requiredMark === false ? 'false' : requiredMark === true ? 'true' : 'optional'

  return (
    <>
      <FieldItem label={fc.showColon}>
        <w.Switch checked={!!colon} onChange={(v: boolean) => dispatch({ type: 'UPDATE_FORM_CONFIG', patch: { colon: v } })} />
      </FieldItem>

      <FieldItem label={fc.requiredMark}>
        <w.Select
          value={requiredMarkValue}
          onChange={(v) => {
            const val = v === 'true' ? true : v === 'false' ? false : 'optional'
            dispatch({ type: 'UPDATE_FORM_CONFIG', patch: { requiredMark: val } })
          }}
          options={requiredMarkOptions}
        />
      </FieldItem>
    </>
  )
}
