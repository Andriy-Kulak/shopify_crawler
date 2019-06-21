const dateFormat = require('dateformat');
const logger = require('../../common/Logger')('src/db/models/Review.js');

module.exports = (mongoose) => {
  const { Schema } = mongoose;
  const productsName = `productsScrapred${dateFormat(new Date(), 'yyyymmdd')}`;
  const reviewSchema = new Schema({
    Id: Number,
    Rating: Number,
    Header: String,
    Description: String,
    ReviewDate: Date,
    ProductId: { type: Schema.Types.ObjectId, ref: productsName },
  });

  const collectionName = `reviewsScrapred${dateFormat(new Date(), 'yyyymmdd')}`;
  logger.debug(collectionName);

  return mongoose.model(collectionName, reviewSchema);
};
