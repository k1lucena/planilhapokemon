

## Importar Dados da Planilha

A planilha tem uma estrutura não-padrão (linhas vazias no topo, headers na 3ª linha, colunas extras após os dados). Vou extrair os dados diretamente e atualizar o `MOCK_STUDENTS` com os 20 alunos reais, e também limpar/re-seedar o banco.

### Dados extraídos da planilha

20 alunos com 11 tarefas cada (colunas de pontuação D-N), pokémon atual na coluna C e pokémon inicial na coluna P. Vou usar o **pokémon inicial** (Poke_INICIAL) como base para o tipo, já que é o starter (Charmander→fire, Squirtle→water, Bulbasaur→grass), e o **pokémon atual** (coluna C) como o campo `pokemon`.

### Plano

**1. Atualizar `src/lib/mockData.ts`**
Substituir os 15 alunos fictícios pelos 20 alunos reais da planilha com suas 11 tarefas (Tarefa 1-11) e pontuações exatas.

**2. Forçar re-seed no banco**
Ao carregar, o `useStudentData` já verifica se há dados no banco. Para forçar a atualização, vou adicionar uma lógica simples: ao detectar que o `MOCK_STUDENTS` mudou (checando pelo primeiro nome), apagar e re-seedar. Alternativamente, o usuário pode clicar "Resetar para Demo" no painel admin para carregar os novos dados.

### Alunos a importar

| Nome | Pokémon | Tipo | Total |
|---|---|---|---|
| MIGUEL | charizard | fire | 270 |
| HELLEN | blastoise | water | 235 |
| CHICO | wartortle | water | 195 |
| LORENA | venusaur | grass | 245 |
| ADONES | venusaur | grass | 250 |
| CARLOS | venusaur | grass | 225 |
| GABRIEL MACHADO | venusaur | grass | 221 |
| MATHEUS | charizard | fire | 230 |
| PREFEITO | charmander | fire | 90 |
| GDIAS | charizard | fire | 245 |
| BAGGIO | charmeleon | fire | 190 |
| EVANDERSON | blastoise | water | 248 |
| YURI | charizard | fire | 245 |
| K1 | charmander | water | 250 |
| BOLA | ivysaur | grass | 170 |
| HELENA | venusaur | grass | 230 |
| KAIOBA | bulbasaur | grass | 85 |
| GALVAO | blastoise | water | 220 |
| GABRIEL DA TRUFA | squirtle | water | 90 |
| JONATHA | blastoise | water | 245 |

### Arquivos modificados

| Arquivo | Mudança |
|---|---|
| `src/lib/mockData.ts` | Substituir dados fictícios pelos 20 alunos reais |

Após o deploy, basta clicar em **"Resetar para Demo"** no painel admin para carregar os dados reais no banco.

