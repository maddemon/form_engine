import { antdAdapter } from '@form-engine/antd'
import { antdMobileAdapter } from '@form-engine/antd-mobile'
import type { FormSchema, PropertyPanelTab, SidePanelTab } from '@form-engine/core'
import { Designer } from '@form-engine/core'
import React from 'react'
import { useAppContext } from '../context/AppContext'
import FieldStatsTab from './components/FieldStatsTab'
import JsonViewTab from './components/JsonViewTab'

const sidePanelTabs: SidePanelTab[] = [
  {
    key: 'field-stats',
    title: 'Field Stats',
    icon: <span style={{ fontSize: 16 }}>📊</span>,
    content: FieldStatsTab,
  },
]

const propertyPanelTabs: PropertyPanelTab[] = [
  {
    key: 'json-view',
    title: 'JSON',
    content: JsonViewTab,
  },
]

// ---------- 页面组件 ----------
interface Props {
  schema: FormSchema
  onSchemaChange: (schema: FormSchema) => void
}

const DesignerPage: React.FC<Props> = ({ schema, onSchemaChange }) => {
  const { themeMode, locale } = useAppContext()
  return (
    <div style={{ height: '100%' }}>
      <Designer
        value={schema}
        onChange={onSchemaChange}
        desktopAdapter={antdAdapter}
        mobileAdapter={antdMobileAdapter}
        panelWidths={{ palette: 260, properties: 'min(320px, 26vw)' }}
        sidePanelTabs={sidePanelTabs}
        propertyPanelTabs={propertyPanelTabs}
        themeMode={themeMode}
        locale={locale}
      />
    </div>
  )
}

export default DesignerPage
