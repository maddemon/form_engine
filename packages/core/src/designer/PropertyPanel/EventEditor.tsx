import React, { useMemo } from 'react'
import { getEventDeclarations } from '../../components'
import { useLocale } from '../../locale'
import { customComponentRegistry } from '../../registry/customComponentRegistry'
import type { DesignerWidgets } from '../../types/adapter-designer'
import type { DesignerAction } from '../../types/designer'
import type { EventDeclaration, FormFieldEvents } from '../../types/events'
import type { PropertySlots } from '../../types/property-slot'
import type { FormFieldSchema } from '../../types/schema'
import { CollapsibleSection } from './CollapsibleSection'
import { EventHandlerEditor } from './EventHandlerEditor'

function getFieldEventDeclarations(fieldType: string): EventDeclaration[] {
  const customConfig = customComponentRegistry.get(fieldType)
  if (customConfig?.events?.length) {
    return customConfig.events
  }
  return getEventDeclarations(fieldType)
}

interface EventEditorProps {
  field: FormFieldSchema
  w: DesignerWidgets
  dispatch: React.Dispatch<DesignerAction>
  slots?: PropertySlots
}

export function EventEditor({ field, w, dispatch, slots }: EventEditorProps) {
  const { locale } = useLocale()
  const eventDeclarations = useMemo(() => getFieldEventDeclarations(field.type), [field.type])
  if (eventDeclarations.length === 0) return null

  return (
    <CollapsibleSection
      title={`${locale.designer.propertyPanel.events}（${eventDeclarations.length}）`}
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
