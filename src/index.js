import dotenv from 'dotenv'
dotenv.config({
    path: './.env'
})

import { connectDB } from './db/index.js'
import { app } from './app.js'

const PORT = process.env.PORT || 5000
const HOST = process.env.HOST || 'localhost'

connectDB()
    .then(info => {
        // app.listen(PORT, HOST, () =>
             console.log(`Server listening on PORT ${PORT}`)
    // )
    })
    .catch(error => {
        console.log(error.message)
    })




