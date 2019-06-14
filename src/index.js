const program = require('commander');
const logger = require('./common/Logger')('index.js');

const parseBoolean = (value, prevValue) => {
  const lowCasedValue = value.toLowerCase();
  switch (lowCasedValue) {
    case 'true':
      return true;
    case 'false':
      return false;
    default:
      logger.warn(`Invalid argument ${lowCasedValue}`);
      return prevValue;
  }
};

const REVIEWS_LIMIT = 1000;

const parseIntArg = (value, prev) => {
  const result = parseInt(value, 10);
  return Number.isInteger(result) ? result : prev;
};

program
  .option('-p, --products <value>', 'Should script parse products? (default: true)', parseBoolean, true)
  .option('-r, --reviews <value>', 'Should script parse reviews? (default: true)', parseBoolean, true)
  .option('-l, --limit <number>', `Reviews parsing limit ${REVIEWS_LIMIT}`, parseIntArg, REVIEWS_LIMIT);

program.parse(process.argv);

const Parser = require('./Parser');
const db = require('./db');

logger.info('Script started...');

const parsingProducts = async () => {
  logger.info('Parsing products');
  let parser;
  try {
    parser = new Parser();
    const { Product } = db;

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
    logger.error('Error in parsingProducts:', e);
  } finally {
    if (parser) {
      await parser.clean();
    }
  }
};

const parsingReviews = async () => {
  logger.info('Parsing reviews');
  let parser;
  try {
    const { Product } = db;
    const allProducts = await Product.find();
    parser = new Parser();
    await parser.getReviews(allProducts, program.limit);
  } catch (e) {
    logger.error('Error in parsingReviews:', e);
  } finally {
    if (parser) {
      await parser.clean();
    }
  }
};

const main = async () => {
  const { mongoose } = db;
  logger.info('Main invoked');
  if (program.products) {
    await parsingProducts();
  }
  if (program.reviews) {
    await parsingReviews();
  }
  mongoose.disconnect();
};

main();
