# Material para as lojas

Arquivos gerados por `npm run empacotar` (zips) e `npm run icones` (logo).

| Loja | Enviar | Onde |
|---|---|---|
| Firefox (AMO) | `dist/Pin-<versão>-firefox.zip` | https://addons.mozilla.org/developers/addon/submit/distribution |
| Edge Add-ons | `dist/Pin-<versão>-edge.zip` | https://partner.microsoft.com/dashboard/microsoftedge/overview |

- Política de privacidade (URL): https://github.com/RicardoBiazin/Pin/blob/main/PRIVACY.md
- Site / suporte: https://github.com/RicardoBiazin/Pin/issues
- Logo 300x300 (Edge): `loja/logo-300.png`
- Categoria: Firefox "Privacidade e segurança"; Edge "Produtividade".
- Firefox: na pergunta sobre código-fonte, responder que **não** há minificação nem build (o zip é o próprio código). Licença: MIT.
- Firefox: o id `pin-sem-anuncios@biazin.com.br` está no zip; não mudar, a AMO amarra as atualizações a ele.

## Nome

Pin — bloqueador de anúncios para Pinterest

## Resumo (até 132 caracteres)

Esconde os anúncios (Pins promovidos) do Pinterest e põe um selo "IA" nos pins que o próprio Pinterest marca como feitos por IA.

## Descrição

Use o Pinterest normalmente, com a sua conta, feed, busca e pastas, só que sem anúncios.

O que a extensão faz:
• Esconde os Pins promovidos ("Promovido por", "Patrocinado", "Promoted by", "Sponsored").
• Põe um selo roxo "IA" nos pins que o Pinterest marca como "Modificado por IA". Se preferir, pode esconder esses pins ou não fazer nada.
• Pega também os pins que aparecem conforme você rola a página.
• Mostra no ícone quantos anúncios e pins de IA apareceram na aba.

Privacidade: não coleta nenhum dado, não faz requisição de rede e só roda nas páginas do Pinterest. O código é aberto (licença MIT).

Limitações: o selo de IA depende da marcação do próprio Pinterest; um pin feito por IA que o Pinterest não identificou não recebe o selo. Se o Pinterest mudar o site e algum anúncio passar, abra uma issue no GitHub.

Esta extensão não é afiliada ao Pinterest.

## Description (English)

Use Pinterest as usual — your account, feed, search and boards — without ads.

• Hides Promoted Pins.
• Adds a purple "IA" (AI, in Portuguese) badge to pins that Pinterest itself labels as "AI modified" (or hide them, or do nothing).
• Works with infinite scroll.
• Shows how many ads and AI pins appeared in the tab.

Privacy: collects no data, makes no network requests, runs only on Pinterest. Open source (MIT).

This extension is not affiliated with Pinterest.

## Notas para o revisor

The extension only adds CSS classes to Pinterest grid cards (no DOM removal, no network). Detection logic is in src/detector.js with tests in test/. No build step: the zip contains the source as-is.

## Envios

| Loja | Versão | Data | Identificação |
|---|---|---|---|
| Firefox (AMO) | 0.2.0 | 28/10/2026 | id `pin-sem-anuncios@biazin.com.br` |
| Edge Add-ons | 0.2.1 | 28/10/2026 | CRX ID `gmmmcpbkfhloihkpifadpfdenbdbndaa` (link: https://microsoftedge.microsoft.com/addons/detail/gmmmcpbkfhloihkpifadpfdenbdbndaa) |

Edge: a listagem saiu só em English (United States), porque o pacote não declara `default_locale`. Termos de busca usados: pinterest ad blocker, pinterest no ads, hide promoted pins, ai generated pins, ai image label, bloqueador de anuncios, pinterest sem anuncios.
