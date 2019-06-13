const dateFormat = require('dateformat');
const logger = require('../../common/Logger')('src/db/models/Review.js');

module.exports = (mongoose) => {
  const { Schema } = mongoose;
  const reviewSchema = new Schema({
    Rating: String,
    Description: String,
    ReviewDate: Date,
    ProductId: { type: Schema.Types.ObjectId, ref: 'ProductPage' },
  });

  const collectionName = `reviewScrapred${dateFormat(new Date(), 'yyyymmdd')}`;
  logger.debug(collectionName);

  return mongoose.model(collectionName, reviewSchema);
};
