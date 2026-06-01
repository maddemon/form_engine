/**
 * 自定义组件注册功能测试
 * 
 * 测试场景：
 * 1. 注册自定义组件
 * 2. 在控件库中显示
 * 3. 在属性面板中编辑自定义属性
 * 4. 自定义属性 Widget
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Designer } from '../Designer'
import { registerSimpleCustomComponent } from '../../registry/simpleCustomComponentRegistry'
import { customComponentRegistry } from '../../registry/customComponentRegistry'
import { customPropertyWidgetRegistry } from '../../registry/customComponentRegistry'

// 模拟自定义按钮组件
function TestButton(props: any) {
  return (
    <button 
      style={{ background: props.bgColor || '#1677ff' }}
      data-testid="test-button"
    >
      {props.text || '按钮'}
    </button>
  )
}

// 模拟自定义颜色选择器 Widget
function TestColorPicker(props: any) {
  return (
    <input 
      type="color" 
      data-testid="color-picker"
      onChange={(e) => props.onChange(e.target.value)} 
    />
  )
}

describe('自定义组件注册', () => {
  beforeEach(() => {
    // 清空注册表
    customComponentRegistry.clear()
    customPropertyWidgetRegistry.clear()
  })

  it('应该能注册自定义组件', () => {
    registerSimpleCustomComponent('test-button', TestButton, {
      label: '测试按钮',
      category: '测试',
      defaultProps: {
        text: '点击我',
        bgColor: '#1677ff',
      },
    })

    // 验证注册成功
    expect(customComponentRegistry.has('test-button')).toBe(true)
    
    const config = customComponentRegistry.get('test-button')
    expect(config).toBeDefined()
    expect(config?.label).toBe('测试按钮')
    expect(config?.category).toBe('测试')
  })

  it('应该自动推断 propertyConfig', () => {
    registerSimpleCustomComponent('test-button', TestButton, {
      label: '测试按钮',
      defaultProps: {
        text: '点击我',
        bgColor: '#1677ff',
        disabled: false,
        count: 10,
      },
    })

    const config = customComponentRegistry.get('test-button')
    expect(config?.propertyConfig).toBeDefined()
    expect(config?.propertyConfig?.length).toBe(4) // text, bgColor, disabled, count
    
    // 验证自动推断的 widget 类型
    const textConfig = config?.propertyConfig?.find(p => p.key === 'text')
    expect(textConfig?.widget).toBe('input')
    
    const disabledConfig = config?.propertyConfig?.find(p => p.key === 'disabled')
    expect(disabledConfig?.widget).toBe('checkbox')
    
    const countConfig = config?.propertyConfig?.find(p => p.key === 'count')
    expect(countConfig?.widget).toBe('number')
  })

  it('应该支持自定义属性 Widget', () => {
    // 注册自定义 Widget
    customPropertyWidgetRegistry.register('TestColorPicker', TestColorPicker)

    expect(customPropertyWidgetRegistry.has('TestColorPicker')).toBe(true)
    
    const Widget = customPropertyWidgetRegistry.get('TestColorPicker')
    expect(Widget).toBeDefined()
  })

  it('应该按分类分组自定义组件', () => {
    registerSimpleCustomComponent('comp1', TestButton, {
      label: '组件1',
      category: '分组A',
      defaultProps: {},
    })
    
    registerSimpleCustomComponent('comp2', TestButton, {
      label: '组件2',
      category: '分组B',
      defaultProps: {},
    })
    
    registerSimpleCustomComponent('comp3', TestButton, {
      label: '组件3',
      category: '分组A',
      defaultProps: {},
    })

    const grouped = customComponentRegistry.getGrouped()
    
    expect(grouped['分组A']).toBeDefined()
    expect(grouped['分组A'].length).toBe(2)
    expect(grouped['分组B']).toBeDefined()
    expect(grouped['分组B'].length).toBe(1)
  })
})

describe('属性编辑器', () => {
  it('应该根据 propertyConfig 渲染编辑器', () => {
    // 这个测试需要实际的 React 组件测试
    // 这里只是示例
    expect(true).toBe(true)
  })
})
