

## Painel de Gerenciamento Local (CRUD de Alunos e Tarefas)

### Visão Geral
Adicionar um painel de administração dentro do app para criar, editar e excluir alunos e tarefas, usando **localStorage** como banco de dados local. O Google Sheets passa a ser apenas uma fonte de importação inicial opcional.

### Arquitetura de Dados

- **localStorage** armazena os alunos como JSON (`pokedex-arena-students`)
- Na primeira visita, carrega os dados mock como base inicial
- Botão opcional "Importar do Sheets" para puxar dados da planilha uma vez
- Todas as alterações (add/edit/delete aluno, add/edit tarefa) persistem no localStorage

### Novos Componentes

**1. `src/components/AdminPanel.tsx`** — Painel lateral (Sheet/Drawer) acessível por botão no header
- Lista de alunos com opções de editar/excluir
- Botão "Adicionar Aluno" abre formulário
- Seção de gerenciamento de tarefas (adicionar nova tarefa para todos)
- Botão "Importar do Sheets" (importação única)

**2. `src/components/StudentForm.tsx`** — Formulário para adicionar/editar aluno
- Campos: Nome, Pokémon (com autocomplete da PokéAPI), Tipo (select com tipos disponíveis)
- Validação: nome obrigatório, pokémon obrigatório
- Modo criação e edição

**3. `src/components/TaskManager.tsx`** — Gerenciar tarefas/pontuações
- Adicionar nova tarefa (nome + pontuação por aluno)
- Editar pontuação de tarefas existentes por aluno
- Excluir tarefa de todos os alunos

### Modificações em Arquivos Existentes

**`src/hooks/useStudentData.ts`** — Refatorar para:
- Ler/escrever do localStorage como fonte principal
- Expor funções: `addStudent`, `removeStudent`, `updateStudent`, `addTask`, `updateTaskScore`, `removeTask`, `importFromSheet`
- Manter `refetch` apenas para importação manual do Sheets
- Auto-recalcular `totalScore` ao modificar tarefas

**`src/pages/Index.tsx`**:
- Adicionar botão "Gerenciar" no header que abre o AdminPanel
- Passar funções CRUD para o painel

### Fluxo do Usuário

1. App abre com dados mock no localStorage (primeira vez) ou dados salvos
2. Clica em "Gerenciar" no header → abre painel lateral
3. Pode adicionar aluno (nome, pokémon, tipo) → aparece no grid
4. Pode excluir aluno → some do grid
5. Pode adicionar tarefa → nova coluna de pontuação para todos
6. Pode editar pontuação individual por aluno/tarefa
7. Opcionalmente importa do Sheets uma vez para popular dados reais

### Detalhes Técnicos

- localStorage key: `pokedex-arena-students`
- Validação com verificação de nome duplicado
- Select de tipo com todas as 18 opções da `TYPE_COLORS`
- Input de pokémon como texto livre (lowercase, trim)
- totalScore sempre recalculado: `tasks.reduce((sum, t) => sum + t.score, 0)`

