

## Refatorar para App Moderno com Gamificação de Batalhas

### 1. Tema Escuro e Visual Moderno
- Reescrever as variáveis CSS em `src/index.css` para tema escuro como padrão (backgrounds escuros, cards com glassmorphism/bordas neon sutis)
- Remover o fundo pokeball-bg, substituir por gradiente escuro sutil
- Atualizar cores: primary mais vibrante, cards com fundo semi-transparente, bordas com glow
- Adicionar novas animações ao `tailwind.config.ts`: fade-in, scale-in, pulse para status

### 2. Sistema de Batalha por Tipo (`src/lib/battleSystem.ts`)
- Criar tabela de vantagens de tipo (fire > grass > water > fire, electric > water, psychic > fighting, etc.)
- Função `simulateBattle(studentA, studentB)` que compara pontuação ajustada por vantagem de tipo (+10% se vantagem, -10% se desvantagem)
- Função `generateBattleResults(students)` que simula confrontos entre todos os alunos e retorna wins/losses por aluno
- Função `getPlayerStatus(student, previousScore?)`: retorna "Em alta" (top 3), "Subindo" (acima da média), "Estagnado" (abaixo da média)

### 3. Atualizar Types (`src/lib/types.ts`)
- Adicionar interfaces: `BattleResult`, `PlayerStatus`
- Adicionar tipo para status do jogador: `'hot' | 'rising' | 'cold'`

### 4. Arena/Pódio Redesenhado (`src/components/Podium.tsx`)
- Visual de arena de batalha com fundo gradiente escuro
- Top 3 como "campeões" com glow no tipo, animação de entrada
- Mostrar status do jogador e contagem de vitórias em batalhas

### 5. Cards dos Jogadores (`src/components/StudentCard.tsx`)
- Redesign escuro: fundo com gradiente sutil baseado no tipo, borda com glow
- Mostrar iniciais do aluno em avatar circular quando sem sprite
- Adicionar badge de status (🔥 Em alta / ⚡ Subindo / ❄️ Estagnado)
- Contagem de vitórias em batalhas
- Animação hover com scale e glow intensificado

### 6. Modal Pokédex Atualizado (`src/components/PokedexModal.tsx`)
- Visual escuro estilo app de jogo
- Adicionar seção "Batalhas Recentes" com lista de confrontos simulados (vs quem, resultado, vantagem de tipo)
- Feedback visual: verde para vitória, vermelho para derrota
- Manter seções existentes (evolução, progresso, tarefas)

### 7. Rankings Atualizados (`src/components/Rankings.tsx`)
- Adicionar terceira aba: "Batalhas" com ranking por número de vitórias
- Visual escuro nos cards de ranking por tipo
- Remover aparência de tabela tradicional, usar cards estilizados

### 8. Página Principal (`src/pages/Index.tsx`)
- Integrar o sistema de batalha (chamar `generateBattleResults`)
- Passar dados de batalha para os componentes
- Header redesenhado com visual de app/game

### Detalhes Técnicos

**Tabela de tipos simplificada:**
```text
fire > grass, bug, ice, steel
water > fire, ground, rock
grass > water, ground, rock
electric > water, flying
psychic > fighting, poison
fighting > normal, rock, ice, dark, steel
dragon > dragon
ice > grass, ground, flying, dragon
ghost > psychic, ghost
dark > psychic, ghost
fairy > fighting, dragon, dark
```

**Simulação de batalha:**
- Comparar pontuação de A vs B
- Se A tem vantagem de tipo sobre B: pontuação de A * 1.1
- Se A tem desvantagem: pontuação de A * 0.9
- Maior pontuação ajustada vence
- Gerar 3-5 batalhas recentes por aluno para exibir no modal

**Status do jogador:**
- 🔥 "Em alta": top 25% do ranking
- ⚡ "Subindo": entre 25% e 60%
- ❄️ "Estagnado": abaixo de 60%

**Arquivos a criar:** `src/lib/battleSystem.ts`
**Arquivos a modificar:** `src/lib/types.ts`, `src/index.css`, `tailwind.config.ts`, `src/pages/Index.tsx`, `src/components/Podium.tsx`, `src/components/StudentCard.tsx`, `src/components/PokedexModal.tsx`, `src/components/Rankings.tsx`

