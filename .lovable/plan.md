

## Corrigir feedback do botão "Atualizar"

### Diagnóstico

O botão **está funcionando** — a requisição ao banco retorna 200 com dados. O problema é que não há feedback visual claro: o spinner gira muito rápido (a query é rápida) e não há toast confirmando que os dados foram atualizados. O timestamp muda mas é pequeno e fácil de não notar.

### Alterações

**1. `src/hooks/useStudentData.ts`** — Adicionar toast de feedback no `refreshFromSheet`
- Após `fetchStudents()` completar com sucesso, chamar `toast.success('Dados atualizados!')` para dar feedback claro ao usuário

**2. (Opcional) Garantir spinner mínimo visível**  
- Adicionar um `await` mínimo de ~300ms no `refreshFromSheet` para que o spinner seja perceptível, evitando que pareça que nada aconteceu

### Resultado
O usuário verá uma notificação toast confirmando que os dados foram atualizados ao clicar no botão "Atualizar".

