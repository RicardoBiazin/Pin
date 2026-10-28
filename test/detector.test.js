'use strict';

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const detector = require('../src/detector.js');

const GRADE = fs.readFileSync(path.join(__dirname, 'fixtures', 'grade.html'), 'utf8');

function novaPagina(html) {
  return new JSDOM(`<!doctype html><body>${html}</body>`).window.document;
}

test('cada cartão do fixture é classificado como esperado', () => {
  const doc = novaPagina(GRADE);
  const cartoes = detector.listarCartoes(doc);
  assert.strictEqual(cartoes.length, doc.querySelectorAll('[data-grid-item]').length);
  for (const cartao of cartoes) {
    const esperado = cartao.getAttribute('data-esperado') === 'anuncio';
    assert.strictEqual(detector.ehPromovido(cartao), esperado, `cartão ${cartao.id}`);
  }
});

test('normalizar tira acento e caixa', () => {
  assert.strictEqual(detector.normalizar('  PROMOÇÃO  Já '), 'promocao ja');
});

test('rótulo exige texto curto, não frase que cita a palavra', () => {
  assert.ok(detector.textoEhRotulo('Promovido por'));
  assert.ok(detector.textoEhRotulo('Patrocinado'));
  assert.ok(!detector.textoEhRotulo('evento patrocinado pela prefeitura'));
});

test('acharCartao sobe do <img> até o item da grade', () => {
  const doc = novaPagina(GRADE);
  const img = doc.querySelector('#promovido-ptbr img');
  assert.strictEqual(detector.acharCartao(img).id, 'promovido-ptbr');
});

test('content.js esconde anúncios, inclusive os que chegam depois (rolagem)', async () => {
  const dom = new JSDOM(`<!doctype html><body>${GRADE}</body>`, { runScripts: 'outside-only', url: 'https://br.pinterest.com/' });
  const { window } = dom;
  let ouvinteMensagem;
  window.chrome = {
    storage: {
      sync: { get: (_padrao, cb) => cb({ ligado: true, modo: 'esconder' }) },
      onChanged: { addListener() {} },
    },
    runtime: { onMessage: { addListener: (fn) => { ouvinteMensagem = fn; } } },
  };
  window.eval(fs.readFileSync(path.join(__dirname, '..', 'src', 'detector.js'), 'utf8'));
  window.eval(fs.readFileSync(path.join(__dirname, '..', 'src', 'content.js'), 'utf8'));

  const doc = window.document;
  for (const cartao of doc.querySelectorAll('[data-grid-item]')) {
    const oculto = cartao.classList.contains('pin-sem-anuncio-oculto');
    assert.strictEqual(oculto, cartao.getAttribute('data-esperado') === 'anuncio', `cartão ${cartao.id}`);
  }

  // Simula a rolagem infinita: novo anúncio entra na grade.
  doc.querySelector('.grade').insertAdjacentHTML('beforeend',
    '<div data-grid-item="true" id="tardio"><div data-test-id="pin"><img src="z.jpg"><span>Promovido por</span></div></div>');
  await new Promise((r) => setTimeout(r, 300));
  assert.ok(doc.getElementById('tardio').classList.contains('pin-sem-anuncio-oculto'));

  let contagem;
  ouvinteMensagem({ tipo: 'contagem' }, null, (r) => { contagem = r; });
  assert.strictEqual(contagem.escondidos, 6);
  window.close();
});
