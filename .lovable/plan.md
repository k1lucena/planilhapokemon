

## Remover evolução automática — apenas manual

### O que muda

A evolução do Pokémon deixa de acontecer automaticamente quando a pontuação cruza 100/200 pts. O professor precisará clicar no botão "Evoluir Pokémon" no painel admin para disparar a animação.

### Alterações

**1. `src/hooks/useStudentData.ts`**
- Remover a chamada `triggerEvolution` de dentro de `updateTaskScore` (linha 465-467)
- Remover a chamada `enqueueEvolutions` de dentro das funções de importação (CSV, Sheet, JSON)
- Manter `evolveStudent` e `triggerEvolution` intactos — são usados pelo botão manual

**2. `src/components/AdminPanel.tsx`**
- O botão "Evoluir Pokémon" já existe na aba Atividades — sem alterações necessárias

### Resultado
Pontuações podem subir livremente sem disparar evolução. O professor controla quando cada aluno evolui via o botão no painel.

