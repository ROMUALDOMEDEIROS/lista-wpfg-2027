# Lista de Intenção WPFG 2027 — Atletismo

Aplicativo web para os atletas se inscreverem sozinhos por um link enviado no
grupo do WhatsApp. Você recebe tudo num banco de dados centralizado e vê a lista
pronta, separada por gênero e categoria, com exportação para o Google Sheets.

```
Atleta A (WhatsApp) ┐
Atleta B (WhatsApp) ├──►  index.html  ──►  Supabase (banco)  ──►  admin.html (você)
Atleta C (WhatsApp) ┘        (link público)                        + Google Sheets
```

## Arquivos

| Arquivo | Para que serve |
|---|---|
| `index.html` | Formulário do atleta — **este é o link que vai no grupo** |
| `admin.html` | Painel do organizador (tabelas, exportação, remoção) — **uso só seu** |
| `config.js` | Onde você cola as credenciais do Supabase e ajusta título/prazo |
| `supabase.sql` | Script que cria a tabela e as regras de segurança |
| `assets/` | Estilos e código compartilhado |

Não precisa instalar nada: são arquivos estáticos, sem Node, sem build.

---

## Testar agora (sem configurar nada)

Dê dois cliques em `index.html`. Ele abre em **modo de teste**: as inscrições
ficam salvas só no seu navegador. Abra `admin.html` para ver a lista.
Serve para você conferir o formulário antes de publicar.

---

## Colocar no ar (30 minutos, custo zero)

### 1. Criar o banco no Supabase — 10 min

1. Acesse <https://supabase.com> e crie uma conta grátis (Google ou GitHub).
2. **New project** → nome `wpfg-2027-atletas` → região **South America (São Paulo)**
   → defina uma senha de banco e guarde. Aguarde ~2 minutos.
3. Menu **SQL Editor** → **New query** → cole todo o conteúdo de `supabase.sql`
   → **Run**. Deve aparecer *Success*.
4. Menu **Project Settings → API**. Copie:
   - **Project URL** (ex.: `https://abcdefgh.supabase.co`)
   - chave **anon public**
   - chave **service_role** (a secreta — guarde num lugar seguro, é só sua)

### 2. Preencher o `config.js` — 2 min

Abra `config.js` no Bloco de Notas e preencha:

```js
SUPABASE_URL: 'https://abcdefgh.supabase.co',
SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6...',
PRAZO: '31 de outubro de 2026',
WHATSAPP_ORGANIZADOR: '61987654321'
```

### 3. Publicar o site — 10 min

**Opção mais fácil — Netlify Drop (sem cadastro complicado, sem Git):**

1. Acesse <https://app.netlify.com/drop>
2. Arraste a **pasta inteira** do projeto para a página.
3. Em segundos você recebe um endereço, ex.: `https://algo-aleatorio.netlify.app`.
4. Crie uma conta grátis para manter o site e, se quiser, renomeie o endereço
   em *Site settings → Change site name* (ex.: `wpfg2027-atletismo`).

**Alternativa — Vercel:** <https://vercel.com> → *Add New → Project → Deploy*
(pode subir a pasta pelo GitHub ou pelo CLI `npx vercel`). O resultado é o mesmo.

### 4. Divulgar no grupo — 1 min

Abra o `admin.html` publicado, clique em **Mensagem do WhatsApp** e cole no grupo.
O texto já vai com o link do formulário e as instruções.

> O link do atleta termina em `index.html`. **Não mande o `admin.html` no grupo.**

---

## Como você recebe os dados

Abra `admin.html`, cole a chave **service_role** (fica guardada só no seu
navegador, é pedida uma vez) e você vê:

- **Métricas** — total, quantos homens, quantas mulheres, categorias preenchidas.
- **Duas tabelas** — Masculino e Feminino, cada uma agrupada por faixa etária,
  com nome de guerra, telefone clicável (abre o WhatsApp do atleta) e as 3 provas.
- **Atletas por prova** — quantos escolheram cada uma das 12 provas.
- **Copiar para Google Sheets** — copia tudo em formato de tabela; no Sheets é só
  clicar numa célula e dar Ctrl+V.
- **Baixar CSV** — arquivo para Excel.
- **✕** — remove uma inscrição errada.

Também dá para ver e exportar direto pelo Supabase: menu **Table Editor → atletas**.

---

## Regras já implementadas

**Categorias** (a do atleta é calculada pela data de nascimento, com base na
idade em `2027-08-31` — ajuste `DATA_REFERENCIA` em `assets/dados.js` se a
organização divulgar outra data de corte):

18–29 · 30–34 · 35–39 · 40–44 · 45–49 · 50–54 · 55–59 · 60–64 · 65–69 · 70–74 · 75+

**Provas (12), 3 por atleta:**

| Velocidade | Meio-fundo | Fundo / Rua |
|---|---|---|
| 100m | 800m | 5km |
| 100m com Barreira | 1500m | 5km Cross Country |
| 200m | 3000m com Obstáculos | 10km |
| 400m | | 21km (Meia Maratona) |
| 400m com Barreira | | |

**Validações:** nome e telefone obrigatórios, telefone com DDD, exatamente 3
provas (o formulário trava a 4ª seleção), e **um telefone só se inscreve uma vez**
— a segunda tentativa recebe um aviso para falar com o organizador.

**Segurança:** com a chave pública dá para *inscrever*, mas não para *ler* a
lista. Ninguém que receber o link consegue baixar os telefones dos colegas.

---

## Ajustes comuns

| O que mudar | Onde |
|---|---|
| Título, subtítulo, prazo, WhatsApp do organizador | `config.js` |
| Lista de provas / categorias / data de corte da idade | `assets/dados.js` |
| Cores e visual | `assets/styles.css` |
| Campos novos (clube, unidade, tamanho de uniforme) | `index.html` + `supabase.sql` |

Depois de qualquer alteração, publique de novo (arraste a pasta no Netlify Drop).
