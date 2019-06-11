module.exports = (mongoose) => {
  const { Schema } = mongoose;
  const productSchema = new Schema({
    Name: { type: [String], index: true },
    Category: String,
    Subcategory: String,
    MinorDescription: String,
    NumberOfReviews: Number,
    ReviewRating: Number,
    DateStartedTracking: Date,
  });

  mongoose.model('Product', productSchema);
};
