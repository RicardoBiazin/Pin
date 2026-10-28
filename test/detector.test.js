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
    const ia = cartao.getAttribute('data-ia') === 'sim';
    assert.strictEqual(detector.ehIA(cartao), ia, `IA no cartão ${cartao.id}`);
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

test('selo de IA exige o texto exato', () => {
  assert.ok(detector.textoEhRotuloIA('Modificado por IA'));
  assert.ok(detector.textoEhRotuloIA('  AI  modified '));
  assert.ok(!detector.textoEhRotuloIA('Arte modificado por IA para quarto'));
  assert.ok(!detector.textoEhRotuloIA(null));
});

test('acharCartao sobe do <img> até o item da grade', () => {
  const doc = novaPagina(GRADE);
  const img = doc.querySelector('#promovido-ptbr img');
  assert.strictEqual(detector.acharCartao(img).id, 'promovido-ptbr');
});

function carregarContent(config) {
  const dom = new JSDOM(`<!doctype html><body>${GRADE}</body>`, { runScripts: 'outside-only', url: 'https://br.pinterest.com/' });
  const { window } = dom;
  let ouvinteMensagem;
  window.chrome = {
    storage: {
      sync: { get: (padrao, cb) => cb({ ...padrao, ...config }) },
      onChanged: { addListener() {} },
    },
    runtime: { onMessage: { addListener: (fn) => { ouvinteMensagem = fn; } } },
  };
  window.eval(fs.readFileSync(path.join(__dirname, '..', 'src', 'detector.js'), 'utf8'));
  window.eval(fs.readFileSync(path.join(__dirname, '..', 'src', 'content.js'), 'utf8'));
  const contar = () => {
    let r;
    ouvinteMensagem({ tipo: 'contagem' }, null, (x) => { r = x; });
    return r;
  };
  return { window, doc: window.document, contar };
}

test('content.js esconde anúncios e põe selo nos de IA, inclusive os que chegam depois', async () => {
  const { window, doc, contar } = carregarContent({});
  for (const cartao of doc.querySelectorAll('[data-grid-item]')) {
    const oculto = cartao.classList.contains('pin-sem-anuncio-oculto');
    assert.strictEqual(oculto, cartao.getAttribute('data-esperado') === 'anuncio', `cartão ${cartao.id}`);
    const selo = cartao.classList.contains('pin-sem-anuncio-ia');
    assert.strictEqual(selo, cartao.getAttribute('data-ia') === 'sim', `selo IA no cartão ${cartao.id}`);
  }

  // Simula a rolagem infinita: novo anúncio entra na grade.
  doc.querySelector('.grade').insertAdjacentHTML('beforeend',
    '<div data-grid-item="true" id="tardio"><div data-test-id="pin"><img src="z.jpg"><span>Promovido por</span></div></div>');
  await new Promise((r) => setTimeout(r, 300));
  assert.ok(doc.getElementById('tardio').classList.contains('pin-sem-anuncio-oculto'));

  assert.deepStrictEqual({ ...contar() }, { escondidos: 7, ia: 3 });
  window.close();
});

test('content.js com anúncio em "marcar" só põe borda; em "nada" deixa o anúncio', () => {
  const marcar = carregarContent({ modo: 'marcar' });
  const anuncio = marcar.doc.getElementById('promovido-ptbr');
  assert.ok(anuncio.classList.contains('pin-sem-anuncio-marcado'));
  assert.ok(!anuncio.classList.contains('pin-sem-anuncio-oculto'));
  marcar.window.close();

  const nada = carregarContent({ modo: 'nada' });
  const intacto = nada.doc.getElementById('promovido-ptbr');
  assert.ok(!intacto.classList.contains('pin-sem-anuncio-oculto'));
  assert.ok(!intacto.classList.contains('pin-sem-anuncio-marcado'));
  // O selo IA continua funcionando com os anúncios liberados.
  assert.ok(nada.doc.getElementById('ia-ptbr').classList.contains('pin-sem-anuncio-ia'));
  nada.window.close();
});

test('content.js com IA em "esconder" oculta os pins de IA; em "nada" não mexe', () => {
  const esconder = carregarContent({ ia: 'esconder' });
  assert.ok(esconder.doc.getElementById('ia-ptbr').classList.contains('pin-sem-anuncio-oculto'));
  assert.ok(!esconder.doc.getElementById('normal-1').classList.contains('pin-sem-anuncio-oculto'));
  esconder.window.close();

  const nada = carregarContent({ ia: 'nada' });
  const cartao = nada.doc.getElementById('ia-ptbr');
  assert.ok(!cartao.classList.contains('pin-sem-anuncio-oculto'));
  assert.ok(!cartao.classList.contains('pin-sem-anuncio-ia'));
  nada.window.close();
});
