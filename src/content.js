// Roda dentro do pinterest.com: marca e esconde os cartões promovidos.
(function () {
  'use strict';

  const { ehPromovido, listarCartoes } = globalThis.PinDetector;
  const CLASSE_OCULTO = 'pin-sem-anuncio-oculto';
  const CLASSE_MARCADO = 'pin-sem-anuncio-marcado';
  const ATRIBUTO = 'data-pin-anuncio';

  let config = { ligado: true, modo: 'esconder' };
  let escondidos = 0;
  let agendado = null;

  function aplicarClasse(cartao) {
    cartao.classList.remove(CLASSE_OCULTO, CLASSE_MARCADO);
    if (!config.ligado) return;
    cartao.classList.add(config.modo === 'marcar' ? CLASSE_MARCADO : CLASSE_OCULTO);
  }

  function varrer() {
    agendado = null;
    for (const cartao of listarCartoes(document)) {
      if (cartao.hasAttribute(ATRIBUTO)) continue;
      // O React do site reaproveita nós: um cartão normal pode virar anúncio
      // depois. Só grava "nao" quando já há conteúdo para julgar.
      if (ehPromovido(cartao)) {
        cartao.setAttribute(ATRIBUTO, 'sim');
        escondidos++;
        aplicarClasse(cartao);
      } else if (cartao.querySelector('img, video')) {
        cartao.setAttribute(ATRIBUTO, 'nao');
      }
    }
  }

  function agendar() {
    if (agendado === null) agendado = setTimeout(varrer, 150);
  }

  function reaplicarTudo() {
    for (const cartao of document.querySelectorAll(`[${ATRIBUTO}="sim"]`)) aplicarClasse(cartao);
  }

  // Navegação interna do site troca a grade sem recarregar: reavalia tudo.
  function limparMarcas() {
    for (const no of document.querySelectorAll(`[${ATRIBUTO}="nao"]`)) no.removeAttribute(ATRIBUTO);
  }

  let ultimaUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== ultimaUrl) {
      ultimaUrl = location.href;
      limparMarcas();
    }
    agendar();
  }).observe(document.documentElement, { childList: true, subtree: true, characterData: true });

  chrome.storage.sync.get({ ligado: true, modo: 'esconder' }, (salvo) => {
    config = salvo;
    reaplicarTudo();
    varrer();
  });

  chrome.storage.onChanged.addListener((mudancas, area) => {
    if (area !== 'sync') return;
    if (mudancas.ligado) config.ligado = mudancas.ligado.newValue;
    if (mudancas.modo) config.modo = mudancas.modo.newValue;
    reaplicarTudo();
  });

  chrome.runtime.onMessage.addListener((msg, _remetente, responder) => {
    if (msg && msg.tipo === 'contagem') responder({ escondidos });
  });
})();
