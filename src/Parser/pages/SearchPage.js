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

  async Parse(page) {
    await this.checkCategories(page);
  }
}

module.exports = SearchPage;
