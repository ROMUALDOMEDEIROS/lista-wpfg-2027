-- =====================================================================
--  SCRIPT 3 — abre/fecha as inscrições pelo painel do organizador.
--
--  Ao rodar, as inscrições JÁ FICAM ENCERRADAS. Para reabrir, use o botão
--  🔒 / 🔓 no painel (ou rode:  select public.definir_inscricoes('romos2228', true);  ).
--
--  O bloqueio vale no banco: mesmo quem tiver o link antigo não consegue
--  gravar enquanto estiver fechado.
-- =====================================================================

create table if not exists public.ajustes (
  chave         text primary key,
  valor         text not null,
  atualizado_em timestamptz not null default now()
);

-- Estado inicial: fechado.
insert into public.ajustes (chave, valor)
values ('inscricoes_abertas', 'false')
on conflict (chave) do nothing;

-- Ninguém acessa a tabela direto com a chave pública.
alter table public.ajustes enable row level security;

-- Pergunta pública: "posso me inscrever?" (o formulário consulta ao abrir)
create or replace function public.inscricoes_abertas()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (select valor from public.ajustes where chave = 'inscricoes_abertas'),
    'false'
  ) = 'true';
$$;

-- Interruptor do organizador — exige a senha.
create or replace function public.definir_inscricoes(senha text, aberto boolean)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if senha is distinct from 'romos2228' then
    raise exception 'Senha incorreta' using errcode = '28000';
  end if;

  insert into public.ajustes (chave, valor, atualizado_em)
  values ('inscricoes_abertas', case when aberto then 'true' else 'false' end, now())
  on conflict (chave) do update
    set valor = excluded.valor, atualizado_em = now();

  return aberto;
end;
$$;

revoke all on function public.inscricoes_abertas() from public;
revoke all on function public.definir_inscricoes(text, boolean) from public;
grant execute on function public.inscricoes_abertas() to anon;
grant execute on function public.definir_inscricoes(text, boolean) to anon;

-- Gravar inscrição passa a exigir que esteja aberto.
drop policy if exists "inscricao publica" on public.atletas;
create policy "inscricao publica"
  on public.atletas
  for insert
  to anon
  with check (
    public.inscricoes_abertas()
    and char_length(nome) between 2 and 40
    and telefone ~ '^[0-9]{10,11}$'
    and (provas is null or array_length(provas, 1) >= 3)
  );

notify pgrst, 'reload schema';
