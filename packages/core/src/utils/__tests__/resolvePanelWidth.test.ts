import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { resolvePanelWidth } from '../index.ts'

describe('resolvePanelWidth', () => {
  it('缺省值时回退到 fallback', () => {
    assert.equal(resolvePanelWidth(undefined, '220px', 160), '220px')
    assert.equal(resolvePanelWidth(null, '220px', 160), '220px')
    assert.equal(resolvePanelWidth('', '220px', 160), '220px')
  })

  it('number 正常 → px 字符串', () => {
    assert.equal(resolvePanelWidth(280, '220px', 160), '280px')
    assert.equal(resolvePanelWidth(160, '220px', 160), '160px')
  })

  it('number 小于 min → 兜底到 min', () => {
    assert.equal(resolvePanelWidth(100, '220px', 160), '160px')
    assert.equal(resolvePanelWidth(0, '220px', 160), '160px')
    assert.equal(resolvePanelWidth(50, '220px', 160), '160px')
  })

  it('number 非法值（NaN/负数）→ 兜底到 min', () => {
    assert.equal(resolvePanelWidth(NaN, '220px', 160), '160px')
    assert.equal(resolvePanelWidth(-100, '220px', 160), '160px')
  })

  it('string 透传（不解析、不假设单位）', () => {
    assert.equal(resolvePanelWidth('20%', '220px', 160), '20%')
    assert.equal(resolvePanelWidth('18rem', '220px', 160), '18rem')
    assert.equal(resolvePanelWidth('min(220px, 20vw)', '220px', 160), 'min(220px, 20vw)')
    assert.equal(resolvePanelWidth('0', '220px', 160), '0')
  })

  it('最小值对调色板（160）和属性面板（240）独立生效', () => {
    assert.equal(resolvePanelWidth(50, '220px', 160), '160px')
    assert.equal(resolvePanelWidth(50, '280px', 240), '240px')
  })

  it('fallback 仅在缺省时生效，用户传值不会被覆盖', () => {
    assert.equal(resolvePanelWidth(50, '999px', 160), '160px')
    assert.equal(resolvePanelWidth('50%', '999px', 160), '50%')
  })
})
