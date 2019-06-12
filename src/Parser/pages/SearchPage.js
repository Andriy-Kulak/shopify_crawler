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
