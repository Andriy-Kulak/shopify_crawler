const logger = require('../../common/Logger')('src/Parser/pages/SearchPage.js');

const TYPE_DELAY = 50;

class SearchPage {
  constructor() {
    this.category = null;
    this.subcategory = null;
  }

  async checkCategories(page) {
    if (this.category === null) {
      this.category = await page.evaluate(() => document.querySelector('#CategoriesFilter a').firstChild.nodeValue.trim());
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
        page.click('#CategoriesFilter a', { delay: TYPE_DELAY }),
      ]);
    }
    if (this.subcategory === null) {
      this.subcategory = await page.evaluate(() => document.querySelector('#CategoriesFilter ul a').firstChild.nodeValue.trim());
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
        page.click('#CategoriesFilter ul a', { delay: TYPE_DELAY }),
      ]);
    }
  }

  async getProductsOnPage(page) {
    return page.evaluate(() => {
      const nodes = document.querySelectorAll('#SearchResultsListings .grid__item');
      const result = [];
      nodes.forEach((container) => {
        const reviewsNumber = container.querySelector('.ui-review-count-summary').firstChild.nodeValue.trim();
        result.push({
          Name: container.querySelector('h4').textContent.trim(),
          MinorDescription: container.querySelector('p').textContent.trim(),
          ReviewRating: Number(container.querySelector('.ui-star-rating__rating').firstChild.nodeValue.trim()),
          NumberOfReviews: Number(reviewsNumber.split('').filter(Number).join('')),
        });
      });
      return result;
    });
  }

  async Parse(page) {
    await this.checkCategories(page);
    const products = await this.getProductsOnPage(page);
    const source = {
      Category: this.category,
      Subcategory: this.subcategory,
    };
    const productsComplete = products.map(product => Object.assign(product, source));
    return productsComplete;
  }
}

module.exports = SearchPage;
