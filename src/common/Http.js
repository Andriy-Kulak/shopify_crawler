const request = require('request');
const logger = require('../common/Logger')('src/common/Http.js');

const HTTP_OK = 200;

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36',
};

class Http {
  static async Get(url) {
    logger.debug(`Url: ${url}`);
    return new Promise((resolve, reject) => {
      request({
        url,
        method: 'GET',
        headers: HEADERS,
      }, (error, response, html) => {
        if (error) {
          logger.error(`Error on url (${url})`);
          logger.error(error);
          reject(error);
        } else if (response.statusCode !== HTTP_OK) {
          logger.error(`Error on url (${url}), status code: ${response.statusCode}`);
          reject(response.statusCode);
        } else {
          resolve(html);
        }
      });
    });
  }
}

module.exports = Http;
