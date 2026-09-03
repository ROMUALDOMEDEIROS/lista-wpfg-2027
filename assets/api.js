/* Camada de dados: fala com o Supabase via REST.
   Sem credenciais configuradas, cai em MODO LOCAL (localStorage).

   O atleta grava direto na tabela (política de INSERT).
   O organizador lê e remove por funções protegidas por senha no banco
   (listar_atletas / remover_atleta) — a senha nunca fica no código do site. */

const CHAVE_LOCAL = 'wpfg2027_atletas';

function supabaseConfigurado() {
  return Boolean(window.CONFIG && CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY);
}

function headers(extras) {
  return Object.assign({
    apikey: CONFIG.SUPABASE_ANON_KEY,
    Authorization: 'Bearer ' + CONFIG.SUPABASE_ANON_KEY,
    'Content-Type': 'application/json'
  }, extras || {});
}

/* ---------- leitura/escrita local (fallback e testes) ---------- */

function lerLocal() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_LOCAL) || '[]');
  } catch (e) {
    return [];
  }
}

function gravarLocal(lista) {
  localStorage.setItem(CHAVE_LOCAL, JSON.stringify(lista));
}

/* Erro de senha errada, para o painel tratar de forma amigável. */
function erroSenha() {
  const err = new Error('Senha incorreta.');
  err.senhaInvalida = true;
  return err;
}

async function chamarFuncao(nome, corpo) {
  const res = await fetch(CONFIG.SUPABASE_URL + '/rest/v1/rpc/' + nome, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(corpo)
  });

  if (res.ok) {
    const texto = await res.text();
    return texto ? JSON.parse(texto) : null;
  }

  let dados = {};
  try { dados = await res.json(); } catch (e) { /* resposta sem json */ }
  if ((dados.message || '').indexOf('Senha incorreta') !== -1) throw erroSenha();
  throw new Error(dados.message || dados.hint || ('Erro ' + res.status + '.'));
}

/* ---------- API pública ---------- */

/* Inscreve um atleta. Lança Error com .duplicado = true se o telefone já existe. */
async function inscrever(atleta) {
  if (!supabaseConfigurado()) {
    const lista = lerLocal();
    if (lista.some(function (a) { return a.telefone === atleta.telefone; })) {
      const err = new Error('Este telefone já está inscrito.');
      err.duplicado = true;
      throw err;
    }
    atleta.id = Date.now();
    atleta.criado_em = new Date().toISOString();
    lista.push(atleta);
    gravarLocal(lista);
    return atleta;
  }

  const enviar = function (dados) {
    return fetch(CONFIG.SUPABASE_URL + '/rest/v1/atletas', {
      method: 'POST',
      headers: headers({ Prefer: 'return=minimal' }),
      body: JSON.stringify(dados)
    });
  };

  let res = await enviar(atleta);

  /* Banco ainda sem a coluna "provas" (script de atualizacao nao rodado):
     grava assim mesmo, com as tres primeiras provas, em vez de perder a
     inscricao do atleta. */
  if (!res.ok && atleta.provas) {
    let checagem = {};
    try { checagem = await res.clone().json(); } catch (e) { /* resposta sem json */ }
    if (checagem.code === 'PGRST204' || (checagem.message || '').indexOf('provas') !== -1) {
      const semArray = Object.assign({}, atleta);
      delete semArray.provas;
      res = await enviar(semArray);
    }
  }

  if (res.ok) return atleta;

  let corpo = {};
  try { corpo = await res.json(); } catch (e) { /* resposta sem json */ }
  if (res.status === 409 || corpo.code === '23505') {
    const err = new Error('Este telefone já está inscrito.');
    err.duplicado = true;
    throw err;
  }
  if (corpo.code === '42501') {
    const err = new Error('As inscrições estão encerradas.');
    err.bloqueado = true;
    throw err;
  }
  throw new Error(corpo.message || corpo.hint || ('Erro ' + res.status + ' ao salvar.'));
}

/* ---------- inscrições abertas / encerradas ---------- */

const CHAVE_ABERTAS = 'wpfg2027_inscricoes_abertas';

/* O formulário pergunta isto antes de aparecer. Se a consulta falhar,
   assume ENCERRADO — melhor recusar do que aceitar algo que o banco vai
   rejeitar na hora de gravar. */
async function inscricoesAbertas() {
  if (!supabaseConfigurado()) {
    return localStorage.getItem(CHAVE_ABERTAS) !== 'false';
  }
  try {
    return await chamarFuncao('inscricoes_abertas', {}) === true;
  } catch (e) {
    console.error('Não consegui checar se as inscrições estão abertas:', e.message);
    return false;
  }
}

/* Interruptor do painel — exige a senha do organizador. */
async function definirInscricoes(senha, aberto) {
  if (!supabaseConfigurado()) {
    if (senha !== CONFIG.SENHA_TESTE_LOCAL) throw erroSenha();
    localStorage.setItem(CHAVE_ABERTAS, aberto ? 'true' : 'false');
    return aberto;
  }
  return chamarFuncao('definir_inscricoes', { senha: senha, aberto: aberto });
}

/* Provas de um atleta, venha do banco novo (array) ou do antigo (3 colunas). */
function provasDoAtleta(a) {
  if (a.provas && a.provas.length) return a.provas;
  return [a.prova1, a.prova2, a.prova3].filter(Boolean);
}

/* Painel do organizador: a senha é conferida dentro do banco de dados. */
async function listarAtletas(senha) {
  if (!supabaseConfigurado()) {
    if (senha !== CONFIG.SENHA_TESTE_LOCAL) throw erroSenha();
    return lerLocal().sort(function (a, b) {
      return (a.criado_em || '').localeCompare(b.criado_em || '');
    });
  }
  return chamarFuncao('listar_atletas', { senha: senha });
}

async function removerAtleta(senha, id) {
  if (!supabaseConfigurado()) {
    if (senha !== CONFIG.SENHA_TESTE_LOCAL) throw erroSenha();
    gravarLocal(lerLocal().filter(function (a) { return String(a.id) !== String(id); }));
    return;
  }
  return chamarFuncao('remover_atleta', { senha: senha, atleta_id: Number(id) });
}
