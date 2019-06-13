const logger = require('../../common/Logger')('src/Parser/pages/ProductPage.js');

const TIMEOUT = 0;

class ProductPage {
  constructor(product) {
    this.product = product;
  }

  async Parse(page) {
    const { product } = this;
    const { Url } = product;
    logger.debug('Parsing %s', Url);
    page.setDefaultTimeout(TIMEOUT);
    await page.goto(Url, { waitUntil: 'networkidle2' });
    const starsData = await page.evaluate(() => {
      const reviewsCount = document.querySelectorAll('.reviews-summary__review-count');
      const result = {};
      const getIntegerChars = str => str.split('').filter(c => Number.isInteger(Number(c))).join('');
      reviewsCount.forEach((el, index) => {
        const str = el.textContent;
        let value = 0;
        const nodeValue = Number(getIntegerChars(str));
        if (Number.isInteger(nodeValue)) {
          value = nodeValue;
        }
        const key = `star${5 - index}`;
        result[key] = value;
      });
      return result;
    });
    return Object.assign(product, starsData);
  }
}

module.exports = ProductPage;
