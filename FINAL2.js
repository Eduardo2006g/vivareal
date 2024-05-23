const puppeteer = require('puppeteer');
const ExcelJS = require('exceljs');

async function scrape() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Configura o cabeçalho para simular uma solicitação de navegador
  await page.setExtraHTTPHeaders({
    'User-Agent': 'Mozilla/5.0'
  });

  let currentPage = 1;
  const maxPages = 190; // Defina o número máximo de páginas a serem visitadas

  const baseUrl = 'https://www.vivareal.com.br/venda/espirito-santo/guarapari/?pagina=3#onde=Brasil,Esp%C3%ADrito%20Santo,Guarapari,,,,,,BR%3EEspirito%20Santo%3ENULL%3EGuarapari,,,';

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Propriedades');

  // Adiciona cabeçalhos
  worksheet.addRow(['Endereço', 'Detalhes', 'Preço']);

  while (currentPage <= maxPages) {
    // Navega até a página desejada
    await page.goto(`${baseUrl}&pagina=${currentPage}`, { waitUntil: 'domcontentloaded' });

    // Espera até que os elementos desejados estejam completamente carregados
    await page.waitForSelector('span.property-card__address');

    // Extrai os endereços, detalhes e preços das propriedades
    const properties = await page.evaluate(() => {
      const enderecoElements = [...document.querySelectorAll("span.property-card__address")];
      const detalheElements = [...document.querySelectorAll("ul.property-card__details")];
      const precoElements = [...document.querySelectorAll("div.property-card__price.js-property-card-prices.js-property-card__price-small")];
      
      // Mapeia os endereços, detalhes e preços em um array de objetos
      return enderecoElements.map((addressElement, index) => {
        // Formata os detalhes para uma string mais legível
        const detalhes = detalheElements[index].textContent
          .split('\n')
          .map(line => line.trim())
          .filter(line => line !== '');
        
        return {
          Endereco: addressElement.textContent.trim(),
          Detalhes: detalhes.join(', '), // Une os detalhes em uma única linha
          Preco: precoElements[index].textContent.trim() // Assume que o preço está no mesmo índice
        };
      });
    });

    // Escreve as informações das propriedades no arquivo Excel
    properties.forEach(property => {
      worksheet.addRow([property.Endereco, property.Detalhes, property.Preco]);
    });

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

  // Salva o arquivo Excel
  await workbook.xlsx.writeFile('propriedades.xlsx');

  // Fecha o navegador
  await browser.close();
}

// Chama a função para iniciar a raspagem
scrape();
