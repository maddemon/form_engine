import type { DeviceScene, FormEngineAdapter } from '../../types/adapter'
import type { FormConfig, FormFieldSchema } from '../../types/schema'

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
