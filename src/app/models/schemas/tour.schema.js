const mongoose = require('mongoose')
const validator = require('validator')
const slugify = require('slugify')
const User = require('./user.schema')


const tourSchema = new mongoose.Schema(
   {
      id: false,
      name: {
         type: String,
         required: [true, 'A tour must have a name'],
         unique: true,
         trim: true,
         maxlength: [
            64,
            'A tour name must have less or equal then 64 characters',
         ],
         minlength: [
            10,
            'A tour name must have more or equal then 10 characters',
         ],
         validate: {
            validator: function (val) {
               return (
                  validator.isAlpha(val.split(' ').join(''), 'en-US') ||
                  validator.isAlpha(val.split(' ').join(''), 'ar-AE')
               )
            },
            message: 'Tour name must only contain characters',
         },
      },
      duration: {
         type: Number,
         required: [true, 'A tour must have a duration'],
      },
      maxGroupSize: {
         type: Number,
         required: [true, 'A tour must have a group size'],
      },
      difficulty: {
         type: String,
         required: [true, 'A tour must have a difficulty'],

         enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either: easy, medium, difficult',
         },
      },
      ratingsAverage: {
         type: Number,
         default: 0,
         min: [0, 'Rating must be above 0.0'],
         max: [5, 'Rating must be below 5.0'],
      },
      ratingsQuantity: {
         type: Number,
         default: 0,
      },
      price: {
         type: Number,
         required: [true, 'A tour must have a price'],
      },
      priceDiscount: {
         type: Number,
         validate: {
            validator: function (val) {
               return val < this.price
            },
            message: 'Discount price ({VALUE}) should be below regular price',
         },
      },
      startLocation: {
         // GeoJSON
         type: {
            type: String,
            default: 'Point',
            enum: ['Point'],
         },
         coordinates: [Number],
         address: String,
         description: String,
      },
      locations: [
         {
            type: {
               type: String,
               default: 'Point',
               enum: ['Point'],
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number,
         },
      ],
      summary: {
         type: String,
         trim: true,
         required: [true, 'A tour must have a description'],
      },
      description: {
         type: String,
         trim: true,
      },
      imageCover: {
         type: String,
         required: [true, 'A tour must have a cover image'],
      },
      images: {
         type: [String],
         validate: {
            validator: function (val) {
               return val.length <= 6
            },
            message: 'A tour must have less than 6 images',
         },
      },
      guides: {
         type: [
            {
               type: mongoose.Schema.ObjectId,
               ref: 'User',
               required:[true, 'A tour must have a guide'],
               validate: {
                  validator: async function (val) {
                     const user = await User.findById(val)
                     return user.role === 'guide' || user.role === 'lead-guide'
                  },
                  message:
                     'A user ({VALUE}) must be a tour guide or lead-guide to start a tour',
               },
            },
         ],
         validate: {
            validator: function (val) {
               return (val.length <= 3 && val.length != 0)
            },
            message: 'A tour must only have 3 guides and at least 1 guide',
         },
      },
      createdAt: {
         type: Date,
         default: Date.now()
      },
      startDates: [Date],
      slug: {
         type: String,
         unique: true,
      },
   },
   {
      toJSON: { virtuals: true },
      toObject: { virtuals: true },
   }
)

tourSchema.index({ price: 1,ratingsAverage: -1 ,duration: 1 })
tourSchema.index({startLocation:'2dsphere'})
tourSchema.virtual('reviews', {
   ref: 'Review',
   foreignField: 'tour',
   localField: '_id',
})

tourSchema.pre('save', function (next) {
   if (this.name) {
      this.set({ slug: slugify(this.name, { lower: true }) })
   }
   return next()
})

tourSchema.pre('findOneAndUpdate', function (next) {
   if (this.getUpdate()?.name) {
      this.set({ slug: slugify(this.getUpdate().name, { lower: true }) })
   }
   
   return next()
})



tourSchema.pre(/^find/, function (next) {
   this.select('-__v')
   next()
})


const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour
