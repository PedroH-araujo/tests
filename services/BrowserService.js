const puppeteer = require('puppeteer');
const dotenv = require('dotenv');

dotenv.config();

class BrowserService {

    static async getBrowser() {
        return await puppeteer.launch({
            headless: process.env.PUPPETEER_HEADLESS === 'false' ? false : true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    }

    static closeBrowser(browser) {
        if (!browser) {
            return;
        }
        return browser.close();
    }

    static buildCrawlUrl = (checkin, checkout) => {
        const baseUrl = process.env.BASE_CRAWLER_URL;
        console.log('Base URL:', baseUrl);
        return `${baseUrl}?entrada=${checkin}&saida=${checkout}&adultos=1#acomodacoes`;
    };

    static async searchRooms(checkin, checkout) {
        const url = this.buildCrawlUrl(checkin, checkout);
    let browser;
    
    const ROOM_CONTAINER_SELECTOR = 'section[data-name="acomodacoes"] > .row.row-shadow .row.borda-cor[data-codigo]';
    const PRICE_SELECTOR = '[data-campo="tarifas"] > [data-tarifa-codigo="19"] b';
    
    
    try {
        browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: true 
        });
        const page = await browser.newPage();
        
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        
        await page.waitForSelector(ROOM_CONTAINER_SELECTOR, { timeout: 15000 });
        await page.waitForSelector(PRICE_SELECTOR, { timeout: 15000 }); 
        
        const rooms = await page.evaluate((roomSelector, priceSelector) => {
            const NAME_SELECTOR = 'h3[data-campo="titulo"]';
            const DESCRIPTION_SELECTOR = '.quarto.descricao';
            const IMAGE_SELECTOR = '.flexslider .flex-active-slide a';

            const roomElements = document.querySelectorAll(roomSelector);
            const results = [];

            roomElements.forEach(item => {
                const nameElement = item.querySelector(NAME_SELECTOR);
                const name = nameElement ? nameElement.innerText.trim() : 'Nome não encontrado';

                const descriptionElement = item.querySelector(DESCRIPTION_SELECTOR);
                const description = descriptionElement ? descriptionElement.innerText.trim().replace(/\s+/g, ' ') : 'Descrição não encontrada';

                const priceElement = item.querySelector(priceSelector);
                const price = priceElement ? priceElement.innerText.trim() : 'Preço não encontrado';
                
                const imageElement = item.querySelector(IMAGE_SELECTOR);
                const image = imageElement ? imageElement.href : 'Imagem não encontrada';

                if (price !== 'Preço não encontrado') {
                     results.push({
                        name: name,
                        description: description,
                        price: price,
                        image: image
                    });
                }
            });

            return results;
        }, ROOM_CONTAINER_SELECTOR, PRICE_SELECTOR);

        return rooms;
        
    } catch (error) {
        console.error('Erro durante o crawling:', error.message);
        throw new Error('Falha ao extrair dados dos quartos: ' + error.message); 
    } finally {
        if (browser) {
            await this.closeBrowser(browser);
        }
    }
    }
}

module.exports = BrowserService;
