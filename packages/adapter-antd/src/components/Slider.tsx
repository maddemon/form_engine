/**
 * Antd Slider 组件
 * 适配 Form Engine 的 SliderProps
 */

import React from 'react'
import { Slider as AntSlider } from 'antd'
import type { SliderProps as CoreSliderProps } from '@form-engine/core'

/**
 * Slider 组件
 *
 * antd v6 Slider 使用 SliderSingleProps | SliderRangeProps 判别联合，
 * value/onChange 类型随 range 变化，与 CoreSliderProps 的联合类型不兼容。
 * 这里按 range 分支分别渲染，各分支只传该分支合法的类型。
 */
export const Slider: React.FC<CoreSliderProps> = (props) => {
  const { range, value, onChange } = props

  const tooltipProp = props.tooltip
    ? { formatter: (v?: number) => props.tooltip!.formatter?.replace('{value}', String(v ?? '')) ?? '' }
    : undefined

  if (range) {
    return (
      <AntSlider
        range
        value={value as unknown as number[] | undefined}
        defaultValue={props.defaultValue as unknown as number[] | undefined}
        onChange={onChange as unknown as (value: number[]) => void | undefined}
        min={props.min ?? 0}
        max={props.max ?? 100}
        step={props.step ?? 1}
        marks={props.marks}
        dots={props.dots as boolean | undefined}
        included={(props.included as boolean | undefined) ?? true}
        tooltip={tooltipProp}
        vertical={props.vertical as boolean | undefined}
        disabled={props.disabled}
        style={props.style}
        className={props.className}
        id={props.id}
      />
    )
  }

  return (
    <AntSlider
      value={value as unknown as number | undefined}
      defaultValue={props.defaultValue as unknown as number | undefined}
      onChange={onChange as unknown as (value: number) => void | undefined}
      min={props.min ?? 0}
      max={props.max ?? 100}
      step={props.step ?? 1}
      marks={props.marks}
      dots={props.dots as boolean | undefined}
      included={(props.included as boolean | undefined) ?? true}
      tooltip={tooltipProp}
      vertical={props.vertical as boolean | undefined}
      disabled={props.disabled}
      style={props.style}
      className={props.className}
      id={props.id}
    />
  )
}
