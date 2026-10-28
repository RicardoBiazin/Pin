# Changelog

## 0.2.1 — 2026-10-28

- Popup: anúncios voltam a ter escolha própria — esconder (padrão), só marcar ou não fazer nada — no mesmo formato dos pins de IA. No 0.2.0 só dava para desligar a extensão inteira.

## 0.2.0 — 2026-10-28

- Selo roxo "IA" nos pins que o Pinterest marca como "Modificado por IA" (ou "AI modified"); no popup dá para escolher selo, esconder ou nada.
- Contagem de pins de IA no popup.
- Versão para Firefox: `npm run empacotar` gera `-edge.zip` e `-firefox.zip` (este com id gecko e `data_collection_permissions: none`). Passa no `web-ext lint` sem avisos.
- Nome passa a ser "Pin — bloqueador de anúncios para Pinterest" (as lojas recusam a marca alheia no começo do título).
- Política de privacidade (`PRIVACY.md`) e material das lojas (`loja/`).

## 0.1.0 — 2026-10-28

- Primeira versão: esconde Pins promovidos no pinterest.com e pinterest.com.br.
- Detecção por selo de texto, `data-test-id`/`aria-label` e link de anúncio.
- Popup com liga/desliga, modo "só marcar" e contagem por aba.
- Testes com node:test + jsdom, incluindo anúncio que chega na rolagem infinita.
