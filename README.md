Arquivo padrão para todos os casos de link na bio. Basta mudar os links e a foto.

## Métricas e painel admin

O projeto agora inclui:
- rastreamento de cliques do link na bio
- endpoint `POST /api/track-click`
- painel oculto em `/nina-admin`
- rotas serverless para Vercel em `api/`
- configuração de rotas amigáveis em [vercel.json](C:/Users/dahan/Downloads/guia-destrave/vercel.json)
- SQL do Supabase em [supabase/click_events.sql](C:/Users/dahan/Downloads/guia-destrave/supabase/click_events.sql)

### Variáveis de ambiente no Vercel

Configure no projeto:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`

### Supabase

Execute o SQL de [supabase/click_events.sql](C:/Users/dahan/Downloads/guia-destrave/supabase/click_events.sql) no projeto Supabase.

### Senha local do painel

O painel faz uma validação local antes de abrir e usa o hash definido em [admin/config.js](C:/Users/dahan/Downloads/guia-destrave/admin/config.js).

1. Escolha a mesma senha usada em `ADMIN_PASSWORD`.
2. Gere o SHA-256 dessa senha.
3. Substitua o valor em [admin/config.js](C:/Users/dahan/Downloads/guia-destrave/admin/config.js).

Exemplo para gerar o hash em PowerShell:

```powershell
$text = "SUA_SENHA_AQUI"
$bytes = [System.Text.Encoding]::UTF8.GetBytes($text)
$hash = [System.Security.Cryptography.SHA256]::Create().ComputeHash($bytes)
($hash | ForEach-Object { $_.ToString("x2") }) -join ""
```

### Deploy no Vercel

1. Importe este repositório no Vercel.
2. Cadastre as variáveis de ambiente.
3. Faça o deploy.
4. Teste:
   - `/`
   - `/guia-destrave`
   - `/nina-admin`
