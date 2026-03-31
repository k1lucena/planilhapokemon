

## Substituir batalhas por notas + layout moderno

### Mudanças principais

**1. Remover sistema de batalhas**
- Eliminar `src/lib/battleSystem.ts`
- Remover todas as referências a `battleStats`, `generateBattleResults`, `PlayerBattleStats` de:
  - `Index.tsx`, `Podium.tsx`, `StudentCard.tsx`, `Rankings.tsx`, `PokedexModal.tsx`

**2. Calcular notas (NOTA1, NOTA2, NOTA3) a partir das tarefas**
Baseado na estrutura da planilha, as notas são derivadas das atividades:
- **NOTA1** = média das atividades 01-05 (índices 0-4)
- **NOTA2** = média das atividades 06-10 (índices 5-9)
- **NOTA3** = Projeto Final (índice 10)

Criar um helper `calculateGrades(tasks)` em `src/lib/types.ts` que retorna `{ nota1, nota2, nota3, media }`.

**3. Redesenhar layout — visual moderno e limpo**

| Componente | Antes | Depois |
|---|---|---|
| **Header** | Pokédex retrô com LEDs | Header limpo, gradiente sutil, sem LEDs |
| **Podium** | Arena de batalha com V/D | Top 3 com notas e medalhas, sem referência a batalha |
| **StudentCard** | Compacto com stats de batalha | Card glassmorphism com notas N1/N2/N3 visíveis, barra de progresso mais elegante |
| **Rankings** | 3 tabs (Geral/Tipo/Batalhas) | 2 tabs (Geral/Por Tipo), coluna de notas visível |
| **PokedexModal** | 3 tabs (Evolução/Tarefas/Batalhas) | 2 tabs (Evolução/Notas), tab Notas mostra tabela com todas atividades + N1/N2/N3/Média |

**4. Arquivos a alterar**

| Arquivo | Ação |
|---|---|
| `src/lib/battleSystem.ts` | Deletar |
| `src/lib/types.ts` | Adicionar `calculateGrades()` |
| `src/pages/Index.tsx` | Remover battleStats, passar grades |
| `src/components/Podium.tsx` | Trocar V/D por notas, trocar "ARENA" por "TOP 3" |
| `src/components/StudentCard.tsx` | Mostrar N1/N2/N3 no lugar de V/D |
| `src/components/Rankings.tsx` | Remover tab Batalhas, adicionar colunas de notas |
| `src/components/PokedexModal.tsx` | Trocar tab Batalhas por detalhamento de notas |
| `src/index.css` | Ajustar cores/estilos para visual mais moderno (gradientes suaves, menos "pixel art") |

**5. Estilo visual moderno**
- Manter tema escuro mas com gradientes mais suaves
- Reduzir uso de `font-pixel` (manter só em títulos principais)
- Cards com backdrop-blur mais pronunciado e bordas sutis
- Badges de tipo mais refinados
- Notas com indicadores visuais de cor (verde ≥7, amarelo ≥5, vermelho <5)

