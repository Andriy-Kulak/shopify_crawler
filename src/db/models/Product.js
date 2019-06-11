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
  });

  mongoose.model('Product', productSchema);
};
