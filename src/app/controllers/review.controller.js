const review = require('../models/review.model')
const catchAsync = require('../utils/catchAsync')

// dead code
exports.getAllReviews = catchAsync(async (req, res) => {
   const reviewsData = await review.getAllReviews(
      req.query.fields,
      req.query.sort,
      req.query.limit,
      req.query.page,
      req.query
   )

   res.status(200).json({
      status: 'success',
      results: reviewsData.reviews.length,
      filters: reviewsData.filterAllowedQuery,
      sortBy: reviewsData.sortBy,
      fields: reviewsData.queriedFields,
      pagination: {
         page: reviewsData.page,
         limit: reviewsData.limit,
         skip: reviewsData.skip,
      },
      data: {
         reviews: reviewsData.reviews,
      },
   })
})
// *

exports.getTourReviews = catchAsync(async (req, res) => {
   const reviewsData = await review.getTourReviews(
      req.params.id,
      req.query.fields,
      req.query.sort,
      req.query.limit,
      req.query.page,
      req.query
   )

   res.status(200).json({
      status: 'success',
      results: reviewsData.reviews.length,
      filters: reviewsData.filterAllowedQuery,
      sortBy: reviewsData.sortBy,
      fields: reviewsData.queriedFields,
      pagination: {
         page: reviewsData.page,
         limit: reviewsData.limit,
         skip: reviewsData.skip,
      },
      data: {
         reviews: reviewsData.reviews,
      },
   })
})



exports.createReview = catchAsync(async (req, res) => {
   const newReview = await review.createReview(
      req.user._id,
      req.params.id,
      req.body
   )
   res.status(201).json({
      status: 'success',
      data: {
         review: newReview,
      },
   })
})
exports.editReview = catchAsync(async (req, res) => {
   const newReview = await review.editReview(
      req.user,
      req.params.id,
      req.body
   )
   res.status(201).json({
      status: 'success',
      data: {
         review: newReview,
      },
   })
})
exports.deleteReview = catchAsync(async (req, res) => {
   const newReview = await review.deleteReview(
      req.user,
      req.params.id
   )
   res.status(201).json({
      status: 'success',
      data: {
         review: newReview,
      },
   })
})