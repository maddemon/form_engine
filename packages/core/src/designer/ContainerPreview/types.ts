import type { DeviceScene } from '../../types/adapter-field'
import type { FormEngineAdapter } from '../../types/adapter'
import type { FormConfig, FormFieldSchema } from '../../types/schema'

/** 这些容器的 ContainerContent 内部已自行调用 FieldRenderer，外层无需重复包 label */
export const SELF_RENDERED_CONTAINERS = new Set(['card', 'collapse', 'tabs'])

/** 所有容器内容组件的统一 props（按需取用） */
export interface ContainerContentProps {
  field: FormFieldSchema
  /** 设备场景（table 容器需要区分 mobile/desktop 布局） */
  scene: DeviceScene
  /** 表单配置（card/collapse/tabs 容器渲染时需要） */
  formConfig: FormConfig
  /** 画布 adapter（card/collapse/tabs 容器渲染时需要） */
  adapter: FormEngineAdapter
}
