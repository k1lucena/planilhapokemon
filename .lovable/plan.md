

## Atualizar mockData para espelhar a planilha real

O mockData atual usa nomes genéricos ("Tarefa 1-11") e o banco pode estar dessincronizado. Vou atualizar para refletir exatamente a estrutura e os dados do CSV publicado.

### Diferenças encontradas

- **Nomes das tarefas**: O mock usa "Tarefa 1..11", mas a planilha usa nomes reais: "Atividade 01 - Apresentação", "Atividade 02 - Estudos de Casos", ..., "Projeto Final"
- **Scores**: Alguns valores podem estar levemente diferentes entre o mock e o CSV atual
- **Tipo do K1**: No mock está `type: 'water'` (correto pelo Poke_INICIAL = Squirtle), pokémon atual é Charmander

### O que muda

| Arquivo | Mudança |
|---|---|
| `src/lib/mockData.ts` | Substituir os 20 alunos com nomes de tarefas reais da planilha e scores exatos do CSV |

### Nomes de tarefas (extraídos do CSV)

1. `Atividade 01 - Apresentação`
2. `Atividade 02 - Estudos de Casos`
3. `Atividade 03 - Desenho (Duplas)`
4. `Atividade 04 - Indent. de Probl.`
5. `Atividade 05 - Entrevistas`
6. `Atividade 06 - Personas`
7. `Atividade 07 - Protótipos`
8. `Atividade 08 - Desafio Cabide`
9. `Atividade 09 - Tela App`
10. `Atividade 10 - Questionário UEQ`
11. `Projeto Final`

### Após o deploy

Clicar em **"Resetar para Demo"** no painel admin para sincronizar o banco com os novos dados.

