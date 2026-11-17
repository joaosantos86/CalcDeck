import { describe, expect, it } from 'vitest'

import type { KeyTone } from '@/types/calculator'

import {
  body,
  display,
  dpadKeys,
  scientificKeyRows,
  scientificCalculator,
} from '../scientificCalculator'

describe('scientificCalculator', () => {
  const keys = scientificCalculator.keys
  const tones = new Set<KeyTone>(['light', 'medium', 'dark', 'red', 'orange'])

  it('define o corpo vertical e o visor inicial', () => {
    expect(body.height).toBeGreaterThan(body.width * 2)
    expect(display.value).toBe('42.')
  })

  it('gera teclas individuais com identificadores únicos', () => {
    expect(keys.length).toBeGreaterThan(40)
    expect(new Set(keys.map((key) => key.id)).size).toBe(keys.length)
  })

  it('mantém todas as teclas dentro do corpo da calculadora', () => {
    for (const key of keys) {
      expect(Math.abs(key.x) + key.width / 2).toBeLessThan(body.width / 2)
      expect(Math.abs(key.y) + key.height / 2).toBeLessThan(body.height / 2)
    }
  })

  it('reproduz as funções científicas e o teclado numérico da referência', () => {
    const labels = new Set(keys.map((key) => key.label))

    for (const label of [
      'SHIFT',
      'ALPHA',
      'MODE',
      'ON',
      'x⁻¹',
      'nCr',
      'Pol(',
      'x³',
      'sin',
      'cos',
      'tan',
      '7',
      '8',
      '9',
      'DEL',
      'AC',
      '0',
      'Ans',
      '=',
    ]) {
      expect(labels.has(label), `tecla ${label}`).toBe(true)
    }

    expect(scientificKeyRows).toHaveLength(8)
  })

  it('posiciona o conjunto direcional entre os botões de função', () => {
    expect(dpadKeys).toHaveLength(5)
    expect(dpadKeys.map((key) => key.label)).toEqual(['▲', '◀', '●', '▶', '▼'])
  })

  it('adiciona as legendas secundárias das funções SHIFT e ALPHA', () => {
    expect(keys.some((key) => key.secondaryLabel === 'sin⁻¹')).toBe(true)
    expect(keys.some((key) => key.secondaryTone === 'red')).toBe(true)
  })

  it('utiliza apenas tons previstos na paleta', () => {
    for (const key of keys) {
      expect(tones.has(key.tone)).toBe(true)
    }
  })
})
