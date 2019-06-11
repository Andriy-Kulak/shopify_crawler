const mongoose = require('mongoose');
const config = require('config');
const logger = require('../common/Logger')('src/db/index.js');

const mongooseConfig = config.get('mongoose');
mongoose.connect(mongooseConfig.uri, mongooseConfig.options);

const db = mongoose.connection;
db.on('error', (err) => {
  logger.error('Mongoose error:', err);
});
db.once('open', () => {
  logger.info('Connected to mongo.');
});

require('./models/Product')(mongoose);
require('./models/Review')(mongoose);

module.exports = mongoose;
