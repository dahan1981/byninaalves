Arquivo padrão para todos os casos de link na bio. Basta mudar os links e a foto.

## Métricas e painel admin

O projeto agora inclui:
- rastreamento de cliques do link na bio
- endpoint `POST /api/track-click`
- painel oculto em `/nina-admin`
- funções Netlify em `netlify/functions`
- SQL do Supabase em [supabase/click_events.sql](C:/Users/dahan/Downloads/guia-destrave/supabase/click_events.sql)

### Variáveis de ambiente

Configure na hospedagem:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`

### Supabase

Execute o SQL de [supabase/click_events.sql](C:/Users/dahan/Downloads/guia-destrave/supabase/click_events.sql) no projeto Supabase.

### Senha local do painel

O painel faz uma validação local antes de abrir e usa o hash definido em [admin/config.js](C:/Users/dahan/Downloads/guia-destrave/admin/config.js).

1. Escolha a mesma senha usada em `ADMIN_PASSWORD`.
2. Gere o SHA-256 dessa senha.
3. Substitua o valor placeholder em [admin/config.js](C:/Users/dahan/Downloads/guia-destrave/admin/config.js).

Exemplo para gerar o hash em PowerShell:

```powershell
$text = "SUA_SENHA_AQUI"
$bytes = [System.Text.Encoding]::UTF8.GetBytes($text)
$hash = [System.Security.Cryptography.SHA256]::Create().ComputeHash($bytes)
($hash | ForEach-Object { $_.ToString("x2") }) -join ""
```
