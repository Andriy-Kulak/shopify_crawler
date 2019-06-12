const logger = require('../../common/Logger')('src/Parser/pages/SearchPage.js');
/*
const LONG_DELAY_API = 2000;
*/

const TYPE_DELAY = 50;

const NEXT_PAGE_SELECTOR = '.search-pagination__next-page-text';
const URL = 'https://apps.shopify.com/browse';
// const URL = 'https://apps.shopify.com/browse/store-design-popups-and-notifications?page=9&pricing=all&requirements=off&sort_by=popular'; // Go to next SubCategory
// const URL = 'https://apps.shopify.com/browse/store-design-other?page=9&pricing=all&requirements=off&sort_by=popular'; // Got to next SubCategory in another Category
// const URL = 'https://apps.shopify.com/browse/places-to-sell-other?pricing=all&requirements=off&sort_by=popular'; // Last SubCategory
// const URL = 'https://apps.shopify.com/browse/store-design-badges?page=2&pricing=all&requirements=off&sort_by=popular'; // Next subCategory do not have Next Link

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

  async clickOnNextSubCat(initialFlag = false) {
    const { page } = this;
    return page.evaluate((flag) => {
      let isFount = flag;
      let clicked = false;
      const links = document.querySelectorAll('#CategoriesFilter .search-filter-group__item-name');
      for (const link of links) {
        if (link.getAttribute('aria-current').toLowerCase() === 'true') {
          isFount = true;
        } else if (isFount) {
          clicked = true;
          link.click();
          break;
        }
      }
      if (!clicked) {
        window.location.href = 'about:blank';
      }
    }, initialFlag);
  }

  async getCatAndSubCatOnPage() {
    const { page } = this;
    return page.evaluate(() => {
      let result = null;
      const links = document.querySelectorAll('#CategoriesFilter .search-filter-group__item-name');
      for (const link of links) {
        if (link.getAttribute('aria-current').toLowerCase() === 'true') {
          const subcategory = link.firstChild.nodeValue.trim();
          const blockContainer = link.parentNode.parentNode.parentNode;
          const category = blockContainer.querySelector('a').firstChild.nodeValue.trim();
          result = { subcategory, category };
          break;
        }
      }
      return result;
    });
  }

  setCatAndSubCat({ subcategory, category }) {
    logger.debug(`Category: ${category}, Subcategory: ${subcategory}`);
    this.category = category;
    this.subcategory = subcategory;
  }

  async checkCategories() {
    const { page } = this;
    const initialFlag = this.category === null;
    if (initialFlag === true || (await this.noNextLinkOnPage())) {
      logger.debug('Clicking on next subCategory.');
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
        this.clickOnNextSubCat(initialFlag),
      ]);
    } else {
      logger.debug('Clicking on next link.');
      return Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
        page.click(NEXT_PAGE_SELECTOR, { delay: TYPE_DELAY }),
      ]);
    }
    const result = await this.getCatAndSubCatOnPage();
    if (result) {
      this.setCatAndSubCat(result);
    } else {
      logger.debug('No category and subcategory on page. Parsing finished');
    }
    return result;
  }

  async getProductsOnPage() {
    const { page } = this;
    logger.debug('Getting products on page');
    return page.evaluate(() => {
      const nodes = document.querySelectorAll('#SearchResultsListings .grid__item');
      const result = [];

      const getValue = (container, selector) => {
        const el = container.querySelector(selector);
        if (el) {
          const { firstChild } = el;
          if (firstChild) {
            return firstChild.nodeValue.trim();
          }
        }
        return null;
      };

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
        const Name = container.querySelector('h4').textContent.trim();
        const MinorDescription = container.querySelector('p').textContent.trim();

        const reviewRating = getValue(container, '.ui-star-rating__rating');
        const ReviewRating = Number(reviewRating);

        const reviewsNumber = getValue(container, '.ui-review-count-summary');
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

  async noNextLinkOnPage() {
    const { page } = this;
    const noNextLink = await page.evaluate((selector) => {
      const nextLink = document.querySelector(selector);
      if (!nextLink) {
        return true;
      }
      return nextLink.classList.contains('disabled');
    }, NEXT_PAGE_SELECTOR);
    if (noNextLink) {
      logger.debug('Next link not found.');
    } else {
      logger.debug('Next link found.');
    }
    return noNextLink;
  }

  async Parse() {
    await this.checkCategories();
    const url = await this.page.url();
    logger.debug('Parsing %s', url);
    const products = await this.getProductsOnPage();
    logger.debug('Found %d products', products.length);
    const source = {
      Category: this.category,
      Subcategory: this.subcategory,
    };
    return products.map(product => Object.assign(product, source));
  }
}

module.exports = SearchPage;
