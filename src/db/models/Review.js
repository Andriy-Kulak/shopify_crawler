module.exports = (mongoose) => {
  const { Schema } = mongoose;
  const reviewSchema = new Schema({
    Rating: String,
    Description: String,
    ReviewDate: Date,
    ProductId: { type: Schema.Types.ObjectId, ref: 'Product' },
  });

  mongoose.model('Review', reviewSchema);
};
