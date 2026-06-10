import { useDroppable } from '@dnd-kit/core'
import { useMemo } from 'react'
import type { FormFieldSchema } from '../../types/schema'
import { useDroppableStyle } from '../useDroppableStyle'

/**
 * 容器组件通用的 droppable 逻辑
 *
 * 整合 useDroppable + childIds + droppableStyle，
 * 消除 CardContainerContent / GenericContainerContent / FlexContainerContent 中的重复代码。
 */
export function useContainerDroppable(field: FormFieldSchema) {
  const { setNodeRef, isOver } = useDroppable({
    id: `${field.id}__container`,
    data: { parentId: field.id },
  })
  const childIds = useMemo(() => field.children.map((c) => c.id), [field.children])
  const hasChildren = field.children.length > 0
  const droppableStyle = useDroppableStyle(isOver, hasChildren)

  return { setNodeRef, isOver, childIds, hasChildren, droppableStyle }
}

/**
 * 按 columnIndex / regionKey 将 children 分组到各列
 *
 * 消除 GridContainerContent 和 SubFormContainerContent 中的重复分组逻辑。
 */
export function useChildrenByColumn(children: FormFieldSchema[]) {
  return useMemo(() => {
    const map: Record<number, FormFieldSchema[]> = {}
    for (const child of children) {
      const colIdx = (child.columnIndex ?? child.regionKey)
        ? Number(child.regionKey ?? child.columnIndex)
        : 0
      if (!map[colIdx]) map[colIdx] = []
      map[colIdx].push(child)
    }
    return map
  }, [children])
}
