const mongoose = require('mongoose')
const config = require('./app.config')

// init the database connection
const dbConnect = mongoose.connect(config.db).catch((err) => {
   throw new Error('DATABASE CONNECTION ERROR', err)
})

// export the connection then use it in server.js
module.exports = dbConnect
