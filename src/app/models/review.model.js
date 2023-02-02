const Review = require('./schemas/review.schema')
const APIfeatures = require('../utils/APIfeatures')
const { filterObj, filterNullUsers } = require('../utils/filterObj')
const { ErrorBuilder } = require('../utils/ErrorBuilder')

class ReviewModel {
   // dead code
   async getAllReviews(fields, sortBy, limit, page, filters) {
      filters = filterObj(filters, ['review', 'rating', 'tour', 'user'])
      const features = new APIfeatures(Review.find())
         .fields(fields)
         .filter(filters)
         .sort(sortBy)
         .pagination(limit, page)
         .populate('tour', 'name')
         .populate('user', 'photo name')

      const reviewsData = await features.query
      return {
         reviews: reviewsData,
         filterAllowedQuery: features.filterAllowedQuery,
         sortBy: features.sortBy,
         queriedFields: features.queriedFields,
         page: features.page,
         limit: features.limit,
         skip: features.skip,
      }
   }
   // *

   async getTourReviews(tourId, fields, sortBy, limit, page, filters) {
      filters = filterObj(filters, ['review', 'rating', 'tour', 'user'])
      const features = new APIfeatures(Review.find({ tour: tourId }))
         .fields(fields)
         .filter(filters)
         .sort(sortBy)
         .pagination(limit, page)
         .populate('tour', 'name', false, true)
         .populate('user', 'photo name')

      const reviewsData = filterNullUsers(await features.query)

      return {
         reviews: reviewsData,
         filterAllowedQuery: features.filterAllowedQuery,
         sortBy: features.sortBy,
         queriedFields: features.queriedFields,
         page: features.page,
         limit: features.limit,
         skip: features.skip,
      }
   }

   async createReview(userId, tourId, review) {
      review = filterObj(review, ['review', 'rating'])
      review.tour = tourId
      review.user = userId
      const newReview = await Review.create(review)
      return newReview
   }

   async editReview(user, reviewId, data) {
      const review = await Review.findOne({ _id: reviewId })
      if (!review)
         throw new ErrorBuilder('review not found', 404, 'ERROR_404_NOT_FOUND')

      if (user.role !== 'admin' && `${user._id}` !== `${review.user}`) {
         throw new ErrorBuilder('unauthorized action', 401, 'UNAUTHORIZED')
      }

      data = filterObj(data, ['review', 'rating'])
      Object.keys(data).forEach((key) => {
         review[key] = data[key]
      })

      return await review.save()
   }

   async deleteReview(user, reviewId) {
      const review = await Review.findOne({ _id: reviewId })
      if (!review)
         throw new ErrorBuilder('review not found', 404, 'ERROR_404_NOT_FOUND')

      if (user.role !== 'admin' && `${user._id}` !== `${review.user}`) {
         throw new ErrorBuilder('unauthorized action', 401, 'UNAUTHORIZED')
      }

      return await review.remove({
         new: true,
         runValidators: true
      })
   }

}
module.exports = new ReviewModel()
