// Roda dentro do pinterest.com: esconde os cartões promovidos e marca (ou
// esconde) os que o Pinterest identifica como feitos por IA.
(function () {
  'use strict';

  const { ehPromovido, ehIA, listarCartoes } = globalThis.PinDetector;
  const CLASSE_OCULTO = 'pin-sem-anuncio-oculto';
  const CLASSE_MARCADO = 'pin-sem-anuncio-marcado';
  const CLASSE_IA = 'pin-sem-anuncio-ia';
  const ATRIBUTO = 'data-pin-anuncio';
  const ATRIBUTO_IA = 'data-pin-ia';

  const PADRAO = { ligado: true, modo: 'esconder', ia: 'marcar' };
  let config = { ...PADRAO };
  let escondidos = 0;
  let ia = 0;
  let agendado = null;

  function aplicarClasse(cartao) {
    cartao.classList.remove(CLASSE_OCULTO, CLASSE_MARCADO, CLASSE_IA);
    if (!config.ligado) return;
    const anuncio = cartao.getAttribute(ATRIBUTO) === 'sim';
    const deIA = cartao.getAttribute(ATRIBUTO_IA) === 'sim';
    if (anuncio) {
      cartao.classList.add(config.modo === 'marcar' ? CLASSE_MARCADO : CLASSE_OCULTO);
    }
    if (deIA && config.ia === 'esconder') cartao.classList.add(CLASSE_OCULTO);
    if (deIA && config.ia === 'marcar') cartao.classList.add(CLASSE_IA);
  }

  // Classifica uma vez cada sinal. O React do site reaproveita nós: um cartão
  // normal pode virar outro depois. Só grava "nao" quando já há conteúdo.
  function classificar(cartao, atributo, teste) {
    if (cartao.hasAttribute(atributo)) return false;
    if (teste(cartao)) {
      cartao.setAttribute(atributo, 'sim');
      return true;
    }
    if (cartao.querySelector('img, video')) cartao.setAttribute(atributo, 'nao');
    return false;
  }

  function varrer() {
    agendado = null;
    for (const cartao of listarCartoes(document)) {
      const novoAnuncio = classificar(cartao, ATRIBUTO, ehPromovido);
      const novoIA = classificar(cartao, ATRIBUTO_IA, ehIA);
      if (novoAnuncio) escondidos++;
      if (novoIA) ia++;
      if (novoAnuncio || novoIA) aplicarClasse(cartao);
    }
  }

  function agendar() {
    if (agendado === null) agendado = setTimeout(varrer, 150);
  }

  function reaplicarTudo() {
    for (const cartao of document.querySelectorAll(`[${ATRIBUTO}="sim"], [${ATRIBUTO_IA}="sim"]`)) aplicarClasse(cartao);
  }

  // Navegação interna do site troca a grade sem recarregar: reavalia tudo.
  function limparMarcas() {
    for (const atributo of [ATRIBUTO, ATRIBUTO_IA]) {
      for (const no of document.querySelectorAll(`[${atributo}="nao"]`)) no.removeAttribute(atributo);
    }
  }

  let ultimaUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== ultimaUrl) {
      ultimaUrl = location.href;
      limparMarcas();
    }
    agendar();
  }).observe(document.documentElement, { childList: true, subtree: true, characterData: true });

  chrome.storage.sync.get(PADRAO, (salvo) => {
    config = salvo;
    reaplicarTudo();
    varrer();
  });

  chrome.storage.onChanged.addListener((mudancas, area) => {
    if (area !== 'sync') return;
    for (const chave of Object.keys(PADRAO)) {
      if (mudancas[chave]) config[chave] = mudancas[chave].newValue;
    }
    reaplicarTudo();
  });

  chrome.runtime.onMessage.addListener((msg, _remetente, responder) => {
    if (msg && msg.tipo === 'contagem') responder({ escondidos, ia });
  });
})();
