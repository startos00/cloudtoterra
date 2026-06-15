import { describe, it, expect } from 'vitest'
import { NODE_TYPES, SUB_TYPES, CONDITIONS, isValidSubType } from './taxonomy'

describe('taxonomy', () => {
  it('has exactly 3 pin types', () => {
    expect(NODE_TYPES).toEqual(['land', 'building', 'civic'])
  })
  it('building sub-types include whole + within-building spaces', () => {
    expect(SUB_TYPES.building).toContain('commercial_office')
    expect(SUB_TYPES.building).toContain('office_unit')
  })
  it('conditions run usable→derelict', () => {
    expect(CONDITIONS).toEqual(['usable', 'dormant', 'distressed', 'derelict'])
  })
  it('validates sub_type against type', () => {
    expect(isValidSubType('land', 'brownfield')).toBe(true)
    expect(isValidSubType('land', 'office_unit')).toBe(false)
    expect(isValidSubType('building', 'office_unit')).toBe(true)
  })
})
