const express = require('express')

const routes = express.Router()

const toursRoutes = require('./APIs/tour.routes')
const usersRoutes = require('./APIs/user.routes')
const authRoutes = require('./APIs/auth.routes')

const { loggedIn } = require('../middlewares/auth.middleware')

routes.get('/', (req, res) => {
   res.json({ message: 'main api route' })
})

routes.use('/tours', toursRoutes)
routes.use('/users', loggedIn(), usersRoutes)
routes.use('/auth', authRoutes)

module.exports = routes
