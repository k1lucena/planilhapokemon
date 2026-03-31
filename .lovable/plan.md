

## Extrair N1/N2/N3 diretamente das colunas "Soma 1", "Soma 2" e "Trabalho Final"

### Mudança principal

Em vez de importar atividades individuais e recalcular somas, o parser agora vai buscar **diretamente** os valores das colunas "Soma 1", "Soma 2" e "Trabalho Final" da planilha. Atividades individuais não serão importadas.

### Modelo de dados

O array `tasks` de cada aluno passará a ter exatamente **3 itens fixos**:
- `{ name: "N1", score: <valor de "Soma 1"> }`
- `{ name: "N2", score: <valor de "Soma 2"> }`
- `{ name: "N3", score: <valor de "Trabalho Final"> }`

O `totalScore` = N1 + N2 + N3.

### Arquivos a alterar

| Arquivo | Mudança |
|---|---|
| `src/hooks/useStudentData.ts` | No `parseCsvData` e `parseSheetData`: buscar colunas "soma 1", "soma 2", "trabalho final" por nome. Ignorar colunas de atividade, média, total. Gerar 3 tasks fixas (N1/N2/N3). Também buscar coluna "matricula" opcionalmente. |
| `src/lib/types.ts` | `calculateGrades`: ler diretamente os 3 tasks por nome (N1/N2/N3) em vez de fatiar por índice. Media = soma dos 3. |
| `src/components/PokedexModal.tsx` | Remover lógica de `slice(0,5)`, `slice(5,10)`, `tasks[10]`. Usar `grades.nota1/nota2/nota3` diretamente. Simplificar a tab de notas para mostrar N1, N2, N3 sem listar atividades individuais. |
| `src/components/AdminPanel.tsx` | Ajustar editor de notas rápidas para mostrar apenas 3 campos (N1, N2, N3) em vez de 11 atividades. |

### Lógica de detecção de colunas no CSV

```text
"Soma 1"         → N1
"Soma 2"         → N2  
"Trabalho Final" → N3
"Matrícula"      → matricula (armazenado no nome ou ignorado)

Ignorar: "Média", "Total", "Atividade *", qualquer outra coluna
```

