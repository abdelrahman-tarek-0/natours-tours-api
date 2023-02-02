const mongoose = require('mongoose')
const validator = require('validator')
const slugify = require('slugify')
const bcrypt = require('bcrypt')
const crypto = require('crypto')

const {resetPasswordExpires} = require('../../../config/app.config')

const userSchema = new mongoose.Schema(
   {
      id: false,
      name: {
         type: String,
         required: [true, 'A user must have a name'],
         unique: true,
         trim: true,
         maxlength: [
            64,
            'A user name must have less or equal then 64 characters',
         ],
         minlength: [
            8,
            'A user name must have more or equal then 8 characters',
         ],
         validate: {
            validator: function (val) {
               return (
                  validator.isAlpha(val.split(' ').join(''), 'en-US') ||
                  validator.isAlpha(val.split(' ').join(''), 'ar-AE')
               )
            },
            message: 'User name must only contain characters',
         },
      },
      email: {
         email:{
            required: [true, 'A user must have email'],
            type:String,
            validate: [validator.isEmail, 'Email is not valid'],
            unique: true
         },
         confirmed:{
            type:Boolean,
            default:false
         }
      },
      photo: String,
      password: {
         type: String,
         required: [true, 'A user must have a password'],
         minlength: [8, 'a password must be more than 8 chars'],
         select: false,
      },

      passwordConfirm: {
         type: String,
         required: [true, 'Please confirm your password'],
         minlength: [8, 'a password must be more than 8 chars'],
         select: false,
         validate: {
            validator: function (val) {
               return val === this.password
            },
            message: 'The confirm password is not identical to the password',
         },
      },
      role: {
         type: String,
         enum: ['user', 'guide', 'lead-guide', 'admin'],
         default: 'user',
      },
      passwordChangedAt: [
         {
            password: String,
            date: Date,
         },
      ],
      slug: {
         type: String,
         unique: true,
      },
      verification: [
         {
            reset: String,
            resetType: {
               type: String,
               enum: ['token', 'code'],
            },
            expiresDate: Date,
            status: {
               type: String,
               enum: ['not available', 'error'],
            },
         },
      ],
      Active: {
         type: Boolean,
         default: true,
      },
      createdAt: {
         type: Date,
         default: Date.now()
      }
   },
   {
      toJSON: { virtuals: true },
      toObject: { virtuals: true },
   }
)
userSchema.virtual('reviews', {
   ref: 'Review',
   foreignField: 'user',
   localField: '_id',
})
userSchema.pre('save', async function (next) {
   if (this.name) {
      this.set({ slug: slugify(this.name, { lower: true }) })
   }
   if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, 12)
      this.passwordConfirm = undefined
   }
   if(this.isModified('verification')){
      if (this.verification.length > 10) {
         this.verification.shift()
      }
   }
   if (this.isModified('passwordChangedAt')) {
      if (this.passwordChangedAt.length > 10) {
         this.passwordChangedAt.shift()
      }
   }
   return next()
})
userSchema.pre('findOneAndUpdate', function (next) {
   if (this.getUpdate().name) {
      this.set({ slug: slugify(this.getUpdate().name, { lower: true }) })
   }
   return next()
})
userSchema.pre(/^find/, function (next) {
   this.find({ Active: { $ne: false } }).select('-__v -createdAt -updatedAt')
   return next()
})
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
   if (this.passwordChangedAt[this.passwordChangedAt.length - 1]) {
      const changedTimestamp = parseInt(
         this.passwordChangedAt[
            this.passwordChangedAt.length - 1
         ].date.getTime() / 1000,
         10
      )
      return JWTTimestamp < changedTimestamp
   }
   return false
}

userSchema.methods.changePasswordTime = function () {
   this.passwordChangedAt.push({
      password: this.password,
      date: Date.now(),
   })
}

userSchema.methods.createPasswordReset = function (type) {
   const expiresDate = Date.now() + resetPasswordExpires * 60 * 1000
   let reset = ''

   if (type === 'code') {
      reset = Math.floor(100000 + Math.random() * 900000)
   } else if (type === 'token') {
      const resetToken = crypto.randomBytes(32).toString('hex')
      reset = crypto.createHash('sha256').update(resetToken).digest('hex')
   }

   this.verification.forEach((element) => {
      if (element.status !== 'not available' || element.status !== 'error') {
         element.status = 'not available'
      }
   })

   this.verification.push({ reset, resetType: type, expiresDate })
   return { reset, expiresDate }
}
userSchema.methods.resetVerification = function(){
   this.verification.forEach((element) => {
      if (element.status !== 'not available' || element.status !== 'error') {
         element.status = 'not available'
      }
   })
}
userSchema.methods.confirmEmail = function(){
   this.email.confirmed = true;
}
const User = mongoose.model('User', userSchema)
module.exports = User
