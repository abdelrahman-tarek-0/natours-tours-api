const express = require('express')

const routes = express.Router()
const reviewsRoutes = require('./review.routes')

const controller = require('../../controllers/user.controller')
const { restrictTo, allowChange } = require('../../middlewares/auth.middleware')

routes.get('/', controller.getAllUsers)
routes.get(
   '/me',
   controller.getLoggedUser
)
routes.patch('/updatePassword', controller.updatePassword)
routes.patch('/updateUser', controller.updateUser)
routes.delete('/deleteMe', controller.deleteUser)

routes.get('/:id/profile', controller.getUserProfile)

// routes.get('/:id', Controller.getUsers)
// routes.post('/', Controller.createNewUsers)
// routes.patch('/:id', userController.editUsers)
// routes.delete('/:id', Controller.deleteUsers)

module.exports = routes
