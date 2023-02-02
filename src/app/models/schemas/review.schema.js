const mongoose = require('mongoose')
const Tour = require('./tour.schema')
const User = require('./user.schema')
const reviewSchema = new mongoose.Schema(
   {
      id: false,
      review: {
         type: String,
         required: [true, 'Review can not be empty'],
      },
      rating: {
         type: Number,
         required: [true, 'Review must include rating'],
         max: [5, 'rating must be between 1 and 5'],
         min: [1, 'rating must be between 1 and 5'],
      },
      tour: {
         type: mongoose.Schema.ObjectId,
         required: [true, 'Review must belong to a tour'],
         ref: 'Tour',
         validate: {
            validator: async function (val) {
               return await Tour.exists({ _id: val })
            },
            message: 'no such tour:({VALUE}) , can not create review without tour',
         },
      },
      user: {
         type: mongoose.Schema.ObjectId,
         required: [true, 'Review must belong to a user'],
         ref: 'User',
         validate: {
            validator: async function (val) {
               return await User.exists({ _id: val })
            },
            message: 'no such user:({VALUE}) , can not create review without user',
         },
      },
      createdAt: {
         type: Date,
         default: Date.now(),
      },
   },
   {
      toJSON: { virtuals: true },
      toObject: { virtuals: true },
   }
)

reviewSchema.statics.calcAverageRating = async function (tourId) {
   const stats = await this.aggregate([
      {
         $match: { tour: tourId },
      },
      {
         $group: {
            _id: tourId,
            nReview: { $sum: 1 },
            avgRating: { $avg: '$rating' },
         },
      },
   ])

   await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0]?.avgRating || 0,
      ratingsQuantity: stats[0]?.nReview || 0,
   })
   console.log(stats)
}


reviewSchema.post('save', async function () {
   await this.constructor.calcAverageRating(this.tour)
})

// reviewSchema.post(/^findOneAnd/, async function () {
//    await (await(this.r)).constructor.calcAverageRating()
// })

reviewSchema.post('remove', async function () {
   await this.constructor.calcAverageRating(this.tour)
})
// error "Query was already executed: Review.findOne({ _id: new ObjectId(\"63c9ff6d67c1ee14b0171f55...",
// fix this error change the pre findOneAnd

const Review = mongoose.model('Review', reviewSchema)
module.exports = Review
