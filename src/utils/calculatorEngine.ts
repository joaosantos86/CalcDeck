import type { AngleMode, CalculatorFunction, CalculatorVariable } from '@/types/calculator'

export type CalculatorErrorKind = 'Syntax ERROR' | 'Math ERROR' | 'Stack ERROR'

export class CalculatorError extends Error {
  readonly kind: CalculatorErrorKind

  constructor(kind: CalculatorErrorKind) {
    super(kind)
    this.name = 'CalculatorError'
    this.kind = kind
  }
}

export type Variables = Record<CalculatorVariable, number>

export interface EvaluationContext {
  angleMode: AngleMode
  ans: number
  memory: number
  variables: Variables
}

export type EvaluationResult =
  { ok: true; value: number; variables: Variables } | { ok: false; error: CalculatorErrorKind }

type Token =
  | { type: 'number'; text: string; value: number }
  | { type: 'operator'; text: '+' | '-' | '*' | '/' | '^' }
  | { type: 'lparen'; text: '(' }
  | { type: 'rparen'; text: ')' }
  | { type: 'comma'; text: ',' }
  | { type: 'postfix'; text: '!' | '²' | '³' | '⁻¹' | '%' }
  | { type: 'function'; text: string; name: CalculatorFunction }
  | { type: 'constant'; text: string; name: 'pi' | 'e' | 'ans' }
  | { type: 'variable'; text: string; name: CalculatorVariable }

interface FunctionKeyword {
  text: string
  name: CalculatorFunction
  arity: number
}

const FUNCTION_KEYWORDS: FunctionKeyword[] = [
  { text: 'asinh(', name: 'asinh', arity: 1 },
  { text: 'acosh(', name: 'acosh', arity: 1 },
  { text: 'atanh(', name: 'atanh', arity: 1 },
  { text: 'sinh(', name: 'sinh', arity: 1 },
  { text: 'cosh(', name: 'cosh', arity: 1 },
  { text: 'tanh(', name: 'tanh', arity: 1 },
  { text: 'root(', name: 'root', arity: 2 },
  { text: 'sqrt(', name: 'sqrt', arity: 1 },
  { text: 'cbrt(', name: 'cbrt', arity: 1 },
  { text: 'asin(', name: 'asin', arity: 1 },
  { text: 'acos(', name: 'acos', arity: 1 },
  { text: 'atan(', name: 'atan', arity: 1 },
  { text: 'sin(', name: 'sin', arity: 1 },
  { text: 'cos(', name: 'cos', arity: 1 },
  { text: 'tan(', name: 'tan', arity: 1 },
  { text: 'log(', name: 'log', arity: 1 },
  { text: 'exp10(', name: 'exp10', arity: 1 },
  { text: 'ln(', name: 'ln', arity: 1 },
  { text: 'exp(', name: 'exp', arity: 1 },
  { text: 'nCr(', name: 'nCr', arity: 2 },
  { text: 'nPr(', name: 'nPr', arity: 2 },
  { text: 'Pol(', name: 'Pol', arity: 2 },
  { text: 'Rec(', name: 'Rec', arity: 2 },
]

const CONSTANT_KEYWORDS = [
  { text: 'Ans', name: 'ans' as const },
  { text: 'π', name: 'pi' as const },
]

const VARIABLE_LETTERS = new Set(['A', 'B', 'C', 'D', 'X', 'Y', 'M'])

const POSTFIX_CHARACTERS = new Set(['!', '²', '³', '%'])

function isDigit(character: string | undefined): boolean {
  return character !== undefined && character >= '0' && character <= '9'
}

/** Splits an expression into numbers and the glyphs used by the calculator. */
export function tokenize(expression: string): Token[] {
  const tokens: Token[] = []
  let index = 0

  while (index < expression.length) {
    const character = expression[index]!

    if (character === ' ') {
      index += 1
      continue
    }

    if (isDigit(character) || character === '.') {
      const start = index
      while (
        index < expression.length &&
        (isDigit(expression[index]) || expression[index] === '.')
      ) {
        index += 1
      }
      if (expression[index] === 'E') {
        index += 1
        if (expression[index] === '-') index += 1
        while (isDigit(expression[index])) index += 1
      }
      const text = expression.slice(start, index)
      const value = Number(text)
      if (!Number.isFinite(value)) {
        throw new CalculatorError('Syntax ERROR')
      }
      tokens.push({ type: 'number', text, value })
      continue
    }

    const functionKeyword = FUNCTION_KEYWORDS.find((keyword) =>
      expression.startsWith(keyword.text, index),
    )
    if (functionKeyword) {
      tokens.push({ type: 'function', text: functionKeyword.text, name: functionKeyword.name })
      index += functionKeyword.text.length
      continue
    }

    const constantKeyword = CONSTANT_KEYWORDS.find((keyword) =>
      expression.startsWith(keyword.text, index),
    )
    if (constantKeyword) {
      tokens.push({ type: 'constant', text: constantKeyword.text, name: constantKeyword.name })
      index += constantKeyword.text.length
      continue
    }

    if (character === 'e') {
      tokens.push({ type: 'constant', text: 'e', name: 'e' })
      index += 1
      continue
    }

    if (VARIABLE_LETTERS.has(character)) {
      tokens.push({ type: 'variable', text: character, name: character as CalculatorVariable })
      index += 1
      continue
    }

    if (
      character === '+' ||
      character === '-' ||
      character === '*' ||
      character === '/' ||
      character === '^'
    ) {
      tokens.push({ type: 'operator', text: character })
      index += 1
      continue
    }

    if (character === '(') {
      tokens.push({ type: 'lparen', text: '(' })
      index += 1
      continue
    }

    if (character === ')') {
      tokens.push({ type: 'rparen', text: ')' })
      index += 1
      continue
    }

    if (character === ',') {
      tokens.push({ type: 'comma', text: ',' })
      index += 1
      continue
    }

    if (character === '⁻' && expression[index + 1] === '¹') {
      tokens.push({ type: 'postfix', text: '⁻¹' })
      index += 2
      continue
    }

    if (POSTFIX_CHARACTERS.has(character)) {
      tokens.push({ type: 'postfix', text: character as '!' | '²' | '³' | '%' })
      index += 1
      continue
    }

    throw new CalculatorError('Syntax ERROR')
  }

  return tokens
}

type Node =
  | { type: 'number'; value: number }
  | { type: 'constant'; name: 'pi' | 'e' | 'ans' }
  | { type: 'variable'; name: CalculatorVariable }
  | { type: 'unary'; operator: '+' | '-'; argument: Node }
  | { type: 'binary'; operator: '+' | '-' | '*' | '/' | '^'; left: Node; right: Node }
  | { type: 'call'; name: CalculatorFunction; args: Node[] }
  | { type: 'postfix'; operator: '!' | '²' | '³' | '⁻¹' | '%'; argument: Node }

const FUNCTION_ARITY: Record<CalculatorFunction, number> = {
  sin: 1,
  cos: 1,
  tan: 1,
  asin: 1,
  acos: 1,
  atan: 1,
  sinh: 1,
  cosh: 1,
  tanh: 1,
  asinh: 1,
  acosh: 1,
  atanh: 1,
  sqrt: 1,
  cbrt: 1,
  log: 1,
  ln: 1,
  exp10: 1,
  exp: 1,
  nCr: 2,
  nPr: 2,
  Pol: 2,
  Rec: 2,
  root: 2,
}

function startsPrimary(token: Token | undefined): boolean {
  if (!token) return false
  return (
    token.type === 'number' ||
    token.type === 'constant' ||
    token.type === 'variable' ||
    token.type === 'function' ||
    token.type === 'lparen'
  )
}

class Parser {
  private position = 0

  constructor(private readonly tokens: Token[]) {}

  parse(): Node {
    if (this.tokens.length === 0) {
      throw new CalculatorError('Syntax ERROR')
    }

    const node = this.parseExpression()
    if (this.position < this.tokens.length) {
      throw new CalculatorError('Syntax ERROR')
    }
    return node
  }

  private peek(): Token | undefined {
    return this.tokens[this.position]
  }

  private consume(): Token {
    const token = this.tokens[this.position]
    if (!token) {
      throw new CalculatorError('Syntax ERROR')
    }
    this.position += 1
    return token
  }

  private parseExpression(): Node {
    let left = this.parseTerm()

    while (true) {
      const token = this.peek()
      if (token?.type === 'operator' && (token.text === '+' || token.text === '-')) {
        this.consume()
        const right = this.parseTerm()
        left = { type: 'binary', operator: token.text, left, right }
        continue
      }
      break
    }

    return left
  }

  private parseTerm(): Node {
    let left = this.parseUnary()

    while (true) {
      const token = this.peek()
      if (token?.type === 'operator' && (token.text === '*' || token.text === '/')) {
        this.consume()
        const right = this.parseUnary()
        left = { type: 'binary', operator: token.text, left, right }
        continue
      }

      // Implicit multiplication: 2π, 3(4+5), 2sin(30).
      if (startsPrimary(token)) {
        const right = this.parsePower()
        left = { type: 'binary', operator: '*', left, right }
        continue
      }

      break
    }

    return left
  }

  private parseUnary(): Node {
    const token = this.peek()
    if (token?.type === 'operator' && (token.text === '+' || token.text === '-')) {
      this.consume()
      return { type: 'unary', operator: token.text, argument: this.parseUnary() }
    }
    return this.parsePower()
  }

  private parsePower(): Node {
    const left = this.parsePostfix()
    const token = this.peek()

    if (token?.type === 'operator' && token.text === '^') {
      this.consume()
      const right = this.parseUnary()
      return { type: 'binary', operator: '^', left, right }
    }

    return left
  }

  private parsePostfix(): Node {
    let node = this.parsePrimary()

    while (true) {
      const token = this.peek()
      if (token?.type !== 'postfix') break
      this.consume()
      node = { type: 'postfix', operator: token.text, argument: node }
    }

    return node
  }

  private parsePrimary(): Node {
    const token = this.consume()

    if (token.type === 'number') {
      return { type: 'number', value: token.value }
    }

    if (token.type === 'constant') {
      return { type: 'constant', name: token.name }
    }

    if (token.type === 'variable') {
      return { type: 'variable', name: token.name }
    }

    if (token.type === 'lparen') {
      const node = this.parseExpression()
      const closing = this.consume()
      if (closing.type !== 'rparen') {
        throw new CalculatorError('Syntax ERROR')
      }
      return node
    }

    if (token.type === 'function') {
      const arity = FUNCTION_ARITY[token.name]
      const args: Node[] = []

      for (let index = 0; index < arity; index += 1) {
        if (index > 0) {
          const separator = this.consume()
          if (separator.type !== 'comma') {
            throw new CalculatorError('Syntax ERROR')
          }
        }
        args.push(this.parseExpression())
      }

      const closing = this.consume()
      if (closing.type !== 'rparen') {
        throw new CalculatorError('Syntax ERROR')
      }

      return { type: 'call', name: token.name, args }
    }

    throw new CalculatorError('Syntax ERROR')
  }
}

function toRadians(value: number, mode: AngleMode): number {
  if (mode === 'DEG') return (value * Math.PI) / 180
  if (mode === 'GRA') return (value * Math.PI) / 200
  return value
}

function fromRadians(value: number, mode: AngleMode): number {
  if (mode === 'DEG') return (value * 180) / Math.PI
  if (mode === 'GRA') return (value * 200) / Math.PI
  return value
}

function assertFinite(value: number): number {
  if (!Number.isFinite(value)) {
    throw new CalculatorError('Math ERROR')
  }
  return value
}

function factorial(value: number): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new CalculatorError('Math ERROR')
  }
  if (value > 170) {
    throw new CalculatorError('Math ERROR')
  }
  let result = 1
  for (let index = 2; index <= value; index += 1) {
    result *= index
  }
  return assertFinite(result)
}

function combinations(total: number, chosen: number): number {
  if (
    !Number.isInteger(total) ||
    !Number.isInteger(chosen) ||
    total < 0 ||
    chosen < 0 ||
    chosen > total
  ) {
    throw new CalculatorError('Math ERROR')
  }
  const size = Math.min(chosen, total - chosen)
  let result = 1
  for (let index = 1; index <= size; index += 1) {
    result = (result * (total - size + index)) / index
  }
  return assertFinite(Math.round(result))
}

function permutations(total: number, chosen: number): number {
  if (
    !Number.isInteger(total) ||
    !Number.isInteger(chosen) ||
    total < 0 ||
    chosen < 0 ||
    chosen > total
  ) {
    throw new CalculatorError('Math ERROR')
  }
  let result = 1
  for (let index = 0; index < chosen; index += 1) {
    result *= total - index
  }
  return assertFinite(result)
}

interface EvaluationState {
  context: EvaluationContext
  variables: Variables
}

function callFunction(name: CalculatorFunction, args: number[], state: EvaluationState): number {
  const { angleMode } = state.context
  const [first, second] = args

  switch (name) {
    case 'sin':
      return assertFinite(Math.sin(toRadians(first!, angleMode)))
    case 'cos':
      return assertFinite(Math.cos(toRadians(first!, angleMode)))
    case 'tan': {
      const radians = toRadians(first!, angleMode)
      if (Math.abs(Math.cos(radians)) < 1e-12) {
        throw new CalculatorError('Math ERROR')
      }
      return assertFinite(Math.tan(radians))
    }
    case 'asin':
      if (first! < -1 || first! > 1) throw new CalculatorError('Math ERROR')
      return assertFinite(fromRadians(Math.asin(first!), angleMode))
    case 'acos':
      if (first! < -1 || first! > 1) throw new CalculatorError('Math ERROR')
      return assertFinite(fromRadians(Math.acos(first!), angleMode))
    case 'atan':
      return assertFinite(fromRadians(Math.atan(first!), angleMode))
    case 'sinh':
      return assertFinite(Math.sinh(first!))
    case 'cosh':
      return assertFinite(Math.cosh(first!))
    case 'tanh':
      return assertFinite(Math.tanh(first!))
    case 'asinh':
      return assertFinite(Math.asinh(first!))
    case 'acosh':
      if (first! < 1) throw new CalculatorError('Math ERROR')
      return assertFinite(Math.acosh(first!))
    case 'atanh':
      if (first! <= -1 || first! >= 1) throw new CalculatorError('Math ERROR')
      return assertFinite(Math.atanh(first!))
    case 'sqrt':
      if (first! < 0) throw new CalculatorError('Math ERROR')
      return assertFinite(Math.sqrt(first!))
    case 'cbrt':
      return assertFinite(Math.cbrt(first!))
    case 'log':
      if (first! <= 0) throw new CalculatorError('Math ERROR')
      return assertFinite(Math.log10(first!))
    case 'ln':
      if (first! <= 0) throw new CalculatorError('Math ERROR')
      return assertFinite(Math.log(first!))
    case 'exp10':
      return assertFinite(10 ** first!)
    case 'exp':
      return assertFinite(Math.exp(first!))
    case 'root':
      if (first === 0) throw new CalculatorError('Math ERROR')
      if (second! < 0 && Math.abs(first! % 2) === 1) {
        return assertFinite(-((-second!) ** (1 / first!)))
      }
      return assertFinite(second! ** (1 / first!))
    case 'nCr':
      return combinations(first!, second!)
    case 'nPr':
      return permutations(first!, second!)
    case 'Pol': {
      const radius = Math.hypot(first!, second!)
      const angle = fromRadians(Math.atan2(second!, first!), angleMode)
      state.variables.X = radius
      state.variables.Y = angle
      return radius
    }
    case 'Rec': {
      const radians = toRadians(second!, angleMode)
      const x = first! * Math.cos(radians)
      const y = first! * Math.sin(radians)
      state.variables.X = x
      state.variables.Y = y
      return x
    }
    default:
      throw new CalculatorError('Syntax ERROR')
  }
}

function evaluateNode(node: Node, state: EvaluationState): number {
  switch (node.type) {
    case 'number':
      return node.value
    case 'constant':
      if (node.name === 'pi') return Math.PI
      if (node.name === 'e') return Math.E
      return state.context.ans
    case 'variable':
      if (node.name === 'M') return state.context.memory
      return state.variables[node.name] ?? 0
    case 'unary': {
      const value = evaluateNode(node.argument, state)
      return node.operator === '-' ? -value : value
    }
    case 'postfix': {
      const value = evaluateNode(node.argument, state)
      switch (node.operator) {
        case '!':
          return factorial(value)
        case '²':
          return assertFinite(value ** 2)
        case '³':
          return assertFinite(value ** 3)
        case '⁻¹':
          if (value === 0) throw new CalculatorError('Math ERROR')
          return assertFinite(1 / value)
        case '%':
          return assertFinite(value / 100)
        default:
          throw new CalculatorError('Syntax ERROR')
      }
    }
    case 'binary': {
      if (
        (node.operator === '+' || node.operator === '-') &&
        node.right.type === 'postfix' &&
        node.right.operator === '%'
      ) {
        const left = evaluateNode(node.left, state)
        const percentage = evaluateNode(node.right.argument, state) / 100
        return assertFinite(
          node.operator === '+' ? left + left * percentage : left - left * percentage,
        )
      }

      const left = evaluateNode(node.left, state)
      const right = evaluateNode(node.right, state)

      switch (node.operator) {
        case '+':
          return assertFinite(left + right)
        case '-':
          return assertFinite(left - right)
        case '*':
          return assertFinite(left * right)
        case '/':
          if (right === 0) throw new CalculatorError('Math ERROR')
          return assertFinite(left / right)
        case '^':
          return assertFinite(left ** right)
        default:
          throw new CalculatorError('Syntax ERROR')
      }
    }
    case 'call': {
      const args = node.args.map((argument) => evaluateNode(argument, state))
      return callFunction(node.name, args, state)
    }
    default:
      throw new CalculatorError('Syntax ERROR')
  }
}

export function createVariables(): Variables {
  return { A: 0, B: 0, C: 0, D: 0, X: 0, Y: 0, M: 0 }
}

export function evaluateExpression(
  expression: string,
  context: EvaluationContext,
): EvaluationResult {
  try {
    const tokens = tokenize(expression)
    const ast = new Parser(tokens).parse()
    const variables = { ...context.variables }
    const value = evaluateNode(ast, { context, variables })

    if (!Number.isFinite(value)) {
      throw new CalculatorError('Math ERROR')
    }

    return { ok: true, value, variables }
  } catch (error) {
    if (error instanceof CalculatorError) {
      return { ok: false, error: error.kind }
    }
    return { ok: false, error: 'Syntax ERROR' }
  }
}

/** Rounds to the 10 significant digits a fx-82MS keeps internally. */
export function roundToPrecision(value: number): number {
  if (value === 0) return 0
  return Number(value.toPrecision(10))
}

/**
 * Formats a number the way the LCD expects it: fixed notation inside the
 * display range and `E` notation outside of it.
 */
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return 'Math ERROR'
  }

  const rounded = roundToPrecision(value)
  const absolute = Math.abs(rounded)

  if (absolute !== 0 && (absolute >= 1e10 || absolute < 1e-9)) {
    const exponent = Math.floor(Math.log10(absolute))
    const mantissa = roundToPrecision(rounded / 10 ** exponent)
    return `${String(mantissa)}E${exponent}`
  }

  let text = String(rounded)

  if (text.includes('e')) {
    const [mantissa, exponent] = text.split('e')
    text = `${mantissa}E${Number(exponent)}`
  }

  return text
}

export interface NumberSpan {
  start: number
  end: number
  text: string
}

/** All numeric literals of an expression, including unfinished ones like `1.`. */
export function findNumberSpans(expression: string): NumberSpan[] {
  const spans: NumberSpan[] = []
  let index = 0

  while (index < expression.length) {
    const character = expression[index]!
    if (!isDigit(character) && character !== '.') {
      index += 1
      continue
    }

    const start = index
    while (index < expression.length && (isDigit(expression[index]) || expression[index] === '.')) {
      index += 1
    }
    if (expression[index] === 'E') {
      index += 1
      if (expression[index] === '-') index += 1
      while (isDigit(expression[index])) index += 1
    }
    spans.push({ start, end: index, text: expression.slice(start, index) })
  }

  return spans
}

/** Numeric literal under (or immediately before) the caret. */
export function numberEntryAt(expression: string, caret: number): NumberSpan | null {
  const spans = findNumberSpans(expression)
  let match: NumberSpan | null = null

  for (const span of spans) {
    if (caret >= span.start && caret <= span.end) {
      match = span
    }
  }

  return match
}

/** True when the expression ends with an operator, comma or open call. */
export function isExpressionIncomplete(expression: string): boolean {
  const trimmed = expression.trimEnd()
  if (!trimmed) return true
  if (/[+\-*/^,(]$/.test(trimmed)) return true
  const keywords = [...FUNCTION_KEYWORDS.map((keyword) => keyword.text), 'Ans', 'π']
  return keywords.some((keyword) => trimmed.endsWith(keyword))
}

/** Balanced parentheses, useful to decide whether `=` can evaluate. */
export function hasBalancedParentheses(expression: string): boolean {
  let depth = 0
  for (const character of expression) {
    if (character === '(') depth += 1
    if (character === ')') {
      depth -= 1
      if (depth < 0) return false
    }
  }
  return depth === 0
}

/** Improper fraction approximation used by the `a b/c` key. */
export function toFraction(value: number): { numerator: number; denominator: number } | null {
  if (!Number.isFinite(value) || Number.isInteger(value)) {
    return null
  }

  const sign = value < 0 ? -1 : 1
  const absolute = Math.abs(value)
  const precision = 1e8
  let lowerNumerator = 0
  let lowerDenominator = 1
  let upperNumerator = 1
  let upperDenominator = 0

  for (let index = 0; index < 32; index += 1) {
    const mediantNumerator = lowerNumerator + upperNumerator
    const mediantDenominator = lowerDenominator + upperDenominator
    const approximation = mediantNumerator / mediantDenominator

    if (Math.abs(approximation - absolute) < 1 / precision) {
      return {
        numerator: sign * mediantNumerator,
        denominator: mediantDenominator,
      }
    }

    if (approximation < absolute) {
      lowerNumerator = mediantNumerator
      lowerDenominator = mediantDenominator
    } else {
      upperNumerator = mediantNumerator
      upperDenominator = mediantDenominator
    }
  }

  return null
}
