

## Corrigir Importação de Dados (Sheets, CSV, JSON)

### Problemas Identificados

1. **Google Sheets**: O `fetch()` direto para `docs.google.com` é bloqueado por CORS no navegador — a requisição falha silenciosamente
2. **Falhas silenciosas**: Quando CSV/JSON/Sheets retorna array vazio (headers não reconhecidos, formato errado), nenhuma mensagem de erro é exibida ao usuário
3. **Headers CSV inflexíveis**: Se o CSV do usuário tem colunas com nomes ligeiramente diferentes (ex: "Nome do Aluno" vs "Nome"), o parse falha sem aviso

### Solução

**1. Google Sheets via Edge Function (proxy CORS)**
- Criar edge function `import-sheet` que faz o fetch do Google Sheets no servidor (sem CORS)
- Retorna o JSON já parseado para o frontend
- `importFromSheet` chama a edge function ao invés de fetch direto

**2. Feedback com Toast em todas as importações**
- Importar `toast` do sonner em `useStudentData.ts`
- Mostrar toast de sucesso com quantidade de alunos importados
- Mostrar toast de erro quando o parse retorna vazio ou a requisição falha
- Mensagens claras: "X alunos importados com sucesso" / "Formato não reconhecido. Verifique as colunas do arquivo."

**3. Parser CSV mais flexível**
- Aceitar mais variações de headers: "nome do aluno", "estudante", "aluno(a)", etc.
- Se não encontrar coluna de pokémon, usar "bulbasaur" como padrão (ao invés de rejeitar o arquivo inteiro)
- Log das colunas detectadas no console para debug

**4. Parser JSON mais flexível**
- Aceitar também objetos com chaves em pt-BR: `nome`, `pokémon`, `tipo`, `tarefas`
- Aceitar objeto raiz com array dentro (ex: `{ alunos: [...] }`)

### Arquivos

| Arquivo | Mudança |
|---|---|
| `supabase/functions/import-sheet/index.ts` | Nova edge function proxy para Google Sheets |
| `src/hooks/useStudentData.ts` | Chamar edge function, adicionar toasts, melhorar parsers |

### Detalhes Técnicos

**Edge Function `import-sheet`:**
```typescript
// Faz fetch do Google Sheets URL, retorna texto raw
// Evita CORS pois roda no servidor
```

**Toasts:** Usar `import { toast } from 'sonner'` (já disponível no projeto via sonner/toaster).

