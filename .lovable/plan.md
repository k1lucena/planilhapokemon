

## Auto-refresh + Corrigir notas + Animações

### 1. Auto-refresh a cada 5 minutos
**`src/hooks/useStudentData.ts`**: Adicionar `useEffect` com `setInterval` de 5 minutos que chama `refreshFromSheet`. Limpar no cleanup.

### 2. Corrigir cálculo de notas
**Problema**: `calculateGrades` divide por 5 fazendo média dos scores brutos (que vão de 0 a 40), resultando em valores sem sentido como "N1: 7" quando deveria ser a soma dos pontos.

**Correção em `src/lib/types.ts`**: As notas devem ser a **soma** dos scores do grupo, não média:
- **N1** = soma atividades 01-05 (máx ~45 pts)
- **N2** = soma atividades 06-10 (máx ~135 pts)  
- **N3** = Projeto Final (máx ~100 pts)
- **Total** = N1 + N2 + N3 (já é o `totalScore`)

Ajustar `getGradeColor` para usar thresholds proporcionais aos máximos de cada nota, ou simplesmente exibir as notas como pontuação sem colorir por "aprovação".

### 3. Animações nos cards dos treinadores
**`tailwind.config.ts`** + **`src/components/StudentCard.tsx`**:
- Adicionar keyframe `bounce-gentle` (leve bounce sutil no idle)
- Cards com animação de entrada escalonada (`animation-delay` por índice)
- Hover: leve rotação 3D + escala + sombra glow mais intensa

### 4. Animações diferenciadas no hover do Top 3
**`src/components/Podium.tsx`** + **`src/index.css`**:
- **1º lugar**: Hover com pulse dourado + escala maior (1.15) + rotação sutil
- **2º lugar**: Hover com brilho prateado + escala (1.1)  
- **3º lugar**: Hover com brilho bronze + escala (1.08)
- Cada posição terá uma classe CSS específica com transition diferente

### Arquivos a alterar

| Arquivo | Mudança |
|---|---|
| `src/hooks/useStudentData.ts` | setInterval 5min para refreshFromSheet |
| `src/lib/types.ts` | Notas = soma (não média), ajustar thresholds de cor |
| `tailwind.config.ts` | Keyframes: bounce-gentle, podium-hover |
| `src/components/StudentCard.tsx` | Animação de entrada escalonada + hover 3D |
| `src/components/Podium.tsx` | Hover diferenciado por posição (gold/silver/bronze) |
| `src/index.css` | Classes CSS para animações do podium |

