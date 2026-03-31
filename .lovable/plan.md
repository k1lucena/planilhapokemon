

## Apenas 3 Iniciais + Tudo em pt-BR + Sprites Animados no Pódio

### 1. Restringir Pokémon aos 3 Iniciais

**`src/components/StudentForm.tsx`**: Substituir o campo de texto livre por um `Select` com 3 opções fixas:
- Bulbasaur (tipo: grass)
- Charmander (tipo: fire)
- Squirtle (tipo: water)

Ao selecionar o Pokémon, o tipo é preenchido automaticamente. Remover o select de tipo separado.

**`src/lib/mockData.ts`**: Atualizar mock para usar apenas bulbasaur, charmander e squirtle, distribuindo os alunos entre os 3. Remover pokémons como pikachu, eevee, gastly, etc.

### 2. Sprites Animados no Pódio (GIFs)

**`src/hooks/usePokemonData.ts`**: Além do sprite estático (official-artwork), buscar também o sprite animado da PokéAPI:
- `sprites.versions['generation-v']['black-white'].animated.front_default` para cada evolução
- Salvar como campo `animatedSprite` no `PokemonEvolution`

**`src/lib/types.ts`**: Adicionar campo `animatedSprite?: string` ao `PokemonEvolution`.

**`src/components/Podium.tsx`**: Usar o sprite animado (GIF) em vez do estático. Adicionar CSS de bounce/float contínuo para dar vida extra. Manter fallback para sprite estático.

### 3. Traduzir Tudo para pt-BR

Varrer todos os componentes e traduzir strings restantes em inglês:
- `battleSystem.ts`: "Em alta", "Subindo", "Estagnado" (já em pt-BR, ok)
- `Podium.tsx`: ok
- `StudentCard.tsx`: labels "MAX", "pts" → manter
- `Rankings.tsx`: verificar e traduzir headers
- `PokedexModal.tsx`: verificar e traduzir
- `AdminPanel.tsx`: já em pt-BR
- Tipos dos pokémon: exibir tradução pt-BR (fogo, água, planta) nos badges em vez de "fire", "water", "grass"

**Mapeamento de tipos pt-BR** em `src/lib/types.ts`:
```
fire → Fogo, water → Água, grass → Planta
```

Como agora só temos 3 tipos, simplifica bastante.

### Arquivos Modificados

| Arquivo | Mudança |
|---|---|
| `src/lib/types.ts` | Adicionar `animatedSprite` a `PokemonEvolution`, mapa de tradução de tipos |
| `src/lib/mockData.ts` | Apenas bulbasaur/charmander/squirtle |
| `src/hooks/usePokemonData.ts` | Buscar sprites animados (GIF) |
| `src/components/StudentForm.tsx` | Select fixo com 3 pokémons, tipo automático |
| `src/components/Podium.tsx` | Usar sprite animado, animação bounce |
| `src/components/StudentCard.tsx` | Exibir tipo em pt-BR |
| `src/components/PokedexModal.tsx` | Traduzir strings restantes |
| `src/components/Rankings.tsx` | Traduzir strings restantes |

