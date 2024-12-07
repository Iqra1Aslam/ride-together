import express from 'express'
import cors from 'cors'

const app = express()

app.use(express.json({ limit: '1mb' }))
app.use(cors({
//     origin: ['http://localhost:5173/', 'http://localhost:3000/']
}))

import { userRouter } from './routes/user.routes.js'
import { authRouter } from './routes/auth.routes.js'
import { vehicleRouter } from './routes/vehicle.routes.js'
import { driverRouter } from './routes/driver.routes.js'
import {router} from './routes/admin.route.js'
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/user', userRouter)
app.use('/api/v1/driver', driverRouter)
app.use('/api/v1/vehicle', vehicleRouter)
app.use('/api/v1/admin', router)

app.get("/", (req, res) => {
    res.send("Welcome to the API!");
  })
  

export { app }