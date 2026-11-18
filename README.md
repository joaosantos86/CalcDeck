# CalcDeck

Plataforma web que permite selecionar diferentes modelos de calculadoras científicas e utilizá-los
virtualmente, reproduzindo sua interface e funcionamento. O objetivo é que estudantes possam praticar
com modelos específicos mesmo sem possuir o dispositivo físico.

> **Status:** MVP funcional da calculadora científica vertical inspirada na Casio fx‑82MS.
> As teclas, o visor e o teclado físico operam sobre um motor de cálculo próprio, mas o produto
> **ainda não está 100% funcional**. Algumas funções do modelo físico são simplificadas e ainda não
> há catálogo de modelos nem autenticação.
>
> Entenda o escopo e as limitações em [docs/mvp.md](docs/mvp.md) (objetivo, tecnologias e atalhos).

## Tecnologias

- [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Three.js](https://threejs.org/) + [TresJS](https://tresjs.org/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Vue Router](https://router.vuejs.org/)
- [Pinia](https://pinia.vuejs.org/)
- [Vitest](https://vitest.dev/)
- [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/)

## Pré-requisitos

- Node.js `^22.18.0` ou `>=24.12.0`
- npm (o projeto usa npm como gerenciador de pacotes e é desenvolvido com o npm 11)

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

O servidor de desenvolvimento é iniciado em `http://localhost:5173` por padrão.

## Comandos disponíveis

| Comando                | Descrição                                               |
| ---------------------- | ------------------------------------------------------- |
| `npm run dev`          | Inicia o servidor de desenvolvimento com HMR            |
| `npm run build`        | Verifica os tipos e gera o build de produção em `dist/` |
| `npm run preview`      | Serve localmente o build de produção                    |
| `npm run type-check`   | Executa a verificação de tipos com `vue-tsc`            |
| `npm run lint`         | Executa o ESLint em todo o projeto                      |
| `npm run lint:fix`     | Executa o ESLint e corrige problemas automaticamente    |
| `npm run format`       | Formata os arquivos com Prettier                        |
| `npm run format:check` | Verifica a formatação sem alterar arquivos              |
| `npm run test`         | Executa os testes unitários uma única vez               |
| `npm run test:watch`   | Executa os testes unitários em modo watch               |

## Estrutura do projeto

```text
.
├── docs/                   # Escopo do MVP, limitações e próximos passos
├── public/                 # Arquivos servidos na raiz (favicon)
├── src/
│   ├── assets/             # Recursos estáticos importados pela aplicação
│   ├── components/
│   │   └── calculator/     # Cena, modelo, corpo, visor, teclas, pad, luzes e câmera 3D
│   ├── composables/        # Lógica reutilizável do Vue
│   ├── data/               # Configuração do layout da calculadora e dados estáticos
│   ├── router/             # Configuração das rotas
│   ├── services/           # Serviços e integrações
│   ├── stores/             # Stores do Pinia
│   ├── styles/             # Estilos globais e tokens do Tailwind
│   ├── types/              # Tipagens e interfaces compartilhadas
│   ├── utils/              # Geometria, texturas de canvas e utilitários
│   ├── views/              # Páginas da aplicação
│   ├── App.vue             # Componente raiz
│   └── main.ts             # Inicialização do Vue, Pinia e Router
├── index.html
├── vite.config.ts          # Configuração do Vite, alias, Tailwind e TresJS
├── vitest.config.ts        # Configuração dos testes unitários
├── eslint.config.js        # ESLint (flat config)
└── tsconfig*.json          # Configurações do TypeScript (app, node e testes)
```

### Calculadora 3D

- `CalculatorScene.vue` monta o canvas do TresJS, com renderer, sombras e tone mapping.
- `CalculatorModel.vue` compõe o corpo, o visor e as teclas do modelo.
- `CalculatorBody.vue`, `CalculatorDisplay.vue`, `CalculatorKey.vue` e `NavigationPad.vue` constroem
  o corpo vertical, o LCD, as teclas individuais e o conjunto direcional com geometria 3D real.
- `src/data/scientificCalculator.ts` define dimensões, inscrições do modelo fx‑82MS e a organização
  das funções, teclas numéricas, legendas secundárias (SHIFT/ALPHA) e a ação executada por cada tecla.
- `CameraRig.vue` configura a câmera em perspectiva, o enquadramento responsivo e o `OrbitControls`
  com limites de rotação, zoom e deslocamento.
- `SceneLighting.vue` e `SceneEnvironment.vue` cuidam da iluminação de estúdio, das sombras e das
  reflexões PBR.

### Motor de cálculo

- `src/utils/calculatorEngine.ts` tokeniza e interpreta a expressão (descida recursiva, sem `eval`),
  com precedência, parênteses, multiplicação implícita, potências e funções científicas.
- `src/stores/calculator.ts` guarda a expressão, o cursor, o modo angular (DEG/RAD/GRA), a memória,
  as variáveis A–D/X/Y/M, o histórico do último resultado e as ações de cada tecla.
- `src/utils/canvasTextures.ts` desenha o LCD em um canvas reutilizado: linha de expressão com cursor,
  indicadores (modo, SHIFT, ALPHA, hyp, M, INS) e a linha principal em sete segmentos. O visor é
  redesenhado sempre que o estado muda.
- Clicar em uma tecla do modelo 3D (ou usar o teclado físico) dispara as mesmas ações do motor.

#### Funções disponíveis

- Aritmética: `+ − × ÷`, potência (`^` e `x√`), parênteses, sinal negativo, porcentagem e `×10ˣ`.
- Científicas: `x²`, `x³`, `x⁻¹`, `√`, `∛`, `n!`, `nCr`, `nPr`, `log`, `ln`, `10ˣ`, `eˣ`, `π`, `e`,
  `sin`, `cos`, `tan` e as inversas com SHIFT, além de hiperbólicas com `hyp`.
- Coordenadas: `Pol(` e `Rec(`, com os resultados gravados em `X` e `Y`.
- Memória: `M+`, `RCL`, `STO` (SHIFT + RCL) e variáveis `A`, `B`, `C`, `D`, `X`, `Y`, `M` via ALPHA.
- Utilidades: `Ans`, `Ran#`, `Rnd`, `ENG`, `° ′ ″` (DMS), `a b/c` (fração), `MODE`/`DRG▶` e `INS`.
- Edição: `DEL`, `AC`/`OFF`, `ON`, e as setas para mover o cursor pela expressão.
- Erros: `Syntax ERROR`, `Math ERROR` e `Stack ERROR` aparecem no visor e podem ser corrigidos com
  `DEL` ou `AC`.

#### Atalhos do teclado físico

| Tecla                   | Ação                                |
| ----------------------- | ----------------------------------- |
| `0`–`9`, `.`, `,`       | Digitar números e separador decimal |
| `+`, `-`, `*`, `/`, `^` | Operadores                          |
| `(` e `)`               | Parênteses                          |
| `Enter` ou `=`          | Calcular                            |
| `Backspace`             | Apagar                              |
| `Esc`                   | Limpar (AC)                         |
| `!`, `%`                | Fatorial e porcentagem              |
| `s`, `c`, `t`           | Seno, cosseno e tangente            |
| `r`, `l`, `n`           | Raiz, log e log natural             |
| `p`, `a`                | π e Ans                             |
| `h`                     | Alternar modo hiperbólico           |
| `F9`                    | Trocar o sinal                      |

### Convenções

- O alias `@/` aponta para `src/` no TypeScript, no Vite e no Vitest.
- O TypeScript está em modo estrito, com `noUncheckedIndexedAccess`, `noUnusedLocals`,
  `noUnusedParameters` e `noFallthroughCasesInSwitch`.
- O Tailwind CSS é configurado via CSS em `src/styles/main.css` (CSS-first, padrão da versão 4).
  Cores da marca (`brand-*`), superfícies, texto e tipografia ficam disponíveis como tokens.
- A rota inicial `/` está registrada em `src/router/index.ts`.
- O Pinia é registrado globalmente em `src/main.ts`; as stores ficam em `src/stores`.

## Identidade visual

- **Cor principal:** índigo/roxo (`brand-400` a `brand-600`).
- **Fundo:** cinza muito escuro (`surface`, `#09090b`).
- **Texto:** claro (`foreground`) com apoio de `muted`.
- **Tipografia:** sans-serif moderna, usando a pilha de fontes do sistema.
- **Estética:** minimalista, tecnológica e limpa.

## Variáveis de ambiente

Nenhuma variável de ambiente é necessária no momento. Quando surgir essa necessidade, crie um
`.env.example` documentado e use arquivos `.env*` locais (já ignorados pelo Git).

## Testes

Os testes ficam em diretórios `__tests__` próximos ao código testado, com o sufixo `.spec.ts`.
O ambiente padrão é `jsdom` e o Vitest reaproveita a configuração do Vite, incluindo o alias `@/`.
