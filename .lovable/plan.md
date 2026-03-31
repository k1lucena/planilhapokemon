

## Banco de Dados Supabase + Animação de Evolução + Importação Multi-formato

### 1. Configurar Supabase
- Conectar projeto Supabase externo ao Lovable
- Criar tabela `students` com colunas: `id` (uuid, PK), `name` (text, unique), `pokemon` (text), `type` (text), `tasks` (jsonb), `total_score` (integer), `created_at` (timestamptz)
- Habilitar RLS com política pública de leitura e escrita (sem auth, já que é um painel escolar)

### 2. Refatorar `useStudentData.ts`
- Substituir localStorage por queries Supabase (`supabase.from('students')`)
- CRUD completo: `select`, `insert`, `update`, `delete` direto no banco
- Manter recálculo de `totalScore` antes de salvar
- Remover toda lógica de localStorage

### 3. Importação Multi-formato (AdminPanel → aba Dados)
- **Google Sheets**: manter lógica atual de importação via URL pública (já existe)
- **CSV**: input de arquivo + parse com `Papa.parse` (papaparse) — detecta colunas Nome/Pokémon/Tipo/Tarefas
- **JSON**: input de arquivo + `JSON.parse` — espera array de objetos `{name, pokemon, type, tasks}`
- Todos os formatos inserem/atualizam no Supabase ao importar
- UI: 3 botões na aba Dados (Sheets / CSV / JSON) com file input para CSV e JSON

### 4. Animação de Evolução
- Criar componente `EvolutionAnimation.tsx`: overlay fullscreen com sequência animada
- Quando a pontuação de um aluno cruza 100 ou 200 pts (ao atualizar score):
  - Detectar mudança de estágio comparando antes/depois
  - Exibir animação: sprite antigo → flash de luz (scale + opacity) → sprite novo
  - Texto "EVOLUIU!" com efeito de glow
  - Duração ~2.5s, fecha automaticamente
- Integrar no `Index.tsx`: state para controlar qual aluno está evoluindo
- Hook `usePrevious` para comparar estágios anteriores

### Detalhes Técnicos

**Tabela SQL:**
```sql
CREATE TABLE students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  pokemon text NOT NULL,
  type text NOT NULL DEFAULT 'normal',
  tasks jsonb NOT NULL DEFAULT '[]',
  total_score integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public access" ON students FOR ALL USING (true) WITH CHECK (true);
```

**Parsing CSV:** Usar papaparse para detectar headers automaticamente (mesma lógica de detecção de colunas do Sheets)

**Arquivos a criar:** `src/components/EvolutionAnimation.tsx`
**Arquivos a modificar:** `src/hooks/useStudentData.ts`, `src/components/AdminPanel.tsx`, `src/pages/Index.tsx`
**Dependências a instalar:** `papaparse`, `@types/papaparse`

