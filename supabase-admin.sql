-- =====================================================================
--  Acesso do organizador por SENHA (rode DEPOIS do supabase.sql)
--
--  A senha fica guardada aqui dentro do banco, nunca no código do site.
--  Para trocar a senha depois: mude o texto nas duas funções e rode de novo.
-- =====================================================================

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

-- Faz a API reconhecer as funções novas na hora.
notify pgrst, 'reload schema';
