

## Adicionar Estilo Pokédex + Pokébola como Imagem Principal

### Visão Geral
Aplicar o visual da Pokédex clássica (vermelho, com detalhes como a lente azul e LEDs) à interface e adicionar uma Pokébola como imagem/ícone principal do sistema no header.

### 1. Criar SVG da Pokébola
**`src/components/PokeballIcon.tsx`** — Componente SVG inline de uma Pokébola clássica (metade vermelha, metade branca, faixa preta central, botão central). Será usada no header como logo principal.

### 2. Redesenhar o Header como Pokédex
**`src/pages/Index.tsx`** — Refazer o header com visual de Pokédex:
- Fundo vermelho escuro (`hsl(0 75% 35%)`) com borda arredondada e sombra inset
- "Lente" azul circular no canto esquerdo (como a Pokédex da imagem)
- LEDs decorativos (3 círculos coloridos pequenos: vermelho, amarelo, verde)
- Pokébola SVG ao lado do título
- Manter botão "Gerenciar" e hora

### 3. Estilizar Cards com Moldura Pokédex
**`src/components/StudentCard.tsx`** — Adicionar borda vermelha sutil e cantos arredondados estilo "tela da Pokédex" (borda dupla, fundo levemente diferente no topo simulando o frame vermelho).

### 4. Estilizar Modal como Pokédex Aberta
**`src/components/PokedexModal.tsx`** — Adicionar decorações no header do modal:
- Borda vermelha no topo do dialog
- Lente azul pequena decorativa
- LEDs pequenos

### 5. Atualizar CSS Global
**`src/index.css`** — Adicionar variáveis e classes:
- `--pokedex-red: 0 75% 35%`
- `--pokedex-dark-red: 0 65% 25%`
- `--pokedex-blue-lens: 200 80% 55%`
- Classes `.pokedex-frame`, `.pokedex-lens`, `.pokedex-leds`

### Arquivos Modificados

| Arquivo | Mudança |
|---|---|
| `src/components/PokeballIcon.tsx` | Novo — SVG Pokébola |
| `src/pages/Index.tsx` | Header redesenhado estilo Pokédex com Pokébola |
| `src/components/StudentCard.tsx` | Borda/frame estilo Pokédex |
| `src/components/PokedexModal.tsx` | Decorações Pokédex no modal |
| `src/index.css` | Variáveis e classes Pokédex |

