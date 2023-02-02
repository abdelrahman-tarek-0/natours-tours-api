const { unitFromToMetersMap } = require('./calcDistance')
class APIfeatures {
   /**
    * @constructor for the APIfeatures class
    * @param {mongoose.schema.query} query - the query to be modified
    */
   constructor(query) {
      this.query = query
      this.filterAllowedQuery = ''
      this.sortBy = ''
      this.queriedFields = ''
      this.limit = ''
      this.page = ''
      this.skip = ''
      this.geo = ''
   }

   /**
    * @description filter the query based on the allowed query
    * @param {object} allowedQuery - the filters
    * @returns {this} the current instance of the class
    * @example  filter({ price: {gte: 1000, lte: 2000}, duration: {gte: 5}, difficulty: 'easy'})
    */
   filter(allowedQuery) {
      this.filterAllowedQuery = allowedQuery ? { ...allowedQuery } : {}

      // delete undefined
      Object.keys(this.filterAllowedQuery).forEach((key) =>
         this.filterAllowedQuery[key] === undefined
            ? delete this.filterAllowedQuery[key]
            : {}
      )
      // gte lte lt gt mapping to $gte $lte $lt $gt to be mongoose friendly
      // url will be like this /api/v1/tours?price[gte]=1000&price[lte]=2000
      const filters = this.filterAllowedQuery
      this.filterAllowedQuery = JSON.stringify(this.filterAllowedQuery).replace(
         /\b(gte|gt|lte|lt|ne)\b/g,
         (match) => `$${match}`
      )
      this.filterAllowedQuery = JSON.parse(this.filterAllowedQuery)
      this.query = this.query.find(this.filterAllowedQuery)
      this.filterAllowedQuery = filters
      return this
   }

   /**
    * @description sort the query
    * @param {string} s - the sort query
    * @returns {this} - the current instance of the class
    * @example sort('-price') or sort('price') or sort('price,-duration')
    */
   sort(s, opts = {}) {
      this.sortBy = s ? s.split(',') : []

      if (
         (opts?.Geo?.lat && opts?.Geo?.lng && this.sortBy.length === 0) ||
         (this.sortBy.includes('location') && opts?.Geo?.lat && opts.Geo.lng)
      ) {
         this.sortBy = ['location']
         return this
      } else if (
         this.sortBy.includes('location') &&
         (!opts.Geo.lat || !opts.Geo.lng)
      ) {
         this.sortBy = '-_id'
      } else if ((!this.sortBy.includes('location')) && this.sortBy.length !== 0) {
         this.sortBy  = this.sortBy.join(' ')
      } else {
         this.sortBy = '-_id'
      }
     
      this.query = this.query.sort(this.sortBy)
      this.sortBy = this.sortBy.split(' ')

      return this
   }

   /**
    * @description select the fields to be returned
    * @param {string} f - the fields to be returned
    * @returns {this} - the current instance of the class
    * @example fields('name,price,duration') or fields('-name,-price,-duration')
    */
   fields(f) {
      // BUG: you can force the query to return private fields by passing the fields query with the %2b sign in front of the field name like this /api/v1/tours?fields=%2bpassword  (the %2b sign is the url encoded version of +)

      // fix the bug by removing the + sign from the fields query
      if (f) {
         f = JSON.parse(JSON.stringify(f).replace(/\+/g, ''))
         this.queriedFields = f.split(',')
         this.query = this.query.select(this.queriedFields)
      } else {
         this.queriedFields = []
         this.query = this.query.select('-__v -createdAt -updatedAt')
      }
      return this
   }

   /**
    * @description paginate the query
    * @param {number} l - the limit
    * @param {number} p - the page
    * @returns {this} - the current instance of the class
    * @example pagination(10, 2)
    */
   pagination(l, p) {
      this.limit = l * 1 || 50
      this.page = p * 1 || 1
      this.skip = (this.page - 1) * this.limit

      this.query = this.query.skip(this.skip).limit(this.limit)
      return this
   }

   /**
    * @description populate the query fields
    * @param {string} fieldName - the fields to be populated
    * @param {object|string} opt - the options to be passed to the populate method
    * @param {boolean} forceOpts - force the options to be passed to the populate method without the fieldName
    * @param {boolean} forceField - force the field to be populated without checking if it's in the queried fields
    * @returns {this} - the current instance of the class
    * @example populate("guides",'name email')
    */
   populate(fieldName, opt, forceOpts = false, forceField = false) {
      if (
         (!forceField && this.queriedFields.length === 0) ||
         this.queriedFields.includes(fieldName)
      ) {
         if (!forceOpts) {
            this.query = this.query.populate(fieldName, opt)
         } else {
            this.query = this.query.populate(opt)
         }
      }
      return this
   }

   geoLocation(fieldName, Geo, ignoreDestain = false) {
      console.log(Geo)
      if (!Geo.lat || !Geo.lng) {
         this.geo = {}
         return this
      }
      this.geo = { ...Geo }
      let geoOpts = {}

      geoOpts[fieldName] = {
         $near: {
            $geometry: {
               type: 'Point',
               coordinates: [this.geo.lng, this.geo.lat],
            },
         },
      }
      if (ignoreDestain || this.geo.destain >= 0) {
         geoOpts[fieldName].$near.$maxDistance =
            this.geo.destain * (unitFromToMetersMap[this.geo.unit] || 1000)
      }

      this.query = this.query.find(geoOpts)
      return this
   }
}

module.exports = APIfeatures
