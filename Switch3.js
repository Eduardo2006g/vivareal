//Tenho que mudar a quantidade de página limite e adicionar os outros elementos que eu quero: Endereço, e etc. E tem que cortar os ultimos 14 elementos de todas as páginas.
const puppeteer = require('puppeteer');

async function scrape() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Configura o cabeçalho para simular uma solicitação de navegador
  await page.setExtraHTTPHeaders({
    'User-Agent': 'Mozilla/5.0'
  });

  let currentPage = 1;
  const maxPages = 10; // Defina o número máximo de páginas a serem visitadas

  const baseUrl = 'https://www.vivareal.com.br/venda/espirito-santo/guarapari/?pagina=6#onde=Brasil,Esp%C3%ADrito%20Santo,Guarapari,,,,,,BR%3EEspirito%20Santo%3ENULL%3EGuarapari,,,';

  while (currentPage <= maxPages) {
    // Navega até a página desejada
    await page.goto(`${baseUrl}&pagina=${currentPage}`);

    // Espera até que a página esteja completamente carregada
    await page.waitForSelector('body');

    // Obtém todos os parágrafos com a classe 'card__street'
    const paragraphs = await page.evaluate(() => {
      const paragraphElements = [...document.querySelectorAll('div.property-card__price.js-property-card-prices.js-property-card__price-small')];
      return paragraphElements.map(p => p.textContent.trim());
    });

    // Imprime os conteúdos dos parágrafos encontrados
    if (paragraphs.length > 0) {
      console.log(`Parágrafos encontrados na página ${currentPage}:`, paragraphs);
    } else {
      console.log(`Nenhum parágrafo encontrado na página ${currentPage}.`);
    }

    // Aguarda totalmente o carregamento da próxima página
    try {
      // Espera até que o botão "Próxima página" esteja disponível
      await page.waitForSelector('button[title="Próxima página"]');
      
      // Aguarda 3 segundos antes de clicar no botão "Próxima página"
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Clica no botão "Próxima página"
      await page.click('button[title="Próxima página"]');

      // Imprime a nova URL após clicar no botão "Próxima página"
      console.log('Nova URL:', page.url());
    } catch (error) {
      console.error('Erro ao navegar para a próxima página:', error);
      break; // Sai do loop se ocorrer um erro ao navegar
    }

    currentPage++;
  }

  // Fecha o navegador
  await browser.close();
}

// Chama a função para iniciar a raspagem
scrape();
