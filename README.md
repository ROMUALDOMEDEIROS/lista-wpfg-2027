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
| `admin.html` | Painel do organizador — protegido por senha, alcançável pelo rodapé do formulário |
| `config.js` | Onde você cola as credenciais do Supabase e ajusta título/prazo |
| `supabase.sql` | Script que cria a tabela e as regras de segurança |
| `supabase-admin.sql` | Script que guarda a **senha do organizador** dentro do banco |
| `assets/` | Estilos e código compartilhado |

Não precisa instalar nada: são arquivos estáticos, sem Node, sem build.

---

## Testar agora (sem configurar nada)

Dê dois cliques em `index.html`. Ele abre em **modo de teste**: as inscrições
ficam salvas só no seu navegador. Abra `admin.html` (senha de teste: `teste`)
para ver a lista.
Serve para você conferir o formulário antes de publicar.

---

## Colocar no ar (30 minutos, custo zero)

### 1. Criar o banco no Supabase — 10 min

1. Acesse <https://supabase.com> e crie uma conta grátis (Google ou GitHub).
2. **New project** → nome `wpfg-2027-atletas` → região **South America (São Paulo)**
   → defina uma senha de banco e guarde. Aguarde ~2 minutos.
3. Menu **SQL Editor** → **New query** → cole todo o conteúdo de `supabase.sql`
   → **Run**. Deve aparecer *Success*.
4. Repita com o `supabase-admin.sql` (é ele que guarda a senha do organizador).
5. Menu **Project Settings → API**. Copie:
   - **Project URL** (ex.: `https://abcdefgh.supabase.co`)
   - chave **anon public** (é a única que o site usa)

### 2. Preencher o `config.js` — 2 min

Abra `config.js` no Bloco de Notas e preencha:

```js
SUPABASE_URL: 'https://abcdefgh.supabase.co',
SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6...',
PRAZO: '31 de outubro de 2026',
WHATSAPP_ORGANIZADOR: '61987654321'
```

### 3. Publicar o site — 5 min

Este projeto está publicado no **GitHub Pages**, no repositório
<https://github.com/ROMUALDOMEDEIROS/lista-wpfg-2027>:

- Formulário: <https://romualdomedeiros.github.io/lista-wpfg-2027/>
- Painel: <https://romualdomedeiros.github.io/lista-wpfg-2027/admin.html>

Para publicar uma alteração, na pasta do projeto:

```
git add -A && git commit -m "descricao da mudanca" && git push
```

Em cerca de 1 minuto o site no ar já está atualizado.

### 4. Divulgar no grupo — 1 min

Abra o painel, clique em **Mensagem do WhatsApp** e cole no grupo.
O texto já vai com o link do formulário e as instruções.

> Mande o endereço puro do site. O painel mora no mesmo link, no rodapé
> (*🔒 Área do organizador*), atrás da senha — os atletas veem o cadeado, não a lista.

---

## Como você recebe os dados

Abra o painel pelo rodapé do formulário (*🔒 Área do organizador*), digite a
senha e você vê:

- **Métricas** — total, quantos homens, quantas mulheres, categorias preenchidas.
- **Duas tabelas** — Masculino e Feminino, cada uma agrupada por faixa etária,
  com nome de guerra, telefone clicável (abre o WhatsApp do atleta) e as 3 provas.
- **Atletas por prova** — quantos escolheram cada uma das 13 provas.
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

**Provas (13), no mínimo 3 por atleta (sem máximo):**

| Velocidade | Meio-fundo | Fundo / Rua |
|---|---|---|
| 100m | 800m | 5km |
| 100m com Barreira | 1500m | 5km Cross Country |
| 200m | 3000m com Obstáculos | 10km |
| 400m | | 10km Cross Country |
| 400m com Barreira | | 21km (Meia Maratona) |

**Validações:** nome e telefone obrigatórios, telefone com DDD, no mínimo 3
provas, e **um telefone só se inscreve uma vez**
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
| Senha do organizador | `supabase-admin.sql` (troque nas duas funções e rode de novo) |

Depois de qualquer alteração, rode `git add -A && git commit -m "..." && git push`.
