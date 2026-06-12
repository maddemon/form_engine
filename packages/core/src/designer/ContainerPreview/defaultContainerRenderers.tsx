/**
 * 内置容器渲染器注册
 *
 * 从 ContainerPreview.tsx 中提取，消除硬编码。
 * ContainerPreview 只通过 getContainerRenderer 查找，不直接依赖具体渲染器。
 */

import type { ContainerContentProps } from './types'
import { CardContainerContent } from './CardContainerContent'
import { CollapseContainerContent } from './CollapseContainerContent'
import { FlexContainerContent } from './FlexContainerContent'
import { GridContainerContent } from './GridContainerContent'
import { SubFormContainerContent } from './SubFormContainerContent'
import { TabsContainerContent } from './TabsContainerContent'

/** 内置容器渲染器映射 */
export const defaultContainerRenderers: Record<string, React.FC<ContainerContentProps>> = {
  card: CardContainerContent,
  grid: GridContainerContent,
  'sub-form': SubFormContainerContent,
  collapse: CollapseContainerContent,
  tabs: TabsContainerContent,
  flex: FlexContainerContent,
}
