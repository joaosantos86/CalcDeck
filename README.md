# CalcDeck

Plataforma web que permite selecionar diferentes modelos de calculadoras científicas e utilizá-los
virtualmente, reproduzindo sua interface e funcionamento. O objetivo é que estudantes possam praticar
com modelos específicos mesmo sem possuir o dispositivo físico.

> **Status:** protótipo visual 3D da calculadora científica vertical inspirada na Casio fx‑82MS.
> As teclas e o visor ainda são apenas visuais; não há operações matemáticas, catálogo ou autenticação.

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
  das funções, teclas numéricas e legendas secundárias (SHIFT/ALPHA).
- `CameraRig.vue` configura a câmera em perspectiva, o enquadramento responsivo e o `OrbitControls`
  com limites de rotação, zoom e deslocamento.
- `SceneLighting.vue` e `SceneEnvironment.vue` cuidam da iluminação de estúdio, das sombras e das
  reflexões PBR.
- O visor exibe o valor estático `42.` e ainda não possui interação ou cálculo.

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
