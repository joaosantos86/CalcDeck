import { describe, expect, it } from 'vitest'

import {
  createVariables,
  evaluateExpression,
  formatNumber,
  numberEntryAt,
  toFraction,
  type EvaluationContext,
} from '@/utils/calculatorEngine'

function evaluate(expression: string, mode: EvaluationContext['angleMode'] = 'DEG') {
  return evaluateExpression(expression, {
    angleMode: mode,
    ans: 0,
    memory: 0,
    variables: createVariables(),
  })
}

function value(expression: string, mode: EvaluationContext['angleMode'] = 'DEG'): number {
  const result = evaluate(expression, mode)
  if (!result.ok) {
    throw new Error(`expressão inválida: ${expression} (${result.error})`)
  }
  return result.value
}

describe('calculatorEngine', () => {
  it('respeita a precedência e os parênteses', () => {
    expect(value('2+3*4')).toBe(14)
    expect(value('(2+3)*4')).toBe(20)
    expect(value('10-4-3')).toBe(3)
    expect(value('2^3^2')).toBe(512)
    expect(value('-2^2')).toBe(-4)
    expect(value('2^-2')).toBe(0.25)
  })

  it('aceita multiplicação implícita', () => {
    expect(value('2π')).toBeCloseTo(2 * Math.PI, 10)
    expect(value('3(4+2)')).toBe(18)
    expect(value('2sin(30)')).toBeCloseTo(1, 10)
  })

  it('calcula as funções científicas', () => {
    expect(value('sqrt(81)')).toBe(9)
    expect(value('cbrt(27)')).toBe(3)
    expect(value('4!')).toBe(24)
    expect(value('10^3')).toBe(1000)
    expect(value('log(1000)')).toBe(3)
    expect(value('ln(e)')).toBe(1)
    expect(value('exp10(2)')).toBe(100)
    expect(value('root(3,27)')).toBeCloseTo(3, 10)
    expect(value('nCr(5,2)')).toBe(10)
    expect(value('nPr(5,2)')).toBe(20)
    expect(value('2⁻¹')).toBe(0.5)
    expect(value('3²')).toBe(9)
    expect(value('2³')).toBe(8)
  })

  it('converte ângulos conforme o modo', () => {
    expect(value('sin(30)')).toBeCloseTo(0.5, 10)
    expect(value('sin(π/2)', 'RAD')).toBeCloseTo(1, 10)
    expect(value('cos(100)', 'GRA')).toBeCloseTo(0, 10)
    expect(value('asin(0.5)')).toBeCloseTo(30, 10)
    expect(value('atan(1)')).toBeCloseTo(45, 10)
  })

  it('calcula porcentagens relativas', () => {
    expect(value('100+10%')).toBe(110)
    expect(value('100-10%')).toBe(90)
    expect(value('50%')).toBe(0.5)
    expect(value('200*10%')).toBe(20)
  })

  it('reaproveita Ans, memória e variáveis', () => {
    const context: EvaluationContext = {
      angleMode: 'DEG',
      ans: 42,
      memory: 7,
      variables: createVariables(),
    }

    expect(evaluateExpression('Ans+8', context)).toMatchObject({ ok: true, value: 50 })
    expect(evaluateExpression('M*3', context)).toMatchObject({ ok: true, value: 21 })
    expect(evaluateExpression('A+1', context)).toMatchObject({ ok: true, value: 1 })
  })

  it('guarda X e Y ao usar Pol e Rec', () => {
    const context: EvaluationContext = {
      angleMode: 'DEG',
      ans: 0,
      memory: 0,
      variables: createVariables(),
    }

    const polar = evaluateExpression('Pol(3,4)', context)
    expect(polar.ok).toBe(true)
    if (polar.ok) {
      expect(polar.value).toBeCloseTo(5, 10)
      expect(polar.variables.X).toBeCloseTo(5, 10)
      expect(polar.variables.Y).toBeCloseTo(53.13010235, 6)
    }
  })

  it('sinaliza erros de sintaxe e de matemática', () => {
    expect(evaluate('1/0')).toEqual({ ok: false, error: 'Math ERROR' })
    expect(evaluate('sqrt(-1)')).toEqual({ ok: false, error: 'Math ERROR' })
    expect(evaluate('log(0)')).toEqual({ ok: false, error: 'Math ERROR' })
    expect(evaluate('(-1)!')).toEqual({ ok: false, error: 'Math ERROR' })
    expect(evaluate('2+')).toEqual({ ok: false, error: 'Syntax ERROR' })
    expect(evaluate('(2+3')).toEqual({ ok: false, error: 'Syntax ERROR' })
    expect(evaluate('2..3')).toEqual({ ok: false, error: 'Syntax ERROR' })
  })

  it('formata números com até 10 algarismos significativos', () => {
    expect(formatNumber(0.1 + 0.2)).toBe('0.3')
    expect(formatNumber(1 / 3)).toBe('0.3333333333')
    expect(formatNumber(-42)).toBe('-42')
    expect(formatNumber(1e12)).toBe('1E12')
    expect(formatNumber(1.5e-12)).toBe('1.5E-12')
    expect(formatNumber(2.5)).toBe('2.5')
  })

  it('encontra o número sob o cursor', () => {
    expect(numberEntryAt('12+345', 6)).toMatchObject({ start: 3, end: 6, text: '345' })
    expect(numberEntryAt('12+345', 2)).toMatchObject({ start: 0, end: 2, text: '12' })
    expect(numberEntryAt('1.5E-3+2', 6)).toMatchObject({ text: '1.5E-3' })
    expect(numberEntryAt('12+', 3)).toBeNull()
  })

  it('converte decimais em frações', () => {
    expect(toFraction(0.5)).toEqual({ numerator: 1, denominator: 2 })
    expect(toFraction(1.5)).toEqual({ numerator: 3, denominator: 2 })
    expect(toFraction(2)).toBeNull()
  })
})
