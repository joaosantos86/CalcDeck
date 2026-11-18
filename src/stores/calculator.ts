import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'

import type {
  AngleMode,
  CalculatorDisplayState,
  CalculatorFunction,
  CalculatorKeyDefinition,
  CalculatorVariable,
  KeyAction,
} from '@/types/calculator'
import {
  createVariables,
  evaluateExpression,
  formatNumber,
  hasBalancedParentheses,
  isExpressionIncomplete,
  numberEntryAt,
  roundToPrecision,
  toFraction,
  type EvaluationContext,
  type Variables,
} from '@/utils/calculatorEngine'

const MODE_ORDER: AngleMode[] = ['DEG', 'RAD', 'GRA']

const SYSTEM_KEYS = [
  { text: 'asinh(', display: 'sinh⁻¹(' },
  { text: 'acosh(', display: 'cosh⁻¹(' },
  { text: 'atanh(', display: 'tanh⁻¹(' },
  { text: 'sinh(', display: 'sinh(' },
  { text: 'cosh(', display: 'cosh(' },
  { text: 'tanh(', display: 'tanh(' },
  { text: 'asin(', display: 'sin⁻¹(' },
  { text: 'acos(', display: 'cos⁻¹(' },
  { text: 'atan(', display: 'tan⁻¹(' },
  { text: 'exp10(', display: '10^(' },
  { text: 'sqrt(', display: '√(' },
  { text: 'cbrt(', display: '∛(' },
  { text: 'root(', display: 'x√(' },
  { text: 'exp(', display: 'e^(' },
] as const

/** Converts the internal expression into the glyphs printed on the LCD. */
export function renderExpression(expression: string): string {
  let rendered = expression

  for (const keyword of SYSTEM_KEYS) {
    rendered = rendered.split(keyword.text).join(keyword.display)
  }

  return rendered.replace(/\*/g, '×').replace(/\//g, '÷').replace(/-/g, '−')
}

function formatDms(value: number): string {
  const sign = value < 0 ? '−' : ''
  const absolute = Math.abs(value)
  const degrees = Math.floor(absolute)
  const minutesValue = (absolute - degrees) * 60
  const minutes = Math.floor(minutesValue)
  const seconds = roundToPrecision((minutesValue - minutes) * 60)

  return `${sign}${degrees}°${minutes}′${seconds}″`
}

function formatEngineering(value: number): string {
  if (value === 0) return '0'
  const exponent = Math.floor(Math.log10(Math.abs(value)) / 3) * 3
  const mantissa = roundToPrecision(value / 10 ** exponent)
  return `${mantissa}E${exponent}`
}

/** Casio calculators close open parentheses when `=` is pressed. */
function closeParentheses(expression: string): string {
  let depth = 0
  for (const character of expression) {
    if (character === '(') depth += 1
    else if (character === ')') depth -= 1
  }
  return depth > 0 ? expression + ')'.repeat(depth) : expression
}

interface FractionDisplay {
  numerator: number
  denominator: number
  mixed: boolean
}

function formatFraction({ numerator, denominator, mixed }: FractionDisplay): string {
  const sign = numerator < 0 ? '−' : ''
  const absolute = Math.abs(numerator)

  if (mixed && absolute > denominator) {
    const whole = Math.floor(absolute / denominator)
    const remainder = absolute % denominator
    if (remainder === 0) return `${sign}${whole}`
    return `${sign}${whole} ${remainder}/${denominator}`
  }

  return `${sign}${absolute}/${denominator}`
}

export const useCalculatorStore = defineStore('calculator', () => {
  const expression = ref('')
  const caret = ref(0)
  const mode = ref<AngleMode>('DEG')
  const shift = ref(false)
  const alpha = ref(false)
  const hyp = ref(false)
  const insert = ref(true)
  const memory = ref(0)
  const ans = ref(0)
  const variables = reactive<Variables>(createVariables())
  const error = ref<string | null>(null)
  const justEvaluated = ref(false)
  const lastExpression = ref('')
  const pendingStore = ref(false)
  const hint = ref('')
  const pressCounts = reactive<Record<string, number>>({})

  const fraction = ref<FractionDisplay | null>(null)
  const dmsText = ref<string | null>(null)
  const engineeringText = ref<string | null>(null)

  const context = computed<EvaluationContext>(() => ({
    angleMode: mode.value,
    ans: ans.value,
    memory: memory.value,
    variables: { ...variables },
  }))

  function resetViews(): void {
    fraction.value = null
    dmsText.value = null
    engineeringText.value = null
  }

  function resetPowerOn(): void {
    expression.value = ''
    caret.value = 0
    error.value = null
    justEvaluated.value = false
    lastExpression.value = ''
    shift.value = false
    alpha.value = false
    hyp.value = false
    pendingStore.value = false
    hint.value = ''
    resetViews()
  }

  function clearAll(): void {
    resetPowerOn()
    insert.value = true
  }

  /** Draft value used by memory, fraction, DMS and engineering functions. */
  function currentValue(): number | null {
    if (error.value) return null
    if (justEvaluated.value && expression.value) {
      const value = Number(expression.value)
      return Number.isFinite(value) ? value : null
    }

    const entry = numberEntryAt(expression.value, caret.value)
    if (entry) {
      let text = entry.text
      const before = expression.value.slice(0, entry.start)
      if (before.endsWith('-')) {
        const characterBeforeMinus = before.at(-2)
        if (characterBeforeMinus === undefined || /[+\-*/^(,]/.test(characterBeforeMinus)) {
          text = `-${text}`
        }
      }
      const value = Number(text)
      if (Number.isFinite(value)) return value
    }

    if (
      expression.value &&
      !isExpressionIncomplete(expression.value) &&
      hasBalancedParentheses(expression.value)
    ) {
      const result = evaluateExpression(expression.value, context.value)
      if (result.ok) return result.value
    }

    return null
  }

  function startEntry(): void {
    if (error.value) {
      clearAll()
    }
    if (justEvaluated.value) {
      expression.value = ''
      caret.value = 0
      justEvaluated.value = false
    }
    resetViews()
  }

  function insertAt(position: number, text: string, replace = 0): void {
    expression.value =
      expression.value.slice(0, position) + text + expression.value.slice(position + replace)
    caret.value = position + text.length
  }

  /** Types text at the caret, honouring insert/overwrite mode. */
  function typeText(text: string): void {
    startEntry()
    const character = expression.value[caret.value]
    const overwrite = !insert.value && character !== undefined && /[0-9.]/.test(character)
    insertAt(caret.value, text, overwrite ? 1 : 0)
  }

  function digitLimitReached(): boolean {
    const entry = numberEntryAt(expression.value, caret.value)
    if (!entry) return false
    const digits = entry.text.split('E')[0]!.replace(/\D/g, '')
    return digits.length >= 10
  }

  function inputDigit(digit: string): void {
    if (error.value) clearAll()
    if (
      !insert.value &&
      expression.value[caret.value] === '0' &&
      expression.value[caret.value + 1] !== '.'
    ) {
      insertAt(caret.value, digit, 1)
      resetViews()
      return
    }

    const entry = numberEntryAt(expression.value, caret.value)
    if (entry && entry.text === '0' && caret.value === entry.end) {
      insertAt(entry.start, digit, 1)
      resetViews()
      return
    }

    if (digitLimitReached()) return
    typeText(digit)
  }

  function inputDecimal(): void {
    startEntry()
    const entry = numberEntryAt(expression.value, caret.value)
    const mantissa = entry ? entry.text.split('E')[0]! : ''

    if (entry && mantissa.includes('.')) return
    if (!entry) {
      insertAt(caret.value, '0.')
      return
    }
    insertAt(caret.value, '.')
  }

  function inputOperator(operator: '+' | '-' | '*' | '/' | '^'): void {
    if (error.value) clearAll()
    if (justEvaluated.value) {
      justEvaluated.value = false
    }

    resetViews()

    if (!expression.value) {
      if (operator === '-') {
        expression.value = '-'
        caret.value = 1
        return
      }
      expression.value = 'Ans'
      caret.value = 3
    }

    const atEnd = caret.value >= expression.value.length
    const lastCharacter = expression.value[expression.value.length - 1]

    if (atEnd && lastCharacter !== undefined && /[+\-*/^]/.test(lastCharacter)) {
      // Replace a dangling operator, but keep a unary minus alive.
      if (expression.value.length === 1 && lastCharacter === '-') {
        typeText(operator)
        return
      }
      expression.value = expression.value.slice(0, -1) + operator
      return
    }

    if (atEnd && lastCharacter === '(' && operator !== '-') return

    insertAt(caret.value, operator)
  }

  function applyPostfix(operator: '!' | '²' | '³' | '⁻¹' | '%'): void {
    if (error.value) clearAll()

    if (justEvaluated.value && expression.value) {
      expression.value += operator
      caret.value = expression.value.length
      justEvaluated.value = false
      resetViews()
      return
    }

    startEntry()

    if (!expression.value) {
      expression.value = 'Ans'
      caret.value = 3
    } else if (isExpressionIncomplete(expression.value)) {
      return
    }

    const entry = numberEntryAt(expression.value, caret.value)
    const position = entry ? entry.end : caret.value
    insertAt(position, operator)
  }

  function toggleSign(): void {
    if (error.value) clearAll()
    if (justEvaluated.value) {
      expression.value = `-${expression.value}`
      caret.value = expression.value.length
      resetViews()
      return
    }

    resetViews()
    const entry = numberEntryAt(expression.value, caret.value)
    if (!entry) {
      insertAt(caret.value, '-')
      return
    }

    const before = expression.value.slice(0, entry.start)
    if (before.endsWith('-')) {
      const characterBeforeMinus = before.at(-2)
      if (characterBeforeMinus === undefined || /[+\-*/^(,]/.test(characterBeforeMinus)) {
        expression.value = before.slice(0, -1) + expression.value.slice(entry.start)
        if (caret.value > entry.start - 1) caret.value -= 1
        return
      }
    }

    const previousCaret = caret.value
    insertAt(entry.start, '-')
    caret.value = previousCaret >= entry.start ? previousCaret + 1 : previousCaret
  }

  /** Adds the unary minus that belongs to the number under the caret. */
  function signedEntryText(entry: { start: number; text: string }): string {
    const before = expression.value.slice(0, entry.start)
    if (before.endsWith('-')) {
      const characterBeforeMinus = before.at(-2)
      if (characterBeforeMinus === undefined || /[+\-*/^(,]/.test(characterBeforeMinus)) {
        return `-${entry.text}`
      }
    }
    return entry.text
  }
  function insertFunction(name: CalculatorFunction): void {
    if (hyp.value) {
      hyp.value = false
      const hyperbolic: Partial<Record<CalculatorFunction, CalculatorFunction>> = {
        sin: 'sinh',
        cos: 'cosh',
        tan: 'tanh',
        asin: 'asinh',
        acos: 'acosh',
        atan: 'atanh',
      }
      name = hyperbolic[name] ?? name
    }

    if (error.value) clearAll()

    if (justEvaluated.value && expression.value) {
      const previous = expression.value
      expression.value = `${name}(${previous})`
      caret.value = expression.value.length - 1
      justEvaluated.value = false
      resetViews()
      return
    }

    startEntry()
    insertAt(caret.value, `${name}(`)
  }

  function insertConstant(name: 'pi' | 'e' | 'ans'): void {
    startEntry()
    const text = name === 'pi' ? 'π' : name === 'e' ? 'e' : 'Ans'
    insertAt(caret.value, text)
  }

  function insertRandom(): void {
    startEntry()
    const value = Math.random()
    insertAt(caret.value, formatNumber(Number(value.toFixed(3))))
  }

  function applyRnd(): void {
    if (error.value) return
    const entry = numberEntryAt(expression.value, caret.value)
    const value = currentValue()
    if (value === null) return

    const rounded = formatNumber(roundToPrecision(value))
    if (entry) {
      expression.value =
        expression.value.slice(0, entry.start) + rounded + expression.value.slice(entry.end)
      caret.value = entry.start + rounded.length
    } else if (justEvaluated.value) {
      expression.value = rounded
      caret.value = rounded.length
    }
    resetViews()
  }

  function evaluate(): void {
    if (error.value) {
      clearAll()
      return
    }

    const source = closeParentheses(expression.value.trim())
    if (!source) return

    if (!hasBalancedParentheses(source)) {
      error.value = 'Syntax ERROR'
      return
    }

    const result = evaluateExpression(source, context.value)
    if (!result.ok) {
      error.value = result.error
      return
    }

    ans.value = result.value
    Object.assign(variables, result.variables)
    lastExpression.value = source
    expression.value = formatNumber(result.value)
    caret.value = expression.value.length
    justEvaluated.value = true
    resetViews()
  }

  function deleteCharacter(): void {
    if (error.value) {
      const failed = lastExpression.value
      clearAll()
      expression.value = failed
      caret.value = failed.length
      return
    }
    if (justEvaluated.value) {
      clearAll()
      return
    }
    if (caret.value === 0) return

    const before = expression.value.slice(0, caret.value)
    const keywords = [...SYSTEM_KEYS.map((keyword) => keyword.text), 'Ans', '⁻¹']
    const keyword = keywords.find((candidate) => before.endsWith(candidate))

    if (keyword) {
      expression.value =
        expression.value.slice(0, caret.value - keyword.length) +
        expression.value.slice(caret.value)
      caret.value -= keyword.length
      return
    }

    expression.value =
      expression.value.slice(0, caret.value - 1) + expression.value.slice(caret.value)
    caret.value -= 1
    resetViews()
  }

  function memoryAdd(sign: 1 | -1): void {
    const value = currentValue()
    if (value === null) return
    memory.value = roundToPrecision(memory.value + sign * value)
    hint.value = 'M+'
  }

  function storeVariable(letter: CalculatorVariable): void {
    const value = currentValue()
    if (value === null) {
      pendingStore.value = false
      return
    }
    if (letter === 'M') {
      memory.value = roundToPrecision(value)
    } else {
      variables[letter] = roundToPrecision(value)
    }
    pendingStore.value = false
    hint.value = `STO ${letter}`
  }

  function cycleAngleMode(): void {
    const index = MODE_ORDER.indexOf(mode.value)
    mode.value = MODE_ORDER[(index + 1) % MODE_ORDER.length]!
  }

  function toggleFraction(): void {
    if (fraction.value) {
      if (
        !fraction.value.mixed &&
        Math.abs(fraction.value.numerator) > fraction.value.denominator
      ) {
        fraction.value = { ...fraction.value, mixed: true }
        return
      }
      fraction.value = null
      return
    }

    const value = currentValue()
    if (value === null) return
    const result = toFraction(value)
    if (!result) return
    fraction.value = { ...result, mixed: false }
    dmsText.value = null
    engineeringText.value = null
  }

  function toggleDms(): void {
    if (dmsText.value) {
      dmsText.value = null
      return
    }
    const value = currentValue()
    if (value === null) return
    dmsText.value = formatDms(value)
    fraction.value = null
    engineeringText.value = null
  }

  function toggleEngineering(): void {
    if (engineeringText.value) {
      engineeringText.value = null
      return
    }
    const value = currentValue()
    if (value === null) return
    engineeringText.value = formatEngineering(value)
    fraction.value = null
    dmsText.value = null
  }

  function pressAction(action: KeyAction): void {
    hint.value = ''

    if (pendingStore.value && !action.startsWith('var:')) {
      pendingStore.value = false
    }

    switch (action) {
      case 'shift':
        shift.value = !shift.value
        alpha.value = false
        return
      case 'alpha':
        alpha.value = !alpha.value
        shift.value = false
        return
      case 'hyp':
        hyp.value = !hyp.value
        return
      case 'on':
      case 'clear':
        clearAll()
        return
      case 'mode':
      case 'drg':
        cycleAngleMode()
        return
      case 'delete':
        deleteCharacter()
        return
      case 'insert':
        insert.value = !insert.value
        return
      case 'equals':
        evaluate()
        return
      case 'decimal':
        inputDecimal()
        return
      case 'exponent':
        typeText('E')
        return
      case 'sign':
        toggleSign()
        return
      case 'comma':
        typeText(',')
        return
      case 'lparen':
        typeText('(')
        return
      case 'rparen':
        typeText(')')
        return
      case 'fraction':
        toggleFraction()
        return
      case 'engineering':
        toggleEngineering()
        return
      case 'dms':
        toggleDms()
        return
      case 'memory-add':
        memoryAdd(1)
        return
      case 'memory-recall':
        startEntry()
        insertAt(caret.value, 'M')
        return
      case 'store':
        pendingStore.value = true
        hint.value = 'STO'
        return
      case 'unsupported':
        hint.value = 'SD mode only'
        return
      default:
        break
    }

    if (action.startsWith('digit:')) {
      inputDigit(action.slice('digit:'.length))
      return
    }

    if (action.startsWith('op:')) {
      inputOperator(action.slice('op:'.length) as '+' | '-' | '*' | '/' | '^')
      return
    }

    if (action.startsWith('postfix:')) {
      applyPostfix(action.slice('postfix:'.length) as '!' | '²' | '³' | '⁻¹' | '%')
      return
    }

    if (action.startsWith('fn:')) {
      insertFunction(action.slice('fn:'.length) as CalculatorFunction)
      return
    }

    if (action.startsWith('const:')) {
      const name = action.slice('const:'.length)
      if (name === 'random') insertRandom()
      else if (name === 'rnd') applyRnd()
      else insertConstant(name as 'pi' | 'e' | 'ans')
      return
    }

    if (action.startsWith('var:')) {
      const letter = action.slice('var:'.length) as CalculatorVariable
      if (pendingStore.value) {
        storeVariable(letter)
        return
      }
      startEntry()
      insertAt(caret.value, letter)
      return
    }

    if (action.startsWith('cursor:')) {
      const direction = action.slice('cursor:'.length)
      if (direction === 'left') caret.value = Math.max(0, caret.value - 1)
      else if (direction === 'right')
        caret.value = Math.min(expression.value.length, caret.value + 1)
      else if (direction === 'start') caret.value = 0
      else caret.value = expression.value.length
    }
  }

  /** Resolves SHIFT/ALPHA (and pending STO) before running a physical key. */
  function pressKey(key: CalculatorKeyDefinition): void {
    pressCounts[key.id] = (pressCounts[key.id] ?? 0) + 1

    let action: KeyAction | null = key.action

    if (pendingStore.value && key.alphaAction?.startsWith('var:')) {
      action = key.alphaAction
    } else if (shift.value) {
      shift.value = false
      action = key.shiftAction ?? null
    } else if (alpha.value) {
      alpha.value = false
      action = key.alphaAction ?? null
    }

    if (action) pressAction(action)
    else hint.value = ''
  }

  function pressDigit(digit: string): void {
    pressAction(`digit:${digit}`)
  }

  const displayState = computed<CalculatorDisplayState>(() => {
    const renderedExpression = renderExpression(expression.value)
    const showCaret = !justEvaluated.value && !error.value && expression.value.length > 0
    const caretInRendered = showCaret
      ? renderExpression(expression.value.slice(0, caret.value)).length
      : null

    let value = '0'

    if (error.value) {
      value = error.value
    } else if (fraction.value) {
      value = formatFraction(fraction.value)
    } else if (dmsText.value) {
      value = dmsText.value
    } else if (engineeringText.value) {
      value = engineeringText.value
    } else if (justEvaluated.value) {
      value = expression.value || '0'
    } else {
      const entry = numberEntryAt(expression.value, caret.value)
      if (entry) {
        value = signedEntryText(entry)
      } else if (
        expression.value &&
        !isExpressionIncomplete(expression.value) &&
        hasBalancedParentheses(expression.value)
      ) {
        const result = evaluateExpression(expression.value, context.value)
        value = result.ok ? formatNumber(result.value) : '0'
      }
    }

    return {
      expression: justEvaluated.value
        ? `${renderExpression(lastExpression.value)}=`
        : renderedExpression,
      caret: caretInRendered,
      value,
      mode: mode.value,
      shift: shift.value,
      alpha: alpha.value,
      hyp: hyp.value,
      memory: memory.value !== 0,
      insert: insert.value,
      error: error.value,
      hint: hint.value || undefined,
    }
  })

  return {
    expression,
    caret,
    mode,
    shift,
    alpha,
    hyp,
    insert,
    memory,
    ans,
    variables,
    error,
    hint,
    pendingStore,
    pressCounts,
    displayState,
    pressAction,
    pressKey,
    pressDigit,
    evaluate,
    clearAll,
  }
})
