import React from 'react'
import { getEventDeclarations } from '../../components'
import { customComponentRegistry } from '../../registry/customComponentRegistry'
import type { DesignerWidgets } from '../../types/adapter'
import type { DesignerAction } from '../../types/designer'
import type { EventDeclaration, FormFieldEvents } from '../../types/events'
import type { PropertySlots } from '../../types/property-slot'
import type { FormFieldSchema } from '../../types/schema'
import { CollapsibleSection } from '../CollapsibleSection'
import { EventHandlerEditor } from '../EventHandlerEditor'

function getFieldEventDeclarations(field: FormFieldSchema): EventDeclaration[] {
  const customConfig = customComponentRegistry.get(field.type)
  if (customConfig?.events?.length) {
    return customConfig.events
  }
  return getEventDeclarations(field.type)
}

interface EventEditorProps {
  field: FormFieldSchema
  w: DesignerWidgets
  dispatch: React.Dispatch<DesignerAction>
  slots?: PropertySlots
}

export function EventEditor({ field, w, dispatch, slots }: EventEditorProps) {
  const eventDeclarations = getFieldEventDeclarations(field)
  if (eventDeclarations.length === 0) return null

  return (
    <CollapsibleSection
      title={`事件（${eventDeclarations.length}）`}
      defaultCollapsed={!field.events || Object.keys(field.events).length === 0}
      forceExpand={!!field.events && Object.keys(field.events).length > 0}
    >
      {eventDeclarations.map((decl) => (
        <EventHandlerEditor
          key={decl.name}
          eventName={decl.name}
          value={field.events?.[decl.name]}
          widgets={w}
          slots={slots}
          onChange={(handler) => {
            const next: FormFieldEvents = { ...(field.events || {}) }
            if (handler) {
              next[decl.name] = handler
            } else {
              delete next[decl.name]
            }
            const cleaned = Object.keys(next).length > 0 ? next : undefined
            dispatch({
              type: 'UPDATE_FIELD',
              fieldId: field.id,
              patch: { events: cleaned },
            })
          }}
        />
      ))}
    </CollapsibleSection>
  )
}
