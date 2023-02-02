const fs = require('fs')
const mongoose = require('mongoose')
const slugify = require('slugify')

const Tour = require('../../models/schemas/tour.schema')
const User = require('../../models/schemas/user.schema')
const Review = require('../../models/schemas/review.schema')

const config = require('../../../config/app.config')

mongoose
   .connect(config.db)
   .then(() => {
      console.log('db is connected')
   })
   .catch((err) => console.log(err))

const tours = JSON.parse(
   fs.readFileSync(`${__dirname}/data/tours.json`, 'utf-8')
)
const users = JSON.parse(
   fs.readFileSync(`${__dirname}/data/users.json`, 'utf-8')
)
const reviews = JSON.parse(
   fs.readFileSync(`${__dirname}/data/reviews.json`, 'utf-8')
)


const importData = async () => {
   try {

      users.forEach((user) => {
         user.passwordConfirm = user.password
      })

      await User.create(users)
      await Tour.create(tours)
      await Review.create(reviews)


      console.log('Data successfully loaded!')
   } catch (err) {
      console.log(err)
   }

}

const deleteData = async () => {
   try {
      await User.deleteMany()
      await Tour.deleteMany()
      await Review.deleteMany()

      console.log('Data successfully deleted!')
   } catch (err) {
      console.log(err)
   }
 
}
const main = async () => {
   if (process.argv[2] === '--import') {
      await importData()
      process.exit()
   } else if (process.argv[2] === '--delete') {
      await deleteData()
      process.exit()
   
   }  else if (process.argv[2] === '--reset') {
      await deleteData()
      await importData()
      process.exit()
   } else {
      console.log('Please use --import or --delete')
      process.exit()
   }
}

main()