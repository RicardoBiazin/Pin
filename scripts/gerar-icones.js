// Gera icons/16.png, 48.png e 128.png sem dependências: círculo verde-azulado
// com um "P" branco cortado por uma faixa (anúncio proibido). Cor diferente
// do vermelho do Pinterest de propósito, para não imitar a marca.
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const FUNDO = [20, 120, 115];
const BRANCO = [255, 255, 255];

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function bloco(tipo, dados) {
  const tam = Buffer.alloc(4);
  tam.writeUInt32BE(dados.length);
  const corpo = Buffer.concat([Buffer.from(tipo, 'ascii'), dados]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(corpo));
  return Buffer.concat([tam, corpo, crc]);
}

// Cor de um ponto em coordenadas 0..1 (null = transparente).
function cor(x, y) {
  const dx = x - 0.5, dy = y - 0.5;
  if (dx * dx + dy * dy > 0.25) return null;
  // Haste e bojo do "P".
  const haste = x > 0.34 && x < 0.46 && y > 0.22 && y < 0.8;
  const bx = x - 0.5, by = y - 0.4;
  const r = Math.sqrt(bx * bx * 1.4 + by * by);
  const bojo = x > 0.4 && r > 0.1 && r < 0.2;
  // Faixa diagonal do canto superior direito ao inferior esquerdo.
  const faixa = Math.abs(x + y - 1) < 0.06 && dx * dx + dy * dy < 0.16;
  if (haste || bojo || faixa) return BRANCO;
  return FUNDO;
}

function png(tamanho) {
  const AMOSTRAS = 4; // antisserrilhado simples
  const linhas = [];
  for (let py = 0; py < tamanho; py++) {
    const linha = Buffer.alloc(1 + tamanho * 4);
    for (let px = 0; px < tamanho; px++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < AMOSTRAS; sy++) {
        for (let sx = 0; sx < AMOSTRAS; sx++) {
          const c = cor((px + (sx + 0.5) / AMOSTRAS) / tamanho, (py + (sy + 0.5) / AMOSTRAS) / tamanho);
          if (c) { r += c[0]; g += c[1]; b += c[2]; a++; }
        }
      }
      const i = 1 + px * 4;
      if (a) { linha[i] = r / a; linha[i + 1] = g / a; linha[i + 2] = b / a; }
      linha[i + 3] = Math.round((255 * a) / (AMOSTRAS * AMOSTRAS));
    }
    linhas.push(linha);
  }
  const cabecalho = Buffer.alloc(13);
  cabecalho.writeUInt32BE(tamanho, 0);
  cabecalho.writeUInt32BE(tamanho, 4);
  cabecalho[8] = 8; cabecalho[9] = 6; // 8 bits, RGBA
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    bloco('IHDR', cabecalho),
    bloco('IDAT', zlib.deflateSync(Buffer.concat(linhas))),
    bloco('IEND', Buffer.alloc(0)),
  ]);
}

const pasta = path.join(__dirname, '..', 'icons');
fs.mkdirSync(pasta, { recursive: true });
for (const t of [16, 48, 128]) fs.writeFileSync(path.join(pasta, `${t}.png`), png(t));
console.log('Ícones gerados em', pasta);
