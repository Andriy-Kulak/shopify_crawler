const logger = require('../../common/Logger')('src/Parser/pages/SearchPage.js');

class SearchPage {
  static async Parse(page) {
    logger.debug(page);
  }
}

module.exports = SearchPage;
