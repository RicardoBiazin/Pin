# Pin — Pinterest sem anúncios

Extensão para Chrome e Edge (Manifest V3) que esconde os Pins promovidos do Pinterest. Você continua usando o site normal, com sua conta, feed, busca e pastas. Só os anúncios somem.

- Não coleta dados e não faz nenhuma requisição de rede.
- Única permissão: `storage` (guarda se está ligada e o modo).

## Instalar

1. Baixe o zip da versão (`dist\Pin-<versão>.zip`) e descompacte, ou use a própria pasta do projeto.
2. Abra `edge://extensions` (Edge) ou `chrome://extensions` (Chrome).
3. Ligue o **Modo de desenvolvedor**.
4. Clique em **Carregar sem compactação** e escolha a pasta que contém o `manifest.json`.
5. Abra o Pinterest. O ícone da extensão mostra quantos anúncios foram escondidos na aba.

## Popup

- **Esconder anúncios**: liga ou desliga a extensão.
- **Só marcar (não esconder)**: deixa o anúncio na tela, apagado e com borda. Serve para conferir se a detecção está acertando.

## Como detecta

Cada cartão da grade (`[data-grid-item]` / `[role="listitem"]`) é considerado anúncio se tiver qualquer um destes sinais:

1. Um selo de texto curto "Promovido por", "Patrocinado", "Promoted by" ou "Sponsored". Frases maiores que só citam a palavra não contam.
2. `data-test-id` com "promoted", "sponsor" ou "ad", ou `aria-label` com um dos selos acima.
3. Link com `utm_medium=paid|cpc|ad`, `pinterest.com/ads` ou `doubleclick.net`.

O cartão recebe uma classe com `display: none`. O nó não é removido, para não quebrar o React do site. Um `MutationObserver` reavalia a grade a cada mudança, então a rolagem infinita e a navegação interna também são cobertas.

## Limitações

O Pinterest muda o HTML com frequência. Se algum anúncio passar, ligue **Só marcar**, inspecione o cartão (F12) e adicione o sinal novo em `src/detector.js` e um caso em `test/fixtures/grade.html`.

## Desenvolvimento

```
npm install
npm test            # node:test + jsdom
npm run icones      # regera icons/*.png
npm run empacotar   # gera dist\Pin-<versão>.zip
```

A versão fica em `manifest.json` e `package.json` (mantenha iguais).

## Licença

MIT.
