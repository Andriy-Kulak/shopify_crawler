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
    DateStartedTracking: { type: Date, default: Date.now },
    Slug: String,
    star1: Number,
    star2: Number,
    star3: Number,
    star4: Number,
    star5: Number,
  });

  mongoose.model('ProductPage', productSchema);
};
