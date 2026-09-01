-- =====================================================================
--  SCRIPT 2 — rode DEPOIS do supabase.sql, uma vez só.
--
--  Faz duas coisas:
--   1) permite que o atleta escolha MAIS de 3 provas (coluna "provas");
--   2) cria o acesso do organizador por SENHA, conferida dentro do banco
--      (a senha nunca aparece no código do site).
--
--  Para trocar a senha depois: mude o texto nas duas funções e rode de novo.
-- =====================================================================

-- 1) Provas em quantidade livre (mínimo 3, sem máximo) -----------------

alter table public.atletas
  add column if not exists provas text[];

-- Regra de gravação: continua aberta para inscrição, agora exigindo
-- pelo menos 3 provas quando a lista vier preenchida.
drop policy if exists "inscricao publica" on public.atletas;
create policy "inscricao publica"
  on public.atletas
  for insert
  to anon
  with check (
    char_length(nome) between 2 and 40
    and telefone ~ '^[0-9]{10,11}$'
    and (provas is null or array_length(provas, 1) >= 3)
  );

-- 2) Acesso do organizador por senha -----------------------------------

-- Lista todos os inscritos — só devolve se a senha bater.
create or replace function public.listar_atletas(senha text)
returns setof public.atletas
language plpgsql
security definer
set search_path = public
as $$
begin
  if senha is distinct from 'romos2228' then
    raise exception 'Senha incorreta' using errcode = '28000';
  end if;

  return query
    select * from public.atletas order by criado_em asc;
end;
$$;

-- Remove uma inscrição — só executa se a senha bater.
create or replace function public.remover_atleta(senha text, atleta_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if senha is distinct from 'romos2228' then
    raise exception 'Senha incorreta' using errcode = '28000';
  end if;

  delete from public.atletas where id = atleta_id;
end;
$$;

-- Quem pode chamar: só quem tem a chave pública do site (e a senha certa).
revoke all on function public.listar_atletas(text) from public;
revoke all on function public.remover_atleta(text, bigint) from public;
grant execute on function public.listar_atletas(text) to anon;
grant execute on function public.remover_atleta(text, bigint) to anon;

-- Faz a API reconhecer as mudanças na hora.
notify pgrst, 'reload schema';
