const express = require('express')

const routes = express.Router({ mergeParams: true })
const reviewsController = require('../../controllers/review.controller')

routes
   .route('/')
   .get(reviewsController.getTourReviews)
   .post(reviewsController.createReview)
   
routes
   .route('/:id')
   .patch(reviewsController.editReview)
   .delete(reviewsController.deleteReview)

module.exports = routes
