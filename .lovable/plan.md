

## Melhorias na Evolução Pokémon

### Problemas atuais
1. **Evolução única**: Apenas um `evolutionEvent` por vez — se vários alunos evoluem numa importação, só o último dispara animação
2. **Sem som**: A animação é silenciosa
3. **Sem botão de pular**: O usuário precisa esperar 3 segundos obrigatoriamente
4. **Sem evolução manual**: Não há opção no admin para evoluir manualmente o pokémon de um aluno

### Plano

**1. Fila de evoluções (useStudentData.ts)**
- Trocar `evolutionEvent: EvolutionEvent | null` por `evolutionQueue: EvolutionEvent[]`
- Quando scores mudam (importação, update), detectar **todos** os alunos que cruzaram limites e enfileirar todos os eventos
- Expor `evolutionQueue`, `shiftEvolutionQueue` (remove o primeiro da fila)

**2. Som de evolução (EvolutionAnimation.tsx)**
- Usar um arquivo de áudio livre (efeito 8-bit de evolução) hospedado em `/public/sounds/evolution.mp3`, ou gerar via Web Audio API um som sintetizado curto
- Tocar o som automaticamente quando a animação inicia (fase `old`)
- Usar `new Audio()` com fallback silencioso se o navegador bloquear autoplay

**3. Botão de pular (EvolutionAnimation.tsx)**
- Adicionar botão "Pular ▶" fixo no canto inferior da animação
- Ao clicar, chama `onComplete` imediatamente, cancelando os timeouts
- Também funciona com tecla Escape ou clique no fundo

**4. Evolução manual no Admin (AdminPanel.tsx)**
- Na aba de atividades ou uma seção dedicada, ao selecionar um aluno, mostrar o estágio atual do pokémon e um botão "Evoluir Pokémon"
- O botão adiciona pontuação suficiente para atingir o próximo marco (100 ou 200) e dispara o evento de evolução
- Desabilitado se já está no estágio máximo (2)

**5. Processamento da fila (Index.tsx)**
- Ao invés de `{evolutionEvent && <EvolutionAnimation>}`, renderizar a animação para `evolutionQueue[0]`
- `onComplete` chama `shiftEvolutionQueue`, que remove o primeiro e automaticamente mostra o próximo

### Arquivos alterados
- `src/hooks/useStudentData.ts` — fila de eventos, detecção em batch
- `src/components/EvolutionAnimation.tsx` — som + botão pular
- `src/pages/Index.tsx` — consumir fila
- `src/components/AdminPanel.tsx` — botão evoluir manual
- `public/sounds/` — arquivo de áudio (ou síntese inline)

