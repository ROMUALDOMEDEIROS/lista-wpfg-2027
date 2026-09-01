/* Dados compartilhados entre o formulario e o painel do organizador. */

const CATEGORIAS = [
  '18 a 29 anos',
  '30 a 34 anos',
  '35 a 39 anos',
  '40 a 44 anos',
  '45 a 49 anos',
  '50 a 54 anos',
  '55 a 59 anos',
  '60 a 64 anos',
  '65 a 69 anos',
  '70 a 74 anos',
  '75 anos ou mais'
];

const GRUPOS_PROVAS = [
  {
    nome: 'Velocidade',
    provas: ['100m', '100m com Barreira', '200m', '400m', '400m com Barreira']
  },
  {
    nome: 'Meio-fundo',
    provas: ['800m', '1500m', '3000m com Obstáculos']
  },
  {
    nome: 'Fundo / Rua',
    provas: ['5km', '5km Cross Country', '10km', '21km (Meia Maratona)']
  }
];

const PROVAS = GRUPOS_PROVAS.flatMap(function (g) { return g.provas; });

/* WPFG 2027: os Jogos acontecem de 12/03/2027 a 21/03/2027.
   A categoria do atleta e a idade que ele tera durante a competicao — usamos o
   ULTIMO dia (21/03/2027), regra usual do WPFG: quem faz aniversario durante os
   Jogos compete ja na idade nova. Se a organizacao divulgar outra data de corte,
   basta mudar DATA_REFERENCIA aqui. */
const EVENTO_INICIO = '2027-03-12';
const EVENTO_FIM = '2027-03-21';
const DATA_REFERENCIA = EVENTO_FIM;

/* '2027-03-21' -> '21/03/2027' */
function dataBR(iso) {
  const p = (iso || '').split('-');
  return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : iso;
}

function idadeNaReferencia(nascimentoISO) {
  if (!nascimentoISO) return null;
  const nasc = new Date(nascimentoISO + 'T00:00:00');
  const ref = new Date(DATA_REFERENCIA + 'T00:00:00');
  if (isNaN(nasc.getTime())) return null;
  let idade = ref.getFullYear() - nasc.getFullYear();
  const m = ref.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && ref.getDate() < nasc.getDate())) idade--;
  return idade;
}

function categoriaPorIdade(idade) {
  if (idade === null || idade < 18) return null;
  if (idade <= 29) return CATEGORIAS[0];
  if (idade >= 75) return CATEGORIAS[CATEGORIAS.length - 1];
  const faixa = Math.floor((idade - 30) / 5); // 30-34 => 0
  return CATEGORIAS[faixa + 1];
}

/* Telefone: guardamos so digitos, exibimos formatado. */
function somenteDigitos(v) {
  return (v || '').replace(/\D/g, '');
}

function formatarTelefone(v) {
  const d = somenteDigitos(v).slice(0, 11);
  if (d.length <= 2) return d.length ? '(' + d : '';
  if (d.length <= 6) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
  if (d.length <= 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
  return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
}

function telefoneValido(v) {
  const d = somenteDigitos(v);
  return d.length === 10 || d.length === 11;
}

/* Link do WhatsApp: DDI 55 + DDD + numero. */
function linkWhatsApp(telefoneDigitos, texto) {
  const d = somenteDigitos(telefoneDigitos);
  const numero = d.length <= 11 ? '55' + d : d;
  const q = texto ? '?text=' + encodeURIComponent(texto) : '';
  return 'https://wa.me/' + numero + q;
}
