

## Corrigir Importação de Dados (Google Sheets + CSV)

Existem **dois problemas** distintos:

### 1. Erro de deploy (aws s3 cp exit 127)
Problema de infraestrutura do Lovable, não do código. Vai resolver sozinho ao tentar publicar novamente.

### 2. Erro na importação — parsing incompatível com a estrutura da planilha

A planilha usa colunas como `NOME`, `POKEMON_INICIAL`, `ATIVIDADE_01_APRESENTACAO`, `PROJETO_FINAL`, `TOTAL`, `SOMA_01`, `NOTA1`, etc. O parser atual não reconhece esses nomes:

- **Pokémon**: busca por "pokemon" → `POKEMON_INICIAL` contém "pokemon" ✓
- **Nome**: busca por "nome" → `NOME` contém "nome" ✓  
- **Tarefas**: busca por "tarefa" ou "task" → mas as colunas são `ATIVIDADE_*` e `PROJETO_FINAL` ✗
- **Colunas extras**: `MATRICULA`, `SOMA_01`, `NOTA1`, `SOMA_02`, `NOTA2`, `NOTA3` seriam incorretamente tratadas como tarefas no fallback

### Correções no `src/hooks/useStudentData.ts`

**A. Atualizar detecção de tarefas** no `parseCsvData` e `parseSheetData`:
- Adicionar "atividade" e "projeto" como palavras-chave para colunas de tarefa
- Adicionar "matricula" à lista de colunas ignoradas (skipKeys)
- Adicionar "soma" e "nota" à lista de colunas ignoradas (não são tarefas, são cálculos)

**B. Melhorar a lógica de skip** para excluir colunas calculadas:
- Ignorar colunas que contenham: `total`, `soma`, `nota`, `matricula`

**C. Redesenhar edge function** — verificar se está deployada. Se a edge function `import-sheet` não estiver acessível, re-deployar.

### Mudanças específicas

| Arquivo | Mudança |
|---|---|
| `src/hooks/useStudentData.ts` | Atualizar `parseCsvData`: adicionar "atividade", "projeto" como task keywords; adicionar "matricula", "soma", "nota" como skip keywords |
| `src/hooks/useStudentData.ts` | Atualizar `parseSheetData`: mesmas mudanças de detecção |
| Edge function `import-sheet` | Re-deployar para garantir que está acessível |

