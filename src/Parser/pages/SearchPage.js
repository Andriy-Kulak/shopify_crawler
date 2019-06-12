const logger = require('../../common/Logger')('src/Parser/pages/SearchPage.js');

const TYPE_DELAY = 50;

const NEXT_PAGE_SELECTOR = '.search-pagination__next-page-text';
const URL = 'https://apps.shopify.com/browse';

class SearchPage {
  constructor() {
    this.category = null;
    this.subcategory = null;
    this.page = null;
  }

  havePage() {
    return this.page !== null;
  }

  async setPage(page) {
    logger.debug('Opening first page (%s)', URL);
    await page.goto(URL, { waitUntil: 'networkidle2' });
    this.page = page;
  }

  async checkCategories() {
    const { page } = this;
    if (this.category === null) {
      logger.debug('Setting first category');
      this.category = await page.evaluate(() => document.querySelector('#CategoriesFilter a').firstChild.nodeValue.trim());
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
        page.click('#CategoriesFilter a', { delay: TYPE_DELAY }),
      ]);
    }
    if (this.subcategory === null) {
      logger.debug('Setting first subcategory');
      this.subcategory = await page.evaluate(() => document.querySelector('#CategoriesFilter ul a').firstChild.nodeValue.trim());
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
        page.click('#CategoriesFilter ul a', { delay: TYPE_DELAY }),
      ]);
    }
  }

  async getProductsOnPage() {
    const { page } = this;
    logger.debug('Getting products on page');
    return page.evaluate(() => {
      const nodes = document.querySelectorAll('#SearchResultsListings .grid__item');
      const result = [];
      nodes.forEach((container) => {
        const fullUrl = container.querySelector('a').getAttribute('href');
        const pos = fullUrl.indexOf('?');
        let Url;
        if (pos !== -1) {
          Url = fullUrl.substr(0, pos);
        } else {
          Url = fullUrl;
        }
        const Slug = Url.substring(Url.lastIndexOf('/') + 1);
        const reviewsNumber = container.querySelector('.ui-review-count-summary').firstChild.nodeValue.trim();
        const Name = container.querySelector('h4').textContent.trim();
        const MinorDescription = container.querySelector('p').textContent.trim();
        const ReviewRating = Number(container.querySelector('.ui-star-rating__rating').firstChild.nodeValue.trim());
        const NumberOfReviews = Number(reviewsNumber.split('').filter(c => Number.isInteger(Number(c))).join(''));
        result.push({
          Url,
          Name,
          MinorDescription,
          ReviewRating,
          NumberOfReviews,
          Slug,
        });
      });
      return result;
    });
  }

  async isNextLinkOnPage() {
    const { page } = this;
    return page.evaluate(selector => !document.querySelector(selector)
      .classList
      .contains('disabled'), NEXT_PAGE_SELECTOR);
  }

  async clickOnNextSubCategory() {
    const { page } = this;
    return page.evaluate(() => {
      let shouldClick = false;
      let result = null;
      const links = document.querySelectorAll('.search-filter-group__item-name');
      for (const link of links) {
        if (link.getAttribute('aria-current').toLowerCase() === 'true') {
          shouldClick = true;
        } else if (shouldClick) {
          const subcategory = link.firstChild.nodeValue.trim();
          result = { subcategory };
          link.click();
          break;
        }
      }
      return result;
    });
  }

  async goToNextSearchResult() {
    const { page } = this;
    logger.debug('go to next search result');
    if (await this.isNextLinkOnPage()) {
      logger.debug('Found Next link, clicking on it.');
      return Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
        page.click(NEXT_PAGE_SELECTOR, { delay: TYPE_DELAY }),
      ]);
    }
    const promise = page.waitForNavigation({ waitUntil: 'networkidle2' });
    const nextCat = await this.clickOnNextSubCategory();
    if (nextCat) {
      this.subcategory = nextCat.subcategory;
    } else {
      await page.goto('')
    }
    return promise;
  }

  async Parse() {
    logger.debug('Parsing');
    await this.checkCategories();
    const products = await this.getProductsOnPage();
    const source = {
      Category: this.category,
      Subcategory: this.subcategory,
    };
    const productsComplete = products.map(product => Object.assign(product, source));
    await this.goToNextSearchResult();
    return productsComplete;
  }
}

module.exports = SearchPage;
