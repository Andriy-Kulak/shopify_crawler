const Parser = require('./Parser');
const mongoose = require('./db');
const logger = require('./common/Logger')('index.js');

logger.info('Script started...');

const parsingProducts = async () => {
  logger.info('Parsing products');
  let parser;
  try {
    parser = new Parser();
    const Product = mongoose.model('ProductPage');

    await parser.init();
    let products;
    do {
      // eslint-disable-next-line no-await-in-loop
      products = await parser.getProducts();
      if (products) {
        // eslint-disable-next-line no-await-in-loop
        await Product.insertMany(products);
      }
    } while (products.length);
  } catch (e) {
    logger.error('Error in main:', e);
  } finally {
    if (parser) {
      await parser.clean();
    }
  }
};

const main = async () => {
  logger.info('Main invoked');
  await parsingProducts();
  mongoose.disconnect();
};

main();
