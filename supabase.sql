-- =====================================================================
--  Lista de Intenção WPFG 2027 — Atletismo
--  Cole este script inteiro no Supabase → SQL Editor → Run.
-- =====================================================================

create table if not exists public.atletas (
  id           bigint generated always as identity primary key,
  nome         text not null,
  telefone     text not null unique,          -- só dígitos: 61987654321
  genero       text not null check (genero in ('Masculino', 'Feminino')),
  nascimento   date,
  categoria    text not null,
  prova1       text not null,
  prova2       text not null,
  prova3       text not null,
  observacoes  text,
  criado_em    timestamptz not null default now()
);

create index if not exists atletas_genero_categoria_idx
  on public.atletas (genero, categoria);

-- Segurança: qualquer pessoa com o link pode SE INSCREVER,
-- mas ninguém consegue LER, ALTERAR ou APAGAR a lista com a chave pública.
-- O painel do organizador (admin.html) usa a chave service_role, que ignora RLS.
alter table public.atletas enable row level security;

drop policy if exists "inscricao publica" on public.atletas;
create policy "inscricao publica"
  on public.atletas
  for insert
  to anon
  with check (
    char_length(nome) between 2 and 40
    and telefone ~ '^[0-9]{10,11}$'
    and prova1 <> prova2 and prova2 <> prova3 and prova1 <> prova3
  );

-- =====================================================================
--  Consultas úteis (rode no SQL Editor quando quiser)
-- =====================================================================

-- Todos os inscritos, na ordem do painel:
-- select nome, telefone, genero, categoria, prova1, prova2, prova3
--   from public.atletas order by genero, categoria, nome;

-- Quantos atletas por prova:
-- select prova, count(*) from (
--   select prova1 as prova from public.atletas
--   union all select prova2 from public.atletas
--   union all select prova3 from public.atletas
-- ) t group by prova order by count(*) desc;

-- Quantos por gênero e categoria:
-- select genero, categoria, count(*) from public.atletas
--   group by genero, categoria order by genero, categoria;
