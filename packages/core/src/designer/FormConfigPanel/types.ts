import type { FormConfig } from '../../types/schema'

/** 表单配置分区：全局、桌面、移动 */
export type FormConfigSection = 'global' | 'desktop' | 'mobile'

/** 共用：控件宽度选项 1-24 */
export const COL_SPAN_OPTIONS = Array.from({ length: 24 }, (_, i) => ({ label: `${i + 1}`, value: String(i + 1) }))

/**
 * 给 formConfig 中 desktop / mobile 子项的 labelCol / wrapperCol 更新 span
 * 返回 patch 中需要 UPDATE_FORM_CONFIG 的子对象
 */
export function buildColPatch(
  scene: 'desktop' | 'mobile',
  formConfig: FormConfig,
  key: 'labelCol' | 'wrapperCol',
  span: number,
) {
  return {
    [scene]: { ...formConfig[scene], [key]: { span } },
  }
}

/** 构造 pageBackground 字段 patch */
export function buildPageBgPatch(scene: 'desktop' | 'mobile', formConfig: FormConfig, value: string) {
  return {
    [scene]: { ...formConfig[scene], pageBackground: value || undefined },
  }
}
