// Detecção de Pins promovidos. Funções puras sobre o DOM, sem chrome.*,
// para rodar igual no navegador e nos testes (jsdom).
(function (raiz) {
  'use strict';

  // Rótulos que o Pinterest põe no cartão de anúncio, já normalizados.
  const ROTULOS = [
    'promovido por',
    'patrocinado',
    'promoted by',
    'promoted',
    'sponsored',
  ];

  const ATRIBUTOS_ANUNCIO = /promoted|sponsor|\bads?\b|-ad-|_ad_|adslot|ad-?unit/i;
  const LINKS_ANUNCIO = /pinterest\.[a-z.]+\/ads\b|[?&]utm_medium=(paid|cpc|ads?)\b|doubleclick\.net/i;

  const SELETOR_CARTAO = '[data-grid-item], [role="listitem"], [data-test-id="pin"], [data-test-id="pinWrapper"]';

  function normalizar(texto) {
    return (texto || '')
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  // Compara texto curto inteiro (ex.: o selo "Promovido por" sozinho num span),
  // para não esconder um pin cujo título só cita a palavra "patrocinado".
  function textoEhRotulo(texto) {
    const t = normalizar(texto);
    if (!t || t.length > 60) return false;
    return ROTULOS.some((r) => t === r || t.startsWith(r + ' '));
  }

  function temRotuloVisivel(cartao) {
    const nos = cartao.querySelectorAll('span, div, a, p');
    for (const no of nos) {
      // Só folhas de texto: o próprio nó tem texto direto.
      let direto = '';
      for (const filho of no.childNodes) {
        if (filho.nodeType === 3) direto += filho.nodeValue;
      }
      if (direto.trim() && textoEhRotulo(direto)) return true;
    }
    return false;
  }

  function temAtributoDeAnuncio(cartao) {
    const nos = [cartao, ...cartao.querySelectorAll('[data-test-id], [aria-label]')];
    for (const no of nos) {
      const id = no.getAttribute && no.getAttribute('data-test-id');
      if (id && ATRIBUTOS_ANUNCIO.test(id)) return true;
      const rotulo = no.getAttribute && no.getAttribute('aria-label');
      if (rotulo && textoEhRotulo(rotulo)) return true;
    }
    return false;
  }

  function temLinkDeAnuncio(cartao) {
    for (const a of cartao.querySelectorAll('a[href]')) {
      if (LINKS_ANUNCIO.test(a.getAttribute('href'))) return true;
    }
    return false;
  }

  function ehPromovido(cartao) {
    if (!cartao || !cartao.querySelectorAll) return false;
    return temAtributoDeAnuncio(cartao) || temRotuloVisivel(cartao) || temLinkDeAnuncio(cartao);
  }

  // Sobe até o cartão da grade. Prefere o item de grade mais externo que
  // ainda não seja a grade inteira.
  function acharCartao(elemento) {
    if (!elemento || !elemento.closest) return null;
    const item = elemento.closest('[data-grid-item]') || elemento.closest('[role="listitem"]');
    return item || elemento.closest('[data-test-id="pinWrapper"], [data-test-id="pin"]');
  }

  function listarCartoes(raizDom) {
    const vistos = new Set();
    for (const no of raizDom.querySelectorAll(SELETOR_CARTAO)) {
      const cartao = acharCartao(no);
      if (cartao) vistos.add(cartao);
    }
    return [...vistos];
  }

  const api = { normalizar, textoEhRotulo, ehPromovido, acharCartao, listarCartoes };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else raiz.PinDetector = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
