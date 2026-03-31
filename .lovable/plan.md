

## Pokédex Escolar — Sistema de Pontuação com Evolução Pokémon

### Visão Geral
App web temático Pokémon que consome dados de uma planilha Google Sheets pública, exibe alunos como Pokémons com evolução visual baseada na pontuação, rankings e interatividade estilo Pokédex.

### Fonte de Dados
- Consumir a planilha via API pública do Google Sheets (formato CSV/JSON)
- Auto-refresh a cada 10 segundos + botão de atualização manual
- Estrutura esperada: Nome | Pokémon | Tipo | Tarefa1 | Tarefa2 | ... | Total

### Pokémons e Sprites
- Usar a **PokéAPI** (pokeapi.co) para buscar sprites e dados de evolução automaticamente
- Cada Pokémon terá 3 formas visuais baseadas na cadeia evolutiva real (ex: Charmander → Charmeleon → Charizard)
- Regras de evolução: 0–99 pts = base, 100–199 pts = evolução 1, 200+ pts = evolução final

### Interface — Seções

**1. Pódio (Topo da página)**
- Top 3 alunos com maior pontuação
- 1º lugar com destaque visual (card maior, borda dourada, animação)
- Exibe nome, Pokémon (sprite da evolução atual), pontuação e tipo

**2. Grid de Cards (Lista principal)**
- Cards para todos os alunos, ordenados por pontuação
- Cada card mostra: sprite do Pokémon (evolução atual), nome do aluno, tipo (badge colorido por tipo), pontuação total, barra de progresso até a próxima evolução
- Hover com animação suave de escala

**3. Modal Pokédex (ao clicar no card)**
- Painel estilo Pokédex com fundo temático
- Detalhes completos: nome, Pokémon, tipo, pontuação total
- Exibe as 3 formas de evolução com indicação de qual está ativa
- Barra de progresso detalhada
- Lista de pontuação por tarefa individual

**4. Rankings (seção inferior)**
- Ranking geral por pontuação (tabela ordenada)
- Ranking agrupado por tipo de Pokémon (Fire, Water, Grass, etc.)

### Design Visual
- Paleta de cores inspirada em Pokémon (vermelho, branco, preto, amarelo)
- Badges coloridos por tipo (Fire = laranja, Water = azul, Grass = verde, etc.)
- Animações CSS: hover nos cards, transição de evolução, barra de progresso animada
- Layout responsivo (desktop e mobile)
- Font temática para títulos

### Dados de exemplo embutidos
- Incluirei ~15 alunos com Pokémons variados como fallback caso a planilha não esteja acessível
- O app tentará buscar da planilha primeiro; se falhar, usa dados locais

