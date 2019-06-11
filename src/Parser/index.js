const puppeteer = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');

const config = require('config');
const logger = require('../common/Logger')('src/Parser/index.js');

const URL = 'https://apps.shopify.com/browse';

puppeteer.use(pluginStealth());

const SearchPage = require('./pages/SearchPage');

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

  async getNextProductsPage() {
    if (!this.product_page) {
      const page = await this.browser.newPage();
      await page.setViewport({ width: 1920, height: 1040 });
      logger.debug('Opening first page (%s)', URL);
      await page.goto(URL, { waitUntil: 'networkidle2' });
      this.product_page = page;
    }
    return this.product_page;
  }

  async getProducts() {
    const page = await this.getNextProductsPage();
    return this.searchPage.Parse(page);
  }
}

module.exports = Parser;
