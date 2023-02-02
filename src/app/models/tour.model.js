const Tour = require('./schemas/tour.schema')
const { ErrorBuilder } = require('../utils/ErrorBuilder')
const APIfeatures = require('../utils/APIfeatures')
const { filterObj, filterNullUsers } = require('../utils/filterObj')
const Review = require('./schemas/review.schema')
const { calcBetween2points } = require('../utils/calcDistance')

class TourModel {
   async getAllTours(Geo, fields, sort, limit, page, filters) {
      const filter = filterObj(filters, [
         'id',
         'name',
         'duration',
         'maxGroupSize',
         'difficulty',
         'ratingsAverage',
         'ratingsQuantity',
         'price',
         'slug',
      ])

      const features = new APIfeatures(Tour.find())
         .filter(filter)
         .fields(fields)
         .pagination(limit, page)
         .populate(
            'guides',
            '-__v -email -password -passwordChangedAt -verification -Active -slug'
         )
         .populate(
            'reviews',
            {
               path: 'reviews',
               populate: {
                  path: 'user',
                  select: 'name photo',
               },
               select: '+createdAt -__v',
            },
            true,
            false
         )
         .geoLocation('startLocation', Geo)
         .sort(sort, { fieldName: 'startLocation', Geo: Geo })


      let toursData = await features.query

   
      for (let i = 0; i < toursData.length; i++) {
         // toursData[i].reviews = {...filterNullUsers(toursData[i].reviews)}
         if (Geo.lat && Geo.lng && toursData[i].startLocation.coordinates !== undefined) {
            const distance = calcBetween2points(
               [Geo.lat, Geo.lng],
               [
                  toursData[i].startLocation.coordinates[1],
                  toursData[i].startLocation.coordinates[0],
               ],
               Geo.unit
            )

            toursData[i] = {...toursData[i]._doc,reviews:[...toursData[0].reviews]}
            toursData[i].startLocation.distance = distance
         }
      }

      return {
         tours: toursData,
         filterAllowedQuery: features.filterAllowedQuery,
         sortBy: features.sortBy,
         queriedFields: features.queriedFields,
         page: features.page,
         limit: features.limit,
         skip: features.skip,
         geoLocation: features.geo,
      }
   }

   async getTour(id, fields, slug) {
      let search = {}
      slug === 'true' ? (search = { slug: id }) : (search = { _id: id })

      const { query, queriedFields } = new APIfeatures(Tour.findOne(search))
         .fields(fields)
         .populate(
            'guides',
            '-__v -email -password -passwordChangedAt -verification -Active'
         )
         .populate(
            'reviews',
            {
               path: 'reviews',
               populate: {
                  path: 'user',
                  select: 'name photo',
               },
            },
            true,
            false
         )
      const returnedTour = await query

      if (!returnedTour)
         throw new ErrorBuilder(
            `Tour with id:${id}, not found`,
            404,
            'ERROR_404_NOT_FOUND'
         )

      returnedTour.reviews = filterNullUsers(returnedTour.reviews)

      return {
         returnedTour,
         queriedFields,
      }
   }

   async createNewTour(tour) {
      tour = filterObj(tour, [
         'name',
         'duration',
         'maxGroupSize',
         'difficulty',
         'price',
         'summary',
         'description',
         'imageCover',
         'images',
         'startDates',
         'startLocation',
         'locations',
         'guides',
      ])
      // remove duplicate values from arrays
      tour.guides = [...new Set(tour.guides)]
      tour.images = [...new Set(tour.images)]
      tour.startDates = [...new Set(tour.startDates)]

      const newTour = await Tour.create(tour)
      if (!newTour) {
         throw new ErrorBuilder(
            `Tour was not created, please try again`,
            400,
            'CREATE_ERROR'
         )
      }
      return newTour
   }

   async editTour(id, tour, slug) {
      tour = filterObj(tour, [
         'name',
         'duration',
         'maxGroupSize',
         'difficulty',
         'price',
         'summary',
         'description',
         'imageCover',
         'images',
         'startDates',
         'startLocation',
         'locations',
         'guides',
      ])
      let search = {}
      slug === 'true' ? (search = { slug: id }) : (search = { _id: id })

      const editedTour = await Tour.findByIdAndUpdate(search, tour, {
         new: true,
         runValidators: true,
      })

      if (!editedTour) {
         throw new ErrorBuilder(
            `Tour was not edited, please try again`,
            400,
            'EDIT_TOUR_ERROR'
         )
      }
      return editedTour
   }

   async deleteTour(id, slug) {
      let search = {}
      slug === 'true' ? (search = { slug: id }) : (search = { _id: id })
      const deletedTour = await Tour.findOneAndDelete(search)

      if (!deletedTour) {
         throw new ErrorBuilder(
            `Tour was not deleted, please try again`,
            400,
            'DELETE_TOUR_ERROR'
         )
      }
      console.log(deletedTour._id)
      const reviews = await Review.deleteMany({
         tour: deletedTour._id,
      })
      return deletedTour
   }

   async getTourStats() {
      const stats = await Tour.aggregate([
         { $match: { ratingsAverage: { $gte: 4.5 } } },
         {
            $group: {
               _id: '$difficulty',
               numTours: { $sum: 1 },
               numRating: { $sum: '$ratingsQuantity' },
               averageRating: { $avg: '$ratingsAverage' },
               averagePice: { $avg: '$price' },
               minPrice: { $min: '$price' },
               maxPrice: { $max: '$price' },
               averageMaxGroup: { $avg: '$maxGroupSize' },
               sumTotalPrice: { $sum: '$price' },
            },
         },
         {
            $sort: { price: -1 },
         },
         {
            $addFields: {
               sumOFMinMaxPrice: { $sum: ['$minPrice', '$maxPrice'] },
            },
         },
      ])
      return stats
   }

   async getMonthlyPlan(year) {
      year *= 1
      const plan = await Tour.aggregate([
         {
            $unwind: '$startDates',
         },
         {
            $match: {
               startDates: {
                  $gte: new Date(`${year}-01-01`),
                  $lte: new Date(`${year}-12-31`),
               },
            },
         },
         {
            $group: {
               _id: { $month: '$startDates' },
               numTourStarts: { $sum: 1 },
               tours: { $push: '$name' },
            },
         },
         {
            $addFields: { month: '$_id' },
         },
         {
            $project: {
               _id: 0,
            },
         },
         {
            $sort: { month: 1 },
         },
      ])
      return plan
   }
   async toursWithin(Geo) {
      let unitMap = {
         mi: 1.609344 * 1000,
         km: 1000,
         m: 1,
         cm: 0.01,
      }
      const lol = 'startLocation'
      let opts = {}
      opts[lol] = {
         $near: {
            $geometry: {
               type: 'Point',
               coordinates: [Geo.lng, Geo.lat],
            },
         },
      }
      if (Geo.destain >= 0) {
         opts[lol].$near.$maxDistance = Geo.destain * unitMap[Geo.unit]
      }

      const features = await Tour.find(opts)

      // let toursData = features.map((tour) => {
      //    tour.reviews = filterNullUsers(tour.reviews)
      //    return tour
      // })
      return {
         tours: features,
      }
   }
}

module.exports = new TourModel()
