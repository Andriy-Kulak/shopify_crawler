const puppeteer = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');

const config = require('config');
const logger = require('../common/Logger')('src/Parser/index.js');

puppeteer.use(pluginStealth());

const SearchPage = require('./pages/SearchPage');
const ProductPage = require('./pages/ProductPage');

const PAGES_PER_ITERATION = 5;

class Parser {
  constructor() {
    this.browser = null;
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
    const { searchPage } = this;
    if (!searchPage.havePage()) {
      const page = await this.getNewPage();
      await searchPage.setPage(page);
    }

    const products = await searchPage.Parse();
    return this.getStarsForProduct(products);
  }
}

module.exports = Parser;
