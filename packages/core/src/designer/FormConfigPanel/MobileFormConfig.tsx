import { useMemo } from 'react'
import { useLocale } from '../../locale'
import { FieldItem } from '../../propRenders/shared'
import type { DesignerWidgets } from '../../types/adapter-designer'
import type { DesignerAction } from '../../types/designer'
import type { FormConfig } from '../../types/schema'

interface MobileFormConfigProps {
  mobile: FormConfig['mobile']
  dispatch: React.Dispatch<DesignerAction>
  widgets: DesignerWidgets
}

/**
 * 移动端表单配置：页面背景、布局模式
 */
export const MobileFormConfig: React.FC<MobileFormConfigProps> = ({ mobile, dispatch, widgets: w }) => {
  const { locale } = useLocale()
  const fc = locale.designer.formConfig

  const layoutOptions = useMemo(
    () => [
      { label: fc.horizontal, value: 'horizontal' },
      { label: fc.vertical, value: 'vertical' },
    ],
    [fc.horizontal, fc.vertical],
  )

  const handlePageBgChange = (v: string | number) => {
    const val = String(v)
    dispatch({
      type: 'UPDATE_FORM_CONFIG',
      patch: { mobile: { ...mobile, pageBackground: val || undefined } },
    })
  }

  return (
    <>
      <FieldItem label={fc.pageBg}>
        <w.ColorPicker value={mobile.pageBackground ?? ''} onChange={handlePageBgChange} placeholder={fc.bgPlaceholder} allowClear />
      </FieldItem>

      <FieldItem label={fc.layoutMode}>
        <w.Select
          value={mobile.layout}
          onChange={(v) => dispatch({ type: 'UPDATE_FORM_CONFIG', patch: { mobile: { ...mobile, layout: v as 'horizontal' | 'vertical' } } })}
          options={layoutOptions}
        />
      </FieldItem>
    </>
  )
}
