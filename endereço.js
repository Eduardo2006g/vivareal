//Pega o endereço
const puppeteer = require('puppeteer');

async function scrape() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Configura o cabeçalho para simular uma solicitação de navegador
  await page.setExtraHTTPHeaders({
    'User-Agent': 'Mozilla/5.0'
  });

  // Navega até a página desejada
  await page.goto('https://www.vivareal.com.br/venda/espirito-santo/guarapari/#onde=Brasil,Esp%C3%ADrito%20Santo,Guarapari,,,,,,BR%3EEspirito%20Santo%3ENULL%3EGuarapari,,,', { waitUntil: 'domcontentloaded' });

  // Espera até que a página esteja completamente carregada
  await page.waitForSelector('body');

  // Obtém todos os parágrafos com a classe 'card__street'
  const paragraphs = await page.evaluate(() => {
    const paragraphElements = [...document.querySelectorAll("span.property-card__address")];
    return paragraphElements.map(p => p.textContent.trim());
  });

  // Concatena os conteúdos dos parágrafos em uma única string
  const allParagraphsText = paragraphs.join('\n');

  // Imprime os conteúdos dos parágrafos encontrados
  if (allParagraphsText) {
    console.log('Itens encontrados:\n', allParagraphsText);
  } else {
    console.log('Nenhum item encontrado.');
  }

  // Fecha o navegador
  await browser.close();
}

// Chama a função para iniciar a raspagem
scrape();
