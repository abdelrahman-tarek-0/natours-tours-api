const express = require('express')

const routes = express.Router()
const reviewsRoutes = require('./review.routes')

const controller = require('../../controllers/tour.controller')
const {
   restrictTo,
   loggedIn,
   allowChange,
} = require('../../middlewares/auth.middleware')

routes.get(
   '/monthly-plan/:year',
   loggedIn(),
   restrictTo('admin'),
   controller.getMonthlyPlan
)
routes.get('/stats', loggedIn(), restrictTo('admin'), controller.getTourStats)

routes.get(
   '/tours-within/:destain/center/:center/unit/:unit',
   controller.toursWithin
)

routes
   .route('/')
   .get(controller.getAllTours)
   .post(loggedIn(), controller.createNewTour)

routes.use('/reviews', loggedIn(), reviewsRoutes)
routes.use('/:id/reviews', loggedIn(), reviewsRoutes)

routes
   .route('/:id')
   .get(controller.getTour)
   .patch(
      loggedIn(),
      restrictTo('guide','lead-guide','admin'),
      allowChange({
         doc: 'tours',
         identifierFrom: 'params',
         identifierName: 'id',
      }),
      controller.editTour
   )
   .delete(
      loggedIn(),
      restrictTo('guide','lead-guide','admin'),
      allowChange({
         doc: 'tours',
         identifierFrom: 'params',
         identifierName: 'id',
      }),
      controller.deleteTour
   )

module.exports = routes
