

## Plano: Corrigir animação de evolução + Adicionar exportação + Remover importação

### Problema da animação
A animação de evolução (`EvolutionAnimation`) pode não estar visível porque o painel admin (Sheet do Radix) tem um overlay que pode cobrir a animação mesmo com `z-[100]`. Além disso, quando o `evolveStudent` é chamado com o painel aberto, a animação fica por trás do Sheet. A correção é fechar o painel admin antes de disparar a animação, ou garantir que o z-index da animação seja superior ao do Sheet.

Outra possibilidade: se a pontuação do aluno já é >= 100 (estágio 1), o `evolveStudent` tenta ir para 200, mas o `diff` calcula errado se o score já ultrapassou o threshold sem ter sido "evoluído". Vou ajustar a lógica para não depender de adicionar score — apenas trocar o estágio e disparar a animação.

### Alterações

**1. `src/hooks/useStudentData.ts`**
- Refatorar `evolveStudent`: em vez de adicionar pontuação fictícia, apenas incrementar o estágio do pokémon e disparar a animação. Adicionar um campo `evolutionStage` ao student (ou usar um state separado) para controlar o estágio independente da pontuação
- Alternativa mais simples: manter a lógica atual mas garantir que `triggerEvolution` é chamado corretamente e a animação aparece

**2. `src/components/EvolutionAnimation.tsx`**
- Aumentar z-index para `z-[200]` para garantir que fica acima do Sheet do Radix (que usa `z-50`)

**3. `src/components/AdminPanel.tsx`**
- Remover toda a seção de importação (Google Sheets, CSV, JSON) da aba "Dados"
- Renomear aba "Dados" para "Exportar" ou similar
- Adicionar botões de exportação:
  - **Exportar CSV**: gera CSV com todos os alunos, tarefas e notas
  - **Exportar JSON**: gera JSON com a estrutura completa dos dados
- Manter o botão "Resetar para Demo"
- Remover props `onImportSheet`, `onImportCsv`, `onImportJson` da interface

**4. `src/pages/Index.tsx`**
- Remover as props de importação passadas ao AdminPanel
- Fechar o admin panel quando uma evolução é disparada (para a animação ser visível)

### Arquivos alterados
- `src/hooks/useStudentData.ts` — remover exports de import functions, adicionar export functions
- `src/components/EvolutionAnimation.tsx` — z-index fix
- `src/components/AdminPanel.tsx` — trocar importação por exportação
- `src/pages/Index.tsx` — limpar props, fechar admin ao evoluir

