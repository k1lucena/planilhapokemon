

## Corrigir as 3 Importações

### Problemas Encontrados

1. **Google Sheets**: O sheet ID hardcoded (`1Ym7Xwu...`) retorna **401** — a planilha não está publicada/compartilhada publicamente. Além disso, não há como o usuário inserir a URL da sua própria planilha.

2. **CSV e JSON**: A lógica de parse parece correta, mas o fluxo no AdminPanel chama `onImportSheet` sem pedir URL ao usuário. CSV e JSON usam file input (ok), porém dependem do `upsertStudents` que pode falhar silenciosamente se houver conflito de dados.

### Solução

**1. Google Sheets — Permitir URL customizada**
- No AdminPanel, ao clicar "Google Sheets", abrir um mini-dialog/input pedindo a URL da planilha (ao invés de usar ID hardcoded)
- O usuário cola o link do Google Sheets (ex: `https://docs.google.com/spreadsheets/d/XXXX/edit`)
- Extrair o ID da planilha da URL e construir a URL de export CSV: `https://docs.google.com/spreadsheets/d/{ID}/pub?output=csv`
- A planilha precisa estar **publicada na web** (File → Share → Publish to web) — adicionar instrução na UI
- Passar a URL CSV para a edge function (proxy CORS), receber o texto CSV, e reusar `parseCsvData` ao invés de `parseSheetData` (mais simples e confiável que o formato `gviz/tq`)
- Remover o `SHEET_ID` hardcoded

**2. Edge Function — Aceitar qualquer URL**
- Já aceita qualquer URL no body (ok, sem mudança necessária)

**3. CSV e JSON — Corrigir fluxo de substituição**
- Garantir que o `delete` + `upsert` funciona: mover a lógica de delete para dentro do `upsertStudents` quando chamado por importação (flag `replaceAll`)
- Ou manter como está mas adicionar `await` correto e verificar erros do delete

**4. Feedback visual**
- Já tem toasts (ok)
- Adicionar estado de loading nos botões CSV/JSON durante importação

### Arquivos a Modificar

| Arquivo | Mudança |
|---|---|
| `src/hooks/useStudentData.ts` | Remover `SHEET_ID` hardcoded, `importFromSheet` recebe URL como parâmetro, usa formato CSV via edge function + `parseCsvData` |
| `src/components/AdminPanel.tsx` | Adicionar input de URL para Google Sheets com instrução "A planilha deve estar publicada na web", passar URL para `importFromSheet` |

### Detalhes Técnicos

**Fluxo Google Sheets atualizado:**
```
Usuário cola URL → extrair sheet ID → 
construir URL: docs.google.com/spreadsheets/d/{ID}/pub?output=csv →
edge function faz fetch → retorna CSV raw →
parseCsvData() → upsert no banco
```

**AdminPanel UI para Sheets:**
- Input de texto + botão "Importar"
- Texto auxiliar: "Cole o link da planilha. Ela deve estar publicada na web (Arquivo → Compartilhar → Publicar na Web)"

