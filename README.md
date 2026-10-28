# Pin — bloqueador de anúncios para Pinterest

Extensão para Edge, Chrome e Firefox (Manifest V3) que esconde os Pins promovidos do Pinterest e põe um selo **IA** nos pins que o próprio Pinterest marca como "Modificado por IA". Você continua usando o site normal, com sua conta, feed, busca e pastas.

- Não coleta dados e não faz nenhuma requisição de rede ([política de privacidade](PRIVACY.md)).
- Única permissão: `storage` (guarda as preferências do popup).
- Não é afiliada ao Pinterest.

## Instalar

**Pelas lojas:** Firefox Add-ons e Edge Add-ons (links quando forem aprovadas).

**Manualmente (Edge/Chrome):**

1. Baixe `Pin-<versão>-edge.zip` em [Releases](https://github.com/RicardoBiazin/Pin/releases) e descompacte.
2. Abra `edge://extensions` ou `chrome://extensions` e ligue o **Modo de desenvolvedor**.
3. Clique em **Carregar sem compactação** e escolha a pasta que contém o `manifest.json`.

**Manualmente (Firefox, só até fechar o navegador):** `about:debugging#/runtime/this-firefox` → **Carregar extensão temporária** → escolha o `Pin-<versão>-firefox.zip`.

## Popup

- **Extensão ligada**: liga ou desliga tudo.
- **Anúncios → Só marcar (não esconder)**: deixa o anúncio na tela, apagado e com borda vermelha. Serve para conferir a detecção.
- **Pins feitos por IA**: mostrar selo "IA" (padrão), esconder, ou não fazer nada.
- A contagem mostra quantos anúncios e pins de IA apareceram na aba.

## Como detecta

Cada cartão da grade (`[data-grid-item]` / `[role="listitem"]`) é analisado.

**Anúncio**, se tiver qualquer um destes sinais:

1. Um selo de texto curto "Promovido por", "Patrocinado", "Promoted by" ou "Sponsored". Frases maiores que só citam a palavra não contam.
2. `data-test-id` com "promoted", "sponsor" ou "ad", ou `aria-label` com um dos selos acima.
3. Link com `utm_medium=paid|cpc|ad`, `pinterest.com/ads` ou `doubleclick.net`.

**IA**, se tiver um texto ou `title`/`aria-label` exatamente igual ao selo do Pinterest: "Modificado por IA", "AI modified" e variações. Só vale o selo do Pinterest: um pin de IA que ele não identificou fica sem marca.

Os cartões recebem classes CSS (`display: none` ou o selo desenhado com `::after`). Nenhum nó é removido ou inserido, para não quebrar o React do site. Um `MutationObserver` reavalia a grade a cada mudança, cobrindo a rolagem infinita e a navegação interna.

## Limitações

O Pinterest muda o HTML com frequência. Se algum anúncio passar, ligue **Só marcar**, inspecione o cartão (F12) e adicione o sinal novo em `src/detector.js` e um caso em `test/fixtures/grade.html`.

## Desenvolvimento

```
npm install
npm test            # node:test + jsdom
npm run icones      # regera icons/*.png e loja/logo-300.png
npm run empacotar   # gera dist\Pin-<versão>-edge.zip e -firefox.zip
npx web-ext lint --source-dir <pasta do zip do Firefox descompactado>
```

A versão fica em `manifest.json` e `package.json` (mantenha iguais). O material das lojas está em [loja/LOJA.md](loja/LOJA.md).

## Licença

MIT.
