'use strict';

const ligado = document.getElementById('ligado');
const marcar = document.getElementById('marcar');
const contagem = document.getElementById('contagem');

document.getElementById('versao').textContent = 'v' + chrome.runtime.getManifest().version;

chrome.storage.sync.get({ ligado: true, modo: 'esconder' }, (salvo) => {
  ligado.checked = salvo.ligado;
  marcar.checked = salvo.modo === 'marcar';
});

ligado.addEventListener('change', () => chrome.storage.sync.set({ ligado: ligado.checked }));
marcar.addEventListener('change', () => chrome.storage.sync.set({ modo: marcar.checked ? 'marcar' : 'esconder' }));

chrome.tabs.query({ active: true, currentWindow: true }, ([aba]) => {
  if (!aba || !aba.id) return;
  chrome.tabs.sendMessage(aba.id, { tipo: 'contagem' }, (resposta) => {
    if (chrome.runtime.lastError || !resposta) return;
    const n = resposta.escondidos;
    contagem.innerHTML = `<strong>${n}</strong> anúncio${n === 1 ? '' : 's'} nesta aba.`;
  });
});
