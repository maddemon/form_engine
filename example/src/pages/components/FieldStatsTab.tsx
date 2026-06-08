import { FormFieldSchema, SidePanelTabContentProps } from '@form-engine/core'
import { Typography } from 'antd'
import { useMemo } from 'react'

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
      <Typography.Title level={5} style={{ margin: '0 0 12px' }}>
        Field Stats
      </Typography.Title>
      <Typography.Text style={{ display: 'block', marginBottom: 12 }}>Total: {stats.total} fields</Typography.Text>
      {Object.entries(stats.countByType).map(([type, count]) => (
        <div key={type} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
          <Typography.Text>{type}</Typography.Text>
          <Typography.Text strong>{count}</Typography.Text>
        </div>
      ))}
    </div>
  )
}
export default FieldStatsTab
