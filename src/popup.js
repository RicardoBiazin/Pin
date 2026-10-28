'use strict';

const ligado = document.getElementById('ligado');
const marcar = document.getElementById('marcar');
const opcoesIA = document.querySelectorAll('input[name="ia"]');
const contagem = document.getElementById('contagem');

document.getElementById('versao').textContent = 'v' + chrome.runtime.getManifest().version;

chrome.storage.sync.get({ ligado: true, modo: 'esconder', ia: 'marcar' }, (salvo) => {
  ligado.checked = salvo.ligado;
  marcar.checked = salvo.modo === 'marcar';
  for (const opcao of opcoesIA) opcao.checked = opcao.value === salvo.ia;
});

ligado.addEventListener('change', () => chrome.storage.sync.set({ ligado: ligado.checked }));
marcar.addEventListener('change', () => chrome.storage.sync.set({ modo: marcar.checked ? 'marcar' : 'esconder' }));
for (const opcao of opcoesIA) {
  opcao.addEventListener('change', () => chrome.storage.sync.set({ ia: opcao.value }));
}

chrome.tabs.query({ active: true, currentWindow: true }, ([aba]) => {
  if (!aba || !aba.id) return;
  chrome.tabs.sendMessage(aba.id, { tipo: 'contagem' }, (resposta) => {
    if (chrome.runtime.lastError || !resposta) return;
    contagem.textContent = '';
    const linhas = [
      [resposta.escondidos, 'anúncio', 'anúncios', ''],
      [resposta.ia, 'pin de IA', 'pins de IA', 'ia'],
    ];
    for (const [n, singular, plural, classe] of linhas) {
      const linha = document.createElement('div');
      const forte = document.createElement('strong');
      if (classe) forte.className = classe;
      forte.textContent = n;
      linha.append(forte, ` ${n === 1 ? singular : plural} nesta aba`);
      contagem.append(linha);
    }
  });
});
