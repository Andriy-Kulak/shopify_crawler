const puppeteer = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');

const config = require('config');
const logger = require('../common/Logger')('src/Parser/index.js');

const URL = 'https://apps.shopify.com/browse';

puppeteer.use(pluginStealth());

const SearchPage = require('./pages/SearchPage');
const ProductPage = require('./pages/ProductPage');

const PAGES_PER_ITERATION = 5;

class Parser {
  constructor() {
    this.browser = null;
    this.product_page = null;
    this.searchPage = new SearchPage();
  }

  async init() {
    logger.info('Initializing parser.');
    this.browser = await puppeteer.launch(config.get('chrome'));
  }

  async clean() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async getNewPage() {
    const page = await this.browser.newPage();
    await page.setViewport({ width: 1920, height: 1040 });
    return page;
  }

  async getNextProductsPage() {
    if (!this.product_page) {
      const page = await this.getNewPage();
      logger.debug('Opening first page (%s)', URL);
      await page.goto(URL, { waitUntil: 'networkidle2' });
      this.product_page = page;
    }
    return this.product_page;
  }

  async getStarsForProduct(products) {
    let result = [];
    do {
      const productsIteration = products.splice(0, PAGES_PER_ITERATION);
      // eslint-disable-next-line no-await-in-loop
      const productsWithStars = await Promise.all(productsIteration.map(async (product) => {
        const productPage = new ProductPage(product);
        const page = await this.getNewPage();
        const productResult = await productPage.Parse(page);
        await page.close();
        return productResult;
      }));
      result = result.concat(productsWithStars);
    } while (products.length);
    return result;
  }

  async getProducts() {
    const page = await this.getNextProductsPage();
    const products = await this.searchPage.Parse(page);
    return this.getStarsForProduct(products);
  }
}

module.exports = Parser;
