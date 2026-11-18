import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { calculatorKeys } from '@/data/scientificCalculator'
import { useCalculatorStore } from '@/stores/calculator'

function key(label: string) {
  const match = calculatorKeys.find((candidate) => candidate.label === label)
  if (!match) throw new Error(`tecla não encontrada: ${label}`)
  return match
}

describe('useCalculatorStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('calcula expressões digitadas nas teclas', () => {
    const calculator = useCalculatorStore()

    for (const digit of ['1', '2', '+', '3', '=']) {
      calculator.pressKey(key(digit))
    }

    expect(calculator.displayState.value).toBe('15')
    expect(calculator.displayState.expression).toBe('12+3=')
  })

  it('respeita a precedência dos operadores', () => {
    const calculator = useCalculatorStore()

    for (const digit of ['2', '+', '3', '×', '4', '=']) {
      calculator.pressKey(key(digit))
    }

    expect(calculator.displayState.value).toBe('14')
  })

  it('limpa a entrada com AC e apaga com DEL', () => {
    const calculator = useCalculatorStore()

    calculator.pressKey(key('9'))
    calculator.pressKey(key('9'))
    calculator.pressKey(key('DEL'))
    expect(calculator.displayState.value).toBe('9')

    calculator.pressKey(key('AC'))
    expect(calculator.displayState.value).toBe('0')
    expect(calculator.displayState.expression).toBe('')
  })

  it('alterna o sinal do número atual', () => {
    const calculator = useCalculatorStore()

    calculator.pressKey(key('5'))
    calculator.pressKey(key('(−)'))
    expect(calculator.displayState.value).toBe('-5')

    calculator.pressKey(key('(−)'))
    expect(calculator.displayState.value).toBe('5')
  })

  it('usa SHIFT para as funções inversas', () => {
    const calculator = useCalculatorStore()

    calculator.pressKey(key('SHIFT'))
    expect(calculator.displayState.shift).toBe(true)

    for (const label of ['sin', '0', '.', '5', '=']) {
      calculator.pressKey(key(label))
    }

    expect(calculator.displayState.value).toBe('30')
  })

  it('calcula seno em graus e alterna o modo angular', () => {
    const calculator = useCalculatorStore()

    calculator.pressKey(key('sin'))
    for (const label of ['3', '0', '=']) calculator.pressKey(key(label))
    expect(Number(calculator.displayState.value)).toBeCloseTo(0.5, 10)

    calculator.pressKey(key('MODE'))
    expect(calculator.displayState.mode).toBe('RAD')
    calculator.pressKey(key('MODE'))
    expect(calculator.displayState.mode).toBe('GRA')
    calculator.pressKey(key('MODE'))
    expect(calculator.displayState.mode).toBe('DEG')
  })

  it('armazena e recupera valores da memória', () => {
    const calculator = useCalculatorStore()

    calculator.pressKey(key('4'))
    calculator.pressKey(key('2'))
    calculator.pressKey(key('M+'))
    calculator.pressKey(key('AC'))

    calculator.pressKey(key('RCL'))
    expect(calculator.displayState.value).toBe('42')

    calculator.pressKey(key('='))
    expect(calculator.displayState.value).toBe('42')
  })

  it('aplica potência, raiz e fatorial pelos atalhos do visor', () => {
    const calculator = useCalculatorStore()

    calculator.pressKey(key('5'))
    calculator.pressKey(key('x²'))
    calculator.pressKey(key('='))
    expect(calculator.displayState.value).toBe('25')

    calculator.pressKey(key('AC'))
    calculator.pressKey(key('5'))
    calculator.pressKey(key('SHIFT'))
    calculator.pressKey(key('x⁻¹'))
    calculator.pressKey(key('='))
    expect(calculator.displayState.value).toBe('120')
  })

  it('move o cursor e edita no meio da expressão', () => {
    const calculator = useCalculatorStore()

    for (const label of ['1', '2', '3']) calculator.pressKey(key(label))
    calculator.pressKey(calculatorKeys.find((candidate) => candidate.id === 'dpad-left')!)
    calculator.pressKey(key('9'))

    expect(calculator.expression).toBe('1293')
  })

  it('ativa as funções hiperbólicas com hyp', () => {
    const calculator = useCalculatorStore()

    calculator.pressKey(key('hyp'))
    calculator.pressKey(key('sin'))

    expect(calculator.expression).toBe('sinh(')
    expect(calculator.displayState.hyp).toBe(false)
  })

  it('guarda um valor em uma variável com STO e recupera com ALPHA', () => {
    const calculator = useCalculatorStore()

    calculator.pressKey(key('4'))
    calculator.pressKey(key('2'))
    calculator.pressKey(key('SHIFT'))
    calculator.pressKey(key('RCL'))
    calculator.pressKey(key('(−)'))

    expect(calculator.variables.A).toBe(42)

    calculator.pressKey(key('AC'))
    calculator.pressKey(key('ALPHA'))
    calculator.pressKey(key('(−)'))
    calculator.pressKey(key('='))

    expect(calculator.displayState.value).toBe('42')
  })

  it('converte o resultado em graus, minutos e segundos', () => {
    const calculator = useCalculatorStore()

    for (const label of ['1', '.', '5', '=']) calculator.pressKey(key(label))
    calculator.pressKey(key('° ′ ″'))

    expect(calculator.displayState.value).toBe('1°30′0″')
  })

  it('mostra Math ERROR ao dividir por zero e recupera com AC', () => {
    const calculator = useCalculatorStore()

    for (const label of ['5', '÷', '0', '=']) calculator.pressKey(key(label))
    expect(calculator.displayState.value).toBe('Math ERROR')

    calculator.pressKey(key('AC'))
    expect(calculator.displayState.value).toBe('0')
    expect(calculator.displayState.error).toBeNull()
  })

  it('alterna a fração e a notação de engenharia do resultado', () => {
    const calculator = useCalculatorStore()

    for (const label of ['1', '÷', '4', '=']) calculator.pressKey(key(label))
    calculator.pressKey(key('a b/c'))
    expect(calculator.displayState.value).toBe('1/4')

    calculator.pressKey(key('AC'))
    for (const label of ['1', '2', '5', '0', '=']) calculator.pressKey(key(label))
    calculator.pressKey(key('ENG'))
    expect(calculator.displayState.value).toBe('1.25E3')
  })
})
