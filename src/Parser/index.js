const puppeteer = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');

const config = require('config');
const db = require('../db');
const logger = require('../common/Logger')('src/Parser/index.js');

puppeteer.use(pluginStealth());

const SearchPage = require('./pages/SearchPage');
const ProductPage = require('./pages/ProductPage');
const ReviewPage = require('./pages/ReviewPage');

const PAGES_PER_ITERATION = config.get('PAGES_PER_ITERATION');
const PRODUCTS_REVIEW = config.get('PRODUCTS_REVIEW');

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

  async getReviews(allProducts, limit) {
    const filteredProducts = allProducts
      .filter((product) => {
        const { NumberOfReviews } = product;
        if (NumberOfReviews === 0) {
          const { Name, Slug } = product;
          logger.debug(`Skipping "${Name}" (${Slug}) - has zero numbers of review`);
        }
        return NumberOfReviews;
      });
    if (allProducts.length !== filteredProducts.length) {
      logger.debug(`Total skipped (${allProducts.length - filteredProducts.length}) products.`);
    }
    const { Review } = db;
    do {
      const productsIteration = filteredProducts.splice(0, PRODUCTS_REVIEW);
      // eslint-disable-next-line no-await-in-loop
      await Promise.all(productsIteration
        .map(async (product) => {
          const page = new ReviewPage(product, limit);
          const reviews = await page.parse();
          return Review.insertMany(reviews);
        }));
    } while (filteredProducts.length);
  }
}

module.exports = Parser;
