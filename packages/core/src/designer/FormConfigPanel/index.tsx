import { useLocale } from '../../locale'
import type { DesignerWidgets } from '../../types/adapter'
import type { DesignerAction } from '../../types/designer'
import type { FormConfig } from '../../types/schema'
import { Divider, SectionTitle } from '../UIPrimitives'
import { DesktopFormConfig } from './DesktopFormConfig'
import { GlobalFormConfig } from './GlobalFormConfig'
import { MobileFormConfig } from './MobileFormConfig'

interface FormConfigPanelProps {
  formConfig: FormConfig
  dispatch: React.Dispatch<DesignerAction>
  widgets: DesignerWidgets
}

/**
 * 表单全局配置面板
 *
 * 拆分为三个子组件：
 * - GlobalFormConfig：全局（冒号、必填标记）
 * - DesktopFormConfig：桌面端（布局、对齐、变体、列宽、页面背景）
 * - MobileFormConfig：移动端（布局、页面背景）
 */
export const FormConfigPanel: React.FC<FormConfigPanelProps> = ({ formConfig, dispatch, widgets }) => {
  const { locale } = useLocale()
  const fc = locale.designer.formConfig

  return (
    <>
      <SectionTitle>{fc.title}</SectionTitle>

      <GlobalFormConfig colon={formConfig.colon} requiredMark={formConfig.requiredMark} dispatch={dispatch} widgets={widgets} />

      <Divider />

      <SectionTitle variant="secondary">{fc.desktopConfig}</SectionTitle>
      <DesktopFormConfig desktop={formConfig.desktop} dispatch={dispatch} widgets={widgets} />

      <Divider />

      <SectionTitle variant="secondary">{fc.mobileConfig}</SectionTitle>
      <MobileFormConfig mobile={formConfig.mobile} dispatch={dispatch} widgets={widgets} />
    </>
  )
}
