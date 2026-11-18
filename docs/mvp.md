# MVP do CalcDeck

## O que é um MVP

MVP significa **Produto Mínimo Viável** (_Minimum Viable Product_). É a menor versão de um produto
que já entrega valor de verdade para quem usa e, ao mesmo tempo, permite aprender com esse uso.

Um MVP não é uma demonstração sem funções, nem a versão final: é um recorte pequeno, funcional e
testável do produto. Ele deve funcionar de ponta a ponta no escopo a que se propõe.

## Para que ele serve

- **Validar a proposta** com pessoas reais antes de investir em algo maior.
- **Coletar feedback cedo**, enquanto mudanças ainda são baratas.
- **Reduzir riscos e custos**, evitando construir funcionalidades que ninguém usa.
- **Priorizar os próximos passos** com base no uso e no retorno dos usuários.
- **Alinhar a equipe** em torno do que é essencial agora.

Resumindo: o MVP existe para aprender rápido e gastar pouco, não para ser completo.

## O que o MVP do CalcDeck já entrega

- Calculadora científica 3D inspirada na Casio fx‑82MS.
- Operações básicas e funções científicas (trigonometria, logaritmos, potências, raízes, fatorial,
  combinações, porcentagem, constantes e memória).
- Modos angulares (DEG/RAD/GRA), variáveis, `Ans`, frações, notação de engenharia e DMS.
- Visor LCD dinâmico com expressão, cursor e indicadores.
- Interação clicando nas teclas 3D ou usando o teclado físico.
- Tratamento de erros (`Syntax ERROR`, `Math ERROR`) e testes automatizados.

## O que ainda não está 100% funcional

O CalcDeck é um **MVP em evolução**, não um produto final. Limitações conhecidas:

- `S-SUM` e `S-VAR` (modos estatísticos SD/REG) ainda não existem; o visor apenas avisa
  “SD mode only”.
- `MODE` simplificado: alterna DEG/RAD/GRA em vez de abrir o menu completo do modelo físico.
- `a b/c` converte o resultado em fração, mas ainda não permite digitar frações na expressão.
- `RCL` acessa diretamente a memória `M`; a seleção de variável após `RCL` é simplificada.
- O comportamento não é idêntico ao da calculadora física em todos os detalhes de arredondamento,
  formatação e edição.
- Não há catálogo de modelos, contas de usuário, histórico persistente nem acessibilidade completa.

## Como saber se este MVP cumpriu seu papel

- O usuário consegue resolver cálculos do dia a dia de ponta a ponta sem travar.
- O feedback aponta problemas recorrentes e priorizáveis.
- As hipóteses principais (utilidade e usabilidade do modelo 3D) são confirmadas ou descartadas.
- Fica claro qual funcionalidade deve entrar na próxima versão.

## Próximos passos sugeridos

1. Implementar os modos estatísticos SD/REG (`S-SUM`/`S-VAR`).
2. Criar o menu `MODE` completo.
3. Permitir entrada de frações pela tecla `a b/c`.
4. Adicionar histórico de cálculos e catálogo de modelos.
5. Realizar testes de usabilidade com estudantes.
