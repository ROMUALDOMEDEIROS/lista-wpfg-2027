/* =====================================================================
   CONFIGURAÇÃO — preencha depois de criar o projeto no Supabase.

   Supabase -> Project Settings -> API
     SUPABASE_URL      = "Project URL"
     SUPABASE_ANON_KEY = chave "anon public"

   Enquanto estiver em branco, o site funciona em MODO LOCAL (os dados
   ficam só no navegador) — útil para testar antes de publicar.
   ===================================================================== */

window.CONFIG = {
  SUPABASE_URL: 'https://nvofjagfebsyinzduojv.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_FXZrbk82kwZZQcTrvepLDg_xMRBHhIT',

  // Textos do topo do formulário
  EVENTO: 'Lista de Intenção WPFG 2027',
  SUBTITULO: 'Atletismo — World Police & Fire Games',

  // Prazo mostrado para os atletas (texto livre)
  PRAZO: '01 de setembro de 2026',

  // WhatsApp do organizador (só dígitos, com DDD) para o botão "dúvidas"
  WHATSAPP_ORGANIZADOR: '',

  // Senha usada APENAS no modo de teste (sem Supabase configurado).
  // A senha de verdade fica dentro do banco, no arquivo supabase-admin.sql.
  SENHA_TESTE_LOCAL: 'teste'
};
