const dateFormat = require('dateformat');
const logger = require('../../common/Logger')('src/db/models/Product.js');

module.exports = (mongoose) => {
  const { Schema } = mongoose;
  const productSchema = new Schema({
    Url: { type: String, index: true },
    Name: String,
    Category: String,
    Subcategory: String,
    MinorDescription: String,
    NumberOfReviews: Number,
    ReviewRating: Number,
    DateTracked: { type: Date, default: Date.now },
    Slug: String,
    star1: Number,
    star2: Number,
    star3: Number,
    star4: Number,
    star5: Number,
  });

  const collectionName = `productsScrapred${dateFormat(new Date(), 'yyyymmdd')}`;
  logger.debug(collectionName);

  return mongoose.model(collectionName, productSchema);
};
