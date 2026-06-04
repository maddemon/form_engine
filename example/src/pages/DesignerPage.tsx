import { antdAdapter } from '@form-engine/adapter-antd'
import { antdMobileAdapter } from '@form-engine/adapter-antd-mobile'
import type { FormFieldSchema, FormSchema, PropertyPanelTab, PropertyPanelTabContentProps, SidePanelTab, SidePanelTabContentProps } from '@form-engine/core'
import { Designer } from '@form-engine/core'
import { Card, Typography } from 'antd'
import React, { useMemo } from 'react'

// ---------- 自定义侧边栏 Tab：字段统计 ----------
const FieldStatsTab: React.FC<SidePanelTabContentProps> = ({ fields }) => {
  const stats = useMemo(() => {
    const countByType: Record<string, number> = {}
    let total = 0
    const walk = (items: FormFieldSchema[]) => {
      for (const f of items) {
        total++
        countByType[f.type] = (countByType[f.type] || 0) + 1
        if (f.children) walk(f.children)
      }
    }
    walk(fields)
    return { total, countByType }
  }, [fields])

  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={5} style={{ margin: '0 0 12px' }}>字段统计</Typography.Title>
      <Typography.Text style={{ display: 'block', marginBottom: 12 }}>共 {stats.total} 个字段</Typography.Text>
      {Object.entries(stats.countByType).map(([type, count]) => (
        <div key={type} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
          <Typography.Text>{type}</Typography.Text>
          <Typography.Text strong>{count}</Typography.Text>
        </div>
      ))}
    </div>
  )
}

const sidePanelTabs: SidePanelTab[] = [
  {
    key: 'field-stats',
    title: '字段统计',
    icon: <span style={{ fontSize: 16 }}>📊</span>,
    content: FieldStatsTab,
  },
]

// ---------- 自定义属性面板 Tab：JSON 查看 ----------
const JsonViewTab: React.FC<PropertyPanelTabContentProps> = ({ field }) => {
  if (!field) return <div style={{ padding: 16 }}><Typography.Text type="secondary">请选择一个字段</Typography.Text></div>
  return (
    <div style={{ padding: 8 }}>
      <Card title="字段 Schema (JSON)" size="small">
        <pre style={{ maxHeight: 200, overflow: 'auto', fontSize: 12, lineHeight: 1.4 }}>{JSON.stringify(field, null, 2)}</pre>
      </Card>
    </div>
  )
}

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
  return (
    <div style={{ height: '100%' }}>
      <Designer
        schema={schema}
        onSchemaChange={onSchemaChange}
        desktopAdapter={antdAdapter}
        mobileAdapter={antdMobileAdapter}
        panelWidths={{ palette: 260, properties: 'min(320px, 26vw)' }}
        excludeTypes={['date-range']}
        sidePanelTabs={sidePanelTabs}
        propertyPanelTabs={propertyPanelTabs}
      />
    </div>
  )
}

export default DesignerPage
