const cheerio = require('cheerio');
const Http = require('../../common/Http');
const logger = require('../../common/Logger')('src/Parser/pages/ReviewPage.js');

const findId = (tag) => {
  let value = 0;
  tag.children.find((child) => {
    if (child.name === 'div' && child.attribs['data-review-id']) {
      value = Number(child.attribs['data-review-id']);
    }
    return value;
  });
  return value;
};

const parseDate = (str) => {
  const parts = str.toLowerCase().split(' ');
  const [month, day, year] = parts.map((part) => {
    const num = Number.parseInt(part, 10);
    if (Number.isInteger(num)) {
      return num;
    }
    switch (part) {
      case 'january':
        return 1;
      case 'february':
        return 2;
      case 'march':
        return 3;
      case 'april':
        return 4;
      case 'may':
        return 5;
      case 'june':
        return 6;
      case 'july':
        return 7;
      case 'august':
        return 8;
      case 'september':
        return 9;
      case 'october':
        return 10;
      case 'november':
        return 11;
      case 'december':
        return 12;
      default:
        logger.warn(`Invalid month ${str}, ${part} (${parts})`);
        return 1;
    }
  });
  return new Date(Date.UTC(year, month - 1, day));
};

class ReviewPage {
  constructor(product, limit) {
    this.product = product;
    this.limit = limit;
  }

  async parse() {
    const { product, limit } = this;
    let result = [];
    let urlPostFix = '/reviews';
    let Url = `${product.Url}${urlPostFix}`;
    let counter = 0;
    const { _id } = product;
    do {
      try {
        // eslint-disable-next-line no-await-in-loop
        const html = await Http.Get(Url);
        const $ = cheerio.load(html);
        const reviewsOnPage = ReviewPage.getReviews($, _id);
        counter += reviewsOnPage.length;
        result = result.concat(reviewsOnPage);
        urlPostFix = ReviewPage.getNextUrl($);
        Url = `https://apps.shopify.com${urlPostFix}`;
      } catch (e) {
        logger.error(e);
      }
    } while (urlPostFix && counter < limit);
    return result;
  }

  static getNextUrl($) {
    const aLink = $('.search-pagination__next-page-text').get(0);
    if (!aLink) {
      logger.debug('Next link not found.');
      return null;
    }
    if (aLink.attribs.class.indexOf('disabled') !== -1) {
      logger.debug('Last page found.');
      return null;
    }
    return aLink.attribs.href;
  }

  static getReviews($, id) {
    const reviewCollection = $('.review-listing');
    const reviews = [];
    reviewCollection.each((i, tag) => {
      const Id = findId(tag);
      const Header = $('h3', tag).text().trim();
      const Description = $('.review-content', tag).text().trim();
      let Rating = null;
      let ReviewDate = null;
      const ProductId = id;

      $('.review-metadata__item-value', tag).each((i, t) => {
        if (t.children.length === 1 && t.children[0].type === 'text') {
          ReviewDate = parseDate(t.children[0].data.trim());
        } else {
          const ratingTag = $('.ui-star-rating', t).get(0);
          if (ratingTag) {
            Rating = Number(ratingTag.attribs['data-rating']);
          } else {
            logger.warn('Rating not found');
          }
        }
      });

      reviews.push({
        Id,
        Rating,
        Header,
        Description,
        ReviewDate,
        ProductId,
      });
    });
    return reviews;
  }
}

module.exports = ReviewPage;
