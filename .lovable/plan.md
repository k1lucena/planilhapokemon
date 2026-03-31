
Objetivo: corrigir a importação de CSV e Google Sheets sem mudar a estrutura do app nem do banco.

Diagnóstico confirmado
- O erro do Google Sheets não é timeout: os logs da função mostram falha imediata com 404.
- A causa principal do Sheets é a URL: hoje `extractSheetId()` só entende links `/spreadsheets/d/<id>...` e quebra links publicados no formato `/spreadsheets/d/e/<published-id>...`, gerando uma URL inválida para o proxy.
- A causa principal do CSV é o parser: `Papa.parse(..., { header: true })` assume que o cabeçalho está na 1ª linha. Na sua planilha/export, existem linhas vazias/acima do cabeçalho, então a coluna `NOME` não é encontrada.
- Há um segundo problema de parsing: a planilha publicada atual pode vir com cabeçalhos parciais/colunas de atividade em branco, então não dá para depender só de nomes como `ATIVIDADE_*`.

Plano de implementação
1. Corrigir a normalização da URL do Google Sheets
- Substituir `extractSheetId()` por um helper mais robusto em `src/hooks/useStudentData.ts`.
- Aceitar estes formatos:
  - link de edição: `/spreadsheets/d/<id>/edit...`
  - link export CSV: `/spreadsheets/d/<id>/export?format=csv`
  - link publicado: `/spreadsheets/d/e/<published-id>/pubhtml` ou `/pub?output=csv`
  - link já em CSV: reutilizar sem reconstruir errado
- Preservar `gid` quando existir.

2. Deixar a Edge Function mais segura e mais clara
- Atualizar `supabase/functions/import-sheet/index.ts` para validar melhor a entrada e restringir a busca a links válidos do Google Sheets.
- Retornar erro claro para:
  - formato de link inválido
  - planilha não pública/publicada
  - 404 do Google
- Manter CORS como está, mas melhorar o payload de erro para a UI mostrar a causa real.

3. Reescrever o parsing para detectar o cabeçalho real
- Em `src/hooks/useStudentData.ts`, trocar o fluxo atual por um parser em duas etapas:
  - primeiro ler linhas cruas
  - depois detectar automaticamente qual linha é o cabeçalho
- Critérios de detecção:
  - procurar linha com `nome`
  - reforçar se também tiver `matricula`, `pokemon`, `inicial`, `atividade`, `projeto`, `total`
- Isso fará CSV local e Sheets publicados passarem pelo mesmo caminho de parsing.

4. Suportar sua estrutura específica de colunas
- Mapear aliases:
  - `NOME`
  - `MATRICULA`
  - `POKEMON_INICIAL` / `Poke_INICIAL`
  - `aPOKEMON` / `POKEMON` como pokémon atual
  - `ATIVIDADE_*`
  - `PROJETO_FINAL`
  - `TOTAL`, `SOMA_*`, `NOTA*`
- Ignorar sempre colunas de cálculo/apoio:
  - `TOTAL`
  - `SOMA_*`
  - `NOTA*`
  - `MATRICULA`
  - `EVOLUÇÕES`
- Se os nomes das atividades estiverem em branco, inferir as tarefas pela posição:
  - usar as colunas numéricas entre o pokémon atual e o pokémon inicial
  - excluir a última coluna desse bloco se ela representar o total
  - gerar nomes `Atividade 01`, `Atividade 02`, etc.

5. Melhorar os dados gerados para o app
- Continuar calculando `totalScore` a partir das tarefas importadas, em vez de confiar no `TOTAL`.
- Inferir `type` a partir do `POKEMON_INICIAL` quando existir, para manter fogo/água/planta corretos.
- Usar o pokémon atual como `pokemon` exibido no ranking.

6. Ajustes pequenos de UX
- Em `src/components/AdminPanel.tsx`, não limpar o campo da URL antes da importação terminar com sucesso.
- Melhorar as mensagens:
  - Sheets: “link publicado inválido ou inacessível”
  - CSV: “cabeçalho encontrado na linha X” / “nenhuma coluna NOME detectada”

Arquivos a alterar
- `src/hooks/useStudentData.ts`
- `supabase/functions/import-sheet/index.ts`
- `src/components/AdminPanel.tsx`

Validação após implementar
- Testar upload de CSV com linhas vazias acima do cabeçalho.
- Testar link de edição do Google Sheets.
- Testar link publicado `/d/e/...`.
- Testar link direto CSV/export.
- Confirmar no painel algo como:
  - quantidade correta de alunos
  - 11 tarefas importadas
  - ranking atualizado sem apagar os dados antes da importação concluir.

Detalhes técnicos
- Não preciso aplicar o padrão de processamento em background agora: os sinais atuais são 404 de URL e falha de parsing, não limite de execução.
- Não há necessidade de mudar banco, autenticação ou políticas.
- A correção principal é tornar o importador resiliente ao formato real do arquivo e aos vários formatos de URL do Google Sheets.
