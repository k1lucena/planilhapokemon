

## Voltar ao estilo Pokédex + corrigir dados + separar notas + simplificar edição

### Problemas identificados

1. **Dados errados**: O mock tem GABRIEL DA TRUFA e JONATHA que não existem na planilha real. A planilha tem 18 alunos, não 20.
2. **Notas invisíveis**: No card e no modal, as notas das atividades ficam amontoadas e difíceis de ler.
3. **Edição complexa**: Para editar notas, é preciso navegar até a aba "Tarefas", abrir cada tarefa individualmente e editar aluno por aluno — muito lento.
4. **Visual perdeu o estilo Pokédex**: O header ficou genérico após a modernização.

### Plano

**1. Corrigir mockData.ts**
- Remover GABRIEL DA TRUFA e JONATHA (não existem na planilha).
- Manter os 18 alunos reais com scores exatos do CSV.

**2. Restaurar visual Pokédex no header**
- Trazer de volta o fundo vermelho escuro estilo Pokédex no header com a lente azul circular e os LEDs decorativos (verde, amarelo, vermelho).
- Manter o botão de Atualizar e Gerenciar no header.

**3. Separar notas das atividades nos cards e modal**

No **StudentCard**:
- Mostrar apenas o Pokémon, nome, tipo, pontos totais e barra de progresso.
- Abaixo, mostrar N1, N2, N3 e Média em 4 colunas compactas e legíveis com cores (verde/amarelo/vermelho).

No **PokedexModal** (tab Notas):
- Dividir visualmente em 3 blocos:
  - **Nota 1** (Atividades 01-05) — lista com nome e score de cada
  - **Nota 2** (Atividades 06-10) — idem
  - **Nota 3** (Projeto Final) — único item
- Cada bloco com header colorido e a média/nota calculada ao lado.
- No final, card de resumo com N1, N2, N3 e Média Final.

**4. Simplificar edição de notas — nova aba "Notas Rápidas" no AdminPanel**

Substituir a aba "Tarefas" por uma visão de tabela/planilha:
- Dropdown para selecionar o aluno.
- Ao selecionar, mostrar TODAS as 11 atividades como uma lista vertical com input numérico ao lado de cada uma.
- Botão "Salvar" que atualiza todas as notas de uma vez.
- Isso é muito mais rápido que o fluxo atual de abrir cada tarefa.

### Arquivos a alterar

| Arquivo | Mudança |
|---|---|
| `src/lib/mockData.ts` | Remover 2 alunos inexistentes |
| `src/index.css` | Restaurar estilo Pokédex no header (fundo vermelho, LEDs) |
| `src/pages/Index.tsx` | Ajustar header com visual Pokédex |
| `src/components/StudentCard.tsx` | Manter notas separadas e legíveis |
| `src/components/PokedexModal.tsx` | Separar atividades em blocos N1/N2/N3 |
| `src/components/AdminPanel.tsx` | Trocar aba "Tarefas" por "Notas Rápidas" com seleção de aluno + lista de inputs |
| `src/components/TaskManager.tsx` | Reescrever como editor rápido por aluno |

