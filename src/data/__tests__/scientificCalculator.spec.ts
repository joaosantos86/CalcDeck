import { describe, expect, it } from 'vitest'

import type { KeyTone } from '@/types/calculator'

import {
  body,
  display,
  dpadKeys,
  keypadPlate,
  scientificKeyRows,
  scientificCalculator,
} from '../scientificCalculator'

describe('scientificCalculator', () => {
  const keys = scientificCalculator.keys
  const tones = new Set<KeyTone>(['light', 'medium', 'dark', 'red', 'orange'])

  it('define o corpo vertical e o visor inicial', () => {
    expect(body.height).toBeGreaterThan(body.width * 2)
    expect(display.value).toBe('0')
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

  it('deixa uma margem entre as teclas e a borda da placa do teclado', () => {
    const margin = 0.15
    const padLeft = -keypadPlate.width / 2
    const padRight = keypadPlate.width / 2
    const padBottom = keypadPlate.centerY - keypadPlate.height / 2
    const padTop = keypadPlate.centerY + keypadPlate.height / 2

    for (const key of keys) {
      expect(key.x - key.width / 2).toBeGreaterThan(padLeft + margin)
      expect(key.x + key.width / 2).toBeLessThan(padRight - margin)
      expect(key.y - key.height / 2).toBeGreaterThan(padBottom + margin)
      expect(key.y + key.height / 2).toBeLessThan(padTop - margin)
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

  it('mantém um vão entre todas as teclas', () => {
    const boxes = keys.map((key) => ({
      id: key.id,
      circle: key.shape === 'circle',
      x: key.x,
      y: key.y,
      radius: Math.min(key.width, key.height) / 2,
      left: key.x - key.width / 2,
      right: key.x + key.width / 2,
      bottom: key.y - key.height / 2,
      top: key.y + key.height / 2,
    }))

    for (let first = 0; first < boxes.length; first += 1) {
      for (let second = first + 1; second < boxes.length; second += 1) {
        const a = boxes[first]!
        const b = boxes[second]!
        const overlaps =
          a.circle && b.circle
            ? Math.hypot(a.x - b.x, a.y - b.y) < a.radius + b.radius
            : a.left < b.right && a.right > b.left && a.bottom < b.top && a.top > b.bottom

        expect(overlaps, `${a.id} encosta em ${b.id}`).toBe(false)
      }
    }
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
