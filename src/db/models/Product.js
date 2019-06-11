module.exports = (mongoose) => {
  const { Schema } = mongoose;
  const productSchema = new Schema({
    Name: { type: String, index: true },
    Category: String,
    Subcategory: String,
    MinorDescription: String,
    NumberOfReviews: Number,
    ReviewRating: Number,
    DateStartedTracking: { type: Date, default: Date.now },
  });

  mongoose.model('Product', productSchema);
};
