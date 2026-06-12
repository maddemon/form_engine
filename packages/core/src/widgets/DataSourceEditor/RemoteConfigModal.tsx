import React, { useMemo, useRef, useState } from 'react'
import { useStyle } from '../../styles'
import { useLocale } from '../../locale'
import { Divider } from '../Divider'
import { WidgetInput } from '../Input'
import { WidgetModal } from '../Modal'
import { Space } from '../Space'
import { TagLabel } from '../TagLabel'
import { Text } from '../Text'
import { parseUrlDeps } from './utils'

interface RemoteConfigModalProps {
  open: boolean
  config: { url: string; resultPath: string; labelField: string; valueField: string }
  onConfirm: (config: { url: string; resultPath: string; labelField: string; valueField: string }) => void
  onCancel: () => void
}

export function RemoteConfigModal({ open, config, onConfirm, onCancel }: RemoteConfigModalProps) {
  const { token } = useStyle()
  const { locale } = useLocale()
  const [url, setUrl] = useState('')
  const [resultPath, setResultPath] = useState('')
  const [labelField, setLabelField] = useState('name')
  const [valueField, setValueField] = useState('id')
  const prevOpenRef = useRef(false)
  const [touched, setTouched] = useState(false)

  const deps = useMemo(() => parseUrlDeps(url), [url])

  React.useEffect(() => {
    if (open && !prevOpenRef.current) {
      setUrl(config.url || '')
      setResultPath(config.resultPath || '')
      setLabelField(config.labelField || 'name')
      setValueField(config.valueField || 'id')
      setTouched(false)
    }
    prevOpenRef.current = open
  }, [open, config])

  const handleConfirm = () => {
    onConfirm({ url, resultPath, labelField, valueField })
  }

  return (
    <WidgetModal open={open} title={locale.widget.dataSourceEditor.remoteDataSource} width="sm" onCancel={onCancel} onConfirm={handleConfirm}>
      <Space direction="vertical" gap="sm" align="stretch" style={{ width: '100%' }}>
        <div>
          <Text type="secondary" style={{ marginBottom: token('spacingXs') }}>
            {locale.widget.dataSourceEditor.apiUrl}
          </Text>
          <WidgetInput
            value={url}
            onChange={(v) => {
              setUrl(v as string)
              setTouched(true)
            }}
            placeholder={locale.widget.dataSourceEditor.apiUrlPlaceholder}
            style={{ padding: '3px 6px' }}
          />
          <Text type="tertiary" style={{ marginTop: '2px' }}>
            {locale.widget.dataSourceEditor.paramHelp.split('{fieldName}')[0]}<code>{`{fieldName}`}</code>{locale.widget.dataSourceEditor.paramHelp.split('{fieldName}')[1]}
          </Text>
        </div>

        {touched && url && deps.length > 0 && (
          <div>
            <Text type="secondary" style={{ marginBottom: token('spacingXs') }}>
              {locale.widget.dataSourceEditor.dependentField}
            </Text>
            <Space gap="xs" wrap align="start" style={{ width: '100%' }}>
              {deps.map((dep) => (
                <TagLabel key={dep} variant="secondary">
                  {dep}
                </TagLabel>
              ))}
            </Space>
            <Text type="tertiary" style={{ marginTop: '2px' }}>
              {locale.widget.dataSourceEditor.reloadHelp}
            </Text>
          </div>
        )}

        <Divider />
        <div>
          <Text type="secondary" style={{ marginBottom: token('spacingSm') }}>
            {locale.widget.dataSourceEditor.responseMapping}
          </Text>
          <Space direction="vertical" gap="sm" align="stretch" style={{ width: '100%' }}>
            <div>
              <Text type="tertiary" style={{ marginBottom: '2px' }}>
                {locale.widget.dataSourceEditor.listPath}
              </Text>
              <WidgetInput
                value={resultPath}
                onChange={(v) => setResultPath(v as string)}
                placeholder={locale.widget.dataSourceEditor.listPathPlaceholder}
                style={{ padding: '3px 6px' }}
              />
            </div>
            <Space gap="sm" align="stretch" style={{ width: '100%' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text type="tertiary" style={{ marginBottom: '2px' }}>
                  {locale.widget.dataSourceEditor.labelField}
                </Text>
                <WidgetInput
                  value={labelField}
                  onChange={(v) => setLabelField(v as string)}
                  placeholder={locale.widget.dataSourceEditor.labelFieldPlaceholder}
                  style={{ padding: '3px 6px' }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text type="tertiary" style={{ marginBottom: '2px' }}>
                  {locale.widget.dataSourceEditor.valueField}
                </Text>
                <WidgetInput
                  value={valueField}
                  onChange={(v) => setValueField(v as string)}
                  placeholder={locale.widget.dataSourceEditor.valueFieldPlaceholder}
                  style={{ padding: '3px 6px' }}
                />
              </div>
            </Space>
          </Space>
        </div>
      </Space>
    </WidgetModal>
  )
}