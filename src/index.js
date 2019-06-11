const Parser = require('./Parser');
const mongoose = require('./db');
const logger = require('./common/Logger')('index.js');

logger.info('Script started...');

const main = async () => {
  logger.info('Main invoked');
  let parser;
  try {
    parser = new Parser();

    const Product = mongoose.model('Product');

    await parser.init();
    const products = await parser.getProducts();
    if (products) {
      await Product.insertMany(products);
    }
  } catch (e) {
    logger.error('Error in main:', e);
  } finally {
    if (parser) {
      await parser.clean();
    }
  }
};

main();
