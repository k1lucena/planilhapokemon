

## Trocar notas por atividades no painel admin

A aba "📝 Notas" do painel Gerenciar atualmente mostra apenas 3 campos (N1, N2, N3). O usuário quer editar as **atividades individuais** de cada aluno nessa aba.

### Mudança

**Arquivo: `src/components/AdminPanel.tsx`**

Substituir os 3 inputs de Nota 1/2/3 por uma lista dinâmica das atividades do aluno selecionado:

- Ao selecionar um aluno, carregar suas `tasks[]` em estado local
- Exibir cada atividade com nome + input numérico de pontuação
- Botão "Salvar" chama `onUpdateScore` para cada atividade alterada
- Remover `onUpdateNotas` / `quickNotas` — as notas N1/N2/N3 vêm da planilha importada, não de edição manual
- Renomear a aba de "📝 Notas" para "📝 Atividades"

### Resultado

O professor seleciona o aluno, vê todas as atividades listadas (Atividade 01, 02, etc.) e edita as pontuações individualmente — mais simples e direto.

