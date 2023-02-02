const tour = require('../models/tour.model')
const catchAsync = require('../utils/catchAsync')

exports.getAllTours = catchAsync(async (req, res) => {
   let {destain,center,unit} = req.query
   center = center ? center.split(",") : []
   const [lat,lng] = center
   const Geo = {
      destain: Number(destain),
      lat: Number(lat),
      lng: Number(lng),
      unit
   }

   const toursOpj = await tour.getAllTours(
      Geo,
      req.query.fields,
      req.query.sort,
      req.query.limit,
      req.query.page,
      req.query
   )
   res.status(200).json({
      status: 'success',
      results: toursOpj.tours.length,
      filters: toursOpj.filterAllowedQuery,
      sortBy: toursOpj.sortBy,
      fields: toursOpj.queriedFields,
      pagination: {
         page: toursOpj.page,
         limit: toursOpj.limit,
         skip: toursOpj.skip,
      },
      Geolocation:toursOpj.geoLocation,
      data: {
         tours: toursOpj.tours,
      },
   })
})
exports.getTour = catchAsync(async (req, res) => {
   const { returnedTour, queriedFields } = await tour.getTour(
      req.params.id,
      req.query.fields,
      req.query.slug
   )

   res.status(200).json({
      status: 'success',
      fields: queriedFields,
      data: {
         tour: returnedTour,
      },
   })
})
exports.createNewTour = catchAsync(async (req, res) => {
   const newTour = await tour.createNewTour(req.body)
   res.status(201).json({
      status: 'success',
      data: {
         tour: newTour,
      },
   })
})
exports.editTour = catchAsync(async (req, res) => {
   const editedTour = await tour.editTour(
      req.params.id,
      req.body,
      req.query.slug
   )
   res.status(201).json({
      status: 'success',
      data: {
         tour: editedTour,
      },
   })
})
exports.deleteTour = catchAsync(async (req, res) => {
   const deletedTour = await tour.deleteTour(req.params.id, req.query.slug)
   res.status(200).json({
      message: 'success',
      data: {
         tour: deletedTour,
      },
   })
})

exports.getTourStats = catchAsync(async (req, res) => {
   const stats = await tour.getTourStats()
   res.status(200).json({
      status: 'success',
      results: stats.length,
      data: {
         stats,
      },
   })
})
exports.getMonthlyPlan = catchAsync(async (req, res) => {
   const plan = await tour.getMonthlyPlan(req.params.year)
   res.status(200).json({
      status: 'success',
      results: plan.length,
      data: {
         plan,
      },
   })
})

exports.toursWithin = catchAsync(async (req, res) => {
   let {destain,center,unit} = req.query
   center = center ? center.split(",") : []
   const [lat,lng] = center
   const Geo = {
      destain: Number(destain),
      lat: Number(lat),
      lng: Number(lng),
      unit
   }
   console.log(Geo);
   const toursOpj = await tour.toursWithin(
      Geo
   )

   res.status(200).json({
      status: 'success',
      results: toursOpj.tours.length,

      data: {
         tours: toursOpj.tours,
      },
   })
})
