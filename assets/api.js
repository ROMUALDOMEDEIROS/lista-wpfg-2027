/* Camada de dados: fala com o Supabase via REST.
   Sem credenciais configuradas, cai em MODO LOCAL (localStorage). */

const CHAVE_LOCAL = 'wpfg2027_atletas';

function supabaseConfigurado() {
  return Boolean(window.CONFIG && CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY);
}

function headers(chave, extras) {
  return Object.assign({
    apikey: chave,
    Authorization: 'Bearer ' + chave,
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

/* ---------- API publica ---------- */

/* Inscreve um atleta. Lanca Error com .duplicado = true se o telefone ja existe. */
async function inscrever(atleta) {
  if (!supabaseConfigurado()) {
    const lista = lerLocal();
    if (lista.some(function (a) { return a.telefone === atleta.telefone; })) {
      const err = new Error('Este telefone ja esta inscrito.');
      err.duplicado = true;
      throw err;
    }
    atleta.id = Date.now();
    atleta.criado_em = new Date().toISOString();
    lista.push(atleta);
    gravarLocal(lista);
    return atleta;
  }

  const res = await fetch(CONFIG.SUPABASE_URL + '/rest/v1/atletas', {
    method: 'POST',
    headers: headers(CONFIG.SUPABASE_ANON_KEY, { Prefer: 'return=minimal' }),
    body: JSON.stringify(atleta)
  });

  if (res.ok) return atleta;

  let corpo = {};
  try { corpo = await res.json(); } catch (e) { /* resposta sem json */ }
  if (res.status === 409 || corpo.code === '23505') {
    const err = new Error('Este telefone ja esta inscrito.');
    err.duplicado = true;
    throw err;
  }
  throw new Error(corpo.message || corpo.hint || ('Erro ' + res.status + ' ao salvar.'));
}

/* Painel do organizador: usa a chave service_role, digitada na hora e
   guardada apenas neste navegador. */
async function listarAtletas(chaveAdmin) {
  if (!supabaseConfigurado()) {
    return lerLocal().sort(function (a, b) {
      return (a.criado_em || '').localeCompare(b.criado_em || '');
    });
  }
  const url = CONFIG.SUPABASE_URL + '/rest/v1/atletas?select=*&order=criado_em.asc';
  const res = await fetch(url, { headers: headers(chaveAdmin) });
  if (!res.ok) {
    const t = await res.text();
    throw new Error('Nao consegui ler os dados (' + res.status + '). ' + t.slice(0, 200));
  }
  return res.json();
}

async function removerAtleta(chaveAdmin, id) {
  if (!supabaseConfigurado()) {
    gravarLocal(lerLocal().filter(function (a) { return String(a.id) !== String(id); }));
    return;
  }
  const url = CONFIG.SUPABASE_URL + '/rest/v1/atletas?id=eq.' + encodeURIComponent(id);
  const res = await fetch(url, { method: 'DELETE', headers: headers(chaveAdmin) });
  if (!res.ok) throw new Error('Nao consegui remover (' + res.status + ').');
}

async function atualizarAtleta(chaveAdmin, id, campos) {
  if (!supabaseConfigurado()) {
    const lista = lerLocal().map(function (a) {
      return String(a.id) === String(id) ? Object.assign({}, a, campos) : a;
    });
    gravarLocal(lista);
    return;
  }
  const url = CONFIG.SUPABASE_URL + '/rest/v1/atletas?id=eq.' + encodeURIComponent(id);
  const res = await fetch(url, {
    method: 'PATCH',
    headers: headers(chaveAdmin, { Prefer: 'return=minimal' }),
    body: JSON.stringify(campos)
  });
  if (!res.ok) throw new Error('Nao consegui salvar a alteracao (' + res.status + ').');
}
